// Pool de imagens reutilizaveis (padrao SyncHim §6).
// Lista o que esta em freeme-assets/mj/, agrupa por (layout, categoria, postType)
// e encontra match para slots novos sem gastar mais Replicate.

import { getAdminSupabase } from "./supabase-admin";
import { ALL_POSTS } from "@/content/content-calendar";
import { getMJPrompts } from "@/content/mj-prompts";

const BUCKET = "freeme-assets";
const CACHE_TTL_MS = 60_000;

export interface PoolImage {
  key: string;
  url: string;
  layout: string;
  categoria: string;
  postType: "carousel" | "video";
}

let _cache: { ts: number; items: PoolImage[] } | null = null;

export async function listPool(forceRefresh = false): Promise<PoolImage[]> {
  if (!forceRefresh && _cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return _cache.items;
  }
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).list("mj", {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error || !data) return [];

  const items: PoolImage[] = [];
  for (const file of data) {
    const m = /^D(\d+)-(morning|evening)-(\d+)\.jpg$/.exec(file.name);
    if (!m) continue;
    const day = Number(m[1]);
    const slot = m[2] as "morning" | "evening";
    const slideIndex = Number(m[3]);
    const post = ALL_POSTS.find((p) => p.day === day && p.slot === slot);
    if (!post) continue;
    const slots = getMJPrompts(day, slot);
    const slotMeta = slots[slideIndex];
    if (!slotMeta) continue;
    const slide = post.slides[slotMeta.slideIndex];
    if (!slide) continue;
    const { data: url } = supabase.storage.from(BUCKET).getPublicUrl(`mj/${file.name}`);
    items.push({
      key: `D${day}-${slot}-${slideIndex}`,
      url: url.publicUrl,
      layout: slide.layout,
      categoria: post.categoria,
      postType: post.type,
    });
  }
  _cache = { ts: Date.now(), items };
  return items;
}

// Customize os grupos de categorias que partilham pool visual.
// Default: 1:1 (cada categoria so partilha consigo). Editar conforme dor.
// SyncHim agrupa didaticos A/B/C/D. Aqui ficam isolados ate a Vivianne
// confirmar quais querem partilhar.
function categoriaPool(c: string): string {
  return c;
}

export type ReuseStrategy = "prefer-existing" | "always-new" | "reuse-only";

// Padrao SyncHim §6: match por (layout, categoria) + exclude set.
// Se pool exausto pelo exclude, devolve null (fallback fica a cargo do caller).
export async function findReusableImage(
  layout: string,
  categoria: string,
  postType: "carousel" | "video",
  exclude?: Set<string>,
): Promise<PoolImage | null> {
  const pool = await listPool();
  const target = categoriaPool(categoria);
  const matches = pool.filter((p) =>
    p.layout === layout &&
    categoriaPool(p.categoria) === target &&
    p.postType === postType &&
    !exclude?.has(p.url),
  );
  if (matches.length === 0) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}

export function invalidatePoolCache() {
  _cache = null;
}
