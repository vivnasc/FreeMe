import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";

const BUCKET = "freeme-assets";

type Supa = ReturnType<typeof getAdminSupabase>;

// Lista recursivamente todos os ficheiros sob um prefixo (max 2 niveis de profundidade).
async function listRecursive(supabase: Supa, prefix: string, depth = 0): Promise<{ path: string; name: string; size?: number; createdAt?: string; updatedAt?: string }[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) throw new Error(error.message);
  const out: { path: string; name: string; size?: number; createdAt?: string; updatedAt?: string }[] = [];
  for (const entry of data || []) {
    if (entry.name.startsWith(".")) continue;
    const isFile = entry.metadata && typeof entry.metadata === "object" && "size" in entry.metadata;
    const fullPath = `${prefix}/${entry.name}`;
    if (isFile) {
      out.push({
        path: fullPath,
        name: entry.name,
        size: (entry.metadata as { size?: number })?.size,
        createdAt: entry.created_at as string | undefined,
        updatedAt: entry.updated_at as string | undefined,
      });
    } else if (depth < 2) {
      const sub = await listRecursive(supabase, fullPath, depth + 1);
      out.push(...sub);
    }
  }
  return out;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") || "mj";
  const recursive = searchParams.get("recursive") === "true";

  await ensureBucket(BUCKET, { public: true });
  const supabase = getAdminSupabase();

  try {
    if (recursive) {
      const files = await listRecursive(supabase, prefix);
      const items = files.map((f) => {
        const { data: url } = supabase.storage.from(BUCKET).getPublicUrl(f.path);
        return { ...f, url: url.publicUrl };
      });
      return NextResponse.json({ prefix, count: items.length, items });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || [])
      .filter((f) => !f.name.startsWith("."))
      .map((f) => {
        const path = `${prefix}/${f.name}`;
        const { data: url } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return {
          name: f.name,
          path,
          url: url.publicUrl,
          size: f.metadata?.size as number | undefined,
          createdAt: f.created_at,
          updatedAt: f.updated_at,
        };
      });

    return NextResponse.json({ prefix, count: items.length, items });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
