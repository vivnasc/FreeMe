import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase } from "@/lib/admin/supabase-admin";
import { generateImage, type AspectRatio } from "@/lib/admin/replicate";
import { FREEME_STYLE_BASE } from "@/content/mj-prompts";

export const maxDuration = 60;

interface GenerateItem {
  key: string;
  prompt: string;
  type: "carousel" | "video";
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = (await request.json()) as { items: GenerateItem[] };

  if (!items?.length) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }
  if (items.length > 5) {
    return NextResponse.json({ error: "max 5 items per request" }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  const results = await Promise.allSettled(
    items.map(async (item) => {
      const aspectRatio: AspectRatio = item.type === "carousel" ? "4:5" : "9:16";
      const fullPrompt = `${item.prompt}, ${FREEME_STYLE_BASE}`;

      const replicateUrl = await generateImage({
        prompt: fullPrompt,
        aspectRatio,
        outputFormat: "jpg",
      });

      const imgRes = await fetch(replicateUrl);
      if (!imgRes.ok) throw new Error(`Download falhou: ${imgRes.status}`);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      const path = `freeme-content/mj/${item.key}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("course-assets")
        .upload(path, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (upErr) throw new Error(`Upload falhou: ${upErr.message}`);

      const { data: urlData } = supabase.storage
        .from("course-assets")
        .getPublicUrl(path);

      return { key: item.key, url: urlData.publicUrl };
    })
  );

  return NextResponse.json({
    results: results.map((r, i) => ({
      key: items[i].key,
      url: r.status === "fulfilled" ? r.value.url : null,
      error: r.status === "rejected" ? String(r.reason).slice(0, 300) : null,
    })),
  });
}
