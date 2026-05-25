import { cookies } from "next/headers";
import { createHmac } from "crypto";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SECRET = process.env.ADMIN_PASSWORD || "freeme-admin-fallback";
const COOKIE_NAME = "freeme_admin";

function sign(email: string): string {
  return createHmac("sha256", SECRET).update(email).digest("hex");
}

export function verifyLogin(email: string, password: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase()) && password === ADMIN_PASSWORD;
}

export async function setAdminCookie(email: string) {
  const store = await cookies();
  const token = `${email}:${sign(email)}`;
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getAdminEmail(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [email, hash] = token.split(":");
  if (!email || !hash) return null;
  if (sign(email) !== hash) return null;
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) return null;
  return email;
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminEmail()) !== null;
}
