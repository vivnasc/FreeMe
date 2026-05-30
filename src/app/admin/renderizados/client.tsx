"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ALL_POSTS } from "@/content/content-calendar";

interface Item {
  name: string;
  path: string;
  url: string;
}

type Status = "rendered" | "parcial" | "vazio";
type Tab = "rendered" | "parcial" | "vazio" | "todos";

export function RenderizadosClient() {
  const [slides, setSlides] = useState<Item[]>([]);
  const [videos, setVideos] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("todos");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/biblioteca?prefix=slides").then((r) => r.json()),
      fetch("/api/admin/biblioteca?prefix=videos").then((r) => r.json()),
    ])
      .then(([s, v]) => {
        setSlides(s.items || []);
        setVideos(v.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    return ALL_POSTS.map((post) => {
      const slotPrefix = `D${post.day}-${post.slot}`;
      const pngs = slides
        .filter((s) => s.name.startsWith(`${slotPrefix}-`) && s.name.endsWith(".png"))
        .sort((a, b) => a.name.localeCompare(b.name));
      const mp4 = videos.find((v) => v.name === `${slotPrefix}.mp4`);
      const expectedFinal = post.type === "video" ? 1 : post.slides.length;
      const got = post.type === "video" ? (mp4 ? 1 : 0) : pngs.length;
      const status: Status =
        got === 0 ? "vazio" : got >= expectedFinal ? "rendered" : "parcial";
      const week = post.day <= 7 ? 1 : post.day <= 14 ? 2 : post.day <= 21 ? 3 : 4;
      return { post, pngs, mp4, status, got, expected: expectedFinal, week };
    });
  }, [slides, videos]);

  const counts = useMemo(() => {
    const c = { rendered: 0, parcial: 0, vazio: 0 };
    for (const g of grouped) c[g.status]++;
    return c;
  }, [grouped]);

  const filtered = useMemo(() => {
    if (tab === "todos") return grouped;
    return grouped.filter((g) => g.status === tab);
  }, [grouped, tab]);

  const byWeek = useMemo(() => {
    const map = new Map<number, typeof filtered>();
    for (const g of filtered) {
      const arr = map.get(g.week) || [];
      arr.push(g);
      map.set(g.week, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [filtered]);

  async function copyUrls(pKey: string, urls: string[]) {
    await navigator.clipboard.writeText(urls.join("\n"));
    setCopiedKey(pKey);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div className="mini" style={{ marginBottom: 4 }}>Fase 5</div>
        <h1>Carrosseis e Vídeos renderizados</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          Outputs finais (Puppeteer + template + ffmpeg). Diferente da{" "}
          <Link href="/admin/biblioteca" style={{ color: "var(--terracota)" }}>biblioteca</Link>{" "}
          que mostra os assets fonte (MJ).
        </p>
      </div>

      <div className="row tight" style={{ marginBottom: 24 }}>
        <Chip label="rendered" count={counts.rendered} active={tab === "rendered"} onClick={() => setTab("rendered")} color="var(--salvia)" />
        <Chip label="parcial" count={counts.parcial} active={tab === "parcial"} onClick={() => setTab("parcial")} color="var(--ouro)" />
        <Chip label="vazio" count={counts.vazio} active={tab === "vazio"} onClick={() => setTab("vazio")} color="var(--bordeaux)" />
        <Chip label="todos" count={grouped.length} active={tab === "todos"} onClick={() => setTab("todos")} color="var(--terracota)" />
      </div>

      {loading ? (
        <p className="muted">A carregar Storage...</p>
      ) : (
        byWeek.map(([week, posts]) => (
          <div key={week} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 400, fontFamily: "var(--font-serif, 'Fraunces'), serif", marginBottom: 16 }}>
              Semana {week} <span className="muted" style={{ fontSize: 13 }}>· {posts.length}</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {posts.map(({ post, pngs, mp4, status, got, expected }) => {
                const pKey = `D${post.day}-${post.slot === "morning" ? "10h" : "13h"}`;
                const cover = post.type === "video" ? mp4 : pngs[0];
                const allUrls = post.type === "video" ? (mp4 ? [mp4.url] : []) : pngs.map((p) => p.url);
                const badgeColor = status === "rendered" ? "var(--salvia)" : status === "parcial" ? "var(--ouro)" : "var(--bordeaux)";
                return (
                  <div key={pKey} className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ aspectRatio: post.type === "video" ? "9/16" : "4/5", background: "var(--bg)", borderRadius: 6, overflow: "hidden" }}>
                      {post.type === "video" && mp4 ? (
                        <video src={mp4.url} controls preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover.url} alt={cover.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : null}
                    </div>

                    <div className="row between" style={{ alignItems: "center" }}>
                      <span style={{ color: "var(--terracota)", fontWeight: 500, fontSize: 13 }}>{pKey}</span>
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 999, border: `1px solid ${badgeColor}`, color: badgeColor, textTransform: "uppercase", letterSpacing: ".05em" }}>
                        {status} {got}/{expected}
                      </span>
                    </div>

                    {post.title && (
                      <div style={{ fontSize: 13, lineHeight: 1.3, color: "var(--texto)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.title}
                      </div>
                    )}

                    <div className="mini" style={{ fontSize: 10 }}>
                      D{post.day} · {post.slot === "morning" ? "10h" : "13h"} · {post.categoria}
                    </div>

                    {post.type !== "video" && pngs.length > 1 && (
                      <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 2 }}>
                        {pngs.map((p) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={p.path} src={p.url} alt={p.name} loading="lazy" style={{ width: 32, height: 40, objectFit: "cover", borderRadius: 2, flexShrink: 0, background: "var(--bg)" }} />
                        ))}
                      </div>
                    )}

                    <div className="row tight" style={{ marginTop: "auto" }}>
                      <Link href={`/admin/conteudo?post=${pKey}`} className="btn" style={{ fontSize: 11, flex: 1, textAlign: "center" }}>
                        abrir editor
                      </Link>
                      <button
                        onClick={() => copyUrls(pKey, allUrls)}
                        disabled={allUrls.length === 0}
                        className="btn"
                        style={{ fontSize: 11, flex: 1 }}
                      >
                        {copiedKey === pKey ? "✓ copiado" : `↓ URLs (${allUrls.length})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Chip({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="btn"
      style={{
        background: active ? color : "transparent",
        borderColor: color,
        color: active ? "var(--carvao)" : color,
        fontSize: 11,
        padding: "6px 14px",
      }}
    >
      {label} · {count}
    </button>
  );
}
