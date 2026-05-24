import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const locales = ["pt", "en"];
const defaultLocale = "pt";

function getPreferredLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language") || "";
  for (const locale of locales) {
    if (acceptLang.includes(locale)) return locale;
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getPreferredLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next|api|simbolo|.*\\..*).*)"],
};
