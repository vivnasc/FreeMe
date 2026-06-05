import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import {
  sendPurchaseConfirmationToClient,
  sendPurchaseNotificationToAdmin,
} from "@/lib/email/purchase";

const EXPECTED_PRICE = process.env.NEXT_PUBLIC_FREEME_PRICE || "29.00";
const EXPECTED_CURRENCY = process.env.NEXT_PUBLIC_FREEME_CURRENCY || "USD";

export async function POST(request: Request) {
  const { orderID } = await request.json();

  if (!orderID) {
    return NextResponse.json({ error: "orderID required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isPayPalConfigured()) {
    console.error("PayPal nao configurado: falta NEXT_PUBLIC_PAYPAL_CLIENT_ID ou PAYPAL_CLIENT_SECRET");
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
  }

  // Verificar a ordem com o PayPal antes de conceder acesso. Sem isto,
  // qualquer orderID inventado dava acesso vitalicio de graca.
  let capture;
  try {
    capture = await capturePayPalOrder(orderID);
  } catch (e) {
    console.error("PayPal capture error:", e);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 502 });
  }

  if (!capture.ok || capture.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Payment not completed", status: capture.status },
      { status: 402 },
    );
  }

  // Confirmar que pagou o valor e moeda esperados (nao um valor adulterado).
  if (capture.amount !== EXPECTED_PRICE || capture.currency !== EXPECTED_CURRENCY) {
    console.error(
      `PayPal amount mismatch: esperado ${EXPECTED_PRICE} ${EXPECTED_CURRENCY}, recebido ${capture.amount} ${capture.currency} (order ${orderID}, user ${user.id})`,
    );
    return NextResponse.json({ error: "Payment amount mismatch" }, { status: 402 });
  }

  const { data: profile } = await supabase
    .from("freeme_profiles")
    .select("display_name, locale, paid")
    .eq("id", user.id)
    .single();

  // Idempotente: se ja estava paga (ex. duplo clique), nao reenviar emails.
  if (profile?.paid) {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  await supabase
    .from("freeme_profiles")
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      paypal_order_id: orderID,
    })
    .eq("id", user.id);

  const name = profile?.display_name || user.email?.split("@")[0] || "Mae";
  const locale = (profile?.locale || "pt") as "pt" | "en";

  try {
    await sendPurchaseConfirmationToClient(user.email!, name, locale);
    await sendPurchaseNotificationToAdmin(user.email!, name, orderID);
  } catch (e) {
    console.error("Email send failed:", e);
  }

  return NextResponse.json({ ok: true });
}
