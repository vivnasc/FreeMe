import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.FREEME_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({
      ok: false,
      stage: "env",
      error: "ANTHROPIC_API_KEY (ou FREEME_ANTHROPIC_API_KEY) nao definida",
    });
  }

  const model = process.env.FREEME_ANTHROPIC_MODEL || "claude-haiku-4-5";
  const start = Date.now();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 20,
        messages: [{ role: "user", content: "Responde apenas 'ok'." }],
      }),
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({
        ok: false,
        stage: "claude",
        status: res.status,
        error: err.slice(0, 400),
        latencyMs,
        keyPrefix: key.slice(0, 8),
        model,
      });
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || "";

    return NextResponse.json({
      ok: true,
      model: data.model,
      reply: reply.slice(0, 100),
      latencyMs,
      keyPrefix: key.slice(0, 8),
      usage: data.usage,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      stage: "fetch",
      error: String(e).slice(0, 400),
      latencyMs: Date.now() - start,
    });
  }
}
