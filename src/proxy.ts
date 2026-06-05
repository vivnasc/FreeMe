import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const locales = ["pt", "en"];
const defaultLocale = "pt";

export function getPreferredLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language") || "";

  // Respeita a ordem e os q-values do header, em vez de devolver sempre o
  // primeiro locale suportado que aparece na string (que favorecia "pt"
  // mesmo quando o utilizador o tinha em ultima preferencia).
  const ranked = acceptLang
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam ? parseFloat(qParam.split("=")[1]) : 1;
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isNaN(quality) ? 0 : quality,
      };
    })
    .filter((x) => x.base)
    .sort((a, b) => b.quality - a.quality);

  for (const { base } of ranked) {
    if (locales.includes(base)) return base;
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

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
