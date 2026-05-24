import {
  type BlockerName,
  THERAPEUTIC_ORDER,
  BLOCKER_DEPENDENCIES,
} from "./types";

export function buildAdaptivePath(
  activeBlockers: BlockerName[],
): BlockerName[] {
  const needed = new Set<BlockerName>(activeBlockers);

  for (const blocker of activeBlockers) {
    addDependencies(blocker, needed);
  }

  return THERAPEUTIC_ORDER.filter((b) => needed.has(b));
}

function addDependencies(blocker: BlockerName, set: Set<BlockerName>) {
  for (const dep of BLOCKER_DEPENDENCIES[blocker]) {
    set.add(dep);
    addDependencies(dep, set);
  }
}

export function calculateScores(
  responses: { scores: Partial<Record<BlockerName, number>> }[],
): Record<BlockerName, number> {
  const totals: Record<BlockerName, number> = {
    peso: 0,
    vazio: 0,
    culpa: 0,
    medo: 0,
    vergonha: 0,
    magoa: 0,
    rancor: 0,
  };

  for (const r of responses) {
    for (const [blocker, score] of Object.entries(r.scores)) {
      totals[blocker as BlockerName] += score ?? 0;
    }
  }

  return totals;
}

export function getActiveBlockers(
  totals: Record<BlockerName, number>,
): BlockerName[] {
  return THERAPEUTIC_ORDER.filter((b) => totals[b] > 0);
}

export function getDominantBlocker(
  totals: Record<BlockerName, number>,
): BlockerName | null {
  let max = 0;
  let dominant: BlockerName | null = null;

  for (const b of THERAPEUTIC_ORDER) {
    if (totals[b] > max) {
      max = totals[b];
      dominant = b;
    }
  }

  return dominant;
}

export function detectTrauma(
  selectedOptions: { traumaSignal?: boolean }[],
): boolean {
  return selectedOptions.some((o) => o.traumaSignal);
}

export const BLOCKER_LABELS: Record<BlockerName, { pt: string; en: string }> = {
  peso: { pt: "O peso", en: "The weight" },
  vazio: { pt: "O vazio", en: "The void" },
  culpa: { pt: "A culpa", en: "The guilt" },
  medo: { pt: "O medo", en: "The fear" },
  vergonha: { pt: "A vergonha", en: "The shame" },
  magoa: { pt: "A mágoa", en: "The hurt" },
  rancor: { pt: "O rancor", en: "The resentment" },
};

export const BLOCKER_TENDER_MESSAGES: Record<
  BlockerName,
  { pt: string; en: string }
> = {
  peso: {
    pt: "Carregas muito, e viemos começar por aqui, por aliviar o que podes pousar.",
    en: "You carry so much, and we'll start here, by lightening what you can set down.",
  },
  vazio: {
    pt: "A tua energia precisou de descanso, e merece voltar a ti.",
    en: "Your energy needed rest, and it deserves to return to you.",
  },
  culpa: {
    pt: "A culpa que carregas não é tua toda, e vamos ver isso juntas.",
    en: "The guilt you carry isn't all yours, and we'll look at that together.",
  },
  medo: {
    pt: "O medo que te aperta vem de longe, e vamos localizá-lo no tempo.",
    en: "The fear that grips you comes from far away, and we'll place it in time.",
  },
  vergonha: {
    pt: "O que escondes pesa o dobro. Vamos incluir o que andavas a esconder.",
    en: "What you hide weighs double. We'll include what you've been hiding.",
  },
  magoa: {
    pt: "A ferida de filha merece ser vista, com cuidado e sem pressa.",
    en: "The daughter wound deserves to be seen, with care and without rush.",
  },
  rancor: {
    pt: "A raiva que ficou protege uma dor que já podes olhar.",
    en: "The anger that stayed protects a pain you can now face.",
  },
};
