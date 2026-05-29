#!/usr/bin/env node
// Renderiza videos kinetic-line: 1 PNG por linha + TTS por linha + ffmpeg stitch -> MP4.
// Le posts.json (gerado por dump-posts.ts) e processa apenas os do tipo "video".
//
// Env required:
//   NEXT_PUBLIC_SUPABASE_URL, FREEME_SUPABASE_SERVICE_ROLE_KEY
//   ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
//
// Output: freeme-assets/videos/D{day}-{slot}.mp4
//
// Flags:
//   --scope=all|semana-N|day-N
//   --concurrency=2  (Default 2 para nao saturar ElevenLabs)
//   --skip-existing  (Default true)

import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { buildSlideHTML } from "../../src/lib/slide-template.mjs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);

const SCOPE = args.scope || "all";
const CONCURRENCY = Number(args.concurrency || 2);
const SKIP_EXISTING = args["skip-existing"] !== "false";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.FREEME_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE = process.env.ELEVENLABS_VOICE_ID;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Supabase env vars missing");
  process.exit(1);
}
if (!ELEVEN_KEY || !ELEVEN_VOICE) {
  console.error("ERROR: ElevenLabs env vars missing");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "freeme-assets";

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return;
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`createBucket ${BUCKET}: ${error.message}`);
  }
}

async function loadPosts() {
  const jsonUrl = pathToFileURL(path.resolve("tools/produce/posts.json"));
  const mod = await import(jsonUrl.href, { with: { type: "json" } });
  return mod.default.filter((p) => p.type === "video");
}

function filterByScope(posts, scope) {
  if (scope === "all") return posts;
  const m = /^day-(\d+)$/.exec(scope);
  if (m) return posts.filter((p) => p.day === Number(m[1]));
  const w = /^semana-(\d+)$/.exec(scope);
  if (w) {
    const week = Number(w[1]);
    return posts.filter((p) => {
      const wk = p.day <= 7 ? 1 : p.day <= 14 ? 2 : p.day <= 21 ? 3 : 4;
      return wk === week;
    });
  }
  return posts;
}

async function getMJPhotoUrl(day, slot) {
  // Para videos so ha 1 foto MJ por post (slideIndex 0)
  const path = `mj/D${day}-${slot}-0.jpg`;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const head = await fetch(data.publicUrl, { method: "HEAD" });
  return head.ok ? data.publicUrl : null;
}

async function videoExists(day, slot) {
  const { data: url } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(`videos/D${day}-${slot}.mp4`);
  const head = await fetch(url.publicUrl, { method: "HEAD" });
  return head.ok;
}

