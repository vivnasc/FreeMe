"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIAGNOSTIC_QUESTIONS, type DiagnosticOption } from "@/content/diagnostic";
import { calculateScores, getActiveBlockers, getDominantBlocker, buildAdaptivePath, detectTrauma, BLOCKER_LABELS, BLOCKER_TENDER_MESSAGES } from "@/lib/path";
import { createClient } from "@/lib/supabase/client";
import { type BlockerName, THERAPEUTIC_ORDER } from "@/lib/types";

type Phase = "questions" | "map";

export function DiagnosticFlow({ lang }: { lang: string }) {
  const [phase, setPhase] = useState<Phase>("questions");
  const [currentQ, setCurrentQ] = useState(0);
  const [selections, setSelections] = useState<DiagnosticOption[]>([]);
  const [result, setResult] = useState<{
    totals: Record<BlockerName, number>;
    dominant: BlockerName | null;
    path: BlockerName[];
    trauma: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const question = DIAGNOSTIC_QUESTIONS[currentQ];
  const l = lang as "pt" | "en";

  function selectOption(option: DiagnosticOption) {
    const next = [...selections, option];
    setSelections(next);

    if (currentQ < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const totals = calculateScores(next);
      const active = getActiveBlockers(totals);
      const dominant = getDominantBlocker(totals);
      const path = active.length > 0 ? buildAdaptivePath(active) : [...THERAPEUTIC_ORDER];
      const trauma = detectTrauma(next);
      setResult({ totals, dominant, path, trauma });
      setPhase("map");
    }
  }

  async function startJourney() {
    if (!result) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/${lang}/auth/login`); return; }

    const { data: diag } = await supabase
      .from("diagnostics")
      .insert({
        user_id: user.id,
        responses: selections.map((s, i) => ({
          question_id: i + 1,
          option_id: s.id,
          blocker_scores: s.scores,
        })),
        blocker_totals: result.totals,
        active_blockers: getActiveBlockers(result.totals),
        path_order: result.path,
        trauma_flag: result.trauma,
      })
      .select("id")
      .single();

    if (!diag) { setSaving(false); return; }

    const { data: journey } = await supabase
      .from("journeys")
      .insert({
        user_id: user.id,
        diagnostic_id: diag.id,
        path_order: result.path,
        current_index: 0,
      })
      .select("id")
      .single();

    if (!journey) { setSaving(false); return; }

    for (let i = 0; i < result.path.length; i++) {
      await supabase.from("blocker_progress").insert({
        journey_id: journey.id,
        blocker_name: result.path[i],
        order_in_path: i,
        unlocked_at: i === 0 ? new Date().toISOString() : null,
      });
    }

    router.push(`/${lang}/journey`);
    router.refresh();
  }

  if (phase === "questions") {
    const progress = ((currentQ) / DIAGNOSTIC_QUESTIONS.length) * 100;

    return (
      <div className="flex flex-col gap-8">
        <div className="w-full bg-areia rounded-full h-1.5">
          <div
            className="bg-terracota h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="font-sans text-xs text-carvao/40 text-center">
          {currentQ + 1} / {DIAGNOSTIC_QUESTIONS.length}
        </p>

        <h2 className="font-serif text-2xl text-carvao leading-snug text-center">
          {question.text[l]}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => selectOption(opt)}
              className="w-full text-left rounded-2xl border border-barro/15 bg-creme px-5 py-4 font-sans text-base text-carvao transition-all hover:border-barro/40 hover:bg-areia/60 active:scale-[0.98]"
            >
              {opt.text[l]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "map" && result) {
    const maxScore = Math.max(...Object.values(result.totals), 1);

    return (
      <div className="flex flex-col gap-8 items-center text-center">
        <h2 className="font-serif text-2xl text-barro">
          {lang === "pt" ? "O teu mapa" : "Your map"}
        </h2>

        {result.trauma && (
          <div className="w-full rounded-2xl bg-salvia/10 border border-salvia/20 p-5">
            <p className="font-serif text-base text-salvia leading-relaxed">
              {lang === "pt"
                ? "Algumas das tuas respostas indicam uma dor que merece acompanhamento de alguém preparado. O percurso vai reforçar primeiro o chão (peso e vazio), e em qualquer momento podes pedir ajuda."
                : "Some of your answers indicate a pain that deserves accompaniment from someone prepared. The journey will first reinforce the ground (weight and void), and at any moment you can ask for help."}
            </p>
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          {THERAPEUTIC_ORDER.map((b) => {
            const score = result.totals[b];
            const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
            const isDominant = b === result.dominant;
            const inPath = result.path.includes(b);

            return (
              <div key={b} className={`flex items-center gap-3 ${!inPath ? "opacity-30" : ""}`}>
                <span className={`font-serif text-sm w-24 text-right ${isDominant ? "text-barro font-medium" : "text-carvao/70"}`}>
                  {BLOCKER_LABELS[b][l]}
                </span>
                <div className="flex-1 bg-areia rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${isDominant ? "bg-barro" : "bg-terracota/60"}`}
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {result.dominant && (
          <p className="font-serif text-base text-carvao/80 leading-relaxed max-w-sm">
            {BLOCKER_TENDER_MESSAGES[result.dominant][l]}
          </p>
        )}

        <p className="font-sans text-sm text-carvao/50">
          {lang === "pt"
            ? `O teu percurso tem ${result.path.length} bloqueio${result.path.length > 1 ? "s" : ""}, pela ordem que te protege.`
            : `Your journey has ${result.path.length} block${result.path.length > 1 ? "s" : ""}, in the order that protects you.`}
        </p>

        <button
          onClick={startJourney}
          disabled={saving}
          className="mt-4 rounded-full bg-barro px-10 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-barro-symbol disabled:opacity-50"
        >
          {saving
            ? lang === "pt" ? "A preparar..." : "Preparing..."
            : lang === "pt" ? "Começar o percurso" : "Begin the journey"}
        </button>
      </div>
    );
  }

  return null;
}
