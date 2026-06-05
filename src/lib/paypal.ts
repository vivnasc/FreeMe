// Cliente minimo da API REST do PayPal para captura e verificacao de ordens.
// Usa client_id (publico) + client_secret (server-only) para obter um token
// e capturar a ordem no servidor, em vez de confiar no browser.

const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

export function isPayPalConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`PayPal token failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export interface CaptureResult {
  ok: boolean;
  status?: string;
  amount?: string;
  currency?: string;
  raw?: unknown;
}

// Captura a ordem no servidor. Idempotente do lado do PayPal: se a ordem ja
// foi capturada devolve o estado COMPLETED em vez de duplicar a cobranca.
export async function capturePayPalOrder(orderID: string): Promise<CaptureResult> {
  const token = await getAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await res.json().catch(() => null);

  // ORDER_ALREADY_CAPTURED: a ordem ja estava capturada. Confirmamos por GET.
  if (!res.ok) {
    const issue = data?.details?.[0]?.issue;
    if (issue === "ORDER_ALREADY_CAPTURED") {
      return await getPayPalOrder(orderID, token);
    }
    return { ok: false, raw: data ?? (await res.text().catch(() => null)) };
  }

  const unit = data?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const amount = capture?.amount?.value ?? unit?.amount?.value;
  const currency = capture?.amount?.currency_code ?? unit?.amount?.currency_code;
  const status = capture?.status ?? data?.status;

  return {
    ok: status === "COMPLETED",
    status,
    amount,
    currency,
    raw: data,
  };
}

async function getPayPalOrder(orderID: string, token: string): Promise<CaptureResult> {
  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, raw: data };

  const unit = data?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const status = capture?.status ?? data?.status;
  return {
    ok: status === "COMPLETED",
    status,
    amount: capture?.amount?.value ?? unit?.amount?.value,
    currency: capture?.amount?.currency_code ?? unit?.amount?.currency_code,
    raw: data,
  };
}
