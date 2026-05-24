import { type BlockerName } from "@/lib/types";

export interface DiagnosticOption {
  id: string;
  text: { pt: string; en: string };
  scores: Partial<Record<BlockerName, number>>;
  traumaSignal?: boolean;
}

export interface DiagnosticQuestion {
  id: number;
  text: { pt: string; en: string };
  options: DiagnosticOption[];
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    text: {
      pt: "É noite, finalmente paraste. A tua cabeça vai para onde?",
      en: "It's night, you've finally stopped. Where does your mind go?",
    },
    options: [
      {
        id: "1a",
        text: {
          pt: "Para a lista do que ainda falta fazer, e do que vou ter de aguentar amanhã.",
          en: "To the list of what still needs doing, and what I'll have to endure tomorrow.",
        },
        scores: { peso: 1 },
      },
      {
        id: "1b",
        text: {
          pt: "Para um cansaço tão grande que nem penso, só quero apagar.",
          en: "To an exhaustion so deep I can't even think, I just want to switch off.",
        },
        scores: { vazio: 1 },
      },
      {
        id: "1c",
        text: {
          pt: "Para as coisas que eu podia ter feito melhor com eles.",
          en: "To the things I could have done better with them.",
        },
        scores: { culpa: 1 },
      },
      {
        id: "1d",
        text: {
          pt: "Para o que pode correr mal, o que tenho de prevenir.",
          en: "To what could go wrong, what I need to prevent.",
        },
        scores: { medo: 1 },
      },
      {
        id: "1e",
        text: {
          pt: "A minha cabeça raramente para, mas isto não me consome.",
          en: "My mind rarely stops, but this doesn't consume me.",
        },
        scores: {},
      },
    ],
  },
  {
    id: 2,
    text: {
      pt: "Alguém te oferece ajuda com os teus filhos. O que te acontece por dentro?",
      en: "Someone offers to help with your children. What happens inside you?",
    },
    options: [
      {
        id: "2a",
        text: {
          pt: "Aceito com alívio, preciso mesmo.",
          en: "I accept with relief, I really need it.",
        },
        scores: {},
      },
      {
        id: "2b",
        text: {
          pt: "Digo que não, faço mais depressa sozinha.",
          en: "I say no, I'm faster on my own.",
        },
        scores: { peso: 1 },
      },
      {
        id: "2c",
        text: {
          pt: "Aceito, mas fico a sentir que devia conseguir sozinha.",
          en: "I accept, but I'm left feeling I should manage alone.",
        },
        scores: { vergonha: 1 },
      },
      {
        id: "2d",
        text: {
          pt: "Não confio em deixar com outra pessoa.",
          en: "I don't trust leaving them with anyone else.",
        },
        scores: { medo: 1 },
      },
      {
        id: "2e",
        text: {
          pt: "Nem sei o que é isso, ninguém costuma oferecer.",
          en: "I don't even know what that's like, no one usually offers.",
        },
        scores: { vazio: 1, peso: 1 },
      },
    ],
  },
  {
    id: 3,
    text: {
      pt: "Vês uma mãe que parece estar a fazer tudo bem. O primeiro sentimento?",
      en: "You see a mother who seems to be doing everything right. The first feeling?",
    },
    options: [
      {
        id: "3a",
        text: {
          pt: "Comparo-me e saio a perder.",
          en: "I compare myself and come up short.",
        },
        scores: { vergonha: 1 },
      },
      {
        id: "3b",
        text: {
          pt: "Pergunto-me como é que ela tem ajuda e eu não.",
          en: "I wonder how she gets help and I don't.",
        },
        scores: { peso: 1 },
      },
      {
        id: "3c",
        text: {
          pt: "Fico contente por ela, sigo a minha vida.",
          en: "I'm happy for her, I move on with my life.",
        },
        scores: {},
      },
      {
        id: "3d",
        text: {
          pt: "Penso que se soubessem como sou em casa, não me achavam assim.",
          en: "I think if they knew what I'm like at home, they wouldn't see me that way.",
        },
        scores: { vergonha: 1 },
      },
      {
        id: "3e",
        text: {
          pt: "Sinto-me longe de tudo isso, sem energia sequer para comparar.",
          en: "I feel far from all of that, without even the energy to compare.",
        },
        scores: { vazio: 1 },
      },
    ],
  },
  {
    id: 4,
    text: {
      pt: "Pensas na tua própria infância. O que sentes primeiro?",
      en: "You think about your own childhood. What do you feel first?",
    },
    options: [
      {
        id: "4a",
        text: {
          pt: "Uma falta de coisas que eu precisava e não tive.",
          en: "A lack of things I needed and didn't have.",
        },
        scores: { magoa: 1 },
      },
      {
        id: "4b",
        text: {
          pt: "Raiva de quem devia ter estado e não esteve.",
          en: "Anger at who should have been there and wasn't.",
        },
        scores: { rancor: 1 },
      },
      {
        id: "4c",
        text: {
          pt: "Medo de estar a repetir o que viveram comigo.",
          en: "Fear that I'm repeating what was done to me.",
        },
        scores: { medo: 1, magoa: 1 },
      },
      {
        id: "4d",
        text: {
          pt: "Gratidão, no geral foi boa.",
          en: "Gratitude, overall it was good.",
        },
        scores: {},
      },
      {
        id: "4e",
        text: {
          pt: "Prefiro não ir por aí.",
          en: "I'd rather not go there.",
        },
        scores: { magoa: 1 },
        traumaSignal: true,
      },
    ],
  },
  {
    id: 5,
    text: {
      pt: "Quando o teu filho sofre por algo, o que fazes por dentro?",
      en: "When your child suffers, what do you do inside?",
    },
    options: [
      {
        id: "5a",
        text: {
          pt: "Sinto que é culpa minha, que falhei nalgum lado.",
          en: "I feel it's my fault, that I failed somewhere.",
        },
        scores: { culpa: 1 },
      },
      {
        id: "5b",
        text: {
          pt: "Quero resolver tudo, tirar-lhe a dor toda.",
          en: "I want to fix everything, take all the pain away.",
        },
        scores: { peso: 1, medo: 1 },
      },
      {
        id: "5c",
        text: {
          pt: "Entro em pânico com o que pode vir a acontecer-lhe.",
          en: "I panic about what might happen to them.",
        },
        scores: { medo: 1 },
      },
      {
        id: "5d",
        text: {
          pt: "Acompanho, mas sei que parte do caminho é dele.",
          en: "I accompany them, but I know part of the journey is theirs.",
        },
        scores: {},
      },
      {
        id: "5e",
        text: {
          pt: "Sinto a dor dele como se fosse maior do que aguento.",
          en: "I feel their pain as if it were more than I can bear.",
        },
        scores: { peso: 1 },
        traumaSignal: true,
      },
    ],
  },
  {
    id: 6,
    text: {
      pt: "E tu, dentro de ti, como mulher para além de mãe?",
      en: "And you, within yourself, as a woman beyond being a mother?",
    },
    options: [
      {
        id: "6a",
        text: {
          pt: "Quase desapareci, já não sei bem quem sou sem eles.",
          en: "I've almost disappeared, I no longer know who I am without them.",
        },
        scores: { peso: 1, vazio: 1 },
        traumaSignal: true,
      },
      {
        id: "6b",
        text: {
          pt: "Estou esgotada, não sobra nada para mim.",
          en: "I'm drained, nothing is left for me.",
        },
        scores: { vazio: 1 },
      },
      {
        id: "6c",
        text: {
          pt: "Sinto que não chego, que há algo errado comigo.",
          en: "I feel I'm not enough, that something is wrong with me.",
        },
        scores: { vergonha: 1 },
      },
      {
        id: "6d",
        text: {
          pt: "Continuo a existir, tenho coisas minhas.",
          en: "I still exist, I have things of my own.",
        },
        scores: {},
      },
      {
        id: "6e",
        text: {
          pt: "Carrego uma raiva ou mágoa antiga que não me larga.",
          en: "I carry an old anger or hurt that won't let go of me.",
        },
        scores: { rancor: 1, magoa: 1 },
      },
    ],
  },
  {
    id: 7,
    text: {
      pt: "Se uma coisa pudesse ficar mais leve amanhã, qual escolhias?",
      en: "If one thing could feel lighter tomorrow, which would you choose?",
    },
    options: [
      {
        id: "7a",
        text: {
          pt: "Deixar de carregar tudo sozinha.",
          en: "Stop carrying everything alone.",
        },
        scores: { peso: 1 },
      },
      {
        id: "7b",
        text: {
          pt: "Ter energia e vontade outra vez.",
          en: "Have energy and will again.",
        },
        scores: { vazio: 1 },
      },
      {
        id: "7c",
        text: {
          pt: "Parar de me sentir em falta com eles.",
          en: "Stop feeling I've let them down.",
        },
        scores: { culpa: 1 },
      },
      {
        id: "7d",
        text: {
          pt: "Deixar de viver com medo do que pode acontecer.",
          en: "Stop living in fear of what might happen.",
        },
        scores: { medo: 1 },
      },
      {
        id: "7e",
        text: {
          pt: "Parar de sentir que não sou suficiente.",
          en: "Stop feeling I'm not enough.",
        },
        scores: { vergonha: 1 },
      },
      {
        id: "7f",
        text: {
          pt: "Curar uma ferida antiga, da minha história.",
          en: "Heal an old wound from my story.",
        },
        scores: { magoa: 1 },
      },
      {
        id: "7g",
        text: {
          pt: "Largar uma raiva que me pesa.",
          en: "Let go of an anger that weighs on me.",
        },
        scores: { rancor: 1 },
      },
    ],
  },
];
