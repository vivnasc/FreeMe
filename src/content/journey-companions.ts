import { THERAPEUTIC_ORDER, type BlockerName } from "@/lib/types";

// A "presenca da Vivianne" ao longo do percurso. As imagens sao geradas no
// Midjourney com --cref (referencia de personagem da Vivianne), para ser
// mesmo o rosto dela, com POSTURA propria de cada bloqueio (nada generico).
// Depois de geradas, ficam em public/images/journey/<bloqueio>.jpg e aparecem
// no topo da pagina do bloqueio.

// Referencia de personagem da Vivianne (Midjourney character reference).
export const CHARACTER_REF =
  "https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png";

// Parametros comuns. "same woman serene" no inicio reforca a coerencia com a
// cref. Sem --cw, em v7.
export const MJ_PARAMS = "--cref " + CHARACTER_REF + " --ar 3:2 --style raw --v 7";

// Cena + postura especificas de cada bloqueio (clausula de accao): ela encarna
// a superacao daquela emocao, como presenca calma que acompanha.
const SCENES: Record<BlockerName, string> = {
  peso: "gently setting a heavy woven basket down onto a rustic wooden table, shoulders softening, the quiet exhale of relief as a weight is finally released",
  vazio:
    "standing by a sunlit window holding a warm cup with both hands, soft morning light filling a quiet warm room, a feeling of being gently filled and present",
  culpa:
    "resting one open hand softly over her own heart, eyes lowered then lifting with gentle self-forgiveness, tender compassion toward herself",
  medo: "standing calmly in an open doorway facing soft morning light, one foot stepping forward with quiet courage, steady and unafraid",
  vergonha:
    "standing tall in soft warm light, head lifted gently, shoulders open and at ease, dignified self-acceptance with nothing to hide",
  magoa:
    "cradling a small green seedling in her cupped hands, tending it tenderly, the gentle healing of an old wound",
  rancor:
    "opening both hands toward a golden field at sunset, releasing dried leaves to the wind, letting go into freedom and lightness",
};

const STYLE =
  "wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm";

export interface JourneyCompanion {
  blocker: BlockerName;
  mjPrompt: string;
  imagePath: string; // em public/, aparece quando o ficheiro existir
}

export function buildMjPrompt(blocker: BlockerName): string {
  return `same woman serene ${SCENES[blocker]}, ${STYLE} ${MJ_PARAMS}`;
}

export function companionImagePath(blocker: BlockerName): string {
  return `/images/journey/${blocker}.jpg`;
}

export const JOURNEY_COMPANIONS: JourneyCompanion[] = THERAPEUTIC_ORDER.map(
  (blocker) => ({
    blocker,
    mjPrompt: buildMjPrompt(blocker),
    imagePath: companionImagePath(blocker),
  }),
);
