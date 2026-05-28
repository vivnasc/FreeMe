// Reads ALL_POSTS + MJ_PROMPTS from the TypeScript source and writes a JSON snapshot
// that the render scripts (pure JS) can consume without TS loaders.
import fs from "node:fs";
import path from "node:path";
import { ALL_POSTS } from "../../src/content/content-calendar";
import { getMJPrompts } from "../../src/content/mj-prompts";

const out = ALL_POSTS.map((p) => ({
  ...p,
  mjPrompts: getMJPrompts(p.day, p.slot),
}));

const outPath = path.resolve("tools/produce/posts.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Wrote ${out.length} posts to ${outPath}`);
