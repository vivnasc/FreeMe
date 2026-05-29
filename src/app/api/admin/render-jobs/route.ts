import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";

const WORKFLOW_FILE = "produce-content.yml";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  if (!token || !owner || !repo) {
    return NextResponse.json({ error: "GITHUB_* env vars em falta" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      // Cache 10s para nao saturar API
      next: { revalidate: 10 },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `GitHub API ${res.status}: ${err.slice(0, 200)}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    workflow_runs: Array<{
      id: number;
      name: string;
      display_title: string;
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

  const runs = data.workflow_runs.map((r) => ({
    id: r.id,
    title: r.display_title || r.name,
    status: r.status, // queued, in_progress, completed
    conclusion: r.conclusion, // success, failure, cancelled, null while in progress
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
  return NextResponse.json({ runs, inProgress });
}
