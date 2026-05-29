// Guarda overrides de texto TTS (com tags (suspira), (pausa) etc.) em Storage
// para o GH Actions usar no render-videos.mjs em vez do slide.body.
// Path: freeme-assets/audio/{pKey}/_text.json
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";

const BUCKET = "freeme-assets";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { pKey, texts } = (await request.json()) as { pKey: string; texts: Record<number, string> };
  if (!pKey) return NextResponse.json({ error: "pKey required" }, { status: 400 });

  await ensureBucket(BUCKET, { public: true });
  const supabase = getAdminSupabase();
  const path = `audio/${pKey}/_text.json`;
  const json = JSON.stringify(texts);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(json), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, path });
}
