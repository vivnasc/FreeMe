"use client";

import { useState } from "react";
import { CONTENT_30_DAYS, type ContentPost } from "@/content/social-30-days";
import { MJ_PROMPTS, FREEME_STYLE_BASE } from "@/content/mj-prompts";
import { ImageDropZone } from "@/components/image-drop-zone";

export function AdminDashboard() {
  const [selected, setSelected] = useState<ContentPost | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tab, setTab] = useState<"slides" | "copy" | "imagem">("slides");
  const [slideImages, setSlideImages] = useState<Record<string, string>>({});

  function onImageUploaded(slideId: string, url: string) {
    setSlideImages((prev) => ({ ...prev, [slideId]: url }));
  }

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function igCaption(post: ContentPost): string {
    return `${post.caption}\n\n.\n.\n.\n${post.hashtags}`;
  }

  function tiktokCaption(post: ContentPost): string {
    const short = post.caption.split("\n")[0];
    const tags = post.hashtags.split(" ").slice(0, 5).join(" ");
    return `${short}\n\n${tags} #fyp #paraamães`;
  }

  function downloadCaption(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  function exportAllCSV() {
    const header = "Day,Type,Category,Title,IG Caption,TikTok Caption,Hashtags,MJ Prompt";
    const rows = CONTENT_30_DAYS.map((p) => {
      const mj = MJ_PROMPTS[p.day]?.[0]?.prompt || "";
      return [
        p.day,
        p.type,
        p.categoria,
        `"${p.title}"`,
        `"${igCaption(p).replace(/"/g, '""')}"`,
        `"${tiktokCaption(p).replace(/"/g, '""')}"`,
        `"${p.hashtags}"`,
        `"${mj}"`,
      ].join(",");
    });
    const csv = [header, ...rows].join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "freeme-30-dias-completo.csv";
    a.click();
  }

  // === DETAIL VIEW ===
  if (selected) {
    const mjPrompts = MJ_PROMPTS[selected.day] || [];

    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => setSelected(null)} className="text-sm text-creme/50 hover:text-creme mb-6">
          ← Calendário
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl font-semibold text-terracota">Dia {selected.day}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            selected.type === "carousel" ? "bg-terracota/20 text-terracota" : "bg-salvia/20 text-salvia"
          }`}>
            {selected.type === "carousel" ? "Carrossel" : "Vídeo"}
          </span>
          <span className="text-xs text-creme/30">{selected.categoria}</span>
        </div>
        <h1 className="text-lg text-creme/80 mb-6">{selected.title}</h1>

        {/* TABS */}
        <div className="flex gap-1 bg-creme/5 rounded-xl p-1 mb-8">
          {(["slides", "copy", "imagem"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm transition-all ${
                tab === t ? "bg-creme/10 text-creme font-medium" : "text-creme/40 hover:text-creme/60"
              }`}
            >
              {t === "slides" ? "Slides" : t === "copy" ? "Copy" : "Imagem MJ"}
            </button>
          ))}
        </div>

        {/* TAB: SLIDES */}
        {tab === "slides" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {selected.slides.map((slide, i) => {
              const slideId = `day-${selected.day}-slide-${i}`;
              const imageUrl = slideImages[slideId];
              const acceptsPhoto = ["capa", "conteudo", "kinetic-line"].includes(slide.layout);
              const palettes: Record<string, { bg: string; text: string; border: string }> = {
                capa: { bg: "#8C4A36", text: "#FBF4EC", border: "#C87A5B" },
                conteudo: { bg: "#FBF4EC", text: "#2E241D", border: "#F3E4D6" },
                citacao: { bg: "#F3E4D6", text: "#8C4A36", border: "#C87A5B" },
                cta: { bg: "#7D8A6A", text: "#FBF4EC", border: "#6E7857" },
                assinatura: { bg: "#2E241D", text: "#FBF4EC", border: "#C87A5B" },
                "kinetic-line": { bg: "#2E241D", text: "#FBF4EC", border: "#3E342D" },
              };
              const p = palettes[slide.layout] || palettes.conteudo;

              return (
                <div key={i} className="flex flex-col gap-2">
                <div
                  className="rounded-2xl overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{
                    backgroundColor: p.bg,
                    color: p.text,
                    border: `1px solid ${p.border}`,
                    aspectRatio: selected.type === "carousel" ? "4/5" : "9/16",
                  }}
                  onClick={() => copy(slide.body, `slide-${i}`)}
                >
                  {imageUrl && (
                    <>
                      <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
                    </>
                  )}
                  <div className="h-full flex flex-col justify-center p-5 relative z-10">
                    <p className="text-[9px] uppercase tracking-widest opacity-40 mb-2">{slide.layout}</p>
                    {slide.layout === "capa" && (
                      <>
                        <p className={`text-sm font-serif leading-snug whitespace-pre-line ${imageUrl ? "text-white" : ""}`}>{slide.body}</p>
                        <p className="text-[10px] italic opacity-50 mt-3">FreeMe</p>
                      </>
                    )}
                    {(slide.layout === "conteudo" || slide.layout === "kinetic-line") && (
                      <p className={`text-xs leading-relaxed whitespace-pre-line ${imageUrl ? "text-white" : ""}`}>{slide.body}</p>
                    )}
                    {slide.layout === "citacao" && (
                      <p className="text-xs italic leading-relaxed">&ldquo;{slide.body}&rdquo;</p>
                    )}
                    {slide.layout === "cta" && (
                      <>
                        <p className="text-xs leading-relaxed mb-3 whitespace-pre-line">{slide.body}</p>
                        <div className="bg-white/20 rounded-full px-3 py-1.5 self-center">
                          <p className="text-[8px]">freeme.viviannedossantos.com</p>
                        </div>
                      </>
                    )}
                    {slide.layout === "assinatura" && (
                      <div className="text-center">
                        <p className="text-xs italic opacity-60">Vivianne dos Santos</p>
                      </div>
                    )}
                  </div>
                </div>
                {acceptsPhoto && (
                  <ImageDropZone
                    slideId={slideId}
                    currentUrl={imageUrl}
                    onUploaded={(url) => onImageUploaded(slideId, url)}
                  />
                )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: COPY */}
        {tab === "copy" && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs text-creme/40 uppercase tracking-wide">Instagram</h3>
                <div className="flex gap-2">
                  <button onClick={() => copy(igCaption(selected), "ig")} className="text-xs text-terracota hover:text-terracota/80">
                    {copiedField === "ig" ? "Copiado!" : "Copiar"}
                  </button>
                  <button onClick={() => downloadCaption(igCaption(selected), `dia-${selected.day}-instagram.txt`)} className="text-xs text-creme/30 hover:text-creme/50">
                    Download
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-creme/5 p-5">
                <p className="text-sm text-creme/80 whitespace-pre-line">{igCaption(selected)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs text-creme/40 uppercase tracking-wide">TikTok</h3>
                <div className="flex gap-2">
                  <button onClick={() => copy(tiktokCaption(selected), "tt")} className="text-xs text-terracota hover:text-terracota/80">
                    {copiedField === "tt" ? "Copiado!" : "Copiar"}
                  </button>
                  <button onClick={() => downloadCaption(tiktokCaption(selected), `dia-${selected.day}-tiktok.txt`)} className="text-xs text-creme/30 hover:text-creme/50">
                    Download
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-creme/5 p-5">
                <p className="text-sm text-creme/80 whitespace-pre-line">{tiktokCaption(selected)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs text-creme/40 uppercase tracking-wide">Hashtags</h3>
                <button onClick={() => copy(selected.hashtags, "hash")} className="text-xs text-terracota hover:text-terracota/80">
                  {copiedField === "hash" ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <div className="rounded-xl bg-creme/5 p-4">
                <p className="text-sm text-terracota/70">{selected.hashtags}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: IMAGEM MJ */}
        {tab === "imagem" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs text-creme/40 uppercase tracking-wide mb-2">Estilo base FreeMe (incluir em todos os prompts)</h3>
              <div
                className="rounded-xl bg-creme/5 p-4 cursor-pointer hover:bg-creme/10 transition-colors"
                onClick={() => copy(FREEME_STYLE_BASE, "style")}
              >
                <p className="text-xs text-creme/60 font-mono leading-relaxed">{FREEME_STYLE_BASE}</p>
                <p className="text-[10px] text-creme/30 mt-2">{copiedField === "style" ? "Copiado!" : "Clica para copiar"}</p>
              </div>
            </div>

            {mjPrompts.map((mj, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs text-creme/40 uppercase tracking-wide">Prompt dia {selected.day}</h3>
                  <button onClick={() => copy(mj.prompt, `mj-${i}`)} className="text-xs text-terracota hover:text-terracota/80">
                    {copiedField === `mj-${i}` ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <div className="rounded-xl bg-creme/5 p-4">
                  <p className="text-sm text-creme/80 font-mono leading-relaxed">{mj.prompt}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border-2 border-dashed border-creme/15 p-10 text-center hover:border-creme/30 transition-colors">
              <p className="text-sm text-creme/30 mb-2">Arrasta a imagem MJ gerada para aqui</p>
              <p className="text-[10px] text-creme/20">(upload para Supabase Storage em breve)</p>
            </div>
          </div>
        )}

        {/* PLATFORM BADGES */}
        <div className="flex gap-2 mt-8 pt-6 border-t border-creme/10">
          {selected.platforms.map((p) => (
            <span key={p} className="px-3 py-1 rounded-full bg-creme/10 text-xs text-creme/50">
              {p === "ig" ? "Instagram" : "TikTok"}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // === CALENDAR VIEW ===
  const weeks = [
    { label: "Semana 1: Identificação", days: CONTENT_30_DAYS.filter((p) => p.day <= 7) },
    { label: "Semana 2: Educação (7 bloqueios)", days: CONTENT_30_DAYS.filter((p) => p.day > 7 && p.day <= 14) },
    { label: "Semana 3: Transformação + Autoridade", days: CONTENT_30_DAYS.filter((p) => p.day > 14 && p.day <= 21) },
    { label: "Semana 4: Conversão", days: CONTENT_30_DAYS.filter((p) => p.day > 21) },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-terracota">FreeMe Admin</h1>
          <p className="text-sm text-creme/40 mt-1">30 dias de conteúdo para IG e TikTok</p>
        </div>
        <button onClick={exportAllCSV} className="rounded-full bg-salvia px-5 py-2 text-sm text-creme hover:bg-salvia/80">
          Export CSV completo
        </button>
      </div>

      {weeks.map((week) => (
        <div key={week.label} className="mb-8">
          <h2 className="text-sm text-creme/50 uppercase tracking-wide mb-4">{week.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {week.days.map((post) => {
              const firstSlide = post.slides[0];
              const isCarousel = post.type === "carousel";
              const bgColor = firstSlide.layout === "capa" ? "#8C4A36" : "#2E241D";

              return (
                <button
                  key={post.day}
                  onClick={() => { setSelected(post); setTab("slides"); }}
                  className="text-left rounded-2xl overflow-hidden border border-creme/10 hover:border-creme/25 transition-all group"
                >
                  {/* Mini preview */}
                  <div
                    className="h-24 flex items-center justify-center px-4"
                    style={{ backgroundColor: bgColor }}
                  >
                    <p className="text-[10px] text-creme/80 leading-relaxed text-center line-clamp-3 font-serif">
                      {firstSlide.body.slice(0, 80)}...
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-terracota font-medium">Dia {post.day}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        isCarousel ? "bg-terracota/15 text-terracota" : "bg-salvia/15 text-salvia"
                      }`}>
                        {isCarousel ? "C" : "V"}
                      </span>
                    </div>
                    <p className="text-sm text-creme/70 mt-1 truncate">{post.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
