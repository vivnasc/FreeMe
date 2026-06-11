"use client";

import { useState } from "react";

interface Health {
  tables: { table: string; ok: boolean; count: number | null; error: string | null }[];
  auth: { ok: boolean; profileCreated: boolean; error: string | null };
  env: Record<string, boolean>;
}

const ENV_LABELS: Record<string, string> = {
  supabaseUrl: "Supabase URL",
  serviceRole: "Supabase service role",
  paypalClientId: "PayPal Client ID",
  paypalSecret: "PayPal Secret (preciso para cobrar)",
  resend: "Resend (emails de compra)",
};

function Dot({ ok }: { ok: boolean }) {
  return (
    <span style={{ color: ok ? "#7D8A6A" : "#b23b2e", fontWeight: 700 }}>
      {ok ? "OK" : "FALHA"}
    </span>
  );
}

export function SaudeClient() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const res = await fetch("/api/admin/health");
      if (!res.ok) {
        setErr(`Erro ${res.status}: ${(await res.text()).slice(0, 200)}`);
      } else {
        setData((await res.json()) as Health);
      }
    } catch (e) {
      setErr(String(e));
    }
    setLoading(false);
  }

  const registoOk = data?.auth.ok && data?.auth.profileCreated;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Saúde do FreeMe</h1>
      <p style={{ color: "#6b5548", marginBottom: 20, lineHeight: 1.6 }}>
        Confirma se a base de dados e o registo estão sãos. Cria um utilizador
        de teste e apaga-o no fim.
      </p>

      <button
        onClick={run}
        disabled={loading}
        style={{
          background: "#8C4A36", color: "#FBF4EC", border: "none",
          borderRadius: 999, padding: "12px 28px", fontSize: 15, cursor: "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "A verificar..." : "Verificar agora"}
      </button>

      {err && (
        <p style={{ marginTop: 16, color: "#b23b2e", background: "#fbeae8", padding: 12, borderRadius: 8 }}>
          {err}
        </p>
      )}

      {data && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>
              Registo (a parte que falhou no teu teste) — <Dot ok={!!registoOk} />
            </h2>
            <ul style={{ lineHeight: 1.8, color: "#3d2b1f" }}>
              <li>Criar utilizador: <Dot ok={data.auth.ok} /></li>
              <li>Trigger criou o perfil: <Dot ok={data.auth.profileCreated} /></li>
              {data.auth.error && (
                <li style={{ color: "#b23b2e" }}>Erro: {data.auth.error}</li>
              )}
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Tabelas</h2>
            <ul style={{ lineHeight: 1.8, color: "#3d2b1f" }}>
              {data.tables.map((t) => (
                <li key={t.table}>
                  {t.table}: <Dot ok={t.ok} />
                  {t.ok ? ` (${t.count} linhas)` : t.error ? ` — ${t.error}` : ""}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Configuração (env)</h2>
            <ul style={{ lineHeight: 1.8, color: "#3d2b1f" }}>
              {Object.entries(data.env).map(([k, v]) => (
                <li key={k}>
                  {ENV_LABELS[k] ?? k}: <Dot ok={v} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
