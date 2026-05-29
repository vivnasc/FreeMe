"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ALL_POSTS } from "@/content/content-calendar";
import { type ContentPost } from "@/content/content-types";
import { getMJPrompts, FREEME_STYLE_BASE } from "@/content/mj-prompts";
import { ImageDropZone } from "@/components/image-drop-zone";
import { buildSlideHTML } from "@/lib/slide-template.mjs";

type MainView = "studio" | "conteudo" | "imagens" | "slides" | "distribuir";
type DetailTab = "slides" | "copy" | "imagem";
type ConteudoSub = "lista" | "calendario" | "captions";

const CAPTION_AUTHOR_TAG = (process.env.NEXT_PUBLIC_CAPTION_AUTHOR_TAG ?? "@vivianne.dos.santos").trim();
const VIVIANNE_HANDLE = CAPTION_AUTHOR_TAG;

function appendAuthorTag(caption: string, hashtags?: string): string {
  // Vazio desactiva
  if (!CAPTION_AUTHOR_TAG) return hashtags ? `${caption}\n\n${hashtags}` : caption;
  // Nao duplicar (case-insensitive)
  if (caption.toLowerCase().includes(CAPTION_AUTHOR_TAG.toLowerCase())) {
    return hashtags ? `${caption}\n\n${hashtags}` : caption;
  }
  // Mention antes das hashtags (IG detecta melhor)
  return hashtags
    ? `${caption}\n\n${CAPTION_AUTHOR_TAG}\n\n${hashtags}`
    : `${caption}\n\n${CAPTION_AUTHOR_TAG}`;
}

function igCaption(post: ContentPost): string {
  return appendAuthorTag(post.caption, post.hashtags);
}

function tiktokCaption(post: ContentPost): string {
  const short = post.caption.split("\n")[0];
  const tags = post.hashtags.split(" ").slice(0, 5).join(" ");
  return appendAuthorTag(short, `${tags} #fyp #paraamães`);
}

function viewFromPath(path: string): MainView {
  if (path.startsWith("/admin/conteudo")) return "conteudo";
  if (path.startsWith("/admin/imagens")) return "imagens";
  if (path.startsWith("/admin/slides")) return "slides";
  if (path.startsWith("/admin/distribuir")) return "distribuir";
  return "studio";
}

function pathFromView(view: MainView): string {
  return view === "studio" ? "/admin" : `/admin/${view}`;
}

