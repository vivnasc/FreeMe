import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "";
// v3 e o modelo melhor para a voz clonada PT-PT da Vivianne.
// Sem voice_settings: usa os defaults da propria voz clonada (mais naturais).
// Sem language_code, sem previous_text - deixar a voz pura.
const ELEVENLABS_MODEL = process.env.ELEVENLABS_TTS_MODEL || "eleven_v3";
const BUCKET = "freeme-assets";

// v3 voice tag por layout - performance natural varia consoante o tipo de slide.
function voiceTagFor(layout?: string): string {
  switch (layout) {
    case "capa":         return "(amigável)";
    case "conteudo":     return "(didática)";
    case "kinetic-line": return "(didática)";
    case "citacao":      return "(reflexiva)";
    case "cta":          return "(compreensiva)";
    case "assinatura":   return "(com calma)";
    default:             return "(amigável)";
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "ElevenLabs not configured" }, { status: 500 });
  }

  const { text, blocker, filename, voiceId, layout } = await request.json();
  const voice = voiceId || ELEVENLABS_VOICE_ID;

  if (!voice) {
    return NextResponse.json({ error: "Voice ID required" }, { status: 400 });
  }

  // Se o autor ja meteu tag (parentese inicial), respeitar. Caso contrario aplica por layout.
  const hasTag = /^\s*\(/.test(text || "");
  const finalText = hasTag ? text : `${voiceTagFor(layout)} ${text}`;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: finalText,
        model_id: ELEVENLABS_MODEL,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  const storagePath = `audio/${blocker}/${filename}.mp3`;

  await ensureBucket(BUCKET, { public: true });

  const supabase = getAdminSupabase();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({
    url: urlData.publicUrl,
    path: storagePath,
    sizeBytes: audioBuffer.length,
    durationEstimate: Math.round(audioBuffer.length / 16000),
  });
}
