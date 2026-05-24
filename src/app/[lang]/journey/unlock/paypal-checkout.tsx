"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const FREEME_PRICE = process.env.NEXT_PUBLIC_FREEME_PRICE || "29.00";
const FREEME_CURRENCY = process.env.NEXT_PUBLIC_FREEME_CURRENCY || "EUR";

export function PayPalCheckout({ lang }: { lang: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="flex flex-col gap-3 items-center">
        <p className="font-serif text-3xl text-barro font-semibold">
          {FREEME_PRICE} {FREEME_CURRENCY}
        </p>
        <p className="font-sans text-sm text-carvao/40">
          {lang === "pt" ? "Pagamento em breve" : "Payment coming soon"}
        </p>
      </div>
    );
  }

  async function onApprove(data: { orderID: string }) {
    setStatus("processing");

    const res = await fetch("/api/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: data.orderID }),
    });

    if (res.ok) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ paid: true })
          .eq("id", user.id);
      }

      setStatus("success");
      router.push(`/${lang}/journey`);
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="font-serif text-lg text-salvia">
        {lang === "pt" ? "Pagamento confirmado. A abrir o percurso..." : "Payment confirmed. Opening your journey..."}
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: FREEME_CURRENCY,
        intent: "capture",
      }}
    >
      <div className="flex flex-col gap-4 items-center">
        <p className="font-serif text-3xl text-barro font-semibold">
          {FREEME_PRICE} {FREEME_CURRENCY}
        </p>

        <div className="w-full">
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "gold",
              shape: "pill",
              label: "pay",
            }}
            createOrder={(_data, actions) => {
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    description: "FreeMe, A Travessia da Mãe",
                    amount: {
                      currency_code: FREEME_CURRENCY,
                      value: FREEME_PRICE,
                    },
                  },
                ],
              });
            }}
            onApprove={async (_data, actions) => {
              const order = await actions.order?.capture();
              if (order) {
                await onApprove({ orderID: order.id! });
              }
            }}
            onError={() => setStatus("error")}
          />
        </div>

        {status === "error" && (
          <p className="font-sans text-sm text-red-700">
            {lang === "pt"
              ? "Erro no pagamento. Tenta novamente."
              : "Payment error. Please try again."}
          </p>
        )}
      </div>
    </PayPalScriptProvider>
  );
}
