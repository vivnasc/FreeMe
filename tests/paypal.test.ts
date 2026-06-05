import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";

// paypal.ts le o ambiente no momento da chamada, por isso basta defini-lo aqui.
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = "test-client-id";
process.env.PAYPAL_CLIENT_SECRET = "test-secret";
process.env.PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function res(ok: boolean, status: number, body: unknown) {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const TOKEN_URL = "/v1/oauth2/token";

function completedOrder(value = "29.00", currency = "USD") {
  return {
    status: "COMPLETED",
    purchase_units: [
      {
        payments: {
          captures: [{ status: "COMPLETED", amount: { value, currency_code: currency } }],
        },
      },
    ],
  };
}

beforeEach(() => {
  // por defeito o token resolve; cada teste sobrepoe a parte da ordem
  globalThis.fetch = (async (url: string) =>
    String(url).includes(TOKEN_URL)
      ? res(true, 200, { access_token: "abc" })
      : res(true, 200, completedOrder())) as typeof fetch;
});

test("isPayPalConfigured true quando ha id e secret", () => {
  assert.equal(isPayPalConfigured(), true);
});

test("ordem COMPLETED com valor certo -> ok com amount/currency", async () => {
  const r = await capturePayPalOrder("ORDER123");
  assert.equal(r.ok, true);
  assert.equal(r.status, "COMPLETED");
  assert.equal(r.amount, "29.00");
  assert.equal(r.currency, "USD");
});

test("ordem por completar -> ok false", async () => {
  globalThis.fetch = (async (url: string) => {
    if (String(url).includes(TOKEN_URL)) return res(true, 200, { access_token: "abc" });
    return res(true, 200, {
      status: "PENDING",
      purchase_units: [{ payments: { captures: [{ status: "PENDING", amount: { value: "29.00", currency_code: "USD" } }] } }],
    });
  }) as typeof fetch;
  const r = await capturePayPalOrder("ORDER123");
  assert.equal(r.ok, false);
  assert.notEqual(r.status, "COMPLETED");
});

test("ORDER_ALREADY_CAPTURED -> confirma por GET e devolve COMPLETED", async () => {
  let captureCalls = 0;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    const u = String(url);
    if (u.includes(TOKEN_URL)) return res(true, 200, { access_token: "abc" });
    if (u.endsWith("/capture")) {
      captureCalls++;
      return res(false, 422, { details: [{ issue: "ORDER_ALREADY_CAPTURED" }] });
    }
    // GET da ordem (fallback)
    assert.ok(!init || init.method === undefined, "fallback e um GET");
    return res(true, 200, completedOrder());
  }) as typeof fetch;
  const r = await capturePayPalOrder("ORDER123");
  assert.equal(captureCalls, 1);
  assert.equal(r.ok, true);
  assert.equal(r.status, "COMPLETED");
});

test("orderID invalido (capture falha) -> ok false, nao confere acesso", async () => {
  globalThis.fetch = (async (url: string) => {
    if (String(url).includes(TOKEN_URL)) return res(true, 200, { access_token: "abc" });
    return res(false, 404, { name: "RESOURCE_NOT_FOUND" });
  }) as typeof fetch;
  const r = await capturePayPalOrder("inventado");
  assert.equal(r.ok, false);
});

test("falha a obter token -> lanca erro", async () => {
  globalThis.fetch = (async () => res(false, 401, { error: "invalid_client" })) as typeof fetch;
  await assert.rejects(() => capturePayPalOrder("ORDER123"), /PayPal token failed/);
});
