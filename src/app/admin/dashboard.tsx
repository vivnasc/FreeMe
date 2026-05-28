"use client";

import { useMemo, useState } from "react";
import { ALL_POSTS } from "@/content/content-calendar";
import { type ContentPost } from "@/content/content-types";
import { getMJPrompts, FREEME_STYLE_BASE } from "@/content/mj-prompts";
import { ImageDropZone } from "@/components/image-drop-zone";

type MainView = "lista" | "calendario" | "mj" | "captions";
type DetailTab = "slides" | "copy" | "imagem";

function igCaption(post: ContentPost): string {
  return `${post.caption}\n\n.\n.\n.\n${post.hashtags}`;
}

function tiktokCaption(post: ContentPost): string {
  const short = post.caption.split("\n")[0];
  const tags = post.hashtags.split(" ").slice(0, 5).join(" ");
  return `${short}\n\n${tags} #fyp #paraamães`;
}

export function AdminDashboard() {
  const [view, setView] = useState<MainView>("lista");
  const [selected, setSelected] = useState<ContentPost | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("slides");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [slideImages, setSlideImages] = useState<Record<string, string>>({});

  const [fWeek, setFWeek] = useState<"all" | 1 | 2 | 3 | 4>("all");
  const [fType, setFType] = useState<"all" | "carousel" | "video">("all");
  const [fSlot, setFSlot] = useState<"all" | "morning" | "evening">("all");
  const [fCategory, setFCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const s = new Set(ALL_POSTS.map((p) => p.categoria));
    return ["all", ...Array.from(s).sort()];
  }, []);

  const filtered = useMemo(() => {
    return ALL_POSTS.filter((p) => {
      if (fWeek !== "all") {
        const w = p.day <= 7 ? 1 : p.day <= 14 ? 2 : p.day <= 21 ? 3 : 4;
        if (w !== fWeek) return false;
      }
      if (fType !== "all" && p.type !== fType) return false;
      if (fSlot !== "all" && p.slot !== fSlot) return false;
      if (fCategory !== "all" && p.categoria !== fCategory) return false;
      return true;
    });
  }, [fWeek, fType, fSlot, fCategory]);

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  }

  function onImageUploaded(slideId: string, url: string) {
    setSlideImages((prev) => ({ ...prev, [slideId]: url }));
  }

  function downloadText(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  function exportAllCSV() {
    const header = "Day,Slot,Time,Type,Category,Title,IG Caption,TikTok Caption,Hashtags,MJ Prompts";
    const rows = filtered.map((p) => {
      const prompts = getMJPrompts(p.day, p.slot).map((m) => m.prompt).join(" || ");
      return [
        p.day,
        p.slot,
        p.time,
        p.type,
        p.categoria,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${igCaption(p).replace(/"/g, '""')}"`,
        `"${tiktokCaption(p).replace(/"/g, '""')}"`,
        `"${p.hashtags}"`,
        `"${prompts.replace(/"/g, '""')}"`,
      ].join(",");
    });
    const csv = [header, ...rows].join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `freeme-content${fWeek !== "all" ? `-semana${fWeek}` : ""}.csv`;
    a.click();
  }

  function postKey(p: ContentPost) {
    return `D${p.day}-${p.slot === "morning" ? "10h" : "13h"}`;
  }

  // ============== DETAIL VIEW ==============
  if (selected) {
    const mjPrompts = getMJPrompts(selected.day, selected.slot);

    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => setSelected(null)} className="text-sm text-creme/50 hover:text-creme mb-6">
          ← Voltar
        </button>

        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="text-3xl font-semibold text-terracota">{postKey(selected)}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            selected.type === "carousel" ? "bg-terracota/20 text-terracota" : "bg-salvia/20 text-salvia"
          }`}>
            {selected.type === "carousel" ? "Carrossel" : "Vídeo"}
          </span>
          <span className="text-xs text-creme/40">{selected.categoria}</span>
          <span className="text-xs text-creme/40">· {selected.slides.length} slides</span>
        </div>
        <h1 className="text-lg text-creme/80 mb-6">{selected.title}</h1>

        <div className="flex gap-1 bg-creme/5 rounded-xl p-1 mb-8">
          {(["slides", "copy", "imagem"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDetailTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm transition-all ${
                detailTab === t ? "bg-creme/10 text-creme font-medium" : "text-creme/40 hover:text-creme/60"
              }`}
            >
              {t === "slides" ? "Slides" : t === "copy" ? "Copy" : `Imagem MJ (${mjPrompts.length})`}
            </button>
          ))}
        </div>

        {detailTab === "slides" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {selected.slides.map((slide, i) => {
              const slideId = `${postKey(selected)}-slide-${i}`;
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {detailTab === "copy" && (
          <div className="flex flex-col gap-6">
            <CaptionBlock label="Instagram" text={igCaption(selected)} fieldKey="ig" copiedField={copiedField} onCopy={copy} onDownload={(t) => downloadText(t, `${postKey(selected)}-instagram.txt`)} />
            <CaptionBlock label="TikTok" text={tiktokCaption(selected)} fieldKey="tt" copiedField={copiedField} onCopy={copy} onDownload={(t) => downloadText(t, `${postKey(selected)}-tiktok.txt`)} />
            <CaptionBlock label="Hashtags" text={selected.hashtags} fieldKey="hash" copiedField={copiedField} onCopy={copy} />
          </div>
        )}

        {detailTab === "imagem" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs text-creme/40 uppercase tracking-wide mb-2">Estilo base FreeMe (juntar a todos os prompts)</h3>
              <div
                className="rounded-xl bg-creme/5 p-4 cursor-pointer hover:bg-creme/10 transition-colors"
                onClick={() => copy(FREEME_STYLE_BASE, "style")}
              >
                <p className="text-xs text-creme/60 font-mono leading-relaxed">{FREEME_STYLE_BASE}</p>
                <p className="text-[10px] text-creme/30 mt-2">{copiedField === "style" ? "Copiado!" : "Clica para copiar"}</p>
              </div>
            </div>

            {mjPrompts.length === 0 && (
              <p className="text-xs text-creme/40">Sem prompts MJ para este post.</p>
            )}
            {mjPrompts.map((mj, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs text-creme/40 uppercase tracking-wide">
                    Prompt {i + 1} · slide {mj.slideIndex} · {mj.usage}
                  </h3>
                  <button onClick={() => copy(mj.prompt, `mj-${i}`)} className="text-xs text-terracota hover:text-terracota/80">
                    {copiedField === `mj-${i}` ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <div className="rounded-xl bg-creme/5 p-4">
                  <p className="text-sm text-creme/80 font-mono leading-relaxed">{mj.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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

  // ============== MAIN VIEWS ==============
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-terracota">FreeMe Admin</h1>
          <p className="text-sm text-creme/40 mt-1">{ALL_POSTS.length} posts · 30 dias · IG + TikTok</p>
        </div>
        <button onClick={exportAllCSV} className="rounded-full bg-salvia px-5 py-2 text-sm text-creme hover:bg-salvia/80">
          Export CSV ({filtered.length})
        </button>
      </div>

      {/* VIEW TABS */}
      <div className="flex gap-1 bg-creme/5 rounded-xl p-1 mb-6">
        {([
          ["lista", "Lista"],
          ["calendario", "Calendário"],
          ["mj", "MJ em Bulk"],
          ["captions", "Captions em Bulk"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`flex-1 rounded-lg py-2.5 text-sm transition-all ${
              view === k ? "bg-creme/10 text-creme font-medium" : "text-creme/40 hover:text-creme/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        <FilterSelect label="Semana" value={fWeek} onChange={(v) => setFWeek(v === "all" ? "all" : Number(v) as 1 | 2 | 3 | 4)} options={[["all", "Todas"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]} />
        <FilterSelect label="Tipo" value={fType} onChange={(v) => setFType(v as "all" | "carousel" | "video")} options={[["all", "Todos"], ["carousel", "Carrossel"], ["video", "Vídeo"]]} />
        <FilterSelect label="Hora" value={fSlot} onChange={(v) => setFSlot(v as "all" | "morning" | "evening")} options={[["all", "Ambas"], ["morning", "10h"], ["evening", "13h"]]} />
        <FilterSelect label="Categoria" value={fCategory} onChange={setFCategory} options={categories.map((c) => [c, c === "all" ? "Todas" : c])} />
        <span className="text-creme/30 self-center ml-2">{filtered.length} / {ALL_POSTS.length} posts</span>
      </div>

      {/* LISTA */}
      {view === "lista" && (
        <div className="rounded-2xl border border-creme/10 overflow-hidden">
          <div className="grid grid-cols-[80px_70px_70px_110px_1fr_60px_70px] gap-3 px-4 py-3 border-b border-creme/10 text-[10px] uppercase tracking-wider text-creme/40">
            <span>Post</span>
            <span>Tipo</span>
            <span>Hora</span>
            <span>Categoria</span>
            <span>Título</span>
            <span className="text-center">Slides</span>
            <span className="text-center">MJ</span>
          </div>
          {filtered.map((p) => {
            const mjCount = getMJPrompts(p.day, p.slot).length;
            return (
              <button
                key={postKey(p)}
                onClick={() => { setSelected(p); setDetailTab("slides"); }}
                className="w-full grid grid-cols-[80px_70px_70px_110px_1fr_60px_70px] gap-3 px-4 py-3 border-b border-creme/5 hover:bg-creme/5 text-left items-center"
              >
                <span className="text-terracota font-medium text-sm">{postKey(p)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded justify-self-start ${
                  p.type === "carousel" ? "bg-terracota/15 text-terracota" : "bg-salvia/15 text-salvia"
                }`}>{p.type === "carousel" ? "Carrossel" : "Vídeo"}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded justify-self-start ${
                  p.slot === "morning" ? "bg-amber-500/15 text-amber-400" : "bg-indigo-500/15 text-indigo-400"
                }`}>{p.time}</span>
                <span className="text-xs text-creme/50">{p.categoria}</span>
                <span className="text-sm text-creme/85 truncate">{p.title}</span>
                <span className="text-xs text-creme/40 text-center">{p.slides.length}</span>
                <span className={`text-xs text-center ${mjCount === 0 ? "text-red-400/70" : "text-creme/50"}`}>{mjCount}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* CALENDÁRIO */}
      {view === "calendario" && (
        <div>
          {[1, 2, 3, 4].map((week) => {
            const weekPosts = filtered.filter((p) => {
              const w = p.day <= 7 ? 1 : p.day <= 14 ? 2 : p.day <= 21 ? 3 : 4;
              return w === week;
            });
            if (weekPosts.length === 0) return null;
            return (
              <div key={week} className="mb-8">
                <h2 className="text-sm text-creme/50 uppercase tracking-wide mb-3">Semana {week}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {weekPosts.map((post) => {
                    const firstSlide = post.slides[0];
                    const isCarousel = post.type === "carousel";
                    const isMorning = post.slot === "morning";
                    const bgColor = firstSlide.layout === "capa" ? "#8C4A36" : "#2E241D";
                    return (
                      <button
                        key={postKey(post)}
                        onClick={() => { setSelected(post); setDetailTab("slides"); }}
                        className="text-left rounded-2xl overflow-hidden border border-creme/10 hover:border-creme/25 transition-all"
                      >
                        <div className="h-24 flex items-center justify-center px-4" style={{ backgroundColor: bgColor }}>
                          <p className="text-[10px] text-creme/80 leading-relaxed text-center line-clamp-3 font-serif">
                            {firstSlide.body.slice(0, 80)}...
                          </p>
                        </div>
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-terracota font-medium">{postKey(post)}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${isMorning ? "bg-amber-500/15 text-amber-400" : "bg-indigo-500/15 text-indigo-400"}`}>{post.time}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${isCarousel ? "bg-terracota/15 text-terracota" : "bg-salvia/15 text-salvia"}`}>{isCarousel ? "C" : "V"}</span>
                          </div>
                          <p className="text-sm text-creme/70 mt-1 truncate">{post.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MJ BULK */}
      {view === "mj" && (
        <BulkMJ posts={filtered} copiedField={copiedField} onCopy={copy} onDownload={downloadText} />
      )}

      {/* CAPTIONS BULK */}
      {view === "captions" && (
        <BulkCaptions posts={filtered} copiedField={copiedField} onCopy={copy} onDownload={downloadText} />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex items-center gap-2 bg-creme/5 rounded-lg px-3 py-2">
      <span className="text-creme/40">{label}:</span>
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-creme/85 outline-none cursor-pointer"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-carvao">{l}</option>
        ))}
      </select>
    </label>
  );
}

function CaptionBlock({
  label,
  text,
  fieldKey,
  copiedField,
  onCopy,
  onDownload,
}: {
  label: string;
  text: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (t: string, f: string) => void;
  onDownload?: (t: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-creme/40 uppercase tracking-wide">{label}</h3>
        <div className="flex gap-3">
          <button onClick={() => onCopy(text, fieldKey)} className="text-xs text-terracota hover:text-terracota/80">
            {copiedField === fieldKey ? "Copiado!" : "Copiar"}
          </button>
          {onDownload && (
            <button onClick={() => onDownload(text)} className="text-xs text-creme/30 hover:text-creme/50">
              Download
            </button>
          )}
        </div>
      </div>
      <div className="rounded-xl bg-creme/5 p-4">
        <p className="text-sm text-creme/80 whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}

function BulkMJ({
  posts,
  copiedField,
  onCopy,
  onDownload,
}: {
  posts: ContentPost[];
  copiedField: string | null;
  onCopy: (t: string, f: string) => void;
  onDownload: (t: string, name: string) => void;
}) {
  const allPrompts = useMemo(() => {
    return posts.flatMap((p) =>
      getMJPrompts(p.day, p.slot).map((m, i) => ({
        key: `D${p.day}-${p.slot}-${i}`,
        postKey: `D${p.day}-${p.slot === "morning" ? "10h" : "13h"}`,
        title: p.title,
        type: p.type,
        prompt: m.prompt,
        slideIndex: m.slideIndex,
        usage: m.usage,
      }))
    );
  }, [posts]);

  const everything = allPrompts.map((p) => `# ${p.postKey} — ${p.title} (slide ${p.slideIndex}, ${p.usage})\n${p.prompt}`).join("\n\n");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-creme/60">
          {allPrompts.length} prompts MJ prontos para gerar em bulk no Midjourney.
        </p>
        <div className="flex gap-3">
          <button onClick={() => onCopy(everything, "mj-all")} className="text-xs rounded-full bg-terracota px-4 py-2 text-creme hover:bg-terracota/80">
            {copiedField === "mj-all" ? "Copiado todos!" : "Copiar todos"}
          </button>
          <button onClick={() => onDownload(everything, "freeme-mj-prompts.txt")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
            Download .txt
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-creme/5 p-3 mb-6">
        <p className="text-xs text-creme/40 mb-1">Estilo base FreeMe (junta a todos os prompts ao gerar):</p>
        <p className="text-xs text-creme/70 font-mono">{FREEME_STYLE_BASE}</p>
        <button onClick={() => onCopy(FREEME_STYLE_BASE, "style-bulk")} className="text-xs text-terracota mt-2 hover:text-terracota/80">
          {copiedField === "style-bulk" ? "Copiado!" : "Copiar estilo base"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {allPrompts.map((mj) => (
          <div key={mj.key} className="rounded-xl bg-creme/5 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-terracota font-medium">{mj.postKey}</span>
                <span className="text-[10px] text-creme/40">slide {mj.slideIndex} · {mj.usage} · {mj.type}</span>
              </div>
              <button onClick={() => onCopy(mj.prompt, mj.key)} className="text-xs text-terracota hover:text-terracota/80">
                {copiedField === mj.key ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="text-xs text-creme/50 italic truncate">{mj.title}</p>
            <p className="text-sm text-creme/85 font-mono leading-relaxed">{mj.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BulkCaptions({
  posts,
  copiedField,
  onCopy,
  onDownload,
}: {
  posts: ContentPost[];
  copiedField: string | null;
  onCopy: (t: string, f: string) => void;
  onDownload: (t: string, name: string) => void;
}) {
  const everythingIG = posts.map((p) => `# D${p.day} ${p.slot === "morning" ? "10h" : "13h"} — ${p.title}\n${igCaption(p)}`).join("\n\n---\n\n");
  const everythingTT = posts.map((p) => `# D${p.day} ${p.slot === "morning" ? "10h" : "13h"} — ${p.title}\n${tiktokCaption(p)}`).join("\n\n---\n\n");

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm text-creme/60">{posts.length} posts · captions IG + TikTok prontas.</p>
        <div className="flex gap-2">
          <button onClick={() => onDownload(everythingIG, "freeme-ig.txt")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
            Download IG (.txt)
          </button>
          <button onClick={() => onDownload(everythingTT, "freeme-tiktok.txt")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
            Download TikTok (.txt)
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((p) => {
          const ig = igCaption(p);
          const tt = tiktokCaption(p);
          const k = `${p.day}-${p.slot}`;
          return (
            <div key={k} className="rounded-xl bg-creme/5 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-terracota font-medium">D{p.day} {p.time}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${p.type === "carousel" ? "bg-terracota/15 text-terracota" : "bg-salvia/15 text-salvia"}`}>{p.type === "carousel" ? "C" : "V"}</span>
                <span className="text-xs text-creme/50 truncate">{p.title}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-creme/40 uppercase tracking-wider">Instagram</span>
                    <button onClick={() => onCopy(ig, `ig-${k}`)} className="text-xs text-terracota hover:text-terracota/80">
                      {copiedField === `ig-${k}` ? "✓" : "Copiar"}
                    </button>
                  </div>
                  <p className="text-xs text-creme/80 whitespace-pre-line bg-carvao/40 rounded p-3 max-h-44 overflow-y-auto">{ig}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-creme/40 uppercase tracking-wider">TikTok</span>
                    <button onClick={() => onCopy(tt, `tt-${k}`)} className="text-xs text-terracota hover:text-terracota/80">
                      {copiedField === `tt-${k}` ? "✓" : "Copiar"}
                    </button>
                  </div>
                  <p className="text-xs text-creme/80 whitespace-pre-line bg-carvao/40 rounded p-3 max-h-44 overflow-y-auto">{tt}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
