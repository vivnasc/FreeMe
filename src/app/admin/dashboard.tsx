"use client";

import { useState } from "react";
import { CONTENT_30_DAYS, type ContentPost } from "@/content/social-30-days";
import { MJ_PROMPTS } from "@/content/mj-prompts";

export function AdminDashboard() {
  const [selected, setSelected] = useState<ContentPost | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function exportCSV() {
    const header = "Day,Type,Category,Title,Caption,Hashtags";
    const rows = CONTENT_30_DAYS.map((p) =>
      [p.day, p.type, p.categoria, `"${p.title}"`, `"${p.caption.replace(/"/g, '""')}"`, `"${p.hashtags}"`].join(",")
    );
    const csv = [header, ...rows].join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "freeme-30-dias.csv";
    a.click();
  }

  if (selected) {
    const mjPrompts = MJ_PROMPTS[selected.day] || [];

    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-creme/50 hover:text-creme mb-6"
        >
          ← Voltar ao calendário
        </button>

        <div className="flex items-center gap-3 mb-8">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            selected.type === "carousel" ? "bg-terracota/20 text-terracota" : "bg-salvia/20 text-salvia"
          }`}>
            {selected.type === "carousel" ? "Carrossel" : "Vídeo"}
          </span>
          <span className="text-xs text-creme/40">{selected.categoria}</span>
        </div>

        <h1 className="font-sans text-2xl text-terracota mb-8">
          Dia {selected.day}: {selected.title}
        </h1>

        {/* SLIDES / CENAS */}
        <div className="mb-8">
          <h2 className="text-sm text-creme/50 uppercase tracking-wide mb-4">
            {selected.type === "carousel" ? "Slides" : "Cenas"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selected.slides.map((slide, i) => {
              const colors: Record<string, { bg: string; text: string }> = {
                capa: { bg: "bg-barro", text: "text-creme" },
                conteudo: { bg: "bg-creme", text: "text-carvao" },
                citacao: { bg: "bg-areia", text: "text-barro" },
                cta: { bg: "bg-salvia", text: "text-creme" },
                assinatura: { bg: "bg-carvao border border-creme/20", text: "text-creme" },
                "kinetic-line": { bg: "bg-carvao border border-creme/10", text: "text-creme" },
              };
              const c = colors[slide.layout] || colors.conteudo;

              return (
                <div
                  key={i}
                  className={`${c.bg} ${c.text} rounded-xl p-4 aspect-[4/5] flex flex-col justify-center cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() => copy(slide.body, `slide-${i}`)}
                >
                  <p className="text-[10px] uppercase tracking-wide opacity-50 mb-2">
                    {slide.layout} {copiedField === `slide-${i}` ? "· copiado" : ""}
                  </p>
                  <p className="text-xs leading-relaxed whitespace-pre-line">
                    {slide.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* IMAGEM - UPLOAD / MJ PROMPT */}
        <div className="mb-8">
          <h2 className="text-sm text-creme/50 uppercase tracking-wide mb-4">
            Imagem (Midjourney)
          </h2>
          {mjPrompts.map((mj, i) => (
            <div key={i} className="mb-4">
              <div
                className="rounded-xl border border-dashed border-creme/20 p-4 cursor-pointer hover:border-creme/40 transition-colors"
                onClick={() => copy(mj.prompt, `mj-${i}`)}
              >
                <p className="text-xs text-creme/40 mb-1">
                  Clica para copiar o prompt {copiedField === `mj-${i}` ? "· copiado!" : ""}
                </p>
                <p className="text-sm text-creme/80 font-mono">{mj.prompt}</p>
              </div>
            </div>
          ))}

          <div className="mt-4 rounded-xl border-2 border-dashed border-creme/15 p-8 text-center hover:border-creme/30 transition-colors">
            <p className="text-sm text-creme/30">
              Arrasta a imagem gerada para aqui (em breve)
            </p>
          </div>
        </div>

        {/* CAPTION */}
        <div className="mb-8">
          <h2 className="text-sm text-creme/50 uppercase tracking-wide mb-4">
            Caption
          </h2>
          <div
            className="rounded-xl bg-creme/5 p-5 cursor-pointer hover:bg-creme/10 transition-colors"
            onClick={() => copy(selected.caption, "caption")}
          >
            <p className="text-sm text-creme/80 whitespace-pre-line">
              {selected.caption}
            </p>
            <p className="text-xs text-creme/30 mt-3">
              {copiedField === "caption" ? "Copiado!" : "Clica para copiar"}
            </p>
          </div>
        </div>

        {/* HASHTAGS */}
        <div className="mb-8">
          <h2 className="text-sm text-creme/50 uppercase tracking-wide mb-4">
            Hashtags
          </h2>
          <div
            className="rounded-xl bg-creme/5 p-4 cursor-pointer hover:bg-creme/10 transition-colors"
            onClick={() => copy(selected.hashtags, "hashtags")}
          >
            <p className="text-sm text-terracota/80">{selected.hashtags}</p>
            <p className="text-xs text-creme/30 mt-2">
              {copiedField === "hashtags" ? "Copiado!" : "Clica para copiar"}
            </p>
          </div>
        </div>

        {/* PLATAFORMAS */}
        <div className="flex gap-2">
          {selected.platforms.map((p) => (
            <span key={p} className="px-3 py-1 rounded-full bg-creme/10 text-xs text-creme/60">
              {p === "ig" ? "Instagram" : "TikTok"}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-sans text-2xl font-semibold text-terracota">
          FreeMe Admin
        </h1>
        <button
          onClick={exportCSV}
          className="rounded-full bg-salvia px-5 py-2 text-sm text-creme hover:bg-salvia/80"
        >
          Export CSV
        </button>
      </div>

      <p className="text-sm text-creme/50 mb-6">
        30 dias de conteúdo. Clica num post para ver slides, caption, hashtags, e prompt Midjourney.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONTENT_30_DAYS.map((post) => (
          <button
            key={post.day}
            onClick={() => setSelected(post)}
            className="flex items-center gap-4 rounded-xl border border-creme/10 px-5 py-4 text-left hover:border-creme/25 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-barro/20 flex items-center justify-center font-sans text-sm text-terracota font-medium shrink-0">
              {post.day}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-creme truncate">{post.title}</p>
              <div className="flex gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  post.type === "carousel" ? "bg-terracota/15 text-terracota" : "bg-salvia/15 text-salvia"
                }`}>
                  {post.type === "carousel" ? "C" : "V"}
                </span>
                <span className="text-[10px] text-creme/30">{post.categoria}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
