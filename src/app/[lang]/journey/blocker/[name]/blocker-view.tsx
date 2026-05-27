"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type BlockerContent } from "@/content/blockers";
import { createClient } from "@/lib/supabase/client";
import type { Annotation } from "@/lib/types";

type Tab = "audio" | "reading" | "exercise" | "notes";

export function BlockerView({
  lang,
  blocker,
  savedAnnotations,
  journeyId,
}: {
  lang: string;
  blocker: BlockerContent;
  savedAnnotations: Annotation[];
  journeyId: string | null;
}) {
  const [tab, setTab] = useState<Tab>("audio");
  const l = lang as "pt" | "en";
  const router = useRouter();

  const tabs: { key: Tab; label: { pt: string; en: string } }[] = [
    { key: "audio", label: { pt: "Ouvir", en: "Listen" } },
    { key: "reading", label: { pt: "Ler", en: "Read" } },
    { key: "exercise", label: { pt: "Exercício", en: "Exercise" } },
    { key: "notes", label: { pt: "Anotações", en: "Notes" } },
  ];

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-8">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <Link
          href={`/${lang}/journey`}
          className="font-sans text-sm text-carvao/50 hover:text-carvao"
        >
          ← {lang === "pt" ? "voltar" : "back"}
        </Link>

        <div className="text-center">
          <p className="font-serif italic text-sm text-terracota mb-1">
            {blocker.tag[l]}
          </p>
          <h1 className="font-serif text-3xl font-semibold text-barro">
            {blocker.title[l]}
          </h1>
        </div>

        <div className="flex gap-1 bg-areia/60 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg py-2.5 font-sans text-sm transition-all ${
                tab === t.key
                  ? "bg-creme text-barro shadow-sm font-medium"
                  : "text-carvao/50 hover:text-carvao/70"
              }`}
            >
              {t.label[l]}
            </button>
          ))}
        </div>

        {tab === "audio" && (
          <AudioTab script={blocker.audioScript[l]} lang={lang} />
        )}
        {tab === "reading" && (
          <ReadingTab text={blocker.reading[l]} />
        )}
        {tab === "exercise" && (
          <ExerciseTab
            lang={lang}
            blocker={blocker}
            savedAnnotations={savedAnnotations}
            journeyId={journeyId}
          />
        )}
        {tab === "notes" && (
          <NotesTab
            lang={lang}
            blocker={blocker}
            savedAnnotations={savedAnnotations}
          />
        )}

        <div className="mt-4 rounded-2xl bg-salvia/5 border border-salvia/15 p-5">
          <p className="font-sans text-xs text-salvia leading-relaxed">
            {blocker.cautionZone[l]}
          </p>
        </div>
      </div>
    </main>
  );
}

function AudioTab({ script, lang }: { script: string; lang: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-areia/50 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-barro/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-barro" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <p className="font-sans text-sm text-carvao/50">
          {lang === "pt"
            ? "Áudio ainda por gravar (voz da Vivianne)"
            : "Audio not yet recorded (Vivianne's voice)"}
        </p>
      </div>

      <details className="group">
        <summary className="font-sans text-sm text-carvao/40 cursor-pointer hover:text-carvao/60">
          {lang === "pt" ? "Ver guião do áudio" : "View audio script"}
        </summary>
        <div className="mt-4 font-serif text-base text-carvao/80 leading-relaxed whitespace-pre-line">
          {script}
        </div>
      </details>
    </div>
  );
}

function ReadingTab({ text }: { text: string }) {
  return (
    <div className="font-serif text-base text-carvao leading-relaxed whitespace-pre-line">
      {text}
    </div>
  );
}

function ExerciseTab({
  lang,
  blocker,
  savedAnnotations: initialAnnotations,
  journeyId,
}: {
  lang: string;
  blocker: BlockerContent;
  savedAnnotations: Annotation[];
  journeyId: string | null;
}) {
  const l = lang as "pt" | "en";
  const router = useRouter();
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [texts, setTexts] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    for (const ann of initialAnnotations) {
      init[ann.step_index] = ann.content;
    }
    return init;
  });
  const [saving, setSaving] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

  async function saveStep(stepIndex: number, isIntegration: boolean) {
    setSaving(stepIndex);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = annotations.find((a) => a.step_index === stepIndex);
    const content = texts[stepIndex] || "";

    if (existing) {
      await supabase
        .from("freeme_annotations")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      setAnnotations((prev) =>
        prev.map((a) => (a.id === existing.id ? { ...a, content } : a))
      );
    } else {
      const { data: inserted } = await supabase
        .from("freeme_annotations")
        .insert({
          user_id: user.id,
          blocker_name: blocker.name,
          step_index: stepIndex,
          is_integration: isIntegration,
          content,
        })
        .select()
        .single();
      if (inserted) {
        setAnnotations((prev) => [...prev, inserted as Annotation]);
      }
    }

    setSaving(null);
  }

  async function completeBloqueio() {
    setCompleting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !journeyId) return;

    await supabase
      .from("freeme_blocker_progress")
      .update({ completed_at: new Date().toISOString() })
      .eq("journey_id", journeyId)
      .eq("blocker_name", blocker.name);

    const { data: journey } = await supabase
      .from("freeme_journeys")
      .select("path_order, current_index")
      .eq("id", journeyId)
      .single();

    if (journey) {
      const nextIndex = (journey.current_index as number) + 1;
      const pathOrder = journey.path_order as string[];

      await supabase
        .from("freeme_journeys")
        .update({ current_index: nextIndex })
        .eq("id", journeyId);

      if (nextIndex < pathOrder.length) {
        await supabase
          .from("freeme_blocker_progress")
          .update({ unlocked_at: new Date().toISOString() })
          .eq("journey_id", journeyId)
          .eq("blocker_name", pathOrder[nextIndex]);
      }
    }

    router.push(`/${lang}/journey`);
    router.refresh();
  }

  const allStepsFilled = blocker.steps.every(
    (_, i) => (texts[i] || "").trim().length > 0
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="font-serif text-sm text-carvao/60 italic">
        {blocker.exerciseIntro[l]}
      </p>

      {blocker.steps.map((step, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-xs text-barro font-medium uppercase tracking-wide">
              {lang === "pt" ? `Passo ${i + 1}` : `Step ${i + 1}`}
            </span>
            <span className="font-serif text-base text-carvao font-medium">
              {step.title[l]}
            </span>
          </div>

          <p className="font-serif text-sm text-carvao/70 leading-relaxed whitespace-pre-line">
            {step.prompt[l]}
          </p>

          <textarea
            value={texts[i] || ""}
            onChange={(e) => setTexts({ ...texts, [i]: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-barro/15 bg-areia/30 px-4 py-3 font-sans text-base text-carvao outline-none focus:border-barro/40 resize-none transition-colors"
            placeholder={lang === "pt" ? "Escreve aqui..." : "Write here..."}
          />

          <button
            onClick={() => saveStep(i, step.isIntegration)}
            disabled={saving === i}
            className="self-end font-sans text-sm text-barro/70 hover:text-barro transition-colors disabled:opacity-50"
          >
            {saving === i
              ? lang === "pt" ? "A guardar..." : "Saving..."
              : lang === "pt" ? "Guardar" : "Save"}
          </button>

          {step.isIntegration && (
            <p className="font-sans text-xs text-salvia">
              {lang === "pt"
                ? "Esta anotação é guardada para a validação final."
                : "This annotation is saved for the final validation."}
            </p>
          )}
        </div>
      ))}

      {allStepsFilled && (
        <button
          onClick={completeBloqueio}
          disabled={completing}
          className="mt-4 self-center rounded-full bg-salvia px-8 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-salvia/90 disabled:opacity-50"
        >
          {completing
            ? lang === "pt" ? "A concluir..." : "Completing..."
            : lang === "pt" ? "Concluir este bloqueio" : "Complete this block"}
        </button>
      )}
    </div>
  );
}

function NotesTab({
  lang,
  blocker,
  savedAnnotations,
}: {
  lang: string;
  blocker: BlockerContent;
  savedAnnotations: Annotation[];
}) {
  const l = lang as "pt" | "en";

  if (savedAnnotations.length === 0) {
    return (
      <p className="font-serif text-base text-carvao/50 text-center py-8">
        {lang === "pt"
          ? "As tuas anotações do exercício aparecerão aqui."
          : "Your exercise annotations will appear here."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {savedAnnotations.map((ann) => {
        const step = blocker.steps[ann.step_index];
        return (
          <div key={ann.id} className="rounded-xl bg-areia/40 p-4">
            <p className="font-sans text-xs text-barro/60 mb-2">
              {step?.title[l] || `Passo ${ann.step_index + 1}`}
              {ann.is_integration && (
                <span className="ml-2 text-salvia">(integração)</span>
              )}
            </p>
            <p className="font-serif text-base text-carvao whitespace-pre-line">
              {ann.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
