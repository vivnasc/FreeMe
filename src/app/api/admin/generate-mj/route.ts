import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";
import { generateImage, type AspectRatio } from "@/lib/admin/replicate";
import { generateImagePrompt } from "@/lib/admin/claude";
import { ALL_POSTS } from "@/content/content-calendar";
import { getMJPrompts } from "@/content/mj-prompts";

export const maxDuration = 60;
const BUCKET = "freeme-assets";

interface GenerateItem {
  key: string; // "D{day}-{slot}-{slideIndex}"
  day: number;
  slot: "morning" | "evening";
  slideIndex: number;
}

interface GenerateResult {
  key: string;
  url: string | null;
  prompt: string | null;
  rationale: string | null;
  error: string | null;
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

  try {
    await ensureBucket(BUCKET, { public: true });
  } catch (e) {
    return NextResponse.json({ error: `Bucket setup: ${e}` }, { status: 500 });
  }

  const results: GenerateResult[] = await Promise.all(
    items.map(async (item): Promise<GenerateResult> => {
      try {
        const post = ALL_POSTS.find((p) => p.day === item.day && p.slot === item.slot);
        if (!post) throw new Error(`Post nao encontrado para D${item.day}-${item.slot}`);

        // O slideIndex no MJ_PROMPTS pode nao corresponder a um slide existente directamente.
        // Usamos a metadata original para determinar qual slide receber a foto e o usage.
        const slots = getMJPrompts(item.day, item.slot);
        const slotMeta = slots[item.slideIndex];
        if (!slotMeta) throw new Error(`Slot index ${item.slideIndex} nao definido`);

        const slide = post.slides[slotMeta.slideIndex];
        if (!slide) throw new Error(`Slide ${slotMeta.slideIndex} nao existe no post`);

        // 1. Claude gera o prompt MJ a partir do conteúdo do slide
        const promptResult = await generateImagePrompt({
          postTitle: post.title,
          postType: post.type,
          postCategory: post.categoria,
          slideBody: slide.body,
          slideIndex: slotMeta.slideIndex,
          usage: slotMeta.usage,
        });

        // 2. Replicate gera a imagem
        const aspectRatio: AspectRatio = post.type === "carousel" ? "4:5" : "9:16";
        const replicateUrl = await generateImage({
          prompt: promptResult.prompt,
          aspectRatio,
          outputFormat: "jpg",
        });

        // 3. Download da imagem do Replicate
        const imgRes = await fetch(replicateUrl);
        if (!imgRes.ok) throw new Error(`Download falhou: ${imgRes.status}`);
        const buffer = Buffer.from(await imgRes.arrayBuffer());

        // 4. Upload para Supabase Storage
        const path = `mj/${item.key}.jpg`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, buffer, {
            contentType: "image/jpeg",
            upsert: true,
          });
        if (upErr) throw new Error(`Upload falhou: ${upErr.message}`);

        const { data: urlData } = supabase.storage
          .from("course-assets")
          .getPublicUrl(path);

        return {
          key: item.key,
          url: urlData.publicUrl,
          prompt: promptResult.prompt,
          rationale: promptResult.rationale,
          error: null,
        };
      } catch (e) {
        return {
          key: item.key,
          url: null,
          prompt: null,
          rationale: null,
          error: String(e).slice(0, 400),
        };
      }
    })
  );

  return NextResponse.json({ results });
}