export function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const view = viewFromPath(pathname);
  const setView = (v: MainView) => router.push(pathFromView(v));
  const [conteudoSub, setConteudoSub] = useState<ConteudoSub>("lista");
  const [selected, setSelected] = useState<ContentPost | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("slides");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [slideImages, setSlideImages] = useState<Record<string, string>>({});
  const [approved, setApprovedState] = useState<Set<string>>(new Set());

  useEffect(() => {
    setApprovedState(loadApproved());
  }, []);

  function toggleApproval(pKey: string) {
    setApprovedState((prev) => {
      const next = new Set(prev);
      if (next.has(pKey)) next.delete(pKey);
      else next.add(pKey);
      saveApproved(next);
      return next;
    });
  }

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

  // Hidrata slideImages a partir das imagens MJ geradas em /admin/imagens
  // para que o preview em /admin/conteudo mostre-as automaticamente.
  // Mapeia chave MJ (D{day}-{slot}-{mjIdx}) para slideId do preview
  // ({postKey}-slide-{slideIndex}) usando getMJPrompts.
  useEffect(() => {
    function hydrateFromMJ() {
      try {
        const generated = JSON.parse(localStorage.getItem(MJ_STORAGE_KEY) || "{}") as Record<string, string>;
        const next: Record<string, string> = {};
        for (const post of ALL_POSTS) {
          const slots = getMJPrompts(post.day, post.slot);
          slots.forEach((slot, mjIdx) => {
            const mjKey = `D${post.day}-${post.slot}-${mjIdx}`;
            const url = generated[mjKey];
            if (!url) return;
            const pKey = `D${post.day}-${post.slot === "morning" ? "10h" : "13h"}`;
            const slideId = `${pKey}-slide-${slot.slideIndex}`;
            next[slideId] = url;
          });
        }
        setSlideImages((prev) => ({ ...next, ...prev })); // drag-drop overrides MJ
      } catch {}
    }
    hydrateFromMJ();
    window.addEventListener("storage", hydrateFromMJ);
    return () => window.removeEventListener("storage", hydrateFromMJ);
  }, []);

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
        <h1 className="text-lg text-creme/80 mb-4">{selected.title}</h1>

        {(() => {
          const pKey = postKey(selected);
          const isApproved = approved.has(pKey);
          return (
            <div className="row" style={{ marginBottom: 20, gap: 10 }}>
              <button
                onClick={() => toggleApproval(pKey)}
                className={`btn ${isApproved ? "salvia" : "primary"}`}
                style={{ fontSize: 13 }}
              >
                {isApproved ? "✓ Conteúdo aprovado" : "Aprovar conteúdo"}
              </button>
              <span className="muted" style={{ fontSize: 12 }}>
                {isApproved ? "Pronto para gerar imagens." : "Revê slides + caption antes de aprovar."}
              </span>
            </div>
          );
        })()}

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
          <>
            {selected.type === "video" && (
              <div className="card" style={{ marginBottom: 20, borderColor: "var(--terracota)" }}>
                <div className="mini" style={{ marginBottom: 6, color: "var(--terracota)" }}>Como o vídeo é montado</div>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Cada slide abaixo é <strong>uma cena</strong> do vídeo Reels/TikTok (1080×1920).
                </p>
                <ul style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                  <li>TTS ElevenLabs lê o texto da cena na tua voz clonada</li>
                  <li>Foto MJ do post (1 só) é background fixo de todas as cenas</li>
                  <li>ffmpeg combina texto + áudio + 0.3s padding = 1 segmento</li>
                  <li>Concat dos {selected.slides.length} segmentos → MP4 final em <code>freeme-assets/videos/D{selected.day}-{selected.slot}.mp4</code></li>
                  <li>Duração total ≈ {(selected.slides.length * 3.5).toFixed(0)}s (depende do texto)</li>
                </ul>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {selected.slides.map((slide, i) => {
              const slideId = `${postKey(selected)}-slide-${i}`;
              const imageUrl = slideImages[slideId];
              const acceptsPhoto = ["capa", "conteudo", "kinetic-line"].includes(slide.layout);
              const isLast = i === selected.slides.length - 1;

              return (
                <div key={i} className="flex flex-col gap-2">
                  <SlidePreview slide={slide} post={selected} photoUrl={imageUrl} isLastSlide={isLast} width={300} />
                  <p className="mini" style={{ fontSize: 10 }}>{slide.layout} · slide {i + 1}/{selected.slides.length}</p>
                  {acceptsPhoto && (
                    <SlideImageControls
                      slideId={slideId}
                      currentUrl={imageUrl}
                      post={selected}
                      slideIdx={i}
                      onUploaded={(url) => onImageUploaded(slideId, url)}
                    />
                  )}
                </div>
              );
            })}
            </div>
          </>
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

  const phaseTitles: Record<MainView, string> = {
    studio: "Studio",
    conteudo: "Conteúdo · 60 posts prontos",
    imagens: "Imagens · Claude → Replicate",
    slides: "Slides · render PNG via GitHub Actions",
    distribuir: "Distribuir · CSV Metricool",
  };
  const phaseNum: Record<MainView, string> = {
    studio: "Vista geral",
    conteudo: "Fase 1",
    imagens: "Fase 2",
    slides: "Fase 3",
    distribuir: "Fase 4",
  };

  // ============== MAIN VIEWS ==============
  return (
    <div>
      {/* HEADER */}
      <div className="row between" style={{ marginBottom: 24 }}>
        <div>
          <div className="mini" style={{ marginBottom: 4 }}>{phaseNum[view]}</div>
          <h1>{phaseTitles[view]}</h1>
        </div>
        {view !== "studio" && (
          <button onClick={exportAllCSV} className="btn">
            Export CSV ({filtered.length})
          </button>
        )}
      </div>

      {/* STUDIO (overview) */}
      {view === "studio" && (
        <StudioPanel
          posts={ALL_POSTS}
          approved={approved}
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

      {/* LISTA — table.t SyncHim */}
      {view === "conteudo" && conteudoSub === "lista" && (
        <table className="t">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Post</th>
              <th style={{ width: 90 }}>Tipo</th>
              <th style={{ width: 70 }}>Hora</th>
              <th style={{ width: 100 }}>Estado</th>
              <th style={{ width: 90, textAlign: "center" }}>Aprovado</th>
              <th style={{ width: 110 }}>Categoria</th>
              <th>Título</th>
              <th style={{ width: 60, textAlign: "center" }}>Slides</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const st = derivePostStatus(p, slideImages);
              const pK = postKey(p);
              const isApproved = approved.has(pK);
              return (
                <tr
                  key={postKey(p)}
                  style={{ cursor: "pointer" }}
                  onClick={() => { setSelected(p); setDetailTab("slides"); }}
                >
                  <td style={{ color: "var(--terracota)", fontWeight: 500 }}>{postKey(p)}</td>
                  <td>
                    <span className="pill" style={{
                      borderColor: p.type === "carousel" ? "var(--terracota)" : "var(--salvia)",
                      color: p.type === "carousel" ? "var(--terracota)" : "var(--salvia)",
                    }}>
                      {p.type === "carousel" ? "Carrossel" : "Vídeo"}
                    </span>
                  </td>
                  <td>
                    <span className="pill" style={{
                      borderColor: p.slot === "morning" ? "var(--ouro)" : "var(--terracota)",
                      color: p.slot === "morning" ? "var(--ouro)" : "var(--terracota)",
                    }}>{p.time}</span>
                  </td>
                  <td>
                    <span className={`pill ${st.status === "ready" ? "ok" : st.status === "partial" ? "partial" : "pending"}`}>
                      {st.status === "ready" ? "Ready" : st.status === "partial" ? `${st.mjDone}/${st.mjTotal}` : "Draft"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }} onClick={(e) => { e.stopPropagation(); toggleApproval(pK); }}>
                    <span className={`pill ${isApproved ? "ok" : "pending"}`} style={{ cursor: "pointer" }}>
                      {isApproved ? "✓" : "—"}
                    </span>
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{p.categoria}</td>
                  <td style={{ color: "var(--texto)" }}>{p.title}</td>
                  <td className="muted" style={{ textAlign: "center", fontSize: 12 }}>{p.slides.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
  approved,
  onNavigate,
}: {
  posts: ContentPost[];
  approved: Set<string>;
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

  // Calcular contadores + funnel (estado por post derivado do MJ generated)
  const totalCarousels = posts.filter((p) => p.type === "carousel").length;
  const totalVideos = posts.filter((p) => p.type === "video").length;
  const totalMJ = posts.reduce((sum, p) => sum + getMJPrompts(p.day, p.slot).length, 0);
  const generatedMJ = Object.keys(mjGenerated).length;
  const funnel = posts.reduce(
    (acc, p) => {
      const { status } = derivePostStatus(p, mjGenerated);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { draft: 0, partial: 0, ready: 0, rendered: 0, published: 0 } as Record<PostStatus, number>,
  );

  const diagAllOk = (() => {
    const d = diag.debug as { ok?: boolean } | undefined;
    const c = diag.claude as { ok?: boolean } | undefined;
    const r = diag.replicate as { ok?: boolean } | undefined;
    return d && c && r && c.ok !== false && r.ok !== false;
  })();

  const approvedCount = posts.filter((p) => approved.has(`D${p.day}-${p.slot === "morning" ? "10h" : "13h"}`)).length;

  // Next Action: prioriza REVISAO/APROVACAO antes de gastar em imagens
  const nextAction = (() => {
    if (!diagAllOk && Object.keys(diag).length === 0) {
      return { title: "Corre o diagnóstico primeiro", desc: "Confirma envs + Claude + Replicate antes de gastar.", view: "studio" as MainView, label: "Ver diagnóstico" };
    }
    if (approvedCount === 0) {
      return {
        title: `Revê e aprova os ${posts.length} posts em Conteúdo`,
        desc: "Antes de gastar em imagens, clica em cada post para veres os slides + caption. Aprova os que servirem. Só depois passa à Fase 2.",
        view: "conteudo" as MainView,
        label: "Ir a Conteúdo →",
      };
    }
    if (approvedCount < posts.length) {
      const falta = posts.length - approvedCount;
      return {
        title: `Continuar revisão (${falta} posts por aprovar)`,
        desc: `Já aprovaste ${approvedCount}/${posts.length}. Continua a rever em Conteúdo antes de avançar.`,
        view: "conteudo" as MainView,
        label: "Continuar revisão →",
      };
    }
    if (funnel.draft + funnel.partial > 0 && generatedMJ === 0) {
      return {
        title: `Gerar imagens (${totalMJ} prompts)`,
        desc: `Conteúdo aprovado. Custo estimado ~$${(totalMJ * 0.07).toFixed(2)}. Começa com 3 carrosseis de teste.`,
        view: "imagens" as MainView,
        label: "Ir a Imagens →",
      };
    }
    if (funnel.draft + funnel.partial > 0) {
      const falta = totalMJ - generatedMJ;
      return {
        title: `Continuar geração (${falta} imagens em falta)`,
        desc: `Reusa pool onde possível. ~$${(falta * 0.07).toFixed(2)} restantes.`,
        view: "imagens" as MainView,
        label: "Continuar →",
      };
    }
    if (funnel.rendered === 0) {
      return {
        title: "Disparar render dos slides",
        desc: `${posts.length} posts com imagens prontas. GH Actions renderiza PNGs em ~15-30 min.`,
        view: "slides" as MainView,
        label: "Ir a Slides →",
      };
    }
    if (funnel.published === 0) {
      return {
        title: "Exportar CSV Metricool",
        desc: `${funnel.rendered} posts prontos. Escolhe data início, gera CSV, importa.`,
        view: "distribuir" as MainView,
        label: "Ir a Distribuir →",
      };
    }
    return { title: "Campanha completa", desc: `${funnel.published} publicados. Tudo agendado.`, view: "studio" as MainView, label: "" };
  })();

  return (
    <div className="flex flex-col gap-3">
      {/* PRÓXIMA ACÇÃO (padrão SyncHim, borda dourada) */}
      <div className="card" style={{ borderColor: "var(--ouro)" }}>
        <div className="mini" style={{ marginBottom: 6, color: "var(--ouro)" }}>Próxima acção</div>
        <h2 style={{ margin: 0, marginBottom: 6 }}>{nextAction.title}</h2>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: nextAction.label ? 14 : 0 }}>
          {nextAction.desc}
        </p>
        {nextAction.label && (
          <button onClick={() => onNavigate(nextAction.view)} className="btn primary">
            {nextAction.label}
          </button>
        )}
      </div>

      {/* FUNIL DE PRODUÇÃO (padrão SyncHim §CIRCUITO-COMPLETO) */}
      <div className="card">
        <div className="mini" style={{ marginBottom: 12 }}>Funil de produção</div>
        <div className="row" style={{ gap: 24 }}>
          <div>
            <div className="mini" style={{ fontSize: 10 }}>Total posts</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500 }}>{posts.length}</div>
          </div>
          <div>
            <div className="mini" style={{ fontSize: 10 }}>Aprovados</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: approvedCount === posts.length ? "var(--salvia)" : "var(--ouro)" }}>{approvedCount}</div>
          </div>
          <div>
            <div className="mini" style={{ fontSize: 10 }}>Draft</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--texto-suave)" }}>{funnel.draft}</div>
          </div>
          <div>
            <div className="mini" style={{ fontSize: 10 }}>Em curso</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--ouro)" }}>{funnel.partial}</div>
          </div>
          <div>
            <div className="mini" style={{ fontSize: 10 }}>Ready</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--terracota)" }}>{funnel.ready}</div>
          </div>
          <div>
            <div className="mini" style={{ fontSize: 10 }}>Rendered</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--salvia)" }}>{funnel.rendered}</div>
          </div>
          <div>
            <div className="mini" style={{ fontSize: 10 }}>Published</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--salvia)" }}>{funnel.published}</div>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
          {generatedMJ} / {totalMJ} imagens MJ geradas · {totalCarousels} carrosseis + {totalVideos} videos
        </p>
      </div>

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
  const [supabasePublicBase, setSupabasePublicBase] = useState<string>("");

  useEffect(() => {
    // Tenta carregar de /api/admin/auth/debug a NEXT_PUBLIC_SUPABASE_URL (devolvida com prefix)
    fetch("/api/admin/auth/debug")
      .then((r) => r.json())
      .then((d) => {
        const url = d?.envs?.find?.((e: { name: string }) => e.name === "NEXT_PUBLIC_SUPABASE_URL");
        if (url?.prefix) setSupabasePublicBase("");
      })
      .catch(() => {});
  }, []);

  function buildAndDownload() {
    const header = [
      "Date", "Time", "Draft",
      "Instagram", "Instagram Post Type", "Instagram Show Reel On Feed",
      "TikTok", "TikTok Post Privacy",
      "Text",
      "Picture Url 1", "Picture Url 2", "Picture Url 3", "Picture Url 4", "Picture Url 5",
      "Picture Url 6", "Picture Url 7", "Picture Url 8", "Picture Url 9", "Picture Url 10",
      "First Comment",
    ];

    const rows = posts.map((p) => {
      const startD = new Date(startDate);
      startD.setDate(startD.getDate() + (p.day - 1));
      const date = startD.toISOString().split("T")[0];
      const time = `${p.time}:00`;
      const ig = igCaption(p);
      const igType = p.type === "carousel" ? "CAROUSEL" : "REEL";

      // Para videos: URL unica do MP4. Para carrosseis: ate 10 PNGs.
      const isVideo = p.type === "video";
      const slidePngs: string[] = isVideo
        ? [`${supabasePublicBase}/storage/v1/object/public/freeme-assets/videos/D${p.day}-${p.slot}.mp4`]
        : Array.from({ length: Math.min(p.slides.length, 10) }, (_, i) =>
            `${supabasePublicBase}/storage/v1/object/public/freeme-assets/slides/D${p.day}-${p.slot}-${String(i).padStart(2, "0")}.png`
          );

      // First comment (1° comentario auto) com mention extra + diagnostico CTA
      const firstComment = `Diagnóstico grátis: freeme.viviannedossantos.com\n\nSe te tocou, partilha com uma mãe que precisa. ${VIVIANNE_HANDLE}`;

      const cells = new Array(header.length).fill("");
      cells[0] = date;
      cells[1] = time;
      cells[2] = "FALSE";
      cells[3] = "TRUE"; cells[4] = igType; cells[5] = isVideo ? "TRUE" : "FALSE";
      cells[6] = "TRUE"; cells[7] = "PUBLIC_TO_EVERYONE";
      cells[8] = `"${ig.replace(/"/g, '""')}"`;
      slidePngs.slice(0, 10).forEach((u, i) => { cells[9 + i] = u; });
      cells[19] = `"${firstComment.replace(/"/g, '""')}"`;
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
    <div style={{ maxWidth: 720 }}>
      <div className="card" style={{ marginBottom: 16, borderColor: "var(--ouro)" }}>
        <div className="mini" style={{ marginBottom: 8 }}>CSV Metricool</div>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
          CSV com data + hora + captions (incluindo {VIVIANNE_HANDLE}) + URLs dos slides/vídeos.
          Importa em Metricool → Planning → Import CSV.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16, borderColor: "var(--terracota)" }}>
        <div className="mini" style={{ marginBottom: 8, color: "var(--terracota)" }}>Para o post aparecer no teu perfil</div>
        <p style={{ fontSize: 13, lineHeight: 1.7 }}>
          O <strong>mention</strong> {VIVIANNE_HANDLE} já vai no caption — quem ler tem o teu perfil clicável.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          Para o post aparecer também no <strong>teu feed</strong>, em Metricool depois do import, edita cada
          post e activa <strong>&ldquo;Add Collaborator&rdquo;</strong> → adiciona <code>{VIVIANNE_HANDLE.slice(1)}</code>.
          Tens de aceitar o convite no Instagram da Vivianne para o post ficar duplicado nos 2 feeds.
        </p>
      </div>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span className="mini" style={{ marginBottom: 6, display: "block" }}>Data de início (Dia 1)</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input"
          style={{ maxWidth: 220 }}
        />
        <span className="muted" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
          D30 = {new Date(new Date(startDate).getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
        </span>
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span className="mini" style={{ marginBottom: 6, display: "block" }}>Base URL do Supabase (para URLs dos slides)</span>
        <input
          type="url"
          value={supabasePublicBase}
          onChange={(e) => setSupabasePublicBase(e.target.value)}
          placeholder="https://<project>.supabase.co"
          className="input"
        />
        <span className="muted" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
          Encontra em Supabase Dashboard → Settings → API → Project URL
        </span>
      </label>

      <button onClick={buildAndDownload} className="btn primary" disabled={!supabasePublicBase}>
        Download CSV ({posts.length} posts)
      </button>

      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        ⚠ Os PNGs/MP4s nos URLs do CSV têm de existir no Storage (Fase 3) antes de o Metricool publicar.
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

// "ARRASTA FOTO" + "gerar auto" por slide. Identidade FreeMe.
// Renderiza UMA slide usando o template oficial (mesmo HTML do GH render),
// escalado para caber no preview do admin. Vês exactamente o que sai.
function SlidePreview({
  slide,
  post,
  photoUrl,
  width = 220,
  isLastSlide,
}: {
  slide: { layout: string; body: string; bold?: string[] };
  post: ContentPost;
  photoUrl?: string;
  width?: number;
  isLastSlide?: boolean;
}) {
  const isVideo = post.type === "video";
  const baseW = 1080;
  const baseH = isVideo ? 1920 : 1350;
  const scale = width / baseW;
  const html = useMemo(
    () =>
      buildSlideHTML(slide, {
        photoUrl: photoUrl || undefined,
        isCarousel: post.type === "carousel",
        isLastSlide: !!isLastSlide,
        isVideo,
      }) as string,
    [slide, photoUrl, post.type, isLastSlide, isVideo],
  );

  return (
    <div
      style={{
        width,
        height: baseH * scale,
        overflow: "hidden",
        borderRadius: 6,
        background: "var(--bg)",
      }}
    >
      <iframe
        srcDoc={html}
        sandbox="allow-same-origin"
        style={{
          width: baseW,
          height: baseH,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          border: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Status state machine derivado (sem DB, baseado em localStorage + storage paths futuros)
export type PostStatus = "draft" | "partial" | "ready" | "rendered" | "published";

function derivePostStatus(
  post: ContentPost,
  mjGenerated: Record<string, string>,
): { status: PostStatus; mjDone: number; mjTotal: number } {
  const slots = getMJPrompts(post.day, post.slot);
  const total = slots.length;
  const done = slots.filter((_, idx) => mjGenerated[`D${post.day}-${post.slot}-${idx}`]).length;
  let status: PostStatus = "draft";
  if (done === 0) status = "draft";
  else if (done < total) status = "partial";
  else status = "ready";
  // TODO: check freeme-assets/slides/D{day}-{slot}-*.png para "rendered"
  return { status, mjDone: done, mjTotal: total };
}

function SlideImageControls({
  slideId,
  currentUrl,
  post,
  slideIdx,
  onUploaded,
}: {
  slideId: string;
  currentUrl?: string;
  post: ContentPost;
  slideIdx: number;
  onUploaded: (url: string) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateAuto() {
    setGenerating(true);
    setError(null);
    try {
      // Determinar qual prompt MJ usa este slideIdx
      const slots = getMJPromptsForSlide(post, slideIdx);
      if (slots.length === 0) {
        setError("Sem prompt MJ definido para este slide");
        return;
      }
      const item = slots[0];
      const res = await fetch("/api/admin/generate-mj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ key: item.key, day: post.day, slot: post.slot, slideIndex: item.idx }],
          strategy: "prefer-existing",
        }),
      });
      const data = await res.json();
      const result = data.results?.[0];
      if (result?.url) {
        onUploaded(result.url);
      } else {
        setError(result?.error || "Sem URL devolvida");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <ImageDropZone slideId={slideId} currentUrl={currentUrl} onUploaded={onUploaded} />
        <button onClick={generateAuto} disabled={generating} className="btn" style={{ fontSize: 11, padding: "4px 10px", whiteSpace: "nowrap" }}>
          {generating ? "..." : "gerar auto"}
        </button>
      </div>
      {error && <p style={{ color: "var(--bordeaux)", fontSize: 10 }}>{error}</p>}
    </div>
  );
}

// Devolve o(s) item(s) do pool MJ que mapeiam para este slideIdx do post.
function getMJPromptsForSlide(post: ContentPost, slideIdx: number) {
  const slots = getMJPrompts(post.day, post.slot);
  const items: { key: string; idx: number }[] = [];
  slots.forEach((s, idx) => {
    if (s.slideIndex === slideIdx) {
      items.push({ key: `D${post.day}-${post.slot}-${idx}`, idx });
    }
  });
  return items;
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
const APPROVED_STORAGE_KEY = "freeme-approved-posts";

function loadApproved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const arr = JSON.parse(localStorage.getItem(APPROVED_STORAGE_KEY) || "[]") as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveApproved(set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(Array.from(set)));
}

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
  type ReuseStrategy = "prefer-existing" | "always-new" | "reuse-only";
  const [strategy, setStrategy] = useState<ReuseStrategy>("always-new");
  const [testN, setTestN] = useState(3);

  async function generateBatch(items: Item[]): Promise<{
    urls: Record<string, string>;
    prompts: Record<string, string>;
    errors: Record<string, string>;
  }> {
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
      body: JSON.stringify({ items: apiItems, strategy }),
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

  // Padrao SyncHim §3: modo teste com N carrosseis completos (todos os prompts dos N primeiros posts)
  function runTestN() {
    const seen = new Set<string>();
    const samplePosts: string[] = [];
    for (const p of allPrompts) {
      const key = p.postKey;
      if (!seen.has(key)) {
        seen.add(key);
        samplePosts.push(key);
        if (samplePosts.length >= testN) break;
      }
    }
    const sample = allPrompts.filter((p) => samplePosts.includes(p.postKey));
    if (sample.length === 0) return;
    const cost = strategy === "reuse-only" ? "0.00 (so pool)" : (sample.length * 0.07).toFixed(2);
    if (!confirm(`Teste de ${testN} carrosseis (${sample.length} imagens). Custo estimado: ~$${cost}`)) return;
    runGeneration(sample);
  }

  function runAllMissing() {
    const missing = allPrompts.filter((p) => !generated[p.key]);
    if (missing.length === 0) {
      alert("Todos os prompts já foram gerados. Apaga do localStorage se quiseres regerar.");
      return;
    }
    const cost = strategy === "reuse-only" ? "0.00 (so pool)" : (missing.length * 0.07).toFixed(2);
    if (!confirm(`Gerar ${missing.length} imagem(s) com strategy "${strategy}". Custo estimado: ~$${cost}`)) return;
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
        <p className="text-sm text-creme font-medium mb-2">Gerar imagens (Claude → Replicate Flux 1.1 Pro Ultra)</p>
        <p className="text-xs text-creme/70 leading-relaxed mb-3">
          Claude inventa prompt por slide. Pool partilha imagens entre slots da mesma (layout, categoria) para poupar.
        </p>
        <div className="flex gap-3 flex-wrap items-center mb-3">
          <label className="flex items-center gap-2 text-xs text-creme/80">
            Estratégia:
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as ReuseStrategy)}
              disabled={running}
              className="bg-carvao/60 text-creme rounded px-2 py-1 text-xs"
            >
              <option value="always-new">Sempre gerar nova</option>
              <option value="prefer-existing">Reusar quando houver match</option>
              <option value="reuse-only">Só reusar (não gera)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-creme/80">
            Teste · N carrosseis:
            <input
              type="number"
              min={1}
              max={10}
              value={testN}
              onChange={(e) => setTestN(Number(e.target.value) || 3)}
              disabled={running}
              className="bg-carvao/60 text-creme rounded px-2 py-1 text-xs w-16"
            />
          </label>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={runTestN}
            disabled={running}
            className="text-xs rounded-full bg-terracota px-4 py-2 text-creme hover:bg-terracota/80 disabled:opacity-50"
          >
            {running && progress && progress.total <= testN * 3
              ? `A gerar ${progress.done}/${progress.total}...`
              : `Testar ${testN} carrosseis completos`}
          </button>
          <button
            onClick={runAllMissing}
            disabled={running}
            className="text-xs rounded-full bg-salvia px-4 py-2 text-creme hover:bg-salvia/80 disabled:opacity-50"
          >
            {running && progress && progress.total > testN * 3
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

      {/* Lista densa estilo SyncHim — 1 linha por post */}
      <table className="t">
        <thead>
          <tr>
            <th style={{ width: 80 }}>Post</th>
            <th style={{ width: 70 }}>Tipo</th>
            <th>Título</th>
            <th style={{ width: 90 }}>Estado</th>
            <th style={{ width: 130 }}>Preview</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const postPrompts = allPrompts.filter((p) => p.key.startsWith(`D${post.day}-${post.slot}-`));
            if (postPrompts.length === 0) return null;
            const pKey = `D${post.day}-${post.slot === "morning" ? "10h" : "13h"}`;
            const generatedCount = postPrompts.filter((p) => generated[p.key]).length;
            const errorCount = postPrompts.filter((p) => errors[p.key]).length;
            const isExpanded = expandedKey === pKey;
            const status =
              errorCount > 0 ? "failed" :
              generatedCount === postPrompts.length ? "ok" :
              generatedCount > 0 ? "partial" : "pending";
            const statusLabel =
              status === "ok" ? `${generatedCount}/${postPrompts.length}` :
              status === "failed" ? `${errorCount} erro` :
              status === "partial" ? `${generatedCount}/${postPrompts.length}` :
              "pendente";

            return (
              <Fragment key={pKey}>
                <tr style={{ cursor: "pointer" }} onClick={() => setExpandedKey(isExpanded ? null : pKey)}>
                  <td style={{ color: "var(--terracota)", fontWeight: 500 }}>{pKey}</td>
                  <td>
                    <span className="pill" style={{
                      borderColor: post.type === "carousel" ? "var(--terracota)" : "var(--salvia)",
                      color: post.type === "carousel" ? "var(--terracota)" : "var(--salvia)",
                    }}>
                      {post.type === "carousel" ? "Carrossel" : "Vídeo"}
                    </span>
                  </td>
                  <td style={{ color: "var(--texto)" }}>{post.title}</td>
                  <td><span className={`pill ${status}`}>{statusLabel}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {postPrompts.map((mj) => {
                        const url = generated[mj.key];
                        const err = errors[mj.key];
                        return (
                          <div
                            key={mj.key}
                            style={{
                              width: 32, height: 40,
                              borderRadius: 3,
                              background: "var(--bg)",
                              border: `1px solid ${err ? "var(--bordeaux)" : "var(--linha)"}`,
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            {url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="muted" style={{ fontSize: 11 }}>{isExpanded ? "▾" : "▸"}</span>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} style={{ background: "var(--bg)", padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {postPrompts.map((mj) => {
                          const url = generated[mj.key];
                          const err = errors[mj.key];
                          return (
                            <div key={mj.key} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{
                                width: 80,
                                aspectRatio: post.type === "carousel" ? "4/5" : "9/16",
                                background: "var(--bg-card)",
                                border: `1px solid ${err ? "var(--bordeaux)" : "var(--linha)"}`,
                                borderRadius: 4,
                                overflow: "hidden",
                                flexShrink: 0,
                              }}>
                                {url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 10, color: "var(--texto-suave)" }}>
                                    slide {mj.slideIndex}
                                  </div>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="row" style={{ marginBottom: 4, gap: 8 }}>
                                  <span className="mini">slide {mj.slideIndex} · {mj.usage}</span>
                                  {url && <span style={{ color: "var(--salvia)", fontSize: 11 }}>✓ gerada</span>}
                                  {claudePrompts[mj.key] && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onCopy(claudePrompts[mj.key], mj.key); }}
                                      className="btn"
                                      style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px" }}
                                    >
                                      {copiedField === mj.key ? "Copiado" : "Copiar prompt"}
                                    </button>
                                  )}
                                </div>
                                {claudePrompts[mj.key] ? (
                                  <pre className="json" style={{ fontSize: 11 }}>{claudePrompts[mj.key]}</pre>
                                ) : (
                                  <p className="muted" style={{ fontSize: 12 }}>Ainda não gerada · prompt será criado pelo Claude no momento da geração.</p>
                                )}
                                {err && <p style={{ color: "var(--bordeaux)", fontSize: 11, marginTop: 4 }}>{err}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
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
