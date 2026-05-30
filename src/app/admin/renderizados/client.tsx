"use client";
import { useEffect, useMemo, useState } from "react";
import { ALL_POSTS } from "@/content/content-calendar";

interface Item {
  name: string;
  path: string;
  url: string;
}

type FilterTipo = "todos" | "carousel" | "video";
type FilterEstado = "todos" | "completo" | "parcial" | "vazio";

export function RenderizadosClient() {
  const [slides, setSlides] = useState<Item[]>([]);
  const [videos, setVideos] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState<FilterTipo>("todos");
  const [estado, setEstado] = useState<FilterEstado>("todos");
  const [semana, setSemana] = useState<"todas" | "1" | "2" | "3" | "4">("todas");

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

  // Agrupa outputs por pKey (D{day}-{slot}). Adaptado do output_urls.pngs do SyncHim.
  const grouped = useMemo(() => {
    return ALL_POSTS.map((post) => {
      const slotPrefix = `D${post.day}-${post.slot}`;
      const pngs = slides
        .filter((s) => s.name.startsWith(`${slotPrefix}-`) && s.name.endsWith(".png"))
        .sort((a, b) => a.name.localeCompare(b.name));
      const mp4 = videos.find((v) => v.name === `${slotPrefix}.mp4`);
      const expected = post.slides.length;
      const got = post.type === "video" ? (mp4 ? 1 : 0) : pngs.length;
      const expectedFinal = post.type === "video" ? 1 : expected;
      const status: "completo" | "parcial" | "vazio" =
        got === 0 ? "vazio" : got >= expectedFinal ? "completo" : "parcial";
      return { post, pngs, mp4, status, got, expected: expectedFinal };
    });
  }, [slides, videos]);

  const filtered = useMemo(() => {
    return grouped.filter((g) => {
      if (tipo !== "todos" && g.post.type !== tipo) return false;
      if (estado !== "todos" && g.status !== estado) return false;
      if (semana !== "todas") {
        const wk = g.post.day <= 7 ? 1 : g.post.day <= 14 ? 2 : g.post.day <= 21 ? 3 : 4;
        if (String(wk) !== semana) return false;
      }
      return true;
    });
  }, [grouped, tipo, estado, semana]);

  const counts = useMemo(() => {
    const c = { completo: 0, parcial: 0, vazio: 0 };
    for (const g of grouped) c[g.status]++;
    return c;
  }, [grouped]);

  return (
    <div>
      <div className="row between" style={{ marginBottom: 24, alignItems: "flex-end" }}>
        <div>
          <div className="mini" style={{ marginBottom: 4 }}>Fase 5</div>
          <h1>Renderizados</h1>
        </div>
        <div className="row tight" style={{ fontSize: 11 }}>
          <span style={{ color: "var(--salvia)" }}>{counts.completo} completos</span>
          <span className="muted">·</span>
          <span style={{ color: "var(--ouro)" }}>{counts.parcial} parciais</span>
          <span className="muted">·</span>
          <span style={{ color: "var(--bordeaux)" }}>{counts.vazio} vazios</span>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div className="row" style={{ gap: 16 }}>
          <label className="col" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="mini">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as FilterTipo)}>
              <option value="todos">Todos</option>
              <option value="carousel">Carrosséis</option>
              <option value="video">Vídeos</option>
            </select>
          </label>
          <label className="col" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="mini">Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value as FilterEstado)}>
              <option value="todos">Todos</option>
              <option value="completo">Completos</option>
              <option value="parcial">Parciais</option>
              <option value="vazio">Vazios</option>
            </select>
          </label>
          <label className="col" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="mini">Semana</span>
            <select value={semana} onChange={(e) => setSemana(e.target.value as typeof semana)}>
              <option value="todas">Todas</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="muted">A carregar Storage...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(({ post, pngs, mp4, status, got, expected }) => {
            const pKey = `D${post.day}-${post.slot === "morning" ? "10h" : "13h"}`;
            const badgeColor = status === "completo" ? "var(--salvia)" : status === "parcial" ? "var(--ouro)" : "var(--bordeaux)";
            return (
              <div key={pKey} className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="row between" style={{ alignItems: "center" }}>
                  <span style={{ color: "var(--terracota)", fontWeight: 500, fontSize: 14 }}>{pKey}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, border: `1px solid ${badgeColor}`, color: badgeColor }}>
                    {status} {got}/{expected}
                  </span>
                </div>
                <div className="mini" style={{ fontSize: 10, lineHeight: 1.3 }}>
                  {post.title?.slice(0, 60) || post.categoria}
                </div>
                {post.type === "video" ? (
                  mp4 ? (
                    <video src={mp4.url} controls preload="metadata" style={{ width: "100%", aspectRatio: "9/16", objectFit: "cover", borderRadius: 4, background: "var(--bg)" }} />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "9/16", background: "var(--bg)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="mini">sem vídeo</span>
                    </div>
                  )
                ) : pngs.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                    {pngs.slice(0, 9).map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p.path} src={p.url} alt={p.name} loading="lazy" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 2, background: "var(--bg)" }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ width: "100%", aspectRatio: "4/5", background: "var(--bg)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="mini">sem slides</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
