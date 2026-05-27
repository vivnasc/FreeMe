"use client";

import { useState } from "react";
import { BLOCKERS } from "@/content/blockers";
import { type BlockerName, THERAPEUTIC_ORDER } from "@/lib/types";

interface GeneratedAudio {
  blocker: string;
  url: string;
  sizeBytes: number;
  durationEstimate: number;
}

export function AudioStudio() {
  const [selected, setSelected] = useState<BlockerName>("peso");
  const [voiceId, setVoiceId] = useState(process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || "");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedAudio[]>([]);
  const [error, setError] = useState("");

  const blocker = BLOCKERS[selected];
  const script = blocker.audioScript.pt;

  async function generate() {
    if (!voiceId.trim()) {
      setError("Voice ID obrigatório");
      return;
    }
    setGenerating(true);
    setError("");

    const res = await fetch("/api/admin/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: script,
        blocker: selected,
        filename: `${selected}-completo`,
        voiceId: voiceId.trim(),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setGenerated((prev) => [{ blocker: selected, ...data }, ...prev]);
      setGenerating(false);
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao gerar");
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-terracota">Estúdio de Áudio</h1>
          <p className="text-sm text-creme/40 mt-1">ElevenLabs TTS (último modelo, voz clonada)</p>
        </div>
        <a href="/admin" className="text-sm text-creme/40 hover:text-creme/60">← Admin</a>
      </div>

      {/* VOICE ID */}
      <div className="rounded-2xl border border-creme/10 p-5 mb-6">
        <label className="flex flex-col gap-2">
          <span className="text-xs text-creme/40 uppercase tracking-wide">Voice ID</span>
          <input
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="Cole o Voice ID do ElevenLabs"
            className="bg-carvao border border-creme/20 rounded-xl px-4 py-3 text-sm text-creme placeholder:text-creme/20 font-mono"
          />
        </label>
      </div>

      {/* BLOCKER SELECTOR */}
      <div className="flex gap-2 flex-wrap mb-8">
        {THERAPEUTIC_ORDER.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
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

      {/* SCRIPT + GENERATE */}
      <div className="rounded-2xl border border-creme/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-creme/80">{blocker.title.pt}</h2>
          <button
            onClick={generate}
            disabled={generating}
            className="rounded-full bg-barro px-6 py-2 text-sm text-creme hover:bg-barro-symbol disabled:opacity-40"
          >
            {generating ? "A gerar áudio..." : "Gerar áudio completo"}
          </button>
        </div>

        <div className="rounded-xl bg-creme/5 p-5 max-h-96 overflow-y-auto">
          <p className="text-sm text-creme/60 leading-relaxed whitespace-pre-line">{script}</p>
        </div>

        <p className="mt-3 text-[10px] text-creme/25">
          {script.length} caracteres / ~{Math.round(script.length / 15)}s estimados
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>

      {/* GENERATED AUDIOS */}
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
