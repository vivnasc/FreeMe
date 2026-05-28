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

// Cria o bucket se nao existir. Idempotente. Cacheado por processo.
export async function ensureBucket(name: string, options?: { public?: boolean; fileSizeLimit?: number }): Promise<void> {
  if (_ensuredBuckets.has(name)) return;
  const supabase = getAdminSupabase();

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets: ${listErr.message}`);

  const exists = buckets?.some((b) => b.name === name);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(name, {
      public: options?.public ?? true,
      fileSizeLimit: options?.fileSizeLimit,
    });
    if (createErr && !/already exists/i.test(createErr.message)) {
      throw new Error(`createBucket ${name}: ${createErr.message}`);
    }
  }
  _ensuredBuckets.add(name);
}
