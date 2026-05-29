"use client";
import { useEffect, useState } from "react";

interface Run {
  id: number;
  title: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  startedAt: string;
  updatedAt: string;
  htmlUrl: string;
  event: string;
  actor?: string;
  durationSec: number | null;
}

function statusPill(run: Run): { label: string; cls: string } {
  if (run.status === "queued") return { label: "Queued", cls: "pending" };
  if (run.status === "in_progress") return { label: "Running", cls: "partial" };
  if (run.conclusion === "success") return { label: "Done", cls: "ok" };
  if (run.conclusion === "failure") return { label: "Failed", cls: "failed" };
  if (run.conclusion === "cancelled") return { label: "Cancelled", cls: "pending" };
  return { label: run.status, cls: "pending" };
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function duration(sec: number | null): string {
  if (sec == null) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m${s ? ` ${s}s` : ""}`;
}

export function RenderJobsClient() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [inProgress, setInProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  async function fetchRuns() {
    try {
      const res = await fetch("/api/admin/render-jobs");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRuns(data.runs);
        setInProgress(data.inProgress);
        setError(null);
        setLastFetched(new Date());
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRuns();
  }, []);

  // Auto-polling 6s se há jobs in progress
  useEffect(() => {
    if (inProgress === 0) return;
    const id = setInterval(fetchRuns, 6000);
    return () => clearInterval(id);
  }, [inProgress]);

  return (
    <div>
      <div className="row between" style={{ marginBottom: 24 }}>
        <div>
          <div className="mini" style={{ marginBottom: 4 }}>Render Jobs</div>
          <h1>GitHub Actions · produce-content.yml</h1>
        </div>
        <div className="row tight">
          {inProgress > 0 && (
            <span className="pill partial">{inProgress} a correr · auto-refresh 6s</span>
          )}
          <button onClick={fetchRuns} className="btn" style={{ fontSize: 12 }}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--bordeaux)", marginBottom: 16 }}>
          <p style={{ color: "var(--bordeaux)", fontSize: 13 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <p className="muted">A carregar...</p>
      ) : runs.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ fontSize: 13 }}>
            Nenhum render dispatchado ainda. Vai à <a href="/admin/slides" style={{ color: "var(--terracota)" }}>Fase 3 · Slides</a> e dispara o primeiro.
          </p>
        </div>
      ) : (
        <table className="t">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Estado</th>
              <th>Título</th>
              <th style={{ width: 90 }}>Trigger</th>
              <th style={{ width: 90 }}>Iniciado</th>
              <th style={{ width: 90 }}>Duração</th>
              <th style={{ width: 70 }}>GH</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const sp = statusPill(run);
              return (
                <tr key={run.id}>
                  <td><span className={`pill ${sp.cls}`}>{sp.label}</span></td>
                  <td style={{ color: "var(--texto)" }}>{run.title}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{run.event}</td>
                  <td className="muted" style={{ fontSize: 12 }}>há {timeAgo(run.startedAt)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{duration(run.durationSec)}</td>
                  <td>
                    <a href={run.htmlUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 11, padding: "2px 8px" }}>
                      abrir →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {lastFetched && (
        <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>
          Última actualização: {lastFetched.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
