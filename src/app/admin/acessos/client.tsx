"use client";

import { useState } from "react";

export function AcessosClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function grant() {
    if (!email.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: `Acesso concedido a ${data.email}. Já pode entrar e fazer o percurso.` });
      } else {
        setMsg({ ok: false, text: data.error || `Erro ${res.status}` });
      }
    } catch (e) {
      setMsg({ ok: false, text: String(e) });
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Conceder acesso</h1>
      <p style={{ color: "#6b5548", marginBottom: 20, lineHeight: 1.6 }}>
        Dá acesso pago a um email sem passar pelo PayPal (testes, ofertas,
        vendas manuais). Confirma também o email. A pessoa tem de se ter
        registado primeiro.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@da.pessoa"
          style={{
            border: "1px solid rgba(140,74,54,0.3)", borderRadius: 12,
            padding: "12px 16px", fontSize: 16, background: "#FBF4EC", color: "#2E241D",
          }}
        />
        <button
          onClick={grant}
          disabled={loading}
          style={{
            background: "#8C4A36", color: "#FBF4EC", border: "none",
            borderRadius: 999, padding: "12px 28px", fontSize: 15, cursor: "pointer",
            opacity: loading ? 0.6 : 1, alignSelf: "flex-start",
          }}
        >
          {loading ? "A conceder..." : "Conceder acesso pago"}
        </button>
      </div>

      {msg && (
        <p
          style={{
            marginTop: 16, padding: 12, borderRadius: 8,
            color: msg.ok ? "#3f5233" : "#b23b2e",
            background: msg.ok ? "#eef2e9" : "#fbeae8",
          }}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
