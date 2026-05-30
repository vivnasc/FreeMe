"use client";
import { useEffect, useState } from "react";

interface Item {
  name: string;
  path: string;
  url: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

type Folder = "mj" | "slides" | "videos" | "audio" | "tests";

export function BibliotecaClient() {
  const [folder, setFolder] = useState<Folder>("mj");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const recursive = folder === "audio" ? "&recursive=true" : "";
    fetch(`/api/admin/biblioteca?prefix=${folder}${recursive}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          setItems([]);
        } else {
          setItems(d.items);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [folder]);

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1500);
  }

  const folders: { key: Folder; label: string; aspectRatio: string }[] = [
    { key: "mj", label: "Imagens MJ (Flux)", aspectRatio: "4/5" },
    { key: "slides", label: "Slides PNG", aspectRatio: "4/5" },
    { key: "videos", label: "Vídeos MP4", aspectRatio: "9/16" },
    { key: "audio", label: "Áudio TTS", aspectRatio: "16/9" },
    { key: "tests", label: "Testes (ping)", aspectRatio: "4/5" },
  ];
  const currentAspect = folders.find((f) => f.key === folder)?.aspectRatio || "4/5";

  return (
    <div>
      <div className="row between" style={{ marginBottom: 24 }}>
        <div>
          <div className="mini" style={{ marginBottom: 4 }}>Biblioteca</div>
          <h1>Assets em freeme-assets</h1>
        </div>
        <span className="muted">{loading ? "..." : `${items.length} ficheiro${items.length === 1 ? "" : "s"}`}</span>
      </div>

      <div className="row tight" style={{ marginBottom: 24 }}>
        {folders.map((f) => (
          <button
            key={f.key}
            onClick={() => setFolder(f.key)}
            className={`btn ${folder === f.key ? "primary" : ""}`}
            style={{ fontSize: 12 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--bordeaux)", marginBottom: 16 }}>
          <p style={{ color: "var(--bordeaux)", fontSize: 13 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <p className="muted">A carregar...</p>
      ) : items.length === 0 ? (
        <p className="muted">Nenhum ficheiro nesta pasta.</p>
      ) : folder === "audio" ? (
        <AudioGrouped items={items} copyUrl={copyUrl} copiedUrl={copiedUrl} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {items.map((item) => {
            const isVideo = item.name.endsWith(".mp4");
            const isAudio = item.name.endsWith(".mp3");
            return (
              <div key={item.path} className="card" style={{ padding: 8 }}>
                {isVideo ? (
                  <video
                    src={item.url}
                    style={{ width: "100%", aspectRatio: currentAspect, objectFit: "cover", borderRadius: 4, background: "var(--bg)" }}
                    controls
                    preload="metadata"
                  />
                ) : isAudio ? (
                  <div style={{ width: "100%", aspectRatio: currentAspect, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", borderRadius: 4 }}>
                    <audio src={item.url} controls style={{ width: "90%" }} />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.name}
                    loading="lazy"
                    style={{
                      width: "100%",
                      aspectRatio: currentAspect,
                      objectFit: "cover",
                      borderRadius: 4,
                      background: "var(--bg)",
                    }}
                  />
                )}
                <div className="mini" style={{ marginTop: 6, fontSize: 10, color: "var(--texto)" }}>
                  {item.name.replace(/\.(jpg|png|mp4|mp3)$/, "")}
                </div>
                <button
                  onClick={() => copyUrl(item.url)}
                  className="btn"
                  style={{ marginTop: 4, fontSize: 10, padding: "2px 6px", width: "100%" }}
                >
                  {copiedUrl === item.url ? "✓ copiado" : "copiar URL"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AudioGrouped({ items, copyUrl, copiedUrl }: { items: Item[]; copyUrl: (url: string) => void; copiedUrl: string | null }) {
  // Agrupa por pasta-pai (ex: "audio/D1-13h/slide-0.mp3" -> "D1-13h").
  // Ordena posts por dia/hora numericos e slides por numero.
  const groups = new Map<string, Item[]>();
  for (const it of items) {
    if (!it.name.endsWith(".mp3")) continue;
    const parts = it.path.split("/");
    const folder = parts.length >= 3 ? parts[parts.length - 2] : "raiz";
    const list = groups.get(folder) || [];
    list.push(it);
    groups.set(folder, list);
  }
  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const ma = /D(\d+)-(\d+)h/.exec(a);
    const mb = /D(\d+)-(\d+)h/.exec(b);
    if (ma && mb) {
      const da = Number(ma[1]) * 100 + Number(ma[2]);
      const db = Number(mb[1]) * 100 + Number(mb[2]);
      return da - db;
    }
    return a.localeCompare(b);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {sortedKeys.map((folder) => {
        const list = (groups.get(folder) || []).sort((a, b) => {
          const ma = /slide-(\d+)/.exec(a.name);
          const mb = /slide-(\d+)/.exec(b.name);
          return (ma ? Number(ma[1]) : 0) - (mb ? Number(mb[1]) : 0);
        });
        return (
          <div key={folder} className="card" style={{ padding: 16 }}>
            <div className="row between" style={{ marginBottom: 12, alignItems: "center" }}>
              <h3 style={{ color: "var(--terracota)", fontSize: 16, fontWeight: 500 }}>{folder}</h3>
              <span className="mini">{list.length} linha{list.length === 1 ? "" : "s"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((item) => {
                const slideMatch = /slide-(\d+)/.exec(item.name);
                const slideNum = slideMatch ? Number(slideMatch[1]) + 1 : null;
                return (
                  <div key={item.path} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(200,122,91,.1)" }}>
                    <span className="mini" style={{ minWidth: 70, color: "var(--texto)" }}>
                      {slideNum !== null ? `Linha ${slideNum}` : item.name}
                    </span>
                    <audio src={item.url} controls preload="none" style={{ flex: 1, height: 32 }} />
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="btn"
                      style={{ fontSize: 10, padding: "2px 6px" }}
                    >
                      {copiedUrl === item.url ? "✓" : "URL"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
