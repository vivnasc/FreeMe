import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { createClient } from "@/lib/supabase/server";

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const displayName = profile?.display_name || user!.email?.split("@")[0];

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <p className="font-serif text-2xl text-barro">
          {lang === "pt"
            ? `Bem-vinda, ${displayName}.`
            : `Welcome, ${displayName}.`}
        </p>
        <p className="font-serif text-base text-carvao/70 leading-relaxed">
          {lang === "pt"
            ? "O teu percurso começa com o diagnóstico. Vamos ver quais bloqueios estão mais ativos em ti."
            : "Your journey begins with the diagnostic. Let's see which blocks are most active in you."}
        </p>
        <button className="mt-4 rounded-full bg-barro px-8 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-barro-symbol">
          {lang === "pt" ? "Começar o diagnóstico" : "Begin the diagnostic"}
        </button>
      </div>
    </main>
  );
}
