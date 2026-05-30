#!/usr/bin/env node
// Renderiza videos kinetic-line ao estilo Reels: 1 foto MJ de fundo + legendas
// ASS sincronizadas com TTS por linha, queimadas com ffmpeg num so passo.
//
// Env required:
//   NEXT_PUBLIC_SUPABASE_URL, FREEME_SUPABASE_SERVICE_ROLE_KEY
//   ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
//
// Output: freeme-assets/videos/D{day}-{slot}.mp4
//
// Flags:
//   --scope=all|semana-N|day-N|tts-only|day-N-tts
//   --concurrency=2
//   --skip-existing
//   --audio-only=true  (gera so MP3s para Storage, salta video)

import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
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
const AUDIO_ONLY = args["audio-only"] === "true";
const FONTS_DIR = path.resolve("tools/produce/fonts");

// v3 voice tags por tipo de slide - performance varia consoante a mensagem.
function voiceTagFor(slide) {
  switch (slide.layout) {
    case "capa":         return "(amigável)";
    case "conteudo":     return "(didática)";
    case "kinetic-line": return "(didática)";
    case "citacao":      return "(reflexiva)";
    case "cta":          return "(compreensiva)";
    case "assinatura":   return "(com calma)";
    default:             return "(amigável)";
  }
}

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
  if (scope === "all" || scope === "videos-only" || scope === "tts-only") return posts;
  const m = /^day-(\d+)(?:-(video|slides|tts))?$/.exec(scope);
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
  const p = `mj/D${day}-${slot}-0.jpg`;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(p);
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
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => { err += d.toString(); });
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${err.slice(-800)}`));
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

// ============================ HELPERS LEGENDA ============================

// Remove tag de performance (ex "(amigável)") do inicio do texto para a legenda.
function stripVoiceTag(text) {
  return text.replace(/^\s*\([^)]*\)\s*/, "").trim();
}

// Converte segundos em formato ASS H:MM:SS.cs (centesimos)
function toASStime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.round((sec - Math.floor(sec)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

// Escapa caracteres especiais ASS e converte \n -> \N
function escapeASS(s) {
  return s.replace(/\\/g, "\\\\").replace(/[{}]/g, "").replace(/\n/g, "\\N");
}

// Aplica bold (ouro) inline a frases da bold list usando ASS color override.
// Cor primary: &H00FBF4EC (creme BGR). Cor bold: &H004AAEEB (ouro BGR).
function applyBoldASS(text, boldList) {
  let out = text;
  for (const phrase of boldList || []) {
    const escaped = escapeASS(phrase);
    const idx = out.indexOf(escaped);
    if (idx === -1) continue;
    out = out.slice(0, idx)
        + `{\\c&H004AAEEB&}${escaped}{\\c&H00FBF4EC&}`
        + out.slice(idx + escaped.length);
  }
  return out;
}

// Constroi ficheiro .ass com legendas sincronizadas. segments: [{ start, end, text, bold }]
function buildASS(segments) {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Fraunces,76,&H00FBF4EC,&H000000FF,&H80000000,&H80000000,0,0,0,0,100,100,0,0,1,4,3,2,90,90,360,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const dialogues = segments.map((seg) => {
    const cleanText = applyBoldASS(escapeASS(stripVoiceTag(seg.text)), seg.bold);
    return `Dialogue: 0,${toASStime(seg.start)},${toASStime(seg.end)},Default,,0,0,0,,{\\fad(220,260)}${cleanText}`;
  }).join("\n");
  return header + dialogues + "\n";
}

// ============================ RENDER BG (foto + brand) ============================

async function renderKineticBG(browser, photoUrl) {
  const fallbackBg = "#2E241D"; // carvao
  const photoLayer = photoUrl
    ? `<div style="position:absolute;inset:0;background-image:url('${photoUrl}');background-size:cover;background-position:center"></div>`
    : "";
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400&family=Outfit:wght@300;400&display=block" rel="stylesheet" />
<style>* { margin:0; padding:0; box-sizing:border-box }
html,body { width:1080px; height:1920px; overflow:hidden }
body { background:${fallbackBg}; position:relative }</style>
</head><body>
  ${photoLayer}
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(46,36,29,.45) 0%,rgba(46,36,29,.25) 20%,rgba(46,36,29,.25) 55%,rgba(46,36,29,.75) 80%,rgba(46,36,29,.92) 100%)"></div>
  <div style="position:absolute;top:60px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;color:#FBF4EC;font-family:'Fraunces',serif;font-size:26px;font-style:italic;letter-spacing:.02em">
    <svg viewBox="0 0 512 512" width="32" height="32"><path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425" fill="none" stroke="#FBF4EC" stroke-width="22" stroke-linecap="round"/></svg>
    FreeMe
  </div>
  <div style="position:absolute;bottom:54px;left:50%;transform:translateX(-50%);color:#FBF4EC;font-family:'Outfit',sans-serif;font-size:22px;letter-spacing:.06em;opacity:.65">@vivianne.dos.santos</div>
<script>window.READY=true</script></body></html>`;

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: "png" });
  await page.close();
  return buf;
}

