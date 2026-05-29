import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase, ensureBucket } from "@/lib/admin/supabase-admin";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "";
// v3 e o modelo correcto para PT-PT (testado pela Vivianne em aulas).
// NAO passar language_code (interfere com v3) nem stability alto demais.
const ELEVENLABS_MODEL = process.env.ELEVENLABS_TTS_MODEL || "eleven_v3";
const BUCKET = "freeme-assets";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "ElevenLabs not configured" }, { status: 500 });
  }

  const { text, blocker, filename, voiceId } = await request.json();
  const voice = voiceId || ELEVENLABS_VOICE_ID;

  if (!voice) {
    return NextResponse.json({ error: "Voice ID required" }, { status: 400 });
  }

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
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: 0.50,        // permite expressao natural (v3 funciona melhor)
          similarity_boost: 0.75, // padrao v3
          style: 0.50,            // v3 beneficia de algum style
          use_speaker_boost: true,
        },
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
