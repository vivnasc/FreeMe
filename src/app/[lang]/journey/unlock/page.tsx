import { notFound, redirect } from "next/navigation";
import { hasLocale, getDictionary } from "../../dictionaries";
import { createClient } from "@/lib/supabase/server";
import { BLOCKER_LABELS } from "@/lib/path";
import { type BlockerName } from "@/lib/types";
import Link from "next/link";

export default async function UnlockPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const l = lang as "pt" | "en";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const { data: journey } = await supabase
    .from("journeys")
    .select("path_order")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (!journey) redirect(`/${lang}/journey`);

  const pathOrder = (journey.path_order || []) as BlockerName[];

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name || user.email?.split("@")[0];

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-8 text-center">
        <div>
          <p className="font-serif text-lg text-salvia mb-2">
            {lang === "pt"
              ? `${displayName}, o teu mapa está feito.`
              : `${displayName}, your map is ready.`}
          </p>
          <h1 className="font-serif text-2xl text-barro">
            {lang === "pt"
              ? "Agora começa a travessia."
              : "Now the crossing begins."}
          </h1>
        </div>

        <div className="rounded-2xl bg-areia/50 p-6">
          <p className="font-sans text-sm text-carvao/60 mb-3">
            {lang === "pt" ? "O teu percurso inclui:" : "Your journey includes:"}
          </p>
          <div className="flex flex-col gap-2">
            {pathOrder.map((b, i) => (
              <div key={b} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-barro/10 flex items-center justify-center font-serif text-xs text-barro">
                  {i + 1}
                </span>
                <span className="font-serif text-base text-carvao">
                  {BLOCKER_LABELS[b][l]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-sans text-sm text-carvao/50">
            {lang === "pt"
              ? "Áudios guiados, exercícios de escrita, anotações privadas, e a validação final."
              : "Guided audio, writing exercises, private annotations, and the final validation."}
          </p>
        </div>

        <div className="rounded-2xl border border-barro/20 bg-creme p-6 flex flex-col gap-4">
          <p className="font-serif text-3xl text-barro font-semibold">
            {lang === "pt" ? "€ --" : "€ --"}
          </p>
          <p className="font-sans text-sm text-carvao/60">
            {lang === "pt"
              ? "Pagamento único. Acesso vitalício ao percurso completo."
              : "One-time payment. Lifetime access to the full journey."}
          </p>
          <button
            disabled
            className="w-full rounded-full bg-barro/30 px-8 py-4 font-sans text-base font-medium text-creme cursor-not-allowed"
          >
            {lang === "pt" ? "Pagamento em breve" : "Payment coming soon"}
          </button>
          <p className="font-sans text-xs text-carvao/30">
            {lang === "pt"
              ? "Stripe (cartão, MB Way, e mais)"
              : "Stripe (card and more)"}
          </p>
        </div>

        <Link
          href={`/${lang}/journey`}
          className="font-sans text-sm text-carvao/40 hover:text-carvao/60"
        >
          ← {lang === "pt" ? "Voltar ao percurso" : "Back to journey"}
        </Link>
      </div>
    </main>
  );
}
