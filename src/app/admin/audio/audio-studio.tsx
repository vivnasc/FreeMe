"use client";

import { useState } from "react";
import { BLOCKERS } from "@/content/blockers";
import { type BlockerName, THERAPEUTIC_ORDER } from "@/lib/types";

type AudioStatus = "idle" | "generating" | "done" | "error";

interface GeneratedAudio {
  blocker: string;
  url: string;
  sizeBytes: number;
  durationEstimate: number;
}

export function AudioStudio() {
  const [selected, setSelected] = useState<BlockerName>("peso");
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [generated, setGenerated] = useState<GeneratedAudio[]>([]);
  const [error, setError] = useState("");

  const blocker = BLOCKERS[selected];
  const script = blocker.audioScript.pt;
  const paragraphs = script.split("\n\n").filter((p) => p.trim());

  async function generateFull() {
    setStatus("generating");
    setError("");

    const res = await fetch("/api/admin/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: script,
        blocker: selected,
        filename: `${selected}-completo`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setGenerated((prev) => [...prev, { blocker: selected, ...data }]);
      setStatus("done");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao gerar");
      setStatus("error");
    }
  }

  async function generateParagraph(idx: number, text: string) {
    setStatus("generating");
    setError("");

    const res = await fetch("/api/admin/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        blocker: selected,
        filename: `${selected}-parte-${idx + 1}`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setGenerated((prev) => [...prev, { blocker: selected, ...data }]);
      setStatus("done");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao gerar");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-terracota">Estúdio de Áudio</h1>
          <p className="text-sm text-creme/40 mt-1">ElevenLabs TTS com a tua voz clonada</p>
        </div>
        <a href="/admin" className="text-sm text-creme/40 hover:text-creme/60">← Admin</a>
      </div>

      {/* SELECTOR */}
      <div className="flex gap-2 flex-wrap mb-8">
        {THERAPEUTIC_ORDER.map((name) => (
          <button
            key={name}
            onClick={() => { setSelected(name); setStatus("idle"); }}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selected === name
                ? "bg-barro text-creme"
                : "bg-creme/5 text-creme/50 hover:text-creme/80"
            }`}
          >
            {BLOCKERS[name].title.pt}
          </button>
        ))}
      </div>

      {/* SCRIPT */}
      <div className="rounded-2xl border border-creme/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-creme/80">{blocker.title.pt}</h2>
          <button
            onClick={generateFull}
            disabled={status === "generating"}
            className="rounded-full bg-barro px-6 py-2 text-sm text-creme hover:bg-barro-symbol disabled:opacity-40"
          >
            {status === "generating" ? "A gerar..." : "Gerar áudio completo"}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {paragraphs.map((p, i) => (
            <div key={i} className="group flex gap-3">
              <div className="flex-1 rounded-xl bg-creme/5 p-4">
                <p className="text-sm text-creme/70 leading-relaxed">{p}</p>
              </div>
              <button
                onClick={() => generateParagraph(i, p)}
                disabled={status === "generating"}
                className="shrink-0 self-start rounded-lg bg-creme/5 px-3 py-2 text-xs text-creme/30 hover:text-creme/60 hover:bg-creme/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-20"
              >
                Gerar parte
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* GENERATED */}
      {generated.length > 0 && (
        <div className="rounded-2xl border border-creme/10 p-6">
          <h3 className="text-sm text-creme/40 uppercase tracking-wide mb-4">Áudios gerados</h3>
          <div className="flex flex-col gap-3">
            {generated.map((a, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-creme/5 p-4">
                <audio controls src={a.url} className="flex-1 h-10" />
                <div className="text-right shrink-0">
                  <p className="text-xs text-creme/50">{a.blocker}</p>
                  <p className="text-[10px] text-creme/30">
                    ~{a.durationEstimate}s / {Math.round(a.sizeBytes / 1024)}KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
