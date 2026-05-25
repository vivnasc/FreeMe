"use client";

import { useState, useEffect } from "react";
import { FREEME_BRAND } from "@/lib/admin/brand";

interface ContentItem {
  id: string;
  code: string;
  type: string;
  categoria: string;
  title: string;
  status: string;
  caption: string;
  created_at: string;
  freeme_content_slides: { idx: number; layout: string; body: string }[];
}

export function AdminDashboard() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [type, setType] = useState<"carousel" | "video">("carousel");
  const [categoria, setCategoria] = useState("ferida");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetch("/api/admin/content").then((r) => r.json()).then(setItems);
  }, [result]);

  async function generate() {
    setGenerating(true);
    setResult(null);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, brief, categoria }),
    });
    const data = await res.json();
    setResult(data);
    setGenerating(false);
  }

  async function exportMetricool() {
    const readyIds = items.filter((i) => i.status === "rendered" || i.status === "ready").map((i) => i.id);
    if (readyIds.length === 0) return;

    const res = await fetch("/api/admin/metricool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: readyIds }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freeme-metricool-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-sans text-2xl font-semibold text-terracota">
          FreeMe Admin
        </h1>
        <button
          onClick={exportMetricool}
          className="rounded-full bg-salvia px-5 py-2 text-sm text-creme hover:bg-salvia/80"
        >
          Export Metricool CSV
        </button>
      </div>

      <div className="rounded-2xl bg-carvao border border-creme/10 p-6 mb-8">
        <h2 className="text-lg text-areia mb-4">Gerar conteúdo</h2>

        <div className="flex gap-3 mb-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "carousel" | "video")}
            className="bg-carvao border border-creme/20 rounded-lg px-3 py-2 text-sm text-creme"
          >
            <option value="carousel">Carrossel</option>
            <option value="video">Vídeo kinetic</option>
          </select>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-carvao border border-creme/20 rounded-lg px-3 py-2 text-sm text-creme"
          >
            {FREEME_BRAND.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={3}
          placeholder="Brief: sobre o que? Ex: carrossel sobre a culpa de gritar, tom reconhecimento, 6 slides..."
          className="w-full bg-carvao border border-creme/20 rounded-xl px-4 py-3 text-sm text-creme placeholder:text-creme/30 resize-none mb-4"
        />

        <button
          onClick={generate}
          disabled={generating || !brief.trim()}
          className="rounded-full bg-barro px-6 py-3 text-sm font-medium text-creme hover:bg-barro-symbol disabled:opacity-40"
        >
          {generating ? "A gerar com Claude..." : "Gerar"}
        </button>

        {result && (
          <div className="mt-6 rounded-xl bg-creme/5 p-4">
            <p className="text-sm text-terracota mb-2">{result.code} — {result.title}</p>
            <p className="text-xs text-creme/60 whitespace-pre-line">{result.caption}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg text-areia mb-2">Conteúdo ({items.length})</h2>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-creme/10 px-5 py-3"
          >
            <div>
              <span className="text-xs text-terracota mr-2">{item.code}</span>
              <span className="text-sm text-creme">{item.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.status === "draft" ? "bg-creme/10 text-creme/50"
                : item.status === "rendered" ? "bg-salvia/20 text-salvia"
                : item.status === "published" ? "bg-salvia text-creme"
                : "bg-barro/20 text-barro"
              }`}>
                {item.status}
              </span>
              <span className="text-xs text-creme/30">
                {item.type === "carousel" ? "C" : "V"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
