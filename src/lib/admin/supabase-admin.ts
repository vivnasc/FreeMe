import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
const _ensuredBuckets = new Set<string>();

export function getAdminSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.FREEME_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  _client = createClient(url, key);
  return _client;
}

// Cria o bucket se nao existir, e se existir garante que respeita as options
// (public flag em particular). Idempotente. Cacheado por processo.
//
// Bug que motivou a verificacao em update: se o bucket foi criado como private
// (manual via dashboard ou outra app), o codigo antigo so chamava createBucket
// que falha com "already exists" e seguia em frente assumindo que estava OK.
// URLs publicos retornavam 404 silenciosamente e so dava problema quando o
// Metricool tentava fetch.
export async function ensureBucket(name: string, options?: { public?: boolean; fileSizeLimit?: number }): Promise<void> {
  if (_ensuredBuckets.has(name)) return;
  const supabase = getAdminSupabase();

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets: ${listErr.message}`);

  const existing = buckets?.find((b) => b.name === name);
  const wantPublic = options?.public ?? true;

  if (!existing) {
    const { error: createErr } = await supabase.storage.createBucket(name, {
      public: wantPublic,
      fileSizeLimit: options?.fileSizeLimit,
    });
    if (createErr && !/already exists/i.test(createErr.message)) {
      throw new Error(`createBucket ${name}: ${createErr.message}`);
    }
  } else if (existing.public !== wantPublic) {
    // Bucket existe mas com flag public diferente do que queremos: ajusta.
    const { error: updateErr } = await supabase.storage.updateBucket(name, {
      public: wantPublic,
      fileSizeLimit: options?.fileSizeLimit,
    });
    if (updateErr) {
      throw new Error(`updateBucket ${name} (public=${wantPublic}): ${updateErr.message}`);
    }
  }
  _ensuredBuckets.add(name);
}
