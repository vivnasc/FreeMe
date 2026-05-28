import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";

function envInfo(name: string) {
  const v = process.env[name];
  if (!v) return { name, set: false };
  return {
    name,
    set: true,
    length: v.length,
    prefix: v.slice(0, 8),
  };
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    deploy: {
      sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "(local)",
      shaFull: process.env.VERCEL_GIT_COMMIT_SHA || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      message: process.env.VERCEL_GIT_COMMIT_MESSAGE?.slice(0, 100) || null,
      url: process.env.VERCEL_URL || null,
      env: process.env.VERCEL_ENV || null,
      region: process.env.VERCEL_REGION || null,
      buildTime: process.env.NEXT_BUILD_TIME || null,
    },
    envs: [
      envInfo("REPLICATE_API_TOKEN"),
      envInfo("ANTHROPIC_API_KEY"),
      envInfo("FREEME_ANTHROPIC_API_KEY"),
      envInfo("NEXT_PUBLIC_SUPABASE_URL"),
      envInfo("FREEME_SUPABASE_SERVICE_ROLE_KEY"),
      envInfo("SUPABASE_SERVICE_ROLE_KEY"),
      envInfo("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      envInfo("ELEVENLABS_API_KEY"),
      envInfo("ELEVENLABS_VOICE_ID"),
      envInfo("GITHUB_DISPATCH_TOKEN"),
      envInfo("GITHUB_REPO_OWNER"),
      envInfo("GITHUB_REPO_NAME"),
      envInfo("GITHUB_DISPATCH_REF"),
      envInfo("FREEME_ADMIN_EMAILS"),
      envInfo("FREEME_ADMIN_PASSWORD"),
      envInfo("RESEND_API_KEY"),
      envInfo("RESEND_FROM"),
    ],
  });
}
