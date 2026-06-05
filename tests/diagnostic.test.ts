import { test } from "node:test";
import assert from "node:assert/strict";
import { DIAGNOSTIC_QUESTIONS } from "@/content/diagnostic";
import {
  calculateScores,
  getActiveBlockers,
  getDominantBlocker,
  buildAdaptivePath,
  detectTrauma,
} from "@/lib/path";
import { THERAPEUTIC_ORDER, BLOCKER_DEPENDENCIES, type BlockerName } from "@/lib/types";

test("ha 7 perguntas, todas bilingues e com >=4 opcoes", () => {
  assert.equal(DIAGNOSTIC_QUESTIONS.length, 7);
  for (const q of DIAGNOSTIC_QUESTIONS) {
    assert.ok(q.text.pt && q.text.en, `Q${q.id} bilingue`);
    assert.ok(q.options.length >= 4, `Q${q.id} >=4 opcoes`);
    for (const o of q.options) {
      assert.ok(o.text.pt && o.text.en, `opcao ${o.id} bilingue`);
      for (const v of Object.values(o.scores)) assert.ok((v as number) > 0);
    }
  }
});

test("ids de opcoes sao unicos", () => {
  const ids = DIAGNOSTIC_QUESTIONS.flatMap((q) => q.options.map((o) => o.id));
  assert.equal(new Set(ids).size, ids.length);
});

test("cada bloqueio e alcancavel por alguma opcao", () => {
  const reachable = new Set<string>();
  DIAGNOSTIC_QUESTIONS.forEach((q) =>
    q.options.forEach((o) => Object.keys(o.scores).forEach((k) => reachable.add(k))),
  );
  for (const b of THERAPEUTIC_ORDER) assert.ok(reachable.has(b), `'${b}' alcancavel`);
});

test("o caminho preserva a ordem terapeutica e fecha dependencias", () => {
  // todas as combinacoes nao vazias de bloqueios activos
  const all = THERAPEUTIC_ORDER;
  for (let mask = 1; mask < 1 << all.length; mask++) {
    const active = all.filter((_, i) => mask & (1 << i));
    const path = buildAdaptivePath(active);
    const idx = path.map((b) => THERAPEUTIC_ORDER.indexOf(b));
    for (let i = 1; i < idx.length; i++) {
      assert.ok(idx[i] > idx[i - 1], `ordem preservada em [${active}]`);
    }
    for (const b of path) {
      for (const dep of BLOCKER_DEPENDENCIES[b]) {
        assert.ok(path.includes(dep), `dep '${dep}' de '${b}' incluida em [${active}]`);
      }
    }
  }
});

test("so 'rancor' puxa a cadeia inteira menos o medo", () => {
  assert.deepEqual(buildAdaptivePath(["rancor"]), [
    "peso",
    "vazio",
    "culpa",
    "vergonha",
    "magoa",
    "rancor",
  ]);
});

test("so 'peso' fica so peso; so 'medo' puxa peso,vazio,culpa,medo", () => {
  assert.deepEqual(buildAdaptivePath(["peso"]), ["peso"]);
  assert.deepEqual(buildAdaptivePath(["medo"]), ["peso", "vazio", "culpa", "medo"]);
});

test("buildAdaptivePath([]) === []", () => {
  assert.deepEqual(buildAdaptivePath([]), []);
});

// Helper: responder por ids de opcao
function persona(ids: string[]) {
  const sel = ids.map((id) => {
    const o = DIAGNOSTIC_QUESTIONS.flatMap((q) => q.options).find((o) => o.id === id);
    if (!o) throw new Error("id desconhecido: " + id);
    return o;
  });
  const totals = calculateScores(sel);
  const active = getActiveBlockers(totals);
  return { totals, active, dominant: getDominantBlocker(totals), trauma: detectTrauma(sel) };
}

test("persona 'peso' -> dominante peso, sem trauma", () => {
  const p = persona(["1a", "2b", "3b", "5b", "6b", "7a"]);
  assert.equal(p.dominant, "peso");
  assert.equal(p.trauma, false);
});

test("persona neutra -> sem bloqueios activos", () => {
  const p = persona(["1e", "2a", "3c", "4d", "5d", "6d"]);
  assert.equal(p.active.length, 0);
  assert.equal(p.dominant, null);
});

test("sinais de trauma sao exactamente 4e, 5e, 6a", () => {
  const got = DIAGNOSTIC_QUESTIONS.flatMap((q) => q.options)
    .filter((o) => o.traumaSignal)
    .map((o) => o.id)
    .sort();
  assert.deepEqual(got, ["4e", "5e", "6a"]);
  assert.equal(persona(["1c", "4e"]).trauma, true);
});

test("getDominantBlocker desempata pela ordem terapeutica", () => {
  // peso e culpa empatados a 1 -> peso (vem primeiro na ordem)
  const totals = calculateScores([{ scores: { culpa: 1 } }, { scores: { peso: 1 } }]);
  assert.equal(getDominantBlocker(totals as Record<BlockerName, number>), "peso");
});
