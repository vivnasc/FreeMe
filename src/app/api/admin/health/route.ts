import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase } from "@/lib/admin/supabase-admin";

// Saude do backend FreeMe, corre no Vercel (onde a base de dados e alcancavel).
// Faz o que o scripts/verify-freeme.mjs faz, mas via browser: confirma as
// tabelas e testa o registo real (cria utilizador, ve se o trigger criou o
// perfil, e apaga). Read-mostly: o utilizador de teste e removido no fim.

export const maxDuration = 30;

const TABLES = [
  "freeme_profiles",
  "freeme_diagnostics",
  "freeme_journeys",
  "freeme_blocker_progress",
  "freeme_annotations",
];

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  const tables: {
    table: string;
    ok: boolean;
    count: number | null;
    error: string | null;
  }[] = [];
  for (const t of TABLES) {
    const { error, count } = await sb
      .from(t)
      .select("*", { count: "exact", head: true });
    tables.push({
      table: t,
      ok: !error,
      count: count ?? null,
      error: error?.message ?? null,
    });
  }

  // Teste do registo: cria utilizador, confirma o perfil criado pelo trigger,
  // e apaga (cascade remove o perfil).
  const auth: { ok: boolean; profileCreated: boolean; error: string | null } = {
    ok: false,
    profileCreated: false,
    error: null,
  };
  const email = `health+${Date.now()}@freeme-test.local`;
  const { data: created, error: cErr } = await sb.auth.admin.createUser({
    email,
    password: "Teste123!forte",
    email_confirm: true,
    user_metadata: { locale: "pt" },
  });
  if (cErr) {
    auth.error = cErr.message;
  } else {
    auth.ok = true;
    const uid = created.user.id;
    await new Promise((r) => setTimeout(r, 1500));
    const { data: prof } = await sb
      .from("freeme_profiles")
      .select("id")
      .eq("id", uid)
      .maybeSingle();
    auth.profileCreated = !!prof;
    await sb.auth.admin.deleteUser(uid);
  }

  const env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRole: !!process.env.FREEME_SUPABASE_SERVICE_ROLE_KEY,
    paypalClientId: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    paypalSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    resend: !!process.env.RESEND_API_KEY,
  };

  return NextResponse.json({ tables, auth, env });
}
