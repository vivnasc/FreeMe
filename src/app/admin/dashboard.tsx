"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_POSTS } from "@/content/content-calendar";
import { type ContentPost } from "@/content/content-types";
import { getMJPrompts, FREEME_STYLE_BASE } from "@/content/mj-prompts";
import { ImageDropZone } from "@/components/image-drop-zone";

type MainView = "studio" | "conteudo" | "imagens" | "slides" | "distribuir";
type DetailTab = "slides" | "copy" | "imagem";
type ConteudoSub = "lista" | "calendario" | "captions";

function igCaption(post: ContentPost): string {
  return `${post.caption}\n\n.\n.\n.\n${post.hashtags}`;
}

function tiktokCaption(post: ContentPost): string {
  const short = post.caption.split("\n")[0];
  const tags = post.hashtags.split(" ").slice(0, 5).join(" ");
  return `${short}\n\n${tags} #fyp #paraamães`;
}

export function AdminDashboard() {
  const [view, setView] = useState<MainView>("studio");
  const [conteudoSub, setConteudoSub] = useState<ConteudoSub>("lista");
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

      {/* PHASE TABS */}
      <div className="flex gap-1 bg-creme/5 rounded-xl p-1 mb-6">
        {([
          ["studio", "Studio"],
          ["conteudo", "1 · Conteúdo"],
          ["imagens", "2 · Imagens"],
          ["slides", "3 · Slides"],
          ["distribuir", "4 · Distribuir"],
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

      {/* STUDIO (overview) */}
      {view === "studio" && (
        <StudioPanel
          posts={ALL_POSTS}
          onNavigate={(v, sub) => {
            setView(v);
            if (sub) setConteudoSub(sub);
          }}
        />
      )}

      {/* FILTERS — só aparecem em Conteúdo/Imagens/Slides/Distribuir */}
      {view !== "studio" && (
        <div className="flex flex-wrap gap-2 mb-6 text-xs">
          <FilterSelect label="Semana" value={fWeek} onChange={(v) => setFWeek(v === "all" ? "all" : Number(v) as 1 | 2 | 3 | 4)} options={[["all", "Todas"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]} />
          <FilterSelect label="Tipo" value={fType} onChange={(v) => setFType(v as "all" | "carousel" | "video")} options={[["all", "Todos"], ["carousel", "Carrossel"], ["video", "Vídeo"]]} />
          <FilterSelect label="Hora" value={fSlot} onChange={(v) => setFSlot(v as "all" | "morning" | "evening")} options={[["all", "Ambas"], ["morning", "10h"], ["evening", "13h"]]} />
          <FilterSelect label="Categoria" value={fCategory} onChange={setFCategory} options={categories.map((c) => [c, c === "all" ? "Todas" : c])} />
          <span className="text-creme/30 self-center ml-2">{filtered.length} / {ALL_POSTS.length} posts</span>
        </div>
      )}

      {/* CONTEÚDO — sub-tabs Lista | Calendário | Captions */}
      {view === "conteudo" && (
        <div className="flex gap-1 bg-creme/5 rounded-xl p-1 mb-4 max-w-md">
          {([
            ["lista", "Lista"],
            ["calendario", "Calendário"],
            ["captions", "Captions"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setConteudoSub(k)}
              className={`flex-1 rounded-lg py-1.5 text-xs transition-all ${
                conteudoSub === k ? "bg-creme/10 text-creme font-medium" : "text-creme/40 hover:text-creme/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* LISTA */}
      {view === "conteudo" && conteudoSub === "lista" && (
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
      {view === "conteudo" && conteudoSub === "calendario" && (
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
      {view === "imagens" && (
        <BulkMJ posts={filtered} copiedField={copiedField} onCopy={copy} onDownload={downloadText} />
      )}

      {/* CAPTIONS BULK */}
      {view === "conteudo" && conteudoSub === "captions" && (
        <BulkCaptions posts={filtered} copiedField={copiedField} onCopy={copy} onDownload={downloadText} />
      )}

      {/* RENDER */}
      {view === "slides" && <RenderPanel />}

      {view === "distribuir" && <DistribuirPanel posts={filtered} />}
    </div>
  );
}

// ============== STUDIO PANEL — overview com fases ==============
function StudioPanel({
  posts,
  onNavigate,
}: {
  posts: ContentPost[];
  onNavigate: (view: MainView, sub?: ConteudoSub) => void;
}) {
  const [diag, setDiag] = useState<{ debug?: unknown; claude?: unknown; replicate?: unknown }>({});
  const [diagLoading, setDiagLoading] = useState<string | null>(null);
  const [mjGenerated, setMjGenerated] = useState<Record<string, string>>({});

  useEffect(() => {
    setMjGenerated(loadGenerated());
  }, []);

  async function runDiag(name: "debug" | "claude" | "replicate") {
    setDiagLoading(name);
    const url =
      name === "debug" ? "/api/admin/auth/debug" :
      name === "claude" ? "/api/admin/test-claude" :
      "/api/admin/test-replicate";
    try {
      const res = await fetch(url);
      const data = await res.json();
      setDiag((d) => ({ ...d, [name]: { httpStatus: res.status, ...data } }));
    } catch (e) {
      setDiag((d) => ({ ...d, [name]: { ok: false, error: String(e) } }));
    } finally {
      setDiagLoading(null);
    }
  }

  // Calcular contadores
  const totalCarousels = posts.filter((p) => p.type === "carousel").length;
  const totalVideos = posts.filter((p) => p.type === "video").length;
  const totalMJ = posts.reduce((sum, p) => sum + getMJPrompts(p.day, p.slot).length, 0);
  const generatedMJ = Object.keys(mjGenerated).length;

  const diagAllOk = (() => {
    const d = diag.debug as { ok?: boolean } | undefined;
    const c = diag.claude as { ok?: boolean } | undefined;
    const r = diag.replicate as { ok?: boolean } | undefined;
    return d && c && r && c.ok !== false && r.ok !== false;
  })();

  return (
    <div className="flex flex-col gap-3">
      {/* FASE 0 · DIAGNÓSTICO */}
      <PhaseCard
        index={0}
        title="Diagnóstico"
        status={diagAllOk ? "ok" : Object.keys(diag).length > 0 ? "partial" : "pending"}
        summary={diagAllOk ? "Tudo verde · pronto para gerar" : "Verifica deploy + envs + providers antes de gastar"}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={() => runDiag("debug")} disabled={diagLoading === "debug"} className="text-xs rounded-full bg-carvao/60 px-4 py-2 text-creme hover:bg-carvao/80 disabled:opacity-50">
            {diagLoading === "debug" ? "..." : "Envs + SHA"}
          </button>
          <button onClick={() => runDiag("claude")} disabled={diagLoading === "claude"} className="text-xs rounded-full bg-carvao/60 px-4 py-2 text-creme hover:bg-carvao/80 disabled:opacity-50">
            {diagLoading === "claude" ? "..." : "Claude (~$0.0001)"}
          </button>
          <button onClick={() => runDiag("replicate")} disabled={diagLoading === "replicate"} className="text-xs rounded-full bg-carvao/60 px-4 py-2 text-creme hover:bg-carvao/80 disabled:opacity-50">
            {diagLoading === "replicate" ? "..." : "Replicate + Bucket (~$0.06)"}
          </button>
        </div>
        {Object.entries(diag).map(([name, data]) => {
          const d = data as { ok?: boolean; httpStatus?: number };
          const isOk = d.ok === true || (d.httpStatus !== undefined && d.httpStatus < 400 && d.ok !== false);
          return (
            <details key={name} className="mb-2">
              <summary className={`text-xs cursor-pointer ${isOk ? "text-salvia" : "text-red-300"}`}>
                {isOk ? "✓" : "✗"} <strong>{name}</strong>
              </summary>
              <pre className={`text-[10px] font-mono leading-relaxed p-3 mt-1 rounded overflow-x-auto ${isOk ? "bg-salvia/5 text-creme/80" : "bg-red-500/10 text-red-200/90"}`}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          );
        })}
      </PhaseCard>

      {/* FASE 1 · CONTEÚDO */}
      <PhaseCard
        index={1}
        title="Conteúdo"
        status="ok"
        summary={`${posts.length} posts · ${totalCarousels} carrosséis · ${totalVideos} vídeos · 30 dias`}
      >
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onNavigate("conteudo", "lista")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
            Lista
          </button>
          <button onClick={() => onNavigate("conteudo", "calendario")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
            Calendário
          </button>
          <button onClick={() => onNavigate("conteudo", "captions")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
            Captions
          </button>
        </div>
      </PhaseCard>

      {/* FASE 2 · IMAGENS MJ */}
      <PhaseCard
        index={2}
        title="Imagens (Claude + Replicate)"
        status={generatedMJ === 0 ? "pending" : generatedMJ < totalMJ ? "partial" : "ok"}
        summary={
          generatedMJ === 0
            ? `0 / ${totalMJ} geradas · custo estimado ~$${(totalMJ * 0.07).toFixed(2)}`
            : `${generatedMJ} / ${totalMJ} geradas · ${(totalMJ - generatedMJ)} em falta (~$${((totalMJ - generatedMJ) * 0.07).toFixed(2)})`
        }
      >
        <button onClick={() => onNavigate("imagens")} className="text-xs rounded-full bg-terracota px-4 py-2 text-creme hover:bg-terracota/80">
          {generatedMJ === 0 ? "Começar geração →" : generatedMJ < totalMJ ? "Continuar geração →" : "Ver imagens geradas →"}
        </button>
      </PhaseCard>

      {/* FASE 3 · SLIDES PNG */}
      <PhaseCard
        index={3}
        title="Slides PNG (GitHub Actions)"
        status={generatedMJ < totalMJ ? "locked" : "pending"}
        summary={generatedMJ < totalMJ ? "Aguarda Fase 2 completa antes de avançar" : "~300 PNGs prontos para renderizar via puppeteer no GH Actions"}
      >
        <button
          onClick={() => onNavigate("slides")}
          disabled={generatedMJ < totalMJ}
          className="text-xs rounded-full bg-terracota px-4 py-2 text-creme hover:bg-terracota/80 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Configurar render →
        </button>
      </PhaseCard>

      {/* FASE 4 · DISTRIBUIR (METRICOOL) */}
      <PhaseCard
        index={4}
        title="Distribuir (CSV Metricool)"
        status="pending"
        summary="Gerar CSV com datas + URLs prontos para importar no Metricool"
      >
        <button onClick={() => onNavigate("distribuir")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
          Configurar CSV →
        </button>
      </PhaseCard>
    </div>
  );
}

function PhaseCard({
  index,
  title,
  status,
  summary,
  children,
}: {
  index: number;
  title: string;
  status: "ok" | "partial" | "pending" | "locked";
  summary: string;
  children?: React.ReactNode;
}) {
  const statusColors: Record<typeof status, string> = {
    ok: "border-salvia/40 bg-salvia/5",
    partial: "border-amber-500/40 bg-amber-500/5",
    pending: "border-creme/15 bg-creme/5",
    locked: "border-creme/10 bg-carvao/40 opacity-60",
  };
  const statusBadge: Record<typeof status, { label: string; cls: string }> = {
    ok: { label: "✓ Pronto", cls: "bg-salvia/20 text-salvia" },
    partial: { label: "Em curso", cls: "bg-amber-500/20 text-amber-300" },
    pending: { label: "Pendente", cls: "bg-creme/10 text-creme/60" },
    locked: { label: "Bloqueado", cls: "bg-carvao/60 text-creme/40" },
  };
  return (
    <div className={`rounded-2xl border ${statusColors[status]} p-5`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-creme/40 mb-1">Fase {index}</p>
          <h3 className="text-base font-medium text-creme">{title}</h3>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusBadge[status].cls}`}>
          {statusBadge[status].label}
        </span>
      </div>
      <p className="text-xs text-creme/60 mb-3">{summary}</p>
      {children}
    </div>
  );
}

// ============== DISTRIBUIR PANEL (Metricool CSV) ==============
function DistribuirPanel({ posts }: { posts: ContentPost[] }) {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  function buildAndDownload() {
    // Header Metricool compatível
    const header = [
      "Date", "Time", "Draft",
      "Instagram", "Instagram Post Type", "Instagram Show Reel On Feed",
      "TikTok", "TikTok Post Privacy",
      "Text",
      "Picture Url 1", "Picture Url 2", "Picture Url 3", "Picture Url 4", "Picture Url 5",
    ];
    const supabaseUrl = "https://" + (typeof window !== "undefined" ? window.location.hostname : "");

    const rows = posts.map((p) => {
      const startD = new Date(startDate);
      startD.setDate(startD.getDate() + (p.day - 1));
      const date = startD.toISOString().split("T")[0];
      const time = `${p.time}:00`;
      const text = `${p.caption}\n\n${p.hashtags}`;
      const igType = p.type === "carousel" ? "CAROUSEL" : "REEL";
      // URLs de slides (a serem geradas na Fase 3)
      const slidePngs = Array.from({ length: Math.min(p.slides.length, 5) }, (_, i) =>
        `${supabaseUrl.replace("admin", "")}storage/v1/object/public/freeme-assets/slides/D${p.day}-${p.slot}-${String(i).padStart(2, "0")}.png`
      );
      const cells = [
        date, time, "FALSE",
        "TRUE", igType, p.type === "video" ? "TRUE" : "FALSE",
        "TRUE", "PUBLIC_TO_EVERYONE",
        `"${text.replace(/"/g, '""')}"`,
        ...slidePngs,
        ...Array(5 - slidePngs.length).fill(""),
      ];
      return cells.join(",");
    });
    const csv = [header.join(","), ...rows].join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `freeme-metricool-${startDate}.csv`;
    a.click();
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
        <p className="text-sm text-amber-200 font-medium mb-1">CSV Metricool</p>
        <p className="text-xs text-amber-100/70 leading-relaxed">
          Gera um CSV no formato Metricool com data + hora + caption + URLs das imagens (que vão ficar no Storage após a Fase 3).
          Importa em Metricool → Planning → Import CSV.
        </p>
      </div>

      <label className="flex flex-col gap-1 mb-4">
        <span className="text-xs text-creme/40 uppercase tracking-wider">Data de início (Dia 1)</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-creme/5 rounded-lg px-4 py-3 text-creme outline-none cursor-pointer"
        />
        <span className="text-xs text-creme/40 mt-1">D30 = {new Date(new Date(startDate).getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}</span>
      </label>

      <button
        onClick={buildAndDownload}
        className="rounded-full bg-terracota px-6 py-3 text-sm font-medium text-creme hover:bg-terracota/80"
      >
        Download CSV ({posts.length} posts)
      </button>

      <p className="text-xs text-creme/40 mt-4">
        ⚠ As URLs dos slides ainda têm de ser geradas na Fase 3 antes deste CSV servir para publicar.
      </p>
    </div>
  );
}

function RenderPanel() {
  const [scope, setScope] = useState<"all" | "slides-only" | "videos-only" | "semana-1" | "semana-2" | "semana-3" | "semana-4">("all");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ runsUrl?: string; error?: string } | null>(null);

  async function trigger() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/trigger-render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || `HTTP ${res.status}` });
      } else {
        setResult({ runsUrl: data.runsUrl });
      }
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
        <p className="text-sm text-amber-200 font-medium mb-1">Render de slides via GitHub Actions</p>
        <p className="text-xs text-amber-100/80 leading-relaxed">
          Dispara um workflow no GitHub que: (1) lê os 60 posts, (2) renderiza cada slide como PNG com puppeteer (usando as fotos MJ já em Storage),
          (3) faz upload para Supabase em <code className="bg-carvao/40 px-1 rounded">freeme-assets/slides/D&#123;day&#125;-&#123;slot&#125;-&#123;idx&#125;.png</code>.
        </p>
        <p className="text-xs text-amber-100/60 mt-2">
          Tempo estimado: ~15-30 min para tudo. Vais ter link directo para acompanhar.
        </p>
      </div>

      <label className="flex flex-col gap-1 mb-4">
        <span className="text-xs text-creme/40 uppercase tracking-wider">Scope</span>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          disabled={running}
          className="bg-creme/5 rounded-lg px-4 py-3 text-creme outline-none cursor-pointer"
        >
          <option value="all" className="bg-carvao">Tudo (60 posts)</option>
          <option value="slides-only" className="bg-carvao">Só carrosséis (35)</option>
          <option value="videos-only" className="bg-carvao">Só vídeos (26)</option>
          <option value="semana-1" className="bg-carvao">Semana 1</option>
          <option value="semana-2" className="bg-carvao">Semana 2</option>
          <option value="semana-3" className="bg-carvao">Semana 3</option>
          <option value="semana-4" className="bg-carvao">Semana 4</option>
        </select>
      </label>

      <button
        onClick={trigger}
        disabled={running}
        className="rounded-full bg-terracota px-6 py-3 text-sm font-medium text-creme hover:bg-terracota/80 disabled:opacity-50"
      >
        {running ? "A disparar..." : "Disparar render"}
      </button>

      {result?.runsUrl && (
        <div className="mt-6 rounded-xl bg-salvia/10 border border-salvia/20 p-4">
          <p className="text-sm text-salvia mb-2">Workflow disparado.</p>
          <a href={result.runsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-terracota underline">
            Acompanhar no GitHub →
          </a>
        </div>
      )}
      {result?.error && (
        <div className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-300">{result.error}</p>
        </div>
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

const MJ_STORAGE_KEY = "freeme-mj-generated";
const MJ_PROMPTS_STORAGE_KEY = "freeme-mj-claude-prompts";

function loadGenerated(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MJ_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveGenerated(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MJ_STORAGE_KEY, JSON.stringify(map));
}

function loadClaudePrompts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MJ_PROMPTS_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveClaudePrompts(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MJ_PROMPTS_STORAGE_KEY, JSON.stringify(map));
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
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [claudePrompts, setClaudePrompts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    setGenerated(loadGenerated());
    setClaudePrompts(loadClaudePrompts());
  }, []);

  const allPrompts = useMemo(() => {
    return posts.flatMap((p) =>
      getMJPrompts(p.day, p.slot).map((m, i) => ({
        key: `D${p.day}-${p.slot}-${i}`,
        postKey: `D${p.day}-${p.slot === "morning" ? "10h" : "13h"}`,
        title: p.title,
        type: p.type,
        prompt: m.prompt,
        full: `${m.prompt}, ${FREEME_STYLE_BASE}`,
        slideIndex: m.slideIndex,
        usage: m.usage,
      }))
    );
  }, [posts]);

  type Item = (typeof allPrompts)[number];

  async function generateBatch(items: Item[]): Promise<{
    urls: Record<string, string>;
    prompts: Record<string, string>;
    errors: Record<string, string>;
  }> {
    // Parse key "D{day}-{slot}-{idx}" para enviar para a API
    const apiItems = items.map((i) => {
      const m = /^D(\d+)-(morning|evening)-(\d+)$/.exec(i.key);
      if (!m) throw new Error(`Key invalida: ${i.key}`);
      return {
        key: i.key,
        day: Number(m[1]),
        slot: m[2] as "morning" | "evening",
        slideIndex: Number(m[3]),
      };
    });

    const res = await fetch("/api/admin/generate-mj", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: apiItems }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      results: { key: string; url: string | null; prompt: string | null; rationale: string | null; error: string | null }[];
    };
    const urls: Record<string, string> = {};
    const prompts: Record<string, string> = {};
    const errs: Record<string, string> = {};
    for (const r of data.results) {
      if (r.url) urls[r.key] = r.url;
      if (r.prompt) prompts[r.key] = r.prompt;
      if (r.error) errs[r.key] = r.error;
    }
    return { urls, prompts, errors: errs };
  }

  async function runGeneration(items: Item[]) {
    setRunning(true);
    setErrors({});
    setProgress({ done: 0, total: items.length });

    const next = { ...generated };
    const nextPrompts = { ...claudePrompts };
    const nextErrors: Record<string, string> = {};
    const BATCH = 3;

    for (let i = 0; i < items.length; i += BATCH) {
      const chunk = items.slice(i, i + BATCH);
      try {
        const { urls, prompts, errors: errs } = await generateBatch(chunk);
        Object.assign(next, urls);
        Object.assign(nextPrompts, prompts);
        Object.assign(nextErrors, errs);
        setGenerated({ ...next });
        setClaudePrompts({ ...nextPrompts });
        saveGenerated(next);
        saveClaudePrompts(nextPrompts);
        setErrors({ ...nextErrors });
      } catch (e) {
        for (const c of chunk) nextErrors[c.key] = String(e);
        setErrors({ ...nextErrors });
      }
      setProgress({ done: Math.min(i + BATCH, items.length), total: items.length });
    }

    setRunning(false);
    setProgress(null);
  }

  function runTest3() {
    const sample = allPrompts.slice(0, 3);
    if (sample.length === 0) return;
    runGeneration(sample);
  }

  function runAllMissing() {
    const missing = allPrompts.filter((p) => !generated[p.key]);
    if (missing.length === 0) {
      alert("Todos os prompts já foram gerados. Apaga do localStorage se quiseres regerar.");
      return;
    }
    if (!confirm(`Gerar ${missing.length} imagem(s) (Claude prompt + Replicate Flux 1.1 Pro Ultra)? Custo estimado: ~$${(missing.length * 0.07).toFixed(2)}`)) return;
    runGeneration(missing);
  }

  function clearAll() {
    if (!confirm("Apagar referências locais às imagens e prompts gerados? (Não apaga do Supabase Storage, só do teu navegador)")) return;
    setGenerated({});
    setClaudePrompts({});
    saveGenerated({});
    saveClaudePrompts({});
  }

  // Versao "pura": 1 prompt por linha, estilo ja incluido, pronto a colar
  const pure = allPrompts.map((p) => p.full).join("\n");
  // Versao etiquetada: organizada por post, com cabecalhos (so para referencia)
  const labeled = allPrompts.map((p) => `# ${p.postKey} — ${p.title} (slide ${p.slideIndex}, ${p.usage})\n${p.full}`).join("\n\n");

  return (
    <div>
      <div className="rounded-xl bg-salvia/15 border border-salvia/30 p-4 mb-4">
        <p className="text-sm text-creme font-medium mb-2">Gerar imagens automaticamente (Claude → Replicate Flux 1.1 Pro Ultra)</p>
        <p className="text-xs text-creme/70 leading-relaxed mb-3">
          Para cada slide: Claude lê a mensagem e gera um prompt específico (sem close-up de caras, pessoas em interacção real, imagem ecoa a mensagem). Depois Flux 1.1 Pro Ultra gera a foto. Custo: ~$0.07 por imagem (Claude + Replicate).
        </p>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={runTest3}
            disabled={running}
            className="text-xs rounded-full bg-terracota px-4 py-2 text-creme hover:bg-terracota/80 disabled:opacity-50"
          >
            {running && progress?.total === 3 ? `A gerar ${progress.done}/3...` : "Testar 3 amostras (~$0.18)"}
          </button>
          <button
            onClick={runAllMissing}
            disabled={running}
            className="text-xs rounded-full bg-salvia px-4 py-2 text-creme hover:bg-salvia/80 disabled:opacity-50"
          >
            {running && progress && progress.total > 3
              ? `A gerar ${progress.done}/${progress.total}...`
              : `Produzir todas (${allPrompts.length - Object.keys(generated).length} em falta · ~$${((allPrompts.length - Object.keys(generated).length) * 0.07).toFixed(2)})`}
          </button>
          {Object.keys(generated).length > 0 && (
            <button onClick={clearAll} disabled={running} className="text-xs rounded-full bg-creme/5 px-3 py-2 text-creme/50 hover:bg-creme/10">
              Limpar local ({Object.keys(generated).length})
            </button>
          )}
          <span className="text-xs text-creme/40 ml-2">
            {Object.keys(generated).length}/{allPrompts.length} geradas
            {Object.keys(errors).length > 0 && <span className="text-red-400/70"> · {Object.keys(errors).length} erros</span>}
          </span>
        </div>
      </div>

      <details className="rounded-xl bg-creme/5 p-3 mb-4 cursor-pointer">
        <summary className="text-xs text-creme/50">Alternativa manual: copiar prompts para Midjourney/outro — abrir</summary>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={() => onCopy(pure, "mj-pure")} className="text-xs rounded-full bg-creme/10 px-4 py-2 text-creme hover:bg-creme/20">
            {copiedField === "mj-pure" ? "Copiado!" : `Copiar prompts puros (${allPrompts.length})`}
          </button>
          <button onClick={() => onDownload(pure, "freeme-mj-prompts-puros.txt")} className="text-xs rounded-full bg-creme/5 px-4 py-2 text-creme/70 hover:bg-creme/10">
            Download puros
          </button>
          <button onClick={() => onDownload(labeled, "freeme-mj-prompts-referencia.txt")} className="text-xs rounded-full bg-creme/5 px-4 py-2 text-creme/70 hover:bg-creme/10">
            Download etiquetado (ref)
          </button>
        </div>
      </details>

      <details className="rounded-xl bg-creme/5 p-3 mb-6 cursor-pointer">
        <summary className="text-xs text-creme/50">Estilo base FreeMe (já incluído em cada prompt)</summary>
        <p className="text-xs text-creme/70 font-mono mt-2">{FREEME_STYLE_BASE}</p>
      </details>

      {/* Progress bar */}
      {progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-creme/60 mb-1">
            <span>A gerar: {progress.done} / {progress.total}</span>
            <span>{Math.round((progress.done / progress.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-creme/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-salvia transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error banner: aparece quando ha erros */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 mb-4">
          <p className="text-sm text-red-300 font-medium mb-2">
            {Object.keys(errors).length} erro(s) na geração — primeiro erro:
          </p>
          <p className="text-xs text-red-200/90 font-mono leading-relaxed whitespace-pre-wrap break-all">
            <strong>{Object.keys(errors)[0]}:</strong> {Object.values(errors)[0]}
          </p>
          {Object.keys(errors).length > 1 && (
            <details className="mt-2">
              <summary className="text-xs text-red-200/60 cursor-pointer">Ver outros {Object.keys(errors).length - 1} erros</summary>
              <div className="mt-2 flex flex-col gap-2">
                {Object.entries(errors).slice(1).map(([k, e]) => (
                  <p key={k} className="text-xs text-red-200/80 font-mono">
                    <strong>{k}:</strong> {e}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Grelha: 60 posts agrupados, cada um com até 2 thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {posts.map((post) => {
          const postPrompts = allPrompts.filter((p) => p.key.startsWith(`D${post.day}-${post.slot}-`));
          if (postPrompts.length === 0) return null;
          const pKey = `D${post.day}-${post.slot === "morning" ? "10h" : "13h"}`;
          const generatedCount = postPrompts.filter((p) => generated[p.key]).length;
          const errorCount = postPrompts.filter((p) => errors[p.key]).length;
          const isExpanded = expandedKey === pKey;

          return (
            <div key={pKey} className="rounded-xl bg-creme/5 overflow-hidden flex flex-col">
              <button
                onClick={() => setExpandedKey(isExpanded ? null : pKey)}
                className="w-full text-left"
              >
                <div className="grid grid-cols-2 gap-px bg-carvao/40">
                  {postPrompts.map((mj) => {
                    const url = generated[mj.key];
                    const err = errors[mj.key];
                    return (
                      <div
                        key={mj.key}
                        className="relative bg-carvao/60"
                        style={{ aspectRatio: post.type === "carousel" ? "4/5" : "9/16" }}
                      >
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[10px] ${err ? "text-red-400/80" : "text-creme/30"}`}>
                              {err ? "erro" : `slide ${mj.slideIndex}`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {postPrompts.length === 1 && (
                    <div className="bg-carvao/30" style={{ aspectRatio: post.type === "carousel" ? "4/5" : "9/16" }} />
                  )}
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-terracota font-medium">{pKey}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded ${
                      post.type === "carousel" ? "bg-terracota/15 text-terracota" : "bg-salvia/15 text-salvia"
                    }`}>{post.type === "carousel" ? "C" : "V"}</span>
                  </div>
                  <span className="text-[10px] text-creme/40">
                    {generatedCount}/{postPrompts.length}
                    {errorCount > 0 && <span className="text-red-400/70"> · {errorCount}!</span>}
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-creme/10 px-3 py-3 flex flex-col gap-3 bg-carvao/40">
                  <p className="text-[11px] text-creme/50 italic">{post.title}</p>
                  {postPrompts.map((mj) => {
                    const url = generated[mj.key];
                    const err = errors[mj.key];
                    return (
                      <div key={mj.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-creme/40">
                            slide {mj.slideIndex} · {mj.usage}
                            {url && <span className="ml-2 text-salvia">✓</span>}
                          </span>
                          {claudePrompts[mj.key] && (
                            <button onClick={() => onCopy(claudePrompts[mj.key], mj.key)} className="text-[10px] text-terracota hover:text-terracota/80">
                              {copiedField === mj.key ? "✓" : "copiar prompt"}
                            </button>
                          )}
                        </div>
                        {claudePrompts[mj.key] ? (
                          <>
                            <p className="text-[10px] uppercase tracking-wider text-salvia/70">Prompt Claude (usado)</p>
                            <p className="text-[11px] text-creme/85 font-mono leading-relaxed bg-carvao/60 rounded p-2">{claudePrompts[mj.key]}</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-creme/40 italic">Ainda nao gerada — prompt sera criado pelo Claude no momento</p>
                        )}
                        {err && <p className="text-[10px] text-red-300/70 italic">{err}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
