import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { generateContent } from "@/lib/admin/claude";
import { getAdminSupabase } from "@/lib/admin/supabase-admin";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, brief, categoria } = await request.json();

  const supabase = getAdminSupabase();
  const result = await generateContent(type, brief);

  const code = `FM-${type === "carousel" ? "C" : "V"}-${Date.now().toString(36).toUpperCase()}`;

  const { data: item, error } = await supabase
    .from("freeme_content_items")
    .insert({
      code,
      type,
      categoria,
      title: result.title,
      status: "draft",
      caption: result.caption,
      hashtags: result.hashtags || "",
      metadata: result.music_prompt ? { musicPrompt: result.music_prompt } : {},
    })
    .select("id")
    .single();

  if (error || !item) {
    return NextResponse.json({ error: error?.message || "Insert failed" }, { status: 500 });
  }

  if (type === "carousel" && result.slides) {
    for (let i = 0; i < result.slides.length; i++) {
      await supabase.from("freeme_content_slides").insert({
        item_id: item.id,
        idx: i,
        layout: result.slides[i].layout,
        body: result.slides[i].body,
      });
    }
  }

  if (type === "video" && result.scenes) {
    for (let i = 0; i < result.scenes.length; i++) {
      await supabase.from("freeme_content_slides").insert({
        item_id: item.id,
        idx: i,
        layout: "kinetic-line",
        body: result.scenes[i].text,
        duration_sec: result.scenes[i].duration_sec || 3.5,
      });
    }
  }

  return NextResponse.json({ id: item.id, code, ...result });
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("freeme_content_items")
    .select("*, freeme_content_slides(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json(data || []);
}
