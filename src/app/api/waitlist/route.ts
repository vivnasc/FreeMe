import { NextResponse } from "next/server";
import { sendWaitlistSignup } from "@/lib/email/waitlist";

export async function POST(request: Request) {
  const { email, name = "", lang = "pt" } = (await request.json()) as {
    email?: string;
    name?: string;
    lang?: string;
  };

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "email inválido" }, { status: 400 });
  }

  try {
    await sendWaitlistSignup(
      email.trim(),
      (name || "").trim(),
      lang === "en" ? "en" : "pt",
    );
  } catch (e) {
    console.error("waitlist signup failed:", e);
    return NextResponse.json({ error: "Não foi possível inscrever agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
