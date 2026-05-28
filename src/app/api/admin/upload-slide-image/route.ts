import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";

const BUCKET = "freeme-assets";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const slideId = formData.get("slideId") as string | null;

  if (!file || !slideId) {
    return NextResponse.json({ error: "file and slideId required" }, { status: 400 });
  }

  await ensureBucket(BUCKET, { public: true });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `slides-manual/${slideId}.${ext}`;

  const supabase = getAdminSupabase();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({ url: urlData.publicUrl, slideId });
}
