import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";
import { createClient } from "@/lib/supabase/server";
import { BLOCKER_LABELS } from "@/lib/path";
import { type BlockerName } from "@/lib/types";

export default async function JourneyPage({
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
    .select("*, blocker_progress(*)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (!journey) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-6 max-w-md">
          <p className="font-serif text-2xl text-barro">
            {lang === "pt"
              ? "O teu percurso começa com o diagnóstico."
              : "Your journey begins with the diagnostic."}
          </p>
          <p className="font-serif text-base text-carvao/70 leading-relaxed">
            {lang === "pt"
              ? "Vamos ver quais bloqueios estão mais ativos em ti."
              : "Let's see which blocks are most active in you."}
          </p>
          <Link
            href={`/${lang}/journey/diagnostic`}
            className="mt-4 rounded-full bg-barro px-8 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-barro-symbol"
          >
            {lang === "pt" ? "Começar o diagnóstico" : "Begin the diagnostic"}
          </Link>
        </div>
      </main>
    );
  }

  const pathOrder = (journey.path_order || []) as BlockerName[];
  const progress = (journey.blocker_progress || []) as {
    id: string;
    blocker_name: string;
    order_in_path: number;
    completed_at: string | null;
    unlocked_at: string | null;
  }[];

  const allCompleted = progress.every((p) => p.completed_at);
  const currentIndex = journey.current_index as number;

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg flex flex-col gap-8">
        <h1 className="font-serif text-2xl text-barro text-center">
          {lang === "pt" ? "O teu percurso" : "Your journey"}
        </h1>

        <div className="flex flex-col gap-3">
          {pathOrder.map((blockerName, i) => {
            const bp = progress.find((p) => p.blocker_name === blockerName);
            const isCompleted = !!bp?.completed_at;
            const isUnlocked = !!bp?.unlocked_at;
            const isCurrent = i === currentIndex && !isCompleted;

            return (
              <div key={blockerName}>
                {isUnlocked ? (
                  <Link
                    href={`/${lang}/journey/blocker/${blockerName}`}
                    className={`flex items-center gap-4 rounded-2xl border p-5 transition-all ${
                      isCurrent
                        ? "border-barro/40 bg-areia/80 shadow-sm"
                        : isCompleted
                          ? "border-salvia/30 bg-salvia/5"
                          : "border-barro/15 bg-creme hover:bg-areia/40"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm ${
                      isCompleted
                        ? "bg-salvia text-creme"
                        : isCurrent
                          ? "bg-barro text-creme"
                          : "bg-areia text-carvao/50"
                    }`}>
                      {isCompleted ? "✓" : i + 1}
                    </div>
                    <div>
                      <p className={`font-serif text-lg ${isCompleted ? "text-salvia" : "text-carvao"}`}>
                        {BLOCKER_LABELS[blockerName][l]}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-carvao/5 p-5 opacity-40">
                    <div className="w-8 h-8 rounded-full bg-areia flex items-center justify-center font-serif text-sm text-carvao/30">
                      {i + 1}
                    </div>
                    <p className="font-serif text-lg text-carvao/40">
                      {BLOCKER_LABELS[blockerName][l]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allCompleted && !journey.completed_at && (
          <Link
            href={`/${lang}/journey/validation`}
            className="mt-4 self-center rounded-full bg-salvia px-10 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-salvia/90"
          >
            {lang === "pt" ? "Validação final" : "Final validation"}
          </Link>
        )}
      </div>
    </main>
  );
}
