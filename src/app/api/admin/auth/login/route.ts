import { NextResponse } from "next/server";
import { verifyLogin, setAdminCookie } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!verifyLogin(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminCookie(email);
  return NextResponse.json({ ok: true });
}
