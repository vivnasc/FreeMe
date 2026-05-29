import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN?.trim();
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  if (!token || !owner || !repo) {
    return NextResponse.json({ error: "GITHUB_* env vars em falta" }, { status: 500 });
  }

  // Lista TODAS as runs do repo e filtra client-side por workflow.
  // Endpoint per-workflow as vezes da 404 se o workflow ainda nao correu nunca.
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 10 },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `GitHub API ${res.status}: ${err.slice(0, 300)}`, owner, repo },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    workflow_runs: Array<{
      id: number;
      name: string;
      display_title: string;
      path: string;
      status: string;
      conclusion: string | null;
      created_at: string;
      run_started_at: string;
      updated_at: string;
      html_url: string;
      event: string;
      actor: { login: string };
    }>;
  };

  // Filtra para o workflow produce-content (e ignora outros)
  const filtered = (data.workflow_runs || []).filter((r) =>
    r.path?.includes("produce-content") || r.name?.toLowerCase().includes("produzir"),
  );

  const runs = filtered.map((r) => ({
    id: r.id,
    title: r.display_title || r.name,
    status: r.status,
    conclusion: r.conclusion,
    createdAt: r.created_at,
    startedAt: r.run_started_at,
    updatedAt: r.updated_at,
    htmlUrl: r.html_url,
    event: r.event,
    actor: r.actor?.login,
    durationSec:
      r.status === "completed"
        ? Math.round((new Date(r.updated_at).getTime() - new Date(r.run_started_at).getTime()) / 1000)
        : null,
  }));

  const inProgress = runs.filter((r) => r.status !== "completed").length;
  const totalRunsInRepo = data.workflow_runs?.length || 0;

  return NextResponse.json({
    runs,
    inProgress,
    totalRunsInRepo,
    note: filtered.length === 0 && totalRunsInRepo > 0
      ? "Repo tem runs mas nenhuma do workflow produce-content. Dispara o render em /admin/slides."
      : undefined,
  });
}
