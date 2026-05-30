#!/usr/bin/env node
// Render all FreeMe slides to PNG using puppeteer + upload to Supabase Storage.
// Designed to run inside GitHub Actions (workflow_dispatch) but works locally too.
//
// Env required:
//   NEXT_PUBLIC_SUPABASE_URL
//   FREEME_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY)
//
// Optional CLI flags:
//   --scope=all|semana-1|semana-2|semana-3|semana-4|slides-only|videos-only|day-N
//   --concurrency=3

import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { buildSlideHTML } from "../../src/lib/slide-template.mjs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);

const SCOPE = args.scope || "all";
const CONCURRENCY = Number(args.concurrency || 3);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.FREEME_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Supabase env vars missing");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "freeme-assets";

// Dynamically import the TypeScript content using tsx-style resolution would require esbuild.
// Simpler: dist-import after running the Next build OR re-implement loader.
// For now we read the source files via dynamic JSON fetch isn't possible — we use a child node process with tsx.
// Easiest robust route: bundle the content into a JSON file at build time.

async function loadPosts() {
  // We expect the GH Action to run `npm run build:content` which produces this JSON.
  const jsonUrl = pathToFileURL(path.resolve("tools/produce/posts.json"));
  const mod = await import(jsonUrl.href, { with: { type: "json" } });
  return mod.default;
}

async function ensureBucket() {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets: ${listErr.message}`);
  if (buckets?.some((b) => b.name === BUCKET)) return;
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`createBucket ${BUCKET}: ${error.message}`);
  }
  console.log(`Created bucket ${BUCKET}`);
}

function filterByScope(posts, scope) {
  if (scope === "all") return posts;
  const m = /^day-(\d+)(?:-(video|slides))?$/.exec(scope);
  if (m) {
    const d = Number(m[1]);
    return posts.filter((p) => p.day === d);
  }
  const w = /^semana-(\d+)$/.exec(scope);
  if (w) {
    const week = Number(w[1]);
    return posts.filter((p) => {
      const wk = p.day <= 7 ? 1 : p.day <= 14 ? 2 : p.day <= 21 ? 3 : 4;
      return wk === week;
    });
  }
  if (scope === "slides-only") return posts.filter((p) => p.type === "carousel");
  if (scope === "videos-only") return posts.filter((p) => p.type === "video");
  return posts;
}

async function getMJPhotoUrl(day, slot, slideIdx) {
  const path = `mj/D${day}-${slot}-${slideIdx}.jpg`;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Verify it exists
  const headRes = await fetch(data.publicUrl, { method: "HEAD" });
  if (!headRes.ok) return null;
  return data.publicUrl;
}

async function uploadSlide(buffer, path) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: true,
    });
  if (error) throw new Error(`Upload ${path}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function slideAlreadyExists(outPath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(outPath);
  const head = await fetch(data.publicUrl, { method: "HEAD" });
  return head.ok;
}

async function renderOne(browser, post, slide, slideIdx, photoSlideIdxs) {
  const outPath = `slides/D${post.day}-${post.slot}-${String(slideIdx).padStart(2, "0")}.png`;

  // Skip se o slide ja existe em Storage (resume seguro depois de falha parcial).
  if (process.env.SKIP_EXISTING_SLIDES !== "false") {
    if (await slideAlreadyExists(outPath)) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(outPath);
      return { post: `D${post.day}-${post.slot}`, slide: slideIdx, url: data.publicUrl, skipped: true };
    }
  }

  // Determine if this slide gets an MJ photo background.
  const photoIdx = photoSlideIdxs.find((idx) => idx === slideIdx);
  const photoUrl = photoIdx !== undefined ? await getMJPhotoUrl(post.day, post.slot, photoIdx) : null;

  const dayLabel = `D${post.day} · ${post.slot === "morning" ? "10h" : "13h"}`;
  const html = buildSlideHTML(slide, {
    photoUrl,
    dayLabel,
    isVideo: post.type === "video",
    isCarousel: post.type === "carousel",
    isLastSlide: slideIdx === post.slides.length - 1,
    slideIndex: slideIdx + 1,
    totalSlides: post.slides.length,
  });

  const isVideo = post.type === "video";
  const w = isVideo ? 1080 : 1080;
  const h = isVideo ? 1920 : 1350;

  // Retry com backoff: imagens MJ lentas/rede instavel podem fazer screenshot
  // ou networkidle timeout. 3 tentativas: 2s, 4s, 8s.
  const MAX_ATTEMPTS = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const page = await browser.newPage();
    try {
      page.setDefaultTimeout(60000);
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
      // waitUntil "load" e mais robusto que "networkidle0" quando imagens
      // MJ demoram (que e o caso aqui).
      await page.setContent(html, { waitUntil: "load", timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      const buffer = await page.screenshot({ type: "png", omitBackground: false, timeout: 45000 });
      await page.close();
      const url = await uploadSlide(buffer, outPath);
      return { post: `D${post.day}-${post.slot}`, slide: slideIdx, url };
    } catch (err) {
      lastErr = err;
      try { await page.close(); } catch {}
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastErr;
}

async function processWithConcurrency(items, limit, worker) {
  const results = [];
  let i = 0;
  const inflight = new Set();

  while (i < items.length || inflight.size > 0) {
    while (inflight.size < limit && i < items.length) {
      const idx = i++;
      const p = worker(items[idx], idx)
        .then((r) => results.push({ ok: true, value: r }))
        .catch((e) => results.push({ ok: false, error: String(e), item: items[idx] }))
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
  console.log(`Rendering slides for ${posts.length}/${allPosts.length} posts`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  // Flatten into (post, slideIdx, slide) units.
  const units = [];
  for (const post of posts) {
    const photoSlideIdxs = (post.mjPrompts || []).map((p) => p.slideIndex);
    post.slides.forEach((slide, idx) => {
      units.push({ post, slide, idx, photoSlideIdxs });
    });
  }
  console.log(`Total slides to render: ${units.length}`);

  const results = await processWithConcurrency(units, CONCURRENCY, async (u) => {
    return renderOne(browser, u.post, u.slide, u.idx, u.photoSlideIdxs);
  });

  await browser.close();

  const ok = results.filter((r) => r.ok && !r.value?.skipped);
  const skipped = results.filter((r) => r.ok && r.value?.skipped);
  const failed = results.filter((r) => !r.ok);
  console.log(`Done. OK: ${ok.length}, Skipped (ja existiam): ${skipped.length}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    for (const f of failed.slice(0, 10)) {
      console.error(`FAIL D${f.item.post.day}-${f.item.post.slot} slide ${f.item.idx}: ${f.error}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
