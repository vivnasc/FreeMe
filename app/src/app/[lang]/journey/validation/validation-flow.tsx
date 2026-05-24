"use client";

import { useState } from "react";
import Link from "next/link";
import { type BlockerName, THERAPEUTIC_ORDER } from "@/lib/types";

interface Props {
  lang: string;
  pathOrder: BlockerName[];
  blockerLabels: Record<string, string>;
  diagnosticTotals: Record<BlockerName, number> | null;
  firstAnnotation: string | null;
  integrations: { blockerName: string; content: string }[];
  lastAnnotation: string | null;
}

const SYMBOL_OPTIONS = {
  pt: ["Ocupei o meu lugar.", "Voltei a mim.", "Pouso o que não é meu.", "Sou mãe, e sou inteira."],
  en: ["I took my place.", "I came back to myself.", "I set down what isn't mine.", "I am a mother, and I am whole."],
};

export function ValidationFlow({
  lang,
  pathOrder,
  blockerLabels,
  diagnosticTotals,
  firstAnnotation,
  integrations,
  lastAnnotation,
}: Props) {
  const [screen, setScreen] = useState(0);
  const [chosenSymbol, setChosenSymbol] = useState("");
  const l = lang as "pt" | "en";

  const maxScore = diagnosticTotals
    ? Math.max(...Object.values(diagnosticTotals), 1)
    : 1;

  const screens = [
    // SCREEN 0: O antes
    <div key="before" className="flex flex-col gap-8 items-center text-center">
      <h2 className="font-serif text-2xl text-barro">
        {lang === "pt" ? "Quando começaste, foi isto que trouxeste." : "When you began, this is what you brought."}
      </h2>

      {diagnosticTotals && (
        <div className="w-full flex flex-col gap-2">
          {THERAPEUTIC_ORDER.filter((b) => (diagnosticTotals[b] || 0) > 0).map((b) => (
            <div key={b} className="flex items-center gap-3">
              <span className="font-serif text-sm w-24 text-right text-carvao/70">
                {blockerLabels[b] || b}
              </span>
              <div className="flex-1 bg-areia rounded-full h-2.5">
                <div
                  className="bg-terracota/60 h-2.5 rounded-full"
                  style={{ width: `${((diagnosticTotals[b] || 0) / maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {firstAnnotation && (
        <div className="w-full rounded-2xl bg-areia/50 p-6">
          <p className="font-sans text-xs text-carvao/40 mb-2">
            {lang === "pt" ? "A tua primeira anotação" : "Your first annotation"}
          </p>
          <p className="font-serif text-base text-carvao italic whitespace-pre-line">
            &ldquo;{firstAnnotation}&rdquo;
          </p>
        </div>
      )}
    </div>,

    // SCREEN 1: O caminho
    <div key="path" className="flex flex-col gap-6 items-center text-center">
      <h2 className="font-serif text-2xl text-barro">
        {lang === "pt" ? "E foi isto que foste pousando." : "And this is what you set down."}
      </h2>

      <div className="w-full flex flex-col gap-4">
        {integrations.map((integ, i) => (
          <div key={i} className="rounded-2xl bg-areia/30 border border-barro/10 p-5 text-left">
            <p className="font-sans text-xs text-terracota mb-2">
              {blockerLabels[integ.blockerName] || integ.blockerName}
            </p>
            <p className="font-serif text-base text-carvao whitespace-pre-line">
              {integ.content}
            </p>
          </div>
        ))}
      </div>
    </div>,

    // SCREEN 2: O agora
    <div key="now" className="flex flex-col gap-8 items-center text-center">
      <h2 className="font-serif text-2xl text-barro">
        {lang === "pt" ? "E foi aqui que chegaste." : "And this is where you arrived."}
      </h2>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {firstAnnotation && (
          <div className="rounded-2xl bg-areia/50 p-5">
            <p className="font-sans text-xs text-carvao/40 mb-2">
              {lang === "pt" ? "No início" : "At the start"}
            </p>
            <p className="font-serif text-sm text-carvao/70 italic whitespace-pre-line">
              &ldquo;{firstAnnotation}&rdquo;
            </p>
          </div>
        )}
        {lastAnnotation && (
          <div className="rounded-2xl bg-salvia/10 border border-salvia/20 p-5">
            <p className="font-sans text-xs text-salvia mb-2">
              {lang === "pt" ? "Agora" : "Now"}
            </p>
            <p className="font-serif text-sm text-carvao italic whitespace-pre-line">
              &ldquo;{lastAnnotation}&rdquo;
            </p>
          </div>
        )}
      </div>

      <p className="font-serif text-base text-carvao/60 leading-relaxed max-w-sm">
        {lang === "pt"
          ? "Vê, pelas tuas próprias palavras, a distância entre quem entrou e quem chegou."
          : "See, through your own words, the distance between who entered and who arrived."}
      </p>
    </div>,

    // SCREEN 3: A voz
    <div key="voice" className="flex flex-col gap-8 items-center text-center">
      <h2 className="font-serif text-2xl text-barro">
        {lang === "pt" ? "Uma voz para ti" : "A voice for you"}
      </h2>

      <div className="rounded-2xl bg-areia/50 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-barro/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-barro" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <p className="font-sans text-sm text-carvao/50">
          {lang === "pt"
            ? "Áudio final (voz da Vivianne, a gravar)"
            : "Final audio (Vivianne's voice, to be recorded)"}
        </p>
      </div>

      <div className="font-serif text-base text-carvao/80 leading-relaxed max-w-sm italic">
        <p>
          {lang === "pt"
            ? "Olha para onde estás agora. Não estás curada, ninguém fica curado, e ainda bem, porque curar não é ficar sem feridas, é parar de as carregar sozinha e às escondidas. Tu vieste, olhaste o que doía, e pousaste o que não era teu. Isso não é pouco. Isso é o trabalho de uma vida, e tu fizeste-o."
            : "Look at where you are now. You are not healed, no one is, and that's fine, because healing is not being wound-free, it's stopping carrying them alone and in secret. You came, you looked at what hurt, and you set down what wasn't yours. That's not little. That's a lifetime's work, and you did it."}
        </p>
        <p className="mt-4">
          {lang === "pt"
            ? "Bem-vinda ao teu lugar. Sempre foi teu."
            : "Welcome to your place. It was always yours."}
        </p>
      </div>
    </div>,

    // SCREEN 4: O símbolo
    <div key="symbol" className="flex flex-col gap-8 items-center text-center">
      <svg
        className="w-20 h-20 mx-auto opacity-80"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425"
          fill="none"
          stroke="#8C4A36"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h2 className="font-serif text-2xl text-barro">
        {lang === "pt" ? "A tua frase de chegada" : "Your arrival phrase"}
      </h2>

      <div className="flex flex-col gap-3 w-full">
        {SYMBOL_OPTIONS[l].map((phrase) => (
          <button
            key={phrase}
            onClick={() => setChosenSymbol(phrase)}
            className={`w-full rounded-2xl border p-4 font-serif text-lg transition-all ${
              chosenSymbol === phrase
                ? "border-barro bg-areia text-barro"
                : "border-barro/15 text-carvao/70 hover:bg-areia/40"
            }`}
          >
            {phrase}
          </button>
        ))}
      </div>

      {chosenSymbol && (
        <div className="mt-4 flex flex-col items-center gap-4">
          <p className="font-serif text-xl text-barro italic">
            &ldquo;{chosenSymbol}&rdquo;
          </p>
          <Link
            href={`/${lang}/journey`}
            className="rounded-full bg-salvia px-8 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-salvia/90"
          >
            {lang === "pt" ? "Voltar ao percurso" : "Return to journey"}
          </Link>
        </div>
      )}
    </div>,
  ];

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg flex flex-col gap-8">
        <div className="flex justify-center gap-2">
          {screens.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === screen ? "bg-barro scale-125" : "bg-areia"
              }`}
            />
          ))}
        </div>

        {screens[screen]}

        <div className="flex justify-between mt-4">
          {screen > 0 ? (
            <button
              onClick={() => setScreen(screen - 1)}
              className="font-sans text-sm text-carvao/50 hover:text-carvao"
            >
              ← {lang === "pt" ? "anterior" : "previous"}
            </button>
          ) : (
            <div />
          )}
          {screen < screens.length - 1 && (
            <button
              onClick={() => setScreen(screen + 1)}
              className="font-sans text-sm text-barro hover:text-barro-symbol font-medium"
            >
              {lang === "pt" ? "seguinte" : "next"} →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
