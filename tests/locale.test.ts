import { test } from "node:test";
import assert from "node:assert/strict";
import { getPreferredLocale } from "@/proxy";

// getPreferredLocale so usa request.headers.get("accept-language")
function req(acceptLanguage: string | null) {
  return { headers: { get: () => acceptLanguage } } as unknown as Parameters<
    typeof getPreferredLocale
  >[0];
}

test("pt-PT -> pt", () => {
  assert.equal(getPreferredLocale(req("pt-PT,pt;q=0.9,en;q=0.5")), "pt");
});

test("en-US -> en", () => {
  assert.equal(getPreferredLocale(req("en-US,en;q=0.9")), "en");
});

test("EN com pt em baixa prioridade -> en (regressao do bug antigo)", () => {
  assert.equal(getPreferredLocale(req("en-US,en;q=0.9,pt;q=0.3")), "en");
});

test("q maior ganha mesmo fora de ordem", () => {
  assert.equal(getPreferredLocale(req("pt;q=0.3,en;q=0.8")), "en");
});

test("pt-BR conta como pt", () => {
  assert.equal(getPreferredLocale(req("es,pt-BR;q=0.4")), "pt");
});

test("sem suporte ou vazio -> defaultLocale pt", () => {
  assert.equal(getPreferredLocale(req("fr-FR,fr;q=0.9")), "pt");
  assert.equal(getPreferredLocale(req("")), "pt");
  assert.equal(getPreferredLocale(req(null)), "pt");
});
