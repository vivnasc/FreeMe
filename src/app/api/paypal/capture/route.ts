import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendPurchaseConfirmationToClient,
  sendPurchaseNotificationToAdmin,
} from "@/lib/email/purchase";

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

  const { data: profile } = await supabase
    .from("freeme_profiles")
    .select("display_name, locale")
    .eq("id", user.id)
    .single();

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
