import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../../dictionaries";
import { RegisterForm } from "./register-form";
import { SafetyButton } from "@/components/safety-button";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-serif text-3xl font-semibold text-barro">
            {dict.meta.title}
          </h1>
          <p className="font-sans text-sm text-carvao/60">
            {lang === "pt" ? "Criar conta" : "Create account"}
          </p>
        </div>

        <RegisterForm lang={lang} dict={dict} />

        <p className="font-sans text-sm text-carvao/50">
          {lang === "pt" ? "Já tens conta?" : "Already have an account?"}{" "}
          <Link
            href={`/${lang}/auth/login`}
            className="text-barro font-medium hover:underline"
          >
            {lang === "pt" ? "Entrar" : "Sign in"}
          </Link>
        </p>

        <p className="font-sans text-xs text-carvao/40 max-w-xs text-center">
          {dict.safety.disclaimer}
        </p>
      </div>

      <SafetyButton label={dict.safety.helpNow} dict={dict.safety} />
    </main>
  );
}
