import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "./dictionaries";
import { SafetyButton } from "@/components/safety-button";

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const otherLang = lang === "pt" ? "en" : "pt";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-10 max-w-md">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-serif text-5xl font-semibold tracking-tight text-barro">
            {dict.meta.title}
          </h1>
          <p className="font-serif text-lg text-terracota italic">
            {dict.meta.subtitle}
          </p>
        </div>

        <p className="font-serif text-xl leading-relaxed text-carvao/80">
          &ldquo;{dict.welcome.slogan}&rdquo;
        </p>

        <p className="font-serif text-base leading-relaxed text-salvia">
          {dict.welcome.greeting}
        </p>

        <div className="flex flex-col gap-4 w-full mt-4">
          <Link
            href={`/${lang}/auth/register`}
            className="w-full rounded-full bg-barro px-8 py-4 font-sans text-base font-medium text-creme text-center transition-colors hover:bg-barro-symbol"
          >
            {dict.welcome.start}
          </Link>
          <Link
            href={`/${lang}/auth/login`}
            className="w-full rounded-full border border-barro/20 px-8 py-4 font-sans text-base font-medium text-barro text-center transition-colors hover:bg-areia"
          >
            {dict.welcome.login}
          </Link>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Link
            href={`/${otherLang}`}
            className="font-sans text-sm text-carvao/50 hover:text-carvao transition-colors"
          >
            {dict.language.switch}
          </Link>
        </div>

        <p className="font-sans text-xs text-carvao/40 max-w-xs">
          {dict.safety.disclaimer}
        </p>
      </div>

      <SafetyButton label={dict.safety.helpNow} dict={dict.safety} />
    </main>
  );
}
