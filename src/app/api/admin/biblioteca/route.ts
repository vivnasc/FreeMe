import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";

const BUCKET = "freeme-assets";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") || "mj";

  await ensureBucket(BUCKET, { public: true });
  const supabase = getAdminSupabase();

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
}
