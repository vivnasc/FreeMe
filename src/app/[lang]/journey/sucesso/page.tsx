import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasLocale } from "../../dictionaries";
import { createClient } from "@/lib/supabase/server";

// Momento gentil a seguir ao pagamento: a pessoa acabou de confiar, recebe-se
// com gratidao antes de entrar no percurso. So acessivel a quem ja pagou.
export default async function SucessoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const pt = lang === "pt";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const { data: profile } = await supabase
    .from("freeme_profiles")
    .select("display_name, paid")
    .eq("id", user.id)
    .single();
  if (!profile?.paid) redirect(`/${lang}/journey/unlock`);

  const displayName = profile?.display_name || user.email?.split("@")[0];

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="w-full overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/images/gratidao-sucesso.jpg"
            alt={pt ? "Gratidão" : "Gratitude"}
            width={1280}
            height={853}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-salvia">
            {pt ? "Obrigada" : "Thank you"}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-barro">
            {pt ? "A tua travessia começa agora." : "Your crossing begins now."}
          </h1>
          <p className="font-serif text-base leading-relaxed text-carvao/70">
            {pt
              ? `${displayName}, o pagamento foi confirmado. O percurso completo está aberto para ti, ao teu ritmo.`
              : `${displayName}, your payment is confirmed. The full journey is open for you, at your own pace.`}
          </p>
        </div>

        <Link
          href={`/${lang}/journey`}
          className="rounded-full bg-barro px-10 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-barro-symbol"
        >
          {pt ? "Entrar no percurso" : "Enter the journey"}
        </Link>
      </div>
    </main>
  );
}