// ============================ BUILD VIDEO ============================

async function buildVideo(post, workDir) {
  const pKey = `D${post.day}-${post.slot === "morning" ? "10h" : "13h"}`;
  const photoUrl = await getMJPhotoUrl(post.day, post.slot);

  // Overrides de texto TTS guardados pela Vivianne em audio/{pKey}/_text.json
  let ttsOverrides = {};
  try {
    const { data: textUrl } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`audio/${pKey}/_text.json`);
    const res = await fetch(textUrl.publicUrl);
    if (res.ok) {
      ttsOverrides = await res.json();
      console.log(`  tts overrides: ${Object.keys(ttsOverrides).length} slides`);
    }
  } catch {}

  const slides = post.slides;

  // 1. Gerar/reusar TTS por linha + medir duracoes
  const segments = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const customText = ttsOverrides[String(i)] || ttsOverrides[i];
    const rawText = (customText || slide.body).replace(/[*_]/g, "").trim();
    const hasTag = /^\s*\(/.test(rawText);
    const ttsText = hasTag ? rawText : `${voiceTagFor(slide)} ${rawText}`;
    const audioStoragePath = `audio/${pKey}/slide-${i}.mp3`;
    let audioBuf;
    try {
      const { data: audioUrl } = supabase.storage.from(BUCKET).getPublicUrl(audioStoragePath);
      const head = await fetch(audioUrl.publicUrl, { method: "HEAD" });
      if (head.ok) {
        const got = await fetch(audioUrl.publicUrl);
        audioBuf = Buffer.from(await got.arrayBuffer());
        console.log(`  slide ${i + 1}/${slides.length}: audio reusado`);
      }
    } catch {}
    if (!audioBuf) {
      audioBuf = await generateTTS(ttsText);
      console.log(`  slide ${i + 1}/${slides.length}: TTS gerado (${ttsText.slice(0, 40)}...)`);
      await supabase.storage.from(BUCKET).upload(audioStoragePath, audioBuf, {
        contentType: "audio/mpeg", upsert: true,
      });
    }
    const audioPath = path.join(workDir, `audio-${i}.mp3`);
    await fs.writeFile(audioPath, audioBuf);
    const duration = await getAudioDuration(audioPath);

    segments.push({
      audioPath,
      duration,
      text: rawText,        // texto cru (sem markdown)
      bold: slide.bold || [],
    });
  }

  if (AUDIO_ONLY) {
    return null;
  }

  // 2. Render fundo unico (foto MJ + brand) - puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
  const bgBuf = await renderKineticBG(browser, photoUrl);
  await browser.close();
  const bgPath = path.join(workDir, "bg.png");
  await fs.writeFile(bgPath, bgBuf);

  // 3. Calcular timings cumulativos + construir ASS
  const INTRO_PAD = 0.3;
  const GAP_BETWEEN = 0.45;
  const TAIL_PAD = 0.4;
  let cursor = INTRO_PAD;
  const timedSegments = segments.map((seg, i) => {
    const start = cursor;
    const end = cursor + seg.duration;
    cursor = end + (i === segments.length - 1 ? 0 : GAP_BETWEEN);
    return { ...seg, start, end };
  });
  const totalDur = cursor + TAIL_PAD;

  const assPath = path.join(workDir, "captions.ass");
  await fs.writeFile(assPath, buildASS(timedSegments));

  // 4. Construir comando ffmpeg unico:
  //    -loop bg + N audios + filter_complex (delay+concat audio, subtitles burn)
  const inputs = ["-loop", "1", "-t", String(totalDur), "-i", bgPath];
  segments.forEach((seg) => {
    inputs.push("-i", seg.audioPath);
  });

  // Cada audio leva so silencio TRAILING para o intervalo ate ao proximo.
  // SO o primeiro tem adelay (intro pad). Concat junta tudo em sequencia.
  // BUG anterior: adelay em todos somava sotaque cada vez maior - voz chegava
  // depois da legenda ja ter passado.
  const audioLabels = [];
  const audioFilters = timedSegments.map((seg, i) => {
    const inputIdx = i + 1; // input 0 e o bg, audios comecam em 1
    const padDur = (i === timedSegments.length - 1)
      ? TAIL_PAD
      : (timedSegments[i + 1].start - seg.end);
    const label = `a${i}`;
    audioLabels.push(`[${label}]`);
    if (i === 0) {
      const introMs = Math.round(INTRO_PAD * 1000);
      return `[${inputIdx}:a]adelay=${introMs}|${introMs},apad=pad_dur=${padDur.toFixed(3)}[${label}]`;
    }
    return `[${inputIdx}:a]apad=pad_dur=${padDur.toFixed(3)}[${label}]`;
  });
  const audioMix = `${audioLabels.join("")}concat=n=${audioLabels.length}:v=0:a=1[aout]`;

  // Subtitles filter: precisa de caminho absoluto e escape de :
  const assEscaped = assPath.replace(/:/g, "\\:");
  const videoFilter = `[0:v]subtitles=${assEscaped}:fontsdir=${FONTS_DIR}[vout]`;

  const filterComplex = [...audioFilters, audioMix, videoFilter].join(";");

  const finalPath = path.join(workDir, "final.mp4");
  await ffmpeg([
    "-y",
    ...inputs,
    "-filter_complex", filterComplex,
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "medium", "-tune", "stillimage",
    "-pix_fmt", "yuv420p", "-r", "30",
    "-c:a", "aac", "-b:a", "192k",
    "-t", String(totalDur),
    "-shortest",
    finalPath,
  ]);

  return await fs.readFile(finalPath);
}

async function processOne(post) {
  const dayLabel = `D${post.day}-${post.slot}`;
  if (!AUDIO_ONLY && SKIP_EXISTING && await videoExists(post.day, post.slot)) {
    console.log(`${dayLabel}: skip (video existe)`);
    return { ok: true, skipped: true, key: dayLabel };
  }
  console.log(`${dayLabel}: ${AUDIO_ONLY ? "TTS bulk" : "video legenda"} (${post.slides.length} linhas)`);
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `freeme-video-${dayLabel}-`));
  try {
    const buf = await buildVideo(post, workDir);
    if (AUDIO_ONLY) {
      console.log(`${dayLabel}: audios em audio/D${post.day}-${post.slot === "morning" ? "10h" : "13h"}/`);
      return { ok: true, key: dayLabel };
    }
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
  console.log(`Scope: ${SCOPE}, concurrency: ${CONCURRENCY}, audio-only: ${AUDIO_ONLY}`);
  await ensureBucket();
  const allPosts = await loadPosts();
  const posts = filterByScope(allPosts, SCOPE);
  console.log(`Videos para processar: ${posts.length}/${allPosts.length}`);

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
