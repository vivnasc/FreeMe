import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminSupabase } from "@/lib/admin/supabase-admin";

// Concede acesso pago a um email, sem passar pelo PayPal. Util para testes,
// ofertas, e vendas manuais (MB Way, transferencia). Tambem confirma o email,
// para a pessoa poder entrar mesmo que a confirmacao por email esteja ligada.

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = (await request.json()) as { email?: string };
  if (!email?.trim()) {
    return NextResponse.json({ error: "email necessario" }, { status: 400 });
  }
  const target = email.trim().toLowerCase();

  const sb = getAdminSupabase();

  const { data: list, error: listErr } = await sb.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  const user = list.users.find((u) => (u.email ?? "").toLowerCase() === target);
  if (!user) {
    return NextResponse.json(
      { error: "Não há conta com esse email. A pessoa tem de se registar primeiro." },
      { status: 404 },
    );
  }

  // Confirmar o email se ainda nao estiver confirmado.
  let confirmed = !!user.email_confirmed_at;
  if (!confirmed) {
    const { error: confErr } = await sb.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (confErr) {
      return NextResponse.json({ error: `Confirmar email: ${confErr.message}` }, { status: 500 });
    }
    confirmed = true;
  }

  const { error: upErr } = await sb
    .from("freeme_profiles")
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      paypal_order_id: "manual-admin",
    })
    .eq("id", user.id);
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email: user.email, confirmed });
}
