import { type BlockerName } from "@/lib/types";

export interface ContentPost {
  day: number;
  type: "carousel" | "video";
  categoria: string;
  title: string;
  slides: { layout: string; body: string }[];
  caption: string;
  hashtags: string;
  platforms: string[];
}

export const CONTENT_30_DAYS: ContentPost[] = [
  // === SEMANA 1: IDENTIFICAÇÃO (a mãe sente-se vista) ===

  {
    day: 1,
    type: "carousel",
    categoria: "ferida",
    title: "Gritaste",
    slides: [
      { layout: "capa", body: "Gritaste.\nE depois ficaste a olhar para ele a dormir, a pedir desculpa em silêncio." },
      { layout: "conteudo", body: "Ninguém te viu. Ninguém te perguntou como estavas." },
      { layout: "conteudo", body: "Achaste que eras a única. Que as outras mães aguentam melhor." },
      { layout: "conteudo", body: "Mas a verdade é que aguentas tanto que já nem sabes o que é descanso." },
      { layout: "citacao", body: "Isso não é falhar. É carregar peso a mais." },
      { layout: "cta", body: "Descobre qual é o teu bloqueio.\nDiagnóstico grátis." },
    ],
    caption: "Ela aguenta. Sempre aguentou. Mas a que preço?\n\nO FreeMe é uma app de percurso terapêutico para mães. Começa com um diagnóstico grátis que te mostra qual dos 7 bloqueios emocionais mais te prende.\n\nLink na bio.",
    hashtags: "#FreeMe #MãeSemCulpa #CulpaMaterna #Maternidade #MãeReal #ConstelacaoFamiliar #ATravessiaDaMãe",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 2,
    type: "video",
    categoria: "espelho",
    title: "Uma boa mãe",
    slides: [
      { layout: "kinetic-line", body: "Uma boa mãe não grita." },
      { layout: "kinetic-line", body: "Uma boa mãe não se cansa." },
      { layout: "kinetic-line", body: "Uma boa mãe aguenta tudo." },
      { layout: "kinetic-line", body: "Uma boa mãe não existe." },
      { layout: "kinetic-line", body: "Existem mães reais.\nE tu és uma delas." },
      { layout: "kinetic-line", body: "FreeMe\nA Travessia da Mãe" },
    ],
    caption: "A mãe perfeita é a maior mentira que te contaram.\n\nE é ela que te faz sentir que falhas todos os dias.\n\n#FreeMe",
    hashtags: "#MãeReal #MãeSemCulpa #MaternidadeReal #FreeMe #ATravessiaDaMãe #CulpaMaterna",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 3,
    type: "carousel",
    categoria: "ferida",
    title: "Ninguém te pergunta",
    slides: [
      { layout: "capa", body: "\"Como estás?\"\nNinguém te pergunta.\nE quando perguntam, tu dizes \"bem\"." },
      { layout: "conteudo", body: "Porque a mãe não se pode queixar." },
      { layout: "conteudo", body: "A mãe resolve. A mãe cuida. A mãe sorri." },
      { layout: "conteudo", body: "E por dentro, a mãe desaparece." },
      { layout: "citacao", body: "O vazio não é falta de amor. É interrupção do fluxo. Dás muito, recebes pouco, e a conta não fecha." },
      { layout: "cta", body: "O FreeMe mostra-te o que sentes.\nSem te julgar." },
    ],
    caption: "Tu cuidas de todos. E quem cuida de ti?\n\nSe a resposta é \"ninguém\", o vazio não é um mistério. É matemática.\n\nDiagnóstico grátis na bio.",
    hashtags: "#FreeMe #MãeEsgotada #Vazio #MaternidadeReal #CulpaMaterna #Autoconhecimento",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 4,
    type: "video",
    categoria: "ferida",
    title: "O que carregas",
    slides: [
      { layout: "kinetic-line", body: "O teu filho." },
      { layout: "kinetic-line", body: "Os problemas do pai dele." },
      { layout: "kinetic-line", body: "A tristeza dos teus pais." },
      { layout: "kinetic-line", body: "Os conflitos da família toda." },
      { layout: "kinetic-line", body: "As dores de quem veio antes de ti." },
      { layout: "kinetic-line", body: "Tudo. Nos teus ombros." },
      { layout: "kinetic-line", body: "E se largasses o que não é teu?" },
    ],
    caption: "Repara no que sustentas. O teu filho, claro. Mas só o teu filho?\n\nTu tornaste-te a que aguenta tudo. E o peso disso não é só cansaço.\n\n#FreeMe",
    hashtags: "#FreeMe #OPeso #MãeSemCulpa #ConstelacaoFamiliar #Maternidade #ATravessiaDaMãe",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 5,
    type: "carousel",
    categoria: "espelho",
    title: "Antes de seres mãe",
    slides: [
      { layout: "capa", body: "Antes de seres mãe, eras uma mulher.\nLembras-te dela?" },
      { layout: "conteudo", body: "Tinha vontades. Tinha um nome que não era só \"mãe\"." },
      { layout: "conteudo", body: "Tinha tempo. Tinha energia para si." },
      { layout: "conteudo", body: "Não desapareceu. Ficou debaixo de tudo o que carregas." },
      { layout: "citacao", body: "Também pertenço à minha vida. Também sou alguém que precisa de ser cuidada." },
      { layout: "assinatura", body: "Vivianne dos Santos" },
    ],
    caption: "Tu não desapareceste. Ficaste debaixo de tudo o que carregas.\n\nO FreeMe ajuda-te a voltar a ti. Sem deixares de ser mãe.\n\nLink na bio.",
    hashtags: "#FreeMe #VoltarAMim #MãeEMulher #Autoconhecimento #MaternidadeReal #ATravessiaDaMãe",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 6,
    type: "video",
    categoria: "espelho",
    title: "Dizes sim",
    slides: [
      { layout: "kinetic-line", body: "Dizes sim quando queres dizer não." },
      { layout: "kinetic-line", body: "Resolves tudo sozinha porque ninguém faz como tu." },
      { layout: "kinetic-line", body: "Pedes desculpa por existir." },
      { layout: "kinetic-line", body: "Compensas o que achas que falhaste." },
      { layout: "kinetic-line", body: "Isto não é amor.\nÉ culpa a comandar." },
      { layout: "kinetic-line", body: "A culpa não é boa conselheira." },
    ],
    caption: "Quem se sente em dívida cede para compensar, não põe limites, pede desculpa por existir.\n\nE aos poucos, abandona o seu lugar.\n\n#FreeMe",
    hashtags: "#FreeMe #CulpaMaterna #MãeSemCulpa #Limites #MaternidadeReal #ConstelacaoFamiliar",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 7,
    type: "carousel",
    categoria: "cta",
    title: "7 perguntas",
    slides: [
      { layout: "capa", body: "7 perguntas.\n2 minutos.\nO teu mapa." },
      { layout: "conteudo", body: "O diagnóstico do FreeMe mostra-te qual dos 7 bloqueios emocionais mais te prende agora." },
      { layout: "conteudo", body: "Não te julga. Não te rotula. Mostra-te o que sentes, com ternura." },
      { layout: "cta", body: "Grátis. Sem compromisso.\nSó para veres.\n\nfreeme.viviannedossantos.com" },
    ],
    caption: "Não é um quiz. É um espelho.\n\n7 situações do dia a dia de qualquer mãe. Tu escolhes a que mais se parece contigo. E o FreeMe mostra-te o que pesa mais.\n\nGrátis. Link na bio.",
    hashtags: "#FreeMe #DiagnósticoGrátis #7Bloqueios #Maternidade #MãeSemCulpa #ATravessiaDaMãe",
    platforms: ["ig", "tiktok"],
  },

  // === SEMANA 2: EDUCAÇÃO (os 7 bloqueios) ===

  {
    day: 8,
    type: "carousel",
    categoria: "bloqueio",
    title: "O peso",
    slides: [
      { layout: "capa", body: "O peso.\nO que carregas que não é teu." },
      { layout: "conteudo", body: "Tu aprendeste que amar é carregar. Que uma boa mãe aguenta tudo." },
      { layout: "conteudo", body: "Mas há uma diferença que muda tudo: uma coisa é o que é teu para carregar. Outra é o que pegaste ao colo e nunca foi teu." },
      { layout: "conteudo", body: "O destino do teu marido é dele. Os teus pais, o deles. O teu filho, o dele." },
      { layout: "citacao", body: "Ficas mais leve não porque deixaste de amar. Ficas mais leve porque pousaste o que nunca foi teu." },
      { layout: "cta", body: "O peso é o 1.º dos 7 bloqueios.\nDescobre o teu." },
    ],
    caption: "Tu podes honrar o sacrifício das mulheres da tua família sem o repetir.\n\nNão tens de sofrer como elas sofreram para lhes pertencer. Esse preço não é amor, é peso.\n\n#FreeMe",
    hashtags: "#FreeMe #OPeso #7Bloqueios #ConstelacaoFamiliar #MãeSemCulpa #Maternidade",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 9,
    type: "video",
    categoria: "bloqueio",
    title: "O vazio",
    slides: [
      { layout: "kinetic-line", body: "Deste. E deste. E deste." },
      { layout: "kinetic-line", body: "E a certa altura, deixou de haver de onde tirar." },
      { layout: "kinetic-line", body: "Não é que não ames." },
      { layout: "kinetic-line", body: "Amas." },
      { layout: "kinetic-line", body: "Mas o amor precisa de combustível.\nE o teu acabou." },
      { layout: "kinetic-line", body: "Uma mãe que só dá e não recebe é uma fonte que ninguém reabastece." },
      { layout: "kinetic-line", body: "Permito-me receber." },
    ],
    caption: "O vazio não é falta de amor. É interrupção do fluxo.\n\nDás muito, recebes pouco, e a conta não fecha.\n\nO caminho não é dar mais. É o contrário.\n\n#FreeMe",
    hashtags: "#FreeMe #OVazio #MãeEsgotada #Burnout #MaternidadeReal #7Bloqueios",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 10,
    type: "carousel",
    categoria: "bloqueio",
    title: "A culpa",
    slides: [
      { layout: "capa", body: "A culpa.\nUma forma de amor que se enganou no caminho." },
      { layout: "conteudo", body: "Quando te culpas, há uma parte de ti que acredita que se sofreres o suficiente, talvez consigas reparar o que aconteceu." },
      { layout: "conteudo", body: "A culpa parece um castigo, mas muitas vezes é um laço. Uma forma de dizer: eu não te largo, eu sofro contigo." },
      { layout: "conteudo", body: "É bonito. E é pesado. E não ajuda nenhum dos dois." },
      { layout: "citacao", body: "Só com as mãos livres do que não era teu é que podes mesmo ser mãe." },
      { layout: "cta", body: "A culpa é o 3.º bloqueio.\nDescobre qual é o teu." },
    ],
    caption: "A culpa não te torna melhor mãe. Torna-te uma mãe que não educa.\n\nQuem se sente em dívida cede para compensar, não põe limites.\n\nDiagnóstico grátis na bio.\n\n#FreeMe",
    hashtags: "#FreeMe #ACulpa #CulpaMaterna #7Bloqueios #ConstelacaoFamiliar #MãeSemCulpa",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 11,
    type: "video",
    categoria: "bloqueio",
    title: "O medo",
    slides: [
      { layout: "kinetic-line", body: "Vigias. Antecipas. Imaginas o pior." },
      { layout: "kinetic-line", body: "Controlas o que não se controla." },
      { layout: "kinetic-line", body: "E o medo tira-te o sono sem proteger ninguém." },
      { layout: "kinetic-line", body: "Muitas vezes, ele não nasce do teu filho de agora." },
      { layout: "kinetic-line", body: "Nasce de uma história mais antiga." },
      { layout: "kinetic-line", body: "O medo viaja nas famílias.\nPassa de mãe para filha sem pedir licença." },
    ],
    caption: "Há um medo de mãe que é natural. E há outro, o que aperta demais.\n\nEsse medo, muitas vezes, não nasce do teu filho de hoje. Nasce de uma história anterior.\n\n#FreeMe",
    hashtags: "#FreeMe #OMedo #AnsiedadeMaterna #7Bloqueios #ConstelacaoFamiliar #MaternidadeReal",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 12,
    type: "carousel",
    categoria: "bloqueio",
    title: "A vergonha",
    slides: [
      { layout: "capa", body: "A vergonha.\nFaz-te esconder exactamente aquilo que mais precisavas de mostrar." },
      { layout: "conteudo", body: "A culpa diz \"fiz algo errado\". A vergonha diz algo pior: \"há algo errado em mim\"." },
      { layout: "conteudo", body: "Por isso escondes. Sorris para fora. E por dentro pensas que és a pior mãe do mundo." },
      { layout: "conteudo", body: "Construíste uma imagem de mãe perfeita. E tudo o que não cabe nessa imagem, empurraste para a sombra." },
      { layout: "citacao", body: "O que escondemos pesa o dobro. O que incluímos, podemos finalmente pousar." },
      { layout: "cta", body: "Posso pertencer exactamente como sou." },
    ],
    caption: "A vergonha vive de te medires contra outras mães. As reais, as das redes, as imaginadas.\n\nMas o modelo é impossível. E tu não estás a falhar. O modelo é que é mentira.\n\n#FreeMe",
    hashtags: "#FreeMe #AVergonha #MãeImperfeita #7Bloqueios #Autoconhecimento #MaternidadeReal",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 13,
    type: "video",
    categoria: "bloqueio",
    title: "A mágoa",
    slides: [
      { layout: "kinetic-line", body: "Antes de seres mãe, foste filha." },
      { layout: "kinetic-line", body: "E talvez aí, no princípio de tudo, algo te tenha faltado." },
      { layout: "kinetic-line", body: "Presença. Colo. Proteção." },
      { layout: "kinetic-line", body: "Ser vista. Ser escolhida." },
      { layout: "kinetic-line", body: "A mágoa tem o olhar voltado para trás.\nUma parte de ti ficou ali, à espera." },
      { layout: "kinetic-line", body: "Parar de esperar o que não virá.\nPara poderes viver com o que tens." },
    ],
    caption: "A mágoa esconde muitas vezes um luto que nunca se chorou. O luto da mãe que precisavas e não tiveste.\n\nTens direito a esse luto.\n\n#FreeMe",
    hashtags: "#FreeMe #AMágoa #FeridaDeFilha #7Bloqueios #ConstelacaoFamiliar #CuraInterior",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 14,
    type: "carousel",
    categoria: "bloqueio",
    title: "O rancor",
    slides: [
      { layout: "capa", body: "O rancor.\nA casca dura que se forma por cima da ferida." },
      { layout: "conteudo", body: "Por baixo de toda a raiva, há quase sempre uma dor que ninguém viu." },
      { layout: "conteudo", body: "Enquanto estás zangada, não tens de tocar na parte que dói mesmo." },
      { layout: "conteudo", body: "O rancor não é um defeito de caráter. É uma ferida que ainda não foi reconhecida." },
      { layout: "citacao", body: "Isto aconteceu, teve um preço, e agora volto-me para a minha vida." },
      { layout: "assinatura", body: "Vivianne dos Santos" },
    ],
    caption: "Toda a força que andava investida em corrigir o passado, em remoer, em esperar um pedido de desculpas que talvez nunca venha, essa força pode voltar para a tua vida.\n\n#FreeMe",
    hashtags: "#FreeMe #ORancor #Raiva #7Bloqueios #ConstelacaoFamiliar #LargarORancor",
    platforms: ["ig", "tiktok"],
  },

  // === SEMANA 3: TRANSFORMAÇÃO + AUTORIDADE ===

  {
    day: 15,
    type: "video",
    categoria: "voz",
    title: "Honrar sem repetir",
    slides: [
      { layout: "kinetic-line", body: "Uma voz que passou de mulher para mulher na tua família:" },
      { layout: "kinetic-line", body: "Uma boa mulher sacrifica-se." },
      { layout: "kinetic-line", body: "Uma boa mãe aguenta tudo." },
      { layout: "kinetic-line", body: "Primeiro os outros, eu por último." },
      { layout: "kinetic-line", body: "Tu podes honrar o sacrifício delas\nsem o repetir." },
      { layout: "kinetic-line", body: "Honro o vosso caminho.\nNão preciso de o repetir.\nEscolho viver a minha própria vida." },
    ],
    caption: "Carregar como elas carregaram tornou-se uma forma de lhes pertencer.\n\nMas não tens de sofrer como elas sofreram para continuares a ser filha e neta delas.\n\nEsse preço não é amor. É peso.\n\n#FreeMe",
    hashtags: "#FreeMe #HonrarSemRepetir #Linhagem #ConstelacaoFamiliar #MãeSemCulpa #Ancestralidade",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 16,
    type: "carousel",
    categoria: "movimento",
    title: "Amor não é sacrifício",
    slides: [
      { layout: "capa", body: "Amar não exige desapareceres." },
      { layout: "conteudo", body: "Cuidar não exige anulares-te." },
      { layout: "conteudo", body: "Servir não exige abandonares-te." },
      { layout: "citacao", body: "Se o teu amor te está a apagar, não é amor a mais. É peso a mais." },
      { layout: "conteudo", body: "Dá para amar inteira, em pé, com vida própria. Aliás, só assim é que dá para amar por muito tempo." },
      { layout: "cta", body: "Descobre o teu bloqueio.\nDiagnóstico grátis." },
    ],
    caption: "O amor que te apaga não é amor a mais. É peso a mais.\n\nE dá para amar inteira. Aliás, só assim é que dá para amar por muito tempo.\n\n#FreeMe",
    hashtags: "#FreeMe #AmorSemSacrifício #MãeInteira #ConstelacaoFamiliar #MaternidadeReal #Autoconhecimento",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 17,
    type: "video",
    categoria: "movimento",
    title: "Devolver",
    slides: [
      { layout: "kinetic-line", body: "O destino do teu marido é dele." },
      { layout: "kinetic-line", body: "Os teus pais, o deles." },
      { layout: "kinetic-line", body: "O teu filho, o dele." },
      { layout: "kinetic-line", body: "Tu podes acompanhar, podes amar." },
      { layout: "kinetic-line", body: "Mas não podes viver a vida deles por eles." },
      { layout: "kinetic-line", body: "E quando tentas, só te esmagas.\nE nem assim os salvas." },
    ],
    caption: "Devolver não é abandonar. É respeitar.\n\nCada pessoa tem o seu destino. Podes amar sem carregar.\n\n#FreeMe",
    hashtags: "#FreeMe #Devolver #ConstelacaoFamiliar #OrdensDoAmor #MaternidadeReal #Desapego",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 18,
    type: "carousel",
    categoria: "voz",
    title: "Quem é a Vivianne",
    slides: [
      { layout: "capa", body: "Sou a Vivianne.\nEscritora, mãe de três." },
      { layout: "conteudo", body: "Em formação em constelação familiar sistémica, a abordagem que sustenta esta travessia." },
      { layout: "conteudo", body: "Criei o FreeMe porque conheço esta culpa por dentro." },
      { layout: "citacao", body: "Ninguém merece carregá-la sozinha, no escuro, sem direito a queixa." },
      { layout: "cta", body: "O FreeMe é uma app de percurso terapêutico.\nNão é um curso. É uma travessia." },
      { layout: "assinatura", body: "Vivianne dos Santos" },
    ],
    caption: "Criei o FreeMe porque nenhuma mãe deveria carregar a culpa sozinha, no escuro, sem direito a queixa.\n\nÉ uma travessia interior, guiada pela minha voz, com os princípios da constelação familiar.\n\n#FreeMe",
    hashtags: "#FreeMe #VivianneDDosSantos #ConstelacaoFamiliar #ATravessiaDaMãe #Maternidade",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 19,
    type: "video",
    categoria: "movimento",
    title: "Culpa vs responsabilidade",
    slides: [
      { layout: "kinetic-line", body: "A culpa diz: falhei." },
      { layout: "kinetic-line", body: "A responsabilidade diz: posso cuidar disto." },
      { layout: "kinetic-line", body: "A culpa afunda." },
      { layout: "kinetic-line", body: "A responsabilidade ergue." },
      { layout: "kinetic-line", body: "Uma paralisa." },
      { layout: "kinetic-line", body: "A outra age." },
      { layout: "kinetic-line", body: "Qual escolhes?" },
    ],
    caption: "A culpa e a responsabilidade parecem-se. Mas uma afunda e a outra ergue.\n\nTransformar culpa em responsabilidade é o movimento que liberta.\n\n#FreeMe",
    hashtags: "#FreeMe #CulpaVsResponsabilidade #CulpaMaterna #Transformação #ConstelacaoFamiliar",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 20,
    type: "carousel",
    categoria: "espelho",
    title: "Se te reconheces",
    slides: [
      { layout: "capa", body: "Se te reconheces em pelo menos 3, este post é para ti." },
      { layout: "conteudo", body: "Dizes que estás bem quando não estás." },
      { layout: "conteudo", body: "Sentes que se parares, tudo desaba." },
      { layout: "conteudo", body: "Compensas o que achas que falhaste com prendas, atenção extra, cedências." },
      { layout: "conteudo", body: "Comparas-te com outras mães e sais a perder." },
      { layout: "conteudo", body: "Não te lembras da última vez que fizeste algo só para ti." },
      { layout: "cta", body: "Não és a única.\nE não tens de o carregar sozinha." },
    ],
    caption: "Não é fraqueza. É excesso de peso.\n\nSe te reconheceste, o FreeMe foi feito para ti.\n\nDiagnóstico grátis na bio.\n\n#FreeMe",
    hashtags: "#FreeMe #Reconheces #MãeSemCulpa #MaternidadeReal #Autoconhecimento #7Bloqueios",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 21,
    type: "video",
    categoria: "movimento",
    title: "Ocupar o teu lugar",
    slides: [
      { layout: "kinetic-line", body: "Tu não és a salvadora do teu filho." },
      { layout: "kinetic-line", body: "Não és a juíza." },
      { layout: "kinetic-line", body: "Não és Deus que devia ter impedido tudo." },
      { layout: "kinetic-line", body: "Tu és a mãe." },
      { layout: "kinetic-line", body: "Só isso." },
      { layout: "kinetic-line", body: "E é tudo." },
    ],
    caption: "Eu sou a mãe, tu és o filho. Tomei-te da melhor forma que pude, com o que eu tinha. O resto pertence à tua vida.\n\nOcupar o teu lugar é o movimento que cura.\n\n#FreeMe",
    hashtags: "#FreeMe #OTeuLugar #OrdensDoAmor #ConstelacaoFamiliar #MãeSemCulpa #Maternidade",
    platforms: ["ig", "tiktok"],
  },

  // === SEMANA 4: CONVERSÃO ===

  {
    day: 22,
    type: "carousel",
    categoria: "cta",
    title: "O que é o FreeMe",
    slides: [
      { layout: "capa", body: "O FreeMe é uma app.\nNão é um curso.\nNão é conteúdo.\nÉ uma travessia." },
      { layout: "conteudo", body: "Começas com um diagnóstico grátis. 7 perguntas que te mostram qual bloqueio mais te prende." },
      { layout: "conteudo", body: "Depois, um percurso adaptado a ti. Áudios guiados, exercícios de escrita, anotações privadas." },
      { layout: "conteudo", body: "No fim, vês pelas tuas próprias palavras a distância entre quem entrou e quem chegou." },
      { layout: "cta", body: "Diagnóstico grátis.\nPercurso completo por pagamento único.\n\nfreeme.viviannedossantos.com" },
    ],
    caption: "O FreeMe não te vai ensinar a ser mãe.\n\nÉ uma travessia que fazes por dentro, no teu ritmo, para pousares o que não era teu para carregar.\n\nDiagnóstico grátis. Link na bio.",
    hashtags: "#FreeMe #ATravessiaDaMãe #App #7Bloqueios #ConstelacaoFamiliar #DiagnósticoGrátis",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 23,
    type: "video",
    categoria: "ferida",
    title: "Às três da manhã",
    slides: [
      { layout: "kinetic-line", body: "São três da manhã." },
      { layout: "kinetic-line", body: "Tudo dorme menos tu." },
      { layout: "kinetic-line", body: "E a tua cabeça vai para as coisas que podias ter feito melhor." },
      { layout: "kinetic-line", body: "Para a lista do que ainda falta." },
      { layout: "kinetic-line", body: "Para o medo do que pode correr mal." },
      { layout: "kinetic-line", body: "Esse peso tem nome.\nE pode ficar mais leve." },
    ],
    caption: "É noite, finalmente paraste. A tua cabeça vai para onde?\n\nEsta é a primeira pergunta do diagnóstico FreeMe. Grátis.\n\n#FreeMe",
    hashtags: "#FreeMe #TrêsDaManhã #Insónia #CulpaMaterna #MaternidadeReal #MãeSemCulpa",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 24,
    type: "carousel",
    categoria: "espelho",
    title: "Não vieste tarde",
    slides: [
      { layout: "capa", body: "Não vieste tarde." },
      { layout: "citacao", body: "Vieste a tempo de ti." },
      { layout: "conteudo", body: "Não importa há quanto tempo carregas isto. O que importa é que estás aqui agora." },
      { layout: "conteudo", body: "A travessia começa quando tu decidires pousar o que não é teu." },
      { layout: "cta", body: "Diagnóstico grátis.\nfreeme.viviannedossantos.com" },
      { layout: "assinatura", body: "Vivianne dos Santos" },
    ],
    caption: "A travessia começa quando tu decidires pousar o que não é teu.\n\nNão é um acto de coragem. É um acto de cansaço honesto.\n\nLink na bio.\n\n#FreeMe",
    hashtags: "#FreeMe #NãoViesteTarde #ATravessiaDaMãe #Autoconhecimento #MãeSemCulpa #Maternidade",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 25,
    type: "video",
    categoria: "voz",
    title: "A mãe que não educa",
    slides: [
      { layout: "kinetic-line", body: "A culpa não te torna melhor mãe." },
      { layout: "kinetic-line", body: "Torna-te uma mãe que não educa." },
      { layout: "kinetic-line", body: "Porque quem se sente em dívida" },
      { layout: "kinetic-line", body: "cede para compensar," },
      { layout: "kinetic-line", body: "não põe limites," },
      { layout: "kinetic-line", body: "pede desculpa por existir." },
      { layout: "kinetic-line", body: "A culpa não é boa conselheira." },
    ],
    caption: "Esta é a verdade que ninguém te diz: a culpa não te torna melhor mãe.\n\nO FreeMe ajuda-te a pousar a culpa e a voltar a educar com presença.\n\n#FreeMe",
    hashtags: "#FreeMe #CulpaNãoÉBoaconselheira #CulpaMaterna #Limites #Educação #MaternidadeReal",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 26,
    type: "carousel",
    categoria: "movimento",
    title: "O que muda",
    slides: [
      { layout: "capa", body: "O que muda quando fazes a travessia." },
      { layout: "conteudo", body: "Não ficas curada. Ninguém fica." },
      { layout: "conteudo", body: "Mas sabes o caminho de volta a ti." },
      { layout: "conteudo", body: "E esse caminho não se desaprende." },
      { layout: "citacao", body: "No fim, vês pelas tuas próprias palavras a distância entre quem entrou e quem chegou." },
      { layout: "cta", body: "Começa pelo diagnóstico grátis." },
    ],
    caption: "O FreeMe não promete que a dor não volta. Promete que, quando voltar, sabes o caminho de volta a ti.\n\nDiagnóstico grátis na bio.\n\n#FreeMe",
    hashtags: "#FreeMe #Transformação #ATravessiaDaMãe #Autoconhecimento #ConstelacaoFamiliar #CuraInterior",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 27,
    type: "video",
    categoria: "espelho",
    title: "Mereces",
    slides: [
      { layout: "kinetic-line", body: "Mereces descanso sem culpa." },
      { layout: "kinetic-line", body: "Mereces pedir ajuda sem vergonha." },
      { layout: "kinetic-line", body: "Mereces um limite sem pedir desculpa." },
      { layout: "kinetic-line", body: "Mereces um tempo só teu sem te justificares." },
      { layout: "kinetic-line", body: "Mereces ocupar o teu lugar." },
      { layout: "kinetic-line", body: "E sempre mereceste." },
    ],
    caption: "Tu não precisas de merecer primeiro com mais sacrifício.\n\nJá mereces. Sempre mereceste.\n\n#FreeMe",
    hashtags: "#FreeMe #Mereces #MãeSemCulpa #Autocompaixão #MaternidadeReal #ATravessiaDaMãe",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 28,
    type: "carousel",
    categoria: "cta",
    title: "Como funciona",
    slides: [
      { layout: "capa", body: "Como funciona o FreeMe." },
      { layout: "conteudo", body: "1. Um espelho à entrada (grátis).\nRespondes a 7 perguntas. Vês qual bloqueio mais te prende." },
      { layout: "conteudo", body: "2. Um percurso só teu.\nÁudios guiados pela minha voz, exercícios de escrita, anotações privadas." },
      { layout: "conteudo", body: "3. O reencontro.\nNo fim, a app mostra-te, pelas tuas palavras, quem entrou e quem chegou." },
      { layout: "cta", body: "Diagnóstico grátis.\nPercurso completo por pagamento único.\n\nfreeme.viviannedossantos.com" },
    ],
    caption: "O FreeMe é uma app que funciona como uma travessia interior.\n\nNão é mais um curso. Não é mais conteúdo. É uma experiência terapêutica guiada.\n\nLink na bio.",
    hashtags: "#FreeMe #ComoFunciona #App #ATravessiaDaMãe #7Bloqueios #DiagnósticoGrátis",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 29,
    type: "video",
    categoria: "ferida",
    title: "A mãe perfeita",
    slides: [
      { layout: "kinetic-line", body: "Ela nunca perde a paciência." },
      { layout: "kinetic-line", body: "Está sempre disponível." },
      { layout: "kinetic-line", body: "Dá conta de tudo, sozinha, a sorrir." },
      { layout: "kinetic-line", body: "Conheces esta mãe?" },
      { layout: "kinetic-line", body: "Ela não existe." },
      { layout: "kinetic-line", body: "E quanto mais a tentas ser,\nmaior a vergonha de não conseguir." },
      { layout: "kinetic-line", body: "Pertenço exactamente como sou." },
    ],
    caption: "Quanto maior a distância entre a mãe ideal que inventaste e a mãe humana que és, maior a vergonha.\n\nNão porque estás a falhar. Porque o modelo é impossível.\n\n#FreeMe",
    hashtags: "#FreeMe #MãePerfeita #AVergonha #MaternidadeReal #MãeImperfeita #Autoconhecimento",
    platforms: ["ig", "tiktok"],
  },

  {
    day: 30,
    type: "carousel",
    categoria: "cta",
    title: "A travessia começa",
    slides: [
      { layout: "capa", body: "Não vieste tarde.\nVieste a tempo de ti." },
      { layout: "citacao", body: "A culpa não é boa conselheira." },
      { layout: "conteudo", body: "O FreeMe é uma travessia de autoconhecimento, com base nos princípios da constelação familiar." },
      { layout: "conteudo", body: "7 bloqueios. A minha voz a guiar-te. As tuas palavras a provarem a mudança." },
      { layout: "cta", body: "Diagnóstico grátis. Hoje.\n\nfreeme.viviannedossantos.com" },
      { layout: "assinatura", body: "Vivianne dos Santos" },
    ],
    caption: "30 dias a falar disto. E sei que pelo menos uma de vocês se reconheceu.\n\nSe és essa, o FreeMe está pronto para ti. Diagnóstico grátis, sem compromisso. Se o que vires fizer sentido, a travessia espera-te.\n\nLink na bio.\n\n#FreeMe",
    hashtags: "#FreeMe #ATravessiaDaMãe #MãeSemCulpa #DiagnósticoGrátis #ConstelacaoFamiliar #Maternidade",
    platforms: ["ig", "tiktok"],
  },
];