async function generateTTS(text) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_TTS_MODEL || "eleven_v3",
        voice_settings: {
          stability: 0.50,
          similarity_boost: 0.75,
          style: 0.50,
          use_speaker_boost: true,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function renderSlidePNG(browser, slide, photoUrl, dayLabel, opts = {}) {
  const html = buildSlideHTML(slide, { photoUrl, dayLabel, isVideo: true, ...opts });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: "png" });
  await page.close();
  return buf;
}

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => { err += d.toString(); });
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${err.slice(-500)}`));
    });
  });
}

async function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffprobe", [
      "-i", file, "-show_entries", "format=duration",
      "-v", "quiet", "-of", "csv=p=0",
    ], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    p.stdout.on("data", (d) => { out += d.toString(); });
    p.on("close", (code) => {
      if (code === 0) resolve(parseFloat(out.trim()) || 2.5);
      else reject(new Error(`ffprobe exit ${code}`));
    });
  });
}

async function buildVideo(post, workDir) {
  const dayLabel = `D${post.day} · ${post.slot === "morning" ? "10h" : "13h"}`;
  const pKey = `D${post.day}-${post.slot === "morning" ? "10h" : "13h"}`;
  const photoUrl = await getMJPhotoUrl(post.day, post.slot);

  // Carrega overrides de texto TTS guardados pela Vivianne em
  // freeme-assets/audio/{pKey}/_text.json (com tags (suspira), (pausa)...).
  let ttsOverrides = {};
  try {
    const { data: textUrl } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`audio/${pKey}/_text.json`);
    const res = await fetch(textUrl.publicUrl);
    if (res.ok) {
      ttsOverrides = await res.json();
      console.log(`  tts overrides: ${Object.keys(ttsOverrides).length} slides personalizados`);
    }
  } catch {}

  // 1. Render PNG + gerar TTS para cada slide
  const slides = post.slides;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  const segments = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    console.log(`  slide ${i + 1}/${slides.length}: ${slide.body.slice(0, 40)}...`);

    const pngBuf = await renderSlidePNG(browser, slide, photoUrl, dayLabel, {
      slideIndex: i + 1,
      totalSlides: slides.length,
    });
    const pngPath = path.join(workDir, `slide-${i}.png`);
    await fs.writeFile(pngPath, pngBuf);

    // TTS: 1) tenta reusar audio aprovado em Storage (gerado/ouvido na admin).
    //      2) se nao existir, gera via ElevenLabs e sobe para mesmo path.
    // Texto: se a Vivianne customizou (tags (suspira) etc.), usa esse.
    const customText = ttsOverrides[String(i)] || ttsOverrides[i];
    const ttsText = (customText || slide.body).replace(/[*_]/g, "").trim();
    const audioStoragePath = `audio/D${post.day}-${post.slot}/slide-${i}.mp3`;
    let audioBuf;
    try {
      const { data: audioUrl } = supabase.storage.from(BUCKET).getPublicUrl(audioStoragePath);
      const head = await fetch(audioUrl.publicUrl, { method: "HEAD" });
      if (head.ok) {
        const got = await fetch(audioUrl.publicUrl);
        audioBuf = Buffer.from(await got.arrayBuffer());
        console.log(`  audio: reusado ${audioStoragePath}`);
      }
    } catch {}
    if (!audioBuf) {
      audioBuf = await generateTTS(ttsText);
      console.log(`  audio: gerado ${audioStoragePath}`);
      await supabase.storage.from(BUCKET).upload(audioStoragePath, audioBuf, {
        contentType: "audio/mpeg", upsert: true,
      });
    }
    const audioPath = path.join(workDir, `audio-${i}.mp3`);
    await fs.writeFile(audioPath, audioBuf);
    const duration = await getAudioDuration(audioPath);

    segments.push({ pngPath, audioPath, duration });
  }
  await browser.close();

  // 2. Para cada segmento: png + mp3 -> mp4 segment
  for (let i = 0; i < segments.length; i++) {
    const { pngPath, audioPath, duration } = segments[i];
    const segPath = path.join(workDir, `seg-${i}.mp4`);
    // Padding 0.3s antes e depois do audio
    const totalDur = duration + 0.6;
    await ffmpeg([
      "-y",
      "-loop", "1", "-t", String(totalDur), "-i", pngPath,
      "-i", audioPath,
      "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k",
      "-af", `adelay=300|300,apad,atrim=0:${totalDur}`,
      "-vf", "scale=1080:1920,setsar=1",
      "-shortest",
      segPath,
    ]);
    segments[i].segPath = segPath;
  }

  // 3. Concat segments -> video final
  const listFile = path.join(workDir, "concat.txt");
  await fs.writeFile(listFile, segments.map((s) => `file '${s.segPath}'`).join("\n"));
  const finalPath = path.join(workDir, "final.mp4");
  await ffmpeg([
    "-y", "-f", "concat", "-safe", "0", "-i", listFile,
    "-c", "copy",
    finalPath,
  ]);

  return await fs.readFile(finalPath);
}

async function processOne(post) {
  const dayLabel = `D${post.day}-${post.slot}`;
  if (SKIP_EXISTING && await videoExists(post.day, post.slot)) {
    console.log(`${dayLabel}: skip (existe)`);
    return { ok: true, skipped: true, key: dayLabel };
  }
  console.log(`${dayLabel}: a gerar (${post.slides.length} slides)`);
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `freeme-video-${dayLabel}-`));
  try {
    const buf = await buildVideo(post, workDir);
    const path_out = `videos/D${post.day}-${post.slot}.mp4`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path_out, buf, { contentType: "video/mp4", upsert: true });
    if (upErr) throw new Error(`Upload ${path_out}: ${upErr.message}`);
    console.log(`${dayLabel}: ok (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
    return { ok: true, key: dayLabel };
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

async function withConcurrency(items, limit, worker) {
  const results = [];
  let i = 0;
  const inflight = new Set();
  while (i < items.length || inflight.size > 0) {
    while (inflight.size < limit && i < items.length) {
      const idx = i++;
      const p = worker(items[idx])
        .then((r) => results.push({ ok: true, value: r }))
        .catch((e) => results.push({ ok: false, error: String(e), key: `D${items[idx].day}-${items[idx].slot}` }))
        .finally(() => inflight.delete(p));
      inflight.add(p);
    }
    if (inflight.size > 0) await Promise.race(inflight);
  }
  return results;
}

async function main() {
  console.log(`Scope: ${SCOPE}, concurrency: ${CONCURRENCY}`);
  await ensureBucket();
  const allPosts = await loadPosts();
  const posts = filterByScope(allPosts, SCOPE);
  console.log(`Videos para gerar: ${posts.length}/${allPosts.length}`);

  const results = await withConcurrency(posts, CONCURRENCY, processOne);
  const ok = results.filter((r) => r.ok && !r.value?.skipped).length;
  const skipped = results.filter((r) => r.ok && r.value?.skipped).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`Done. Gerados: ${ok}, Skipped: ${skipped}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    for (const f of failed.slice(0, 10)) {
      console.error(`FAIL ${f.key}: ${f.error}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
