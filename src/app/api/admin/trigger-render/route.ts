import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";

const WORKFLOW_FILE = "produce-content.yml";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const ref = process.env.GITHUB_DISPATCH_REF || "main";

  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: "GITHUB_DISPATCH_TOKEN / GITHUB_REPO_OWNER / GITHUB_REPO_NAME nao definidas" },
      { status: 500 },
    );
  }

  const { scope } = (await request.json().catch(() => ({}))) as { scope?: string };
  const safeScope = scope || "all";

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ref,
        inputs: { scope: safeScope },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `GitHub API ${res.status}: ${text.slice(0, 300)}` },
      { status: 502 },
    );
  }

  // GitHub dispatch returns 204 No Content. Compose URL for the user to track.
  const runsUrl = `https://github.com/${owner}/${repo}/actions/workflows/${WORKFLOW_FILE}`;
  return NextResponse.json({ ok: true, runsUrl, scope: safeScope });
}
