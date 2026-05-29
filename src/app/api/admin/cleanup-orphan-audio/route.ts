import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";

const BUCKET = "freeme-assets";

// Remove pastas audio/D*-morning/ e audio/D*-evening/ que ficaram orfas
// quando render-videos foi alinhado para o pKey path (D*-10h / D*-13h).
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureBucket(BUCKET, { public: true });
  const supabase = getAdminSupabase();

  const { data: folders, error: listErr } = await supabase.storage
    .from(BUCKET)
    .list("audio", { limit: 1000 });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  const orphanFolders = (folders || [])
    .filter((f) => /^D\d+-(morning|evening)$/.test(f.name))
    .map((f) => f.name);

  let removed = 0;
  for (const folder of orphanFolders) {
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(`audio/${folder}`, { limit: 1000 });
    const paths = (files || []).map((f) => `audio/${folder}/${f.name}`);
    if (paths.length === 0) continue;
    const { error: delErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (delErr) {
      return NextResponse.json({ error: `${folder}: ${delErr.message}`, removed }, { status: 500 });
    }
    removed += paths.length;
  }

  return NextResponse.json({ ok: true, folders: orphanFolders, removed });
}
