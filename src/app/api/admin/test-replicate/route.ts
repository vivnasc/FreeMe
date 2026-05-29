import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";
import { generateImage } from "@/lib/admin/replicate";

export const maxDuration = 60;
const BUCKET = "freeme-assets";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const replicateKey = process.env.REPLICATE_API_TOKEN;
  if (!replicateKey) {
    return NextResponse.json({
      ok: false,
      stage: "env",
      missing: "REPLICATE_API_TOKEN",
      error: "REPLICATE_API_TOKEN nao definida no Vercel",
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.FREEME_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) missing.push("FREEME_SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SERVICE_ROLE_KEY)");
  if (missing.length > 0) {
    return NextResponse.json({
      ok: false,
      stage: "env",
      missing,
      error: `Env vars em falta no Vercel: ${missing.join(", ")}. Settings -> Environment Variables -> Add. Service role key esta em Supabase Dashboard -> Settings -> API (NAO a anon key).`,
    });
  }

  const start = Date.now();

  // 1. Garantir bucket
  try {
    await ensureBucket(BUCKET, { public: true });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      stage: "bucket",
      error: String(e).slice(0, 400),
      latencyMs: Date.now() - start,
    });
  }

  // 2. Gerar 1 imagem ping
  let replicateUrl: string;
  try {
    replicateUrl = await generateImage({
      prompt: "minimal still life of a single warm terracotta ceramic mug on cream linen, soft golden hour light, editorial photograph, 8k --ar 4:5 --s 750 --style raw",
      aspectRatio: "4:5",
      outputFormat: "jpg",
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      stage: "replicate",
      error: String(e).slice(0, 400),
      latencyMs: Date.now() - start,
      keyPrefix: replicateKey.slice(0, 6),
    });
  }

  // 3. Download e upload para Storage
  let publicUrl: string;
  try {
    const imgRes = await fetch(replicateUrl);
    if (!imgRes.ok) throw new Error(`download falhou: ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const supabase = getAdminSupabase();
    const path = `tests/ping-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
    if (upErr) throw new Error(`upload falhou: ${upErr.message}`);

    publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch (e) {
    return NextResponse.json({
      ok: false,
      stage: "storage",
      error: String(e).slice(0, 400),
      replicateUrl,
      latencyMs: Date.now() - start,
    });
  }

  return NextResponse.json({
    ok: true,
    model: "black-forest-labs/flux-1.1-pro-ultra",
    bucket: BUCKET,
    url: publicUrl,
    latencyMs: Date.now() - start,
    keyPrefix: replicateKey.slice(0, 6),
  });
}
