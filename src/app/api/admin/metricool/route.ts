import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { buildCSV } from "@/lib/admin/metricool/csv";
import { getAdminSupabase } from "@/lib/admin/supabase-admin";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemIds } = await request.json();

  const supabase = getAdminSupabase();
  const { data: items } = await supabase
    .from("freeme_content_items")
    .select("*, freeme_content_slides(*)")
    .in("id", itemIds);

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items found" }, { status: 404 });
  }

  const rows = items.map((item) => {
    const slides = (item.freeme_content_slides || []).sort(
      (a: { idx: number }, b: { idx: number }) => a.idx - b.idx,
    );
    const pngUrls = (item.output_urls as { pngs?: string[] })?.pngs || [];
    const videoUrl = (item.output_urls as { video?: string })?.video;

    const scheduledDate = item.scheduled_at
      ? new Date(item.scheduled_at)
      : new Date();

    return {
      date: scheduledDate.toISOString().split("T")[0],
      time: `${String(scheduledDate.getHours()).padStart(2, "0")}:${String(scheduledDate.getMinutes()).padStart(2, "0")}`,
      text: `${item.caption || ""}\n\n${item.hashtags || ""}`.trim(),
      pictureUrls: item.type === "video" ? (videoUrl ? [videoUrl] : []) : pngUrls,
      platforms: {
        ig: {
          type: (item.type === "carousel" ? "CAROUSEL" : "REEL") as "CAROUSEL" | "REEL",
          showReelOnFeed: item.type === "video",
        },
        tiktok: true,
      },
      firstComment: "",
    };
  });

  const csv = buildCSV(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="freeme-metricool-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
