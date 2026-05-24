import { type BlockerName } from "@/lib/types";

export interface ExerciseStep {
  title: { pt: string; en: string };
  prompt: { pt: string; en: string };
  prefill?: { pt: string; en: string };
  isIntegration: boolean;
}

export interface BlockerContent {
  name: BlockerName;
  title: { pt: string; en: string };
  tag: { pt: string; en: string };
  description: { pt: string; en: string };
  audioScript: { pt: string; en: string };
  reading: { pt: string; en: string };
  exerciseIntro: { pt: string; en: string };
  steps: ExerciseStep[];
  cautionZone: { pt: string; en: string };
}

export const BLOCKERS: Record<BlockerName, BlockerContent> = {
  peso: {
    name: "peso",
    title: { pt: "O peso", en: "The weight" },
    tag: { pt: "o que carregas", en: "what you carry" },
    description: {
      pt: "Sustentas tudo e todos, e perdeste-te a ti.",
      en: "You hold everything and everyone, and lost yourself.",
    },
    audioScript: {
      pt: `Vamos começar pelo mais pesado. Não pelo mais fundo, isso vem depois, com calma. Vamos começar pelo que tu sentes todos os dias, em cima dos ombros.

Tu carregas muito. E não é por não amares. É por amares demais, e por teres aprendido que amar é carregar. Mas há uma diferença que ninguém te ensinou, e é a diferença que muda tudo: uma coisa é o que é teu para carregar. Outra coisa é o que tu pegaste ao colo e que nunca foi teu.

Repara no que tu sustentas. O teu filho, claro. Mas só o teu filho? Ou também os problemas do pai dele, a tristeza dos teus pais, os conflitos da família toda, as dores de quem veio antes de ti? Tu tornaste-te a que aguenta tudo, a que resolve tudo, a que segura quando tudo ameaça cair. E o peso disso não é só cansaço. É a sensação de que se largares um bocadinho, desaba.

Quero dizer-te de onde vem grande parte deste peso, porque vais reconhecer. Vem de uma lealdade antiga, de uma voz que passou de mulher para mulher na tua família: uma boa mulher sacrifica-se, uma boa mãe aguenta tudo, primeiro os outros, eu por último. Talvez a tua avó tenha vivido assim. Talvez a tua mãe. E tu, sem decidir, continuaste, porque carregar como elas carregaram é uma forma de lhes pertencer. De dizer: eu sou das vossas.

Mas ouve isto com cuidado, porque é o coração de hoje. Tu podes honrar o sacrifício delas sem o repetir. Podes dizer-lhes, por dentro: vejo o vosso esforço, vejo o que vocês carregaram, honro-o. E a minha vida pertence-me. Não tens de sofrer como elas sofreram para continuares a ser filha e neta delas. Esse preço não é amor, é peso.

Então vamos fazer o movimento. Primeiro, ver o peso, sem o transformar em virtude. Não é heroico carregar tudo. É pesado, e ponto. Depois, identificar o que é mesmo teu, e o que é dos outros que tu puseste às costas. E depois devolver, com respeito, os destinos que não te pertencem. O teu marido tem o destino dele. Os teus pais, o deles. O teu filho, o dele. Tu podes acompanhar, podes amar, mas não podes viver a vida deles por eles, e quando tentas, só te esmagas, e nem assim os salvas.

E há uma frase que quero que guardes, sobre o amor. Amar não exige desapareceres. Cuidar não exige anulares-te. Servir não exige abandonares-te. Se o teu amor te está a apagar, não é amor a mais, é peso a mais. Dá para amar inteira, em pé, com vida própria. Aliás, só assim é que dá para amar por muito tempo.

E por fim, autoriza-te. Esta é difícil, porque mexe com a lealdade. Permite-te ter descanso, prazer, leveza, uma vida tua, sem sentires que estás a trair quem sofreu antes de ti. Diz, devagar: honro o vosso caminho. Não preciso de o repetir. Escolho viver a minha própria vida.

Ficas mais leve não porque deixaste de amar. Ficas mais leve porque pousaste o que nunca foi teu. E agora, com os braços livres, podes finalmente segurar o que é mesmo teu, que é muito menos do que carregavas, e infinitamente mais importante.

Quando estiveres pronta, vamos escrever.`,
      en: "English version coming soon.",
    },
    reading: {
      pt: `Tu carregas muito, e não é por não amares, é por teres aprendido que amar é carregar. Mas há uma diferença que muda tudo: uma coisa é o que é teu para carregar, outra é o que pegaste ao colo e nunca foi teu.

Repara no que sustentas: o teu filho, sim, mas também os problemas do pai dele, a tristeza dos teus pais, os conflitos de toda a família, as dores de quem veio antes. Tornaste-te a que aguenta tudo.

Muito deste peso vem de uma lealdade antiga, uma voz passada de mulher para mulher: "uma boa mãe aguenta tudo, primeiro os outros, eu por último". Carregar como elas carregaram tornou-se uma forma de lhes pertencer. Mas podes honrar o sacrifício delas sem o repetir.

O movimento: ver o peso (sem o tornar virtude), identificar o que é teu e o que é dos outros, devolver os destinos que não te pertencem (cada um tem o seu, podes amar sem viver a vida deles), separar amor de sacrifício (amar não exige desapareceres), e autorizar-te a viver (descanso, leveza, vida própria, sem trair quem sofreu antes).

"Honro o vosso caminho. Não preciso de o repetir. Escolho viver a minha própria vida."

Ficas leve não por deixares de amar, mas por pousares o que nunca foi teu. E só com os braços livres consegues segurar o que é mesmo teu.`,
      en: "English version coming soon.",
    },
    exerciseIntro: {
      pt: "Devagar, só para ti.",
      en: "Slowly, just for you.",
    },
    steps: [
      {
        title: { pt: "Ver", en: "See" },
        prompt: {
          pt: "Escreve tudo o que sentes que andas a carregar. Faz uma lista, sem filtrar. Pessoas, problemas, responsabilidades, tudo o que pesa.",
          en: "Write everything you feel you've been carrying. Make a list, without filtering. People, problems, responsibilities, everything that weighs.",
        },
        isIntegration: false,
      },
      {
        title: { pt: "Identificar", en: "Identify" },
        prompt: {
          pt: "Olha para a lista e marca cada item: isto é mesmo meu, ou estou a carregar por amor, ou por lealdade a alguém?",
          en: "Look at the list and mark each item: is this truly mine, or am I carrying it out of love, or loyalty to someone?",
        },
        isIntegration: false,
      },
      {
        title: { pt: "Devolver", en: "Return" },
        prompt: {
          pt: "Para cada peso que viste que não é teu, escreve a quem pertence, e diz, devagar:\n\"Isto é teu. Vejo-o, respeito-o, e devolvo-to. Confio na tua força para o carregares.\"",
          en: "For each weight you saw that isn't yours, write whose it is, and say slowly:\n\"This is yours. I see it, I respect it, and I return it to you. I trust your strength to carry it.\"",
        },
        isIntegration: false,
      },
      {
        title: { pt: "Amor não é sacrifício", en: "Love is not sacrifice" },
        prompt: {
          pt: "Escreve uma vez, devagar:\n\"Amar não me exige desaparecer. Posso amar inteira.\"\nRepara no que sentes ao escrever isto. Custa acreditar? De quem aprendeste que amar era desaparecer?",
          en: "Write once, slowly:\n\"Loving does not require me to disappear. I can love whole.\"\nNotice what you feel writing this. Is it hard to believe? From whom did you learn that loving meant disappearing?",
        },
        isIntegration: false,
      },
      {
        title: { pt: "Honrar sem repetir", en: "Honour without repeating" },
        prompt: {
          pt: "Pensa nas mulheres da tua família que se sacrificaram. Escreve:\n\"Vejo o vosso esforço. Honro-o. A vossa vida pertenceu-vos. A minha pertence-me. Não preciso de sofrer como vocês para vos pertencer.\"",
          en: "Think of the women in your family who sacrificed themselves. Write:\n\"I see your effort. I honour it. Your life belonged to you. Mine belongs to me. I don't need to suffer as you did to belong to you.\"",
        },
        isIntegration: false,
      },
      {
        title: { pt: "Autorizar-te", en: "Give yourself permission" },
        prompt: {
          pt: "Escreve uma coisa, só uma, que te queres permitir ter, e que andavas a adiar por carregares tudo. Descanso, um projeto, um prazer, um tempo só teu.\n\"Autorizo-me a...\"",
          en: "Write one thing, just one, that you want to allow yourself, and that you've been postponing because you carry everything. Rest, a project, a pleasure, time just for you.\n\"I give myself permission to...\"",
        },
        isIntegration: true,
      },
    ],
    cautionZone: {
      pt: "O peso pode não ser só simbólico. Muitas mães carregam responsabilidades reais: filhos pequenos, familiares doentes, dificuldades económicas, violência. Nesses casos não basta mudança interna, são precisos recursos e apoio concreto. Se surgirem sinais de esgotamento extremo, relação abusiva, sobrecarga de cuidador, violência doméstica, ou sintomas depressivos importantes, procura apoio profissional.",
      en: "The weight may not be only symbolic. Many mothers carry real responsibilities: young children, ill family members, financial hardship, violence. In those cases, internal change is not enough, concrete resources and support are needed. If you notice signs of extreme exhaustion, abusive relationships, caregiver overload, domestic violence, or significant depressive symptoms, seek professional support.",
    },
  },
  vazio: {
    name: "vazio",
    title: { pt: "O vazio", en: "The void" },
    tag: { pt: "o que te falta", en: "what you lack" },
    description: {
      pt: "Dás e dás, e já não sobra nada para ti.",
      en: "You give and give, and nothing is left for you.",
    },
    audioScript: {
      pt: `Antes de tudo, quero dizer-te uma coisa. Se o que tu sentes não é só cansaço, mas um vazio que não passa com descanso, uma tristeza que já não levanta, uma falta de vontade que te assusta, então isto que vamos fazer aqui pode não chegar, e não há vergonha nenhuma nisso. Há coisas que precisam de alguém preparado, um médico, um psicólogo, ao teu lado. Se é aí que estás, promete-me que procuras essa ajuda. Não é fraqueza. É cuidar de ti como cuidas dos outros.

Dito isto, vamos falar do vazio que vem de te teres dado até ao fim.

Tu deste, e deste, e deste. E a certa altura, deixou de haver de onde tirar. Não é que não ames. Amas. Mas o amor precisa de combustível, e o teu acabou, porque tu só puseste para fora e quase nunca recebeste de volta. Uma mãe que só dá e não recebe é uma fonte que ninguém reabastece. Mais cedo ou mais tarde, seca.

Repara no desequilíbrio. Tu cuidas, resolves, organizas, proteges, sustentas. E quem cuida de ti? Quem te pergunta como estás, e espera mesmo pela resposta? Quem te dá descanso, colo, ajuda? Se a resposta é "ninguém", ou "eu própria", então o vazio não é um mistério. É matemática. Dás muito, recebes pouco, e a conta não fecha.

E há uma coisa mais funda, que quero que vejas com honestidade. Às vezes a mãe esvazia-se porque está à espera, sem saber, de receber dos filhos aquilo que não recebeu dos pais. Ser vista, ser escolhida, ser amada sem condições. São necessidades legítimas, tu mereceste tê-las recebido. Mas o teu filho não veio ao mundo para te preencher a ti. E enquanto esperas que ele preencha um buraco antigo, o buraco nunca fecha, e o vazio fica.

Por isso o caminho não é dares ainda mais. É o contrário. Primeiro, reconhecer, sem o transformar em dever: estou vazia, estou esgotada. Não "estou cansada mas já passa". Estou vazia. Dito assim, a sério.

Depois, ver o que estás a carregar que esvazia em vez de encher. Lembras-te do peso? É a mesma família. Devolve o que não é teu, sai dos lugares que não te pertencem. Tu não és a parceira emocional dos teus pais, não és a salvadora da família toda. Cada um desses lugares que ocupas drena-te um bocadinho.

E depois, o movimento mais difícil para ti, eu sei: permitir-te receber. Ajuda. Descanso. Cuidado. Prazer. Sem teres de o merecer primeiro com mais sacrifício. Diz, devagar: permito-me receber. Não preciso de dar tudo para merecer amor. Custa, eu sei. Quem se habituou a ser fonte tem medo de pedir água. Mas a vida quer sustentar-te também a ti. Deixa-a.

E volta a existir para além de seres mãe. Não menos mãe. Mas também mulher, também tu, com desejos, com uma vida que é tua. Diz: também pertenço à minha vida. Também sou alguém que precisa de ser cuidada.

O vazio enche-se quando o fluxo se reabre. Quando paras de ser só a que dá, e voltas a ser também a que recebe. Não é egoísmo. É o que te permite continuar a amar sem te apagares.

Quando estiveres pronta, escreve. E vai com doçura contigo.`,
      en: "English version coming soon.",
    },
    reading: {
      pt: `Antes de tudo: se o que sentes não é só cansaço, mas um vazio que não passa com descanso, uma tristeza que não levanta, procura apoio de um médico ou psicólogo. Não é fraqueza, é cuidar de ti. A reflexão aqui não substitui ajuda clínica.

O vazio não é falta de amor, é interrupção do fluxo. Deste, deste, deste, e deixou de haver de onde tirar. Uma mãe que só dá e nunca recebe é uma fonte que ninguém reabastece.

Vê o desequilíbrio: tu cuidas de todos, e quem cuida de ti? Às vezes o vazio é matemática, dás muito, recebes pouco, a conta não fecha. E às vezes há algo mais fundo: esperar dos filhos o que não recebeste dos pais (ser vista, escolhida, amada sem condições). São necessidades legítimas, mas o teu filho não veio para te preencher.

O caminho não é dar mais, é o contrário: reconhecer o esgotamento ("estou vazia", a sério), devolver o que te esvazia e sair dos lugares que não são teus, permitir-te receber (ajuda, descanso, cuidado, sem o teres de merecer com sacrifício), e voltar a existir para além de mãe.

"Permito-me receber. Não preciso de dar tudo para merecer amor." "Também pertenço à minha vida."

O vazio enche-se quando voltas a ser também a que recebe. Não é egoísmo, é o que te deixa amar sem te apagares.`,
      en: "English version coming soon.",
    },
    exerciseIntro: {
      pt: "Devagar, com doçura. Se sentires que é mais do que cansaço, para o exercício e vê a nota no fim.",
      en: "Slowly, gently. If you feel it's more than tiredness, stop the exercise and see the note at the end.",
    },
    steps: [
      { title: { pt: "Reconhecer", en: "Acknowledge" }, prompt: { pt: "Escreve, sem o suavizar:\n\"Estou vazia porque...\"", en: "Write, without softening:\n\"I am empty because...\"" }, isIntegration: false },
      { title: { pt: "A conta", en: "The account" }, prompt: { pt: "De um lado, escreve tudo o que dás, todos os dias. Do outro, tudo o que recebes. Olha para as duas colunas.", en: "On one side, write everything you give daily. On the other, everything you receive. Look at both columns." }, isIntegration: false },
      { title: { pt: "Diferenciar e devolver", en: "Differentiate and return" }, prompt: { pt: "O que estás a sustentar que não é teu? Que lugares ocupas que pertencem a outros (parceira emocional dos pais, salvadora da família)? Escreve, e devolve:\n\"Isto não é o meu lugar. Devolvo-o a quem pertence.\"", en: "What are you sustaining that isn't yours? What places do you occupy that belong to others? Write, and return:\n\"This is not my place. I return it to whom it belongs.\"" }, isIntegration: false },
      { title: { pt: "O buraco antigo", en: "The old hole" }, prompt: { pt: "Com honestidade, e sem culpa: haverá algo que esperas dos teus filhos (ou do teu parceiro) que afinal te faltou em criança? Só ver, não resolver hoje.", en: "Honestly, without guilt: is there something you expect from your children (or partner) that you actually lacked as a child? Just see, don't resolve today." }, isIntegration: false },
      { title: { pt: "Permitir receber", en: "Allow receiving" }, prompt: { pt: "Escreve uma coisa concreta que vais deixar-te receber esta semana. Ajuda em algo, um descanso, um pedido que costumas engolir.\n\"Esta semana permito-me receber...\"", en: "Write one concrete thing you'll let yourself receive this week.\n\"This week I allow myself to receive...\"" }, isIntegration: false },
      { title: { pt: "Voltar a ti", en: "Return to yourself" }, prompt: { pt: "Escreve:\n\"Também pertenço à minha vida. Também sou alguém que precisa de ser cuidada.\"", en: "Write:\n\"I also belong to my own life. I am also someone who needs to be cared for.\"" }, isIntegration: true },
    ],
    cautionZone: {
      pt: "O vazio é sintoma inespecífico. Se aparecerem sinais persistentes (exaustão extrema, perda de prazer, apatia profunda, insónia, irritabilidade intensa, dificuldade de cuidar de si ou dos filhos), procura avaliação médica ou psicológica. Sinais compatíveis com depressão, depressão pós-parto, burnout, ou ideação de auto-agressão exigem apoio profissional imediato.",
      en: "Emptiness is a nonspecific symptom. If persistent signs appear (extreme exhaustion, loss of pleasure, deep apathy, insomnia, intense irritability, difficulty caring for yourself or children), seek medical or psychological evaluation.",
    },
  },
  culpa: {
    name: "culpa",
    title: { pt: "A culpa", en: "The guilt" },
    tag: { pt: "o que te acusa", en: "what accuses you" },
    description: { pt: "Sentes que falhaste, e isso paralisa-te.", en: "You feel you failed, and it paralyses you." },
    audioScript: {
      pt: `Senta-te. Não tens de mudar nada hoje, só de olhar comigo.

Vais ouvir-me dizer uma coisa que talvez nunca te tenham dito. A tua culpa não é um defeito. É uma forma de amor que se enganou no caminho.

Repara. Quando te culpas, há uma parte de ti que acredita, lá no fundo, que se sofreres o suficiente talvez consigas reparar o que aconteceu. Ou que enquanto carregas esta culpa, continuas ligada ao teu filho, de mãos dadas com a dor dele. A culpa parece um castigo, mas muitas vezes é um laço. Uma forma de dizer: eu não te largo, eu sofro contigo.

É bonito. E é pesado. E não ajuda nenhum dos dois.

Hoje vamos fazer um caminho curto, mas que mexe a sério. Em seis passos. Vai devagar comigo.

O primeiro é ver. Só ver, sem fugir. Traz à frente a culpa que mais te aperta com os teus filhos. Não a julgues, não a expliques. Só olha para ela. Ela está aí. Vê-a.

O segundo é reconhecer o que é real. A culpa vive da luta contra o que aconteceu, do "não devia ter sido assim". Mas foi assim. Diz comigo, por dentro: foi assim. Não é desistir, não é aprovar. É parar de lutar contra uma coisa que já aconteceu. Foi assim. Agora vejo.

O terceiro é o mais importante, e é onde quase ninguém te leva. Diferenciar. O que é teu, e o que não é teu. Há coisas naquela culpa que são mesmo da tua responsabilidade, e tudo bem, vais poder cuidar delas. Mas há outras que tu pegaste ao colo e que nunca foram tuas para carregar. O destino do teu filho é dele. As escolhas dele, são dele. A vida que ele vai viver, é dele. Tu não és tão grande que possas viver a vida dele por ele. Ninguém é.

Por isso, o quarto passo é devolver. Com amor, não com abandono. Imagina que pousas, devagar, aquilo que não era teu. E dizes, por dentro: o que é teu, meu filho, fica contigo. Eu vejo o teu peso, respeito-o, e devolvo-to com amor. Não porque não me importo. Porque te respeito demasiado para viver a tua vida no teu lugar.

O quinto passo é voltares ao teu lugar. Tu não és a salvadora do teu filho, não és a juíza, não és Deus que devia ter impedido tudo. Tu és a mãe. Só isso, e é tudo. Diz por dentro: eu sou a mãe, tu és o filho. Eu tomei-te da melhor forma que pude, com o que eu tinha. O resto pertence à tua vida.

E o sexto, o último, é integrar. Reparas que, quando devolves o que não é teu e voltas ao teu lugar, a culpa não vira frieza. Vira outra coisa. Vira tristeza, às vezes. Vira amor sem aquela pressa de consertar tudo. Um amor que vê o filho como uma pessoa inteira, com o seu próprio caminho, e não como uma ferida tua para curar.

Fica aqui um instante, neste lugar mais leve. Não fizeste nada de errado em pousar o que não era teu. Pelo contrário. Só agora, com as mãos livres, é que podes mesmo ser mãe.

Quando estiveres pronta, vais escrever. Vai com calma.`,
      en: "English version coming soon.",
    },
    reading: {
      pt: `A tua culpa não é um defeito. É uma forma de amor que se enganou no caminho.

Por baixo da culpa há quase sempre uma crença silenciosa: que se sofreres o suficiente, talvez repares o irreparável. Ou que, enquanto te culpas, continuas ligada ao teu filho. A culpa parece castigo, mas muitas vezes é um laço, uma forma de dizer "eu sofro contigo, não te largo". É amor. E é peso. E não ajuda nenhum dos dois.

Curar a culpa não é deixar de te importar. É um movimento interno em seis passos:

Ver a culpa sem fugir. Reconhecer o que é real ("foi assim", parar de lutar contra o que já aconteceu). Diferenciar o que é teu do que não é teu (o destino do teu filho é dele, não é teu para carregar). Devolver com amor o que não te pertence. Voltar ao teu lugar ("eu sou a mãe, tu és o filho; tomei-te da melhor forma que pude; o resto pertence à tua vida"). E integrar, deixar a culpa virar amor sem omnipotência, o amor que vê o filho como pessoa inteira e não como ferida tua para consertar.

Só com as mãos livres do que não era teu é que podes mesmo ser mãe.`,
      en: "English version coming soon.",
    },
    exerciseIntro: { pt: "Faz isto devagar, só para ti. Ninguém vai ler. Se em algum ponto sentires que é demais, para, e respira.", en: "Do this slowly, just for you. No one will read it. If at any point it feels too much, stop and breathe." },
    steps: [
      { title: { pt: "Ver", en: "See" }, prompt: { pt: "Escreve a culpa que mais te aperta com o teu filho. Uma frase. Sem te explicares.", en: "Write the guilt that weighs most on you regarding your child. One sentence. Without explaining yourself." }, isIntegration: false },
      { title: { pt: "Reconhecer", en: "Acknowledge" }, prompt: { pt: "Lê o que escreveste. Por baixo, escreve: \"Foi assim. Agora vejo.\"\nRepara no que sentes ao escrever isto.", en: "Read what you wrote. Below, write: \"It was so. Now I see.\"\nNotice what you feel writing this." }, isIntegration: false },
      { title: { pt: "Diferenciar", en: "Differentiate" }, prompt: { pt: "Olha para essa culpa e responde:\nO que é que, nisto, é mesmo da minha responsabilidade, e posso cuidar daqui para a frente?\nE o que é que é o caminho do meu filho, que eu peguei ao colo mas nunca foi meu para carregar?", en: "Look at that guilt and answer:\nWhat in this is truly my responsibility, that I can care for going forward?\nAnd what is my child's own path, that I picked up but was never mine to carry?" }, isIntegration: false },
      { title: { pt: "Devolver", en: "Return" }, prompt: { pt: "Para aquilo que viste que não é teu, escreve, devagar:\n\"Isto é teu, meu filho. Vejo o teu peso, respeito-o, e devolvo-to com amor.\"", en: "For what you saw isn't yours, write slowly:\n\"This is yours, my child. I see your weight, I respect it, and I return it to you with love.\"" }, isIntegration: false },
      { title: { pt: "O teu lugar", en: "Your place" }, prompt: { pt: "Escreve:\n\"Eu sou a mãe. Tu és o filho. Tomei-te da melhor forma que pude, com o que eu tinha. O resto pertence à tua vida.\"", en: "Write:\n\"I am the mother. You are the child. I raised you the best I could, with what I had. The rest belongs to your life.\"" }, isIntegration: false },
      { title: { pt: "Integrar", en: "Integrate" }, prompt: { pt: "Fecha os olhos um instante. Repara como está agora o que antes era culpa. Depois escreve, numa linha, o que sentes neste lugar mais leve.", en: "Close your eyes for a moment. Notice how what was guilt feels now. Then write, in one line, what you feel in this lighter place." }, isIntegration: true },
    ],
    cautionZone: { pt: "Se a culpa tocar luto, perda de um filho, aborto, abuso, violência, ou morte por suicídio, procura apoio profissional. Isto que carregas é grande demais para se atravessar sozinha, e mereces alguém ao teu lado.", en: "If the guilt touches grief, loss of a child, miscarriage, abuse, violence, or death by suicide, seek professional support. What you carry is too heavy to cross alone." },
  },
  medo: {
    name: "medo",
    title: { pt: "O medo", en: "The fear" },
    tag: { pt: "o que te aperta", en: "what tightens" },
    description: { pt: "Vigias, antecipas, temes repetir o que viveste.", en: "You watch, anticipate, fear repeating what you lived." },
    audioScript: { pt: `Vamos falar do medo. Daquele que não te larga, mesmo quando está tudo bem.

Há um medo de mãe que é natural, que faz parte de amar alguém mais do que a ti. Não é esse que vamos tocar. Vamos tocar o outro. O que aperta demais. O que te faz vigiar, antecipar, imaginar o pior, controlar o que não se controla. O medo que te tira o sono e não protege ninguém.

Quero dizer-te uma coisa que talvez nunca te tenham dito sobre esse medo. Muitas vezes, ele não nasce do teu filho de agora. Nasce de uma história mais antiga, que estava em ti muito antes dele.

Pensa. Houve medo na tua infância? Houve abandono, perda, doença, alguém que viveu sempre em alerta? Porque o medo viaja nas famílias. Passa de mãe para filha sem pedir licença. E às vezes, quando olhas para o teu filho com o coração apertado, não é a ele que estás a ver. É uma dor antiga, a tua, ou de quem veio antes de ti, que se acende outra vez na frente da criança de hoje.

Por isso o primeiro movimento que vamos fazer não é acalmar o medo. É localizá-lo no tempo. Perguntar: este medo que sinto agora, pertence a hoje, a este momento real, ou pertence a uma história anterior, que eu carrego sem saber?

E depois vamos separar três coisas que o medo mistura. O perigo real, aquele de que tens mesmo de cuidar. A memória, a dor antiga que se ativa. E a fantasia, o filme de catástrofe que a tua cabeça monta. São três coisas diferentes, e o medo trata-as como se fossem uma só. Quando as separas, a maior parte do peso cai, porque vês que quase nada daquilo é o perigo real de agora.

E aqui chega o movimento mais difícil, e o mais libertador. Confiar. Não é deixar de cuidar. É reconhecer onde acaba o que está nas tuas mãos. Tu fazes a tua parte, com tudo o que tens. Mas a vida do teu filho não cabe inteira nas tuas mãos, e ainda bem, porque tu não nasceste para viver a vida dele. Diz comigo, por dentro: faço a minha parte. O resto, deixo à vida.

E o teu filho, deixa-o ser uma pessoa com o seu próprio caminho. Não uma extensão tua, não uma parte do teu corpo que anda lá fora e tu tens de proteger a cada segundo. Ele tem a vida dele. Diz: tu és meu filho, eu sou tua mãe, dou-te o que posso, e a tua vida pertence-te.

E se o teu medo é o de repetir, o de seres como a tua mãe foi contigo, ouve isto com atenção, porque é estranho mas é verdadeiro. Quanto mais tu juras "nunca serei como ela", mais presa a ela ficas, porque combater alguém também é uma forma de não a largar. A liberdade não está em rejeitá-la com mais força. Está em poderes ser diferente sem precisares de a rejeitar. Diz, devagar: tu és a minha mãe, eu sou a tua filha, recebo-te como és, e sigo o meu caminho.

Repara onde ficas quando largas o controlo do que não controlas. Não ficas descuidada. Ficas mãe. Só mãe, que já é tudo. Presente hoje, com o teu filho que está aqui, hoje. E hoje, basta.

Quando estiveres pronta, vais escrever.`, en: "English version coming soon." },
    reading: { pt: `Há um medo de mãe que é natural. E há outro, o que aperta demais: o que te faz vigiar, antecipar, controlar o incontrolável, e que te tira o sono sem proteger ninguém. É desse que falamos.

Esse medo, muitas vezes, não nasce do teu filho de hoje. Nasce de uma história mais antiga, tua ou de quem veio antes, que se ativa na frente da criança atual. O medo viaja nas famílias.

O caminho não é acalmar o medo, é atravessá-lo:

Ver: "tenho medo." Localizar no tempo: este medo é de hoje, ou de outra história? Diferenciar três coisas que o medo mistura, o perigo real, a memória antiga, e a fantasia catastrófica. Confiar: "faço a minha parte, o resto deixo à vida" (não é descuidar, é reconhecer onde acabam as tuas mãos). Libertar o filho: vê-lo como pessoa com caminho próprio, não extensão tua. E permanecer no teu lugar de mãe, nem vigilante absoluta, nem vítima do destino.

E se o teu medo é o de repetir a tua mãe: quanto mais a rejeitas, mais presa lhe ficas. A liberdade é "posso ser diferente sem precisar de a rejeitar". "Tu és a minha mãe, eu sou tua filha, recebo-te como és, e sigo o meu caminho."`, en: "English version coming soon." },
    exerciseIntro: { pt: "Devagar, só para ti. Se sentires o medo crescer de mais durante o exercício, para, respira, e volta depois.", en: "Slowly, just for you. If you feel fear growing too much, stop, breathe, and return later." },
    steps: [
      { title: { pt: "Ver", en: "See" }, prompt: { pt: "Escreve o medo que mais te aperta com o teu filho. Sem o explicar.", en: "Write the fear that grips you most regarding your child. Without explaining." }, isIntegration: false },
      { title: { pt: "Localizar no tempo", en: "Locate in time" }, prompt: { pt: "Este medo pertence só a hoje, à criança real que tens à frente? Ou reconheces nele uma história mais antiga, tua ou da tua família?", en: "Does this fear belong only to today, to the real child in front of you? Or do you recognise in it an older story, yours or your family's?" }, isIntegration: false },
      { title: { pt: "Diferenciar", en: "Differentiate" }, prompt: { pt: "Separa o teu medo em três:\nO perigo real, de que tenho mesmo de cuidar hoje:\nA memória antiga que isto acende em mim:\nA fantasia, o pior que a minha cabeça imagina e que ainda não aconteceu:", en: "Separate your fear into three:\nThe real danger I truly need to tend to today:\nThe old memory this awakens in me:\nThe fantasy, the worst my mind imagines that hasn't happened:" }, isIntegration: false },
      { title: { pt: "Confiar", en: "Trust" }, prompt: { pt: "Escreve, devagar:\n\"Faço a minha parte, com tudo o que tenho. O que não está nas minhas mãos, deixo à vida.\"", en: "Write slowly:\n\"I do my part, with everything I have. What is not in my hands, I leave to life.\"" }, isIntegration: false },
      { title: { pt: "Libertar o filho", en: "Free the child" }, prompt: { pt: "Escreve:\n\"Tu és meu filho. Eu sou tua mãe. Dou-te o que posso. A tua vida pertence-te.\"", en: "Write:\n\"You are my child. I am your mother. I give you what I can. Your life belongs to you.\"" }, isIntegration: false },
      { title: { pt: "Receber a mãe", en: "Receive your mother" }, prompt: { pt: "Se o teu medo for o de repetir a tua mãe, escreve:\n\"Tu és a minha mãe. Eu sou tua filha. Recebo-te como és. E sigo o meu caminho.\"\nRepara que não precisas de a rejeitar para seres diferente dela.", en: "If your fear is repeating your mother, write:\n\"You are my mother. I am your daughter. I receive you as you are. And I follow my own path.\"" }, isIntegration: true },
    ],
    cautionZone: { pt: "Se aparecerem sinais de ansiedade clínica (ataques de pânico, ansiedade intensa diária, insónia persistente, hipervigilância, incapacidade de deixar a criança com terceiros, revivescência de trauma), procura avaliação por um profissional de saúde mental. Isto que descreves pode estar para além de uma preocupação de mãe habitual.", en: "If signs of clinical anxiety appear (panic attacks, daily intense anxiety, persistent insomnia, hypervigilance, inability to leave the child with others, trauma reliving), seek evaluation by a mental health professional." },
  },
  vergonha: {
    name: "vergonha",
    title: { pt: "A vergonha", en: "The shame" },
    tag: { pt: "o que escondes", en: "what you hide" },
    description: { pt: "Achas que há algo errado em ti, e escondes.", en: "You think something is wrong with you, and hide." },
    audioScript: { pt: `Vamos falar de uma coisa que tu provavelmente nunca disseste a ninguém. Porque a vergonha tem isto: faz-te esconder exatamente aquilo que mais precisavas de mostrar.

Repara na diferença. A culpa diz "fiz uma coisa errada". Ainda dá para reparar. Mas a vergonha diz outra coisa, mais cruel: "há alguma coisa errada em mim". Não é o que fiz, sou eu. E quando uma mãe sente isso, esconde-se. Sorri para fora, e por dentro pensa que é a pior mãe do mundo, e que se os outros soubessem como ela é mesmo, ninguém a respeitaria.

Quero que saibas de onde vem grande parte desta vergonha. Tu construíste, sem dar conta, uma imagem de mãe perfeita. A boa mãe nunca perde a paciência. A boa mãe está sempre disponível. A boa mãe dá conta de tudo, sozinha, a sorrir. E tudo o que em ti não cabe nessa imagem, o cansaço, a irritação, a vontade de fugir um bocado, a ambivalência, tu empurraste para a sombra, como se não devesse existir. Mas existe. Existe em todas as mães. E quanto maior a distância entre a mãe ideal que inventaste e a mãe humana que és, maior a vergonha. Não porque estás a falhar. Porque o modelo é impossível.

Há ainda outra coisa, e talvez reconheças. Às vezes a vergonha não nasce em ti. Vem de trás. Houve na tua família alguém que foi humilhado, diminuído, apontado como fracasso, excluído? Porque essa sensação de "há algo errado comigo" pode ser uma herança, uma forma de continuares ligada a quem carregou essa dor antes de ti. Não são os factos que passam, é a sensação. E tu podes pousá-la: vejo a vossa dor, respeito-a, e não preciso de a repetir para vos pertencer.

Então o movimento da vergonha não é provares que és boa mãe. É o contrário, é incluíres em ti o que andavas a esconder. Vamos por partes.

Primeiro, ver. Sem justificar, sem combater. Sinto vergonha. Só isso.

Depois, reconhecer que aquilo que escondes é humano. O cansaço é humano. A irritação é humana. Ter limites, ter necessidades tuas, querer um tempo só teu, sentir às vezes dois sentimentos ao mesmo tempo, amar e estar exausta, tudo isso é humano e está em todas, mesmo nas que parecem perfeitas no Instagram.

E aqui o movimento-chave: incluir o que rejeitaste. Em vez de dizeres "isto não devia existir em mim", dizes "isto também faz parte de mim". A mãe que perde a paciência também sou eu. A que às vezes não aguenta também sou eu. E continuo a ser uma boa mãe, porque a boa mãe não é a que não tem sombra, é a que aprende a incluir a sua sombra sem deixar de amar.

E larga a comparação. A vergonha vive de te medires contra outras mães, as reais, as das redes, as imaginadas. Mas tu não és elas. Diz, devagar: eu sou eu, tu és tu, cada uma tem o seu caminho. Eu sou a mãe possível para este filho, e este filho é o filho possível para mim. Não preciso de ser a mãe de mais ninguém.

E por fim, a parte mais funda. A vergonha diz: só posso pertencer se for perfeita. E o movimento responde: posso pertencer exatamente como sou. Posso ficar, mesmo sem ser perfeita. Continuo a merecer o meu lugar, com as minhas falhas, com a minha sombra, inteira. Pertenço por ser humana, não por ser impecável.

Repara como se respira melhor quando paras de esconder. O que escondemos pesa o dobro. O que incluímos, podemos finalmente pousar.

Quando estiveres pronta, escreve. E lembra-te: aqui ninguém te vê para te julgar.`, en: "English version coming soon." },
    reading: { pt: `A culpa diz "fiz algo errado", e ainda dá para reparar. A vergonha diz "há algo errado em mim", e faz-te esconder exatamente o que mais precisavas de mostrar.

Muita vergonha vem de uma imagem de mãe perfeita que construíste (nunca perde a paciência, está sempre disponível, dá conta de tudo). Tudo o que não cabe nessa imagem foi empurrado para a sombra. Quanto maior a distância entre a mãe ideal e a mãe humana que és, maior a vergonha. Não porque falhas, mas porque o modelo é impossível. Às vezes a vergonha é até herdada (alguém humilhado ou excluído na família, e tu carregas a sensação).

O movimento não é provar que és boa mãe, é incluir o que escondes: ver a vergonha ("sinto vergonha"), reconhecer que o que escondes é humano (cansaço, irritação, limites, ambivalência), incluir o rejeitado ("isto também faz parte de mim"), largar a comparação ("eu sou eu, tu és tu, sou a mãe possível para este filho"), e pertencer como imperfeita.

A vergonha diz "só pertenço se for perfeita". O movimento responde: "pertenço exatamente como sou". O que escondemos pesa o dobro; o que incluímos, podemos pousar.`, en: "English version coming soon." },
    exerciseIntro: { pt: "Só para ti. Ninguém vê.", en: "Just for you. No one sees." },
    steps: [
      { title: { pt: "Ver", en: "See" }, prompt: { pt: "Completa, sem te explicares:\n\"Tenho vergonha de...\"", en: "Complete, without explaining:\n\"I am ashamed of...\"" }, isIntegration: false },
      { title: { pt: "A pergunta que liberta", en: "The question that frees" }, prompt: { pt: "\"O que estou a exigir de mim que nunca exigiria de uma amiga querida?\"", en: "\"What am I demanding of myself that I would never demand of a dear friend?\"" }, isIntegration: false },
      { title: { pt: "A mãe ideal", en: "The ideal mother" }, prompt: { pt: "Descreve a \"mãe perfeita\" que sentes que devias ser. Depois lê, e pergunta-te: esta mãe existe mesmo? Alguma vez existiu?", en: "Describe the \"perfect mother\" you feel you should be. Then read it and ask: does this mother really exist? Has she ever?" }, isIntegration: false },
      { title: { pt: "Incluir", en: "Include" }, prompt: { pt: "Pega no que escreveste no passo 1, naquilo de que tens vergonha, e escreve por baixo:\n\"Isto também faz parte de mim. E continuo a ser uma boa mãe.\"", en: "Take what you wrote in step 1, what you're ashamed of, and write below:\n\"This is also part of me. And I am still a good mother.\"" }, isIntegration: false },
      { title: { pt: "Largar a comparação", en: "Release comparison" }, prompt: { pt: "Escreve:\n\"Eu sou a mãe possível para o meu filho. E ele é o filho possível para mim. Não preciso de ser a mãe de mais ninguém.\"", en: "Write:\n\"I am the possible mother for my child. And they are the possible child for me. I don't need to be anyone else's mother.\"" }, isIntegration: false },
      { title: { pt: "Pertencer imperfeita", en: "Belong imperfect" }, prompt: { pt: "Escreve, devagar:\n\"Posso pertencer exatamente como sou. Fico, mesmo sem ser perfeita.\"", en: "Write slowly:\n\"I can belong exactly as I am. I stay, even without being perfect.\"" }, isIntegration: true },
    ],
    cautionZone: { pt: "Se notares isolamento extremo, incapacidade de pedir ajuda, sentimentos persistentes de inutilidade, autodesvalorização intensa, depressão, ou qualquer ideia de auto-agressão, procura apoio profissional. Quem tem vergonha custa a pedir ajuda, mas merece-a.", en: "If you notice extreme isolation, inability to ask for help, persistent feelings of worthlessness, intense self-deprecation, depression, or any idea of self-harm, seek professional support." },
  },
  magoa: {
    name: "magoa",
    title: { pt: "A mágoa", en: "The hurt" },
    tag: { pt: "o que te dói", en: "what hurts" },
    description: { pt: "As feridas de filha que sangram quando és mãe.", en: "The daughter wounds that bleed when you are a mother." },
    audioScript: { pt: `Chegámos a um lugar mais fundo. E só chegámos aqui agora, depois de todo o resto, porque precisavas de ter algum chão debaixo dos pés antes de tocar nisto. Se sentires que é demais, podes parar. Não há pressa nenhuma.

Vamos falar de ti como filha. Porque tu, antes de seres mãe, foste a filha de alguém. E talvez aí, no princípio de tudo, algo te tenha faltado.

Talvez te tenha faltado presença. Ou colo. Ou proteção. Ou que te vissem, que te escolhessem, que te dissessem que eras suficiente. Não vou minimizar isso, nem te vou dizer que foi por amor, nem que ela fez o melhor que pôde, porque essas frases, ditas cedo demais, são uma forma de te calar. Primeiro, a verdade: algo faltou. E doeu. E ainda dói.

Deixa essa dor existir um instante, sem a corrigir. A mágoa, muitas vezes, esconde um luto que nunca se chorou, o luto da mãe que tu precisavas e não tiveste. Tens direito a esse luto.

Mas quero mostrar-te uma coisa sobre a mágoa, com todo o cuidado. A mágoa tem o olhar voltado para trás. Uma parte de ti ficou ali, naquela idade, à espera. À espera de que um dia, finalmente, ela te dê o que não deu. Que mude. Que se torne a mãe que devia ter sido. E enquanto esperas, não consegues seguir, porque uma parte de ti ainda está parada à porta da infância, à espera de uma entrega que talvez nunca venha.

O movimento que liberta não é perdoar à força. É outra coisa, mais subtil e mais tua. É parar de esperar o que não virá, para poderes finalmente viver com o que tens.

Vamos devagar. Primeiro, vês a falta, e já o fizemos. Algo faltou. Depois, deixas a dor ser dor, sem pressa de a resolver.

Depois, uma diferenciação importante: separar o que a tua mãe pôde dar do que tu precisavas receber. Nem sempre coincidem. Ela pode ter dado tudo o que tinha, e mesmo assim não ter sido o que tu precisavas. As duas coisas são verdade ao mesmo tempo. Ela com os limites dela, tu com as tuas necessidades legítimas.

E aqui, um passo que muda tudo: ver a tua mãe como pessoa. Não só como a tua mãe, não só como a falha, não só como a mãe ideal que querias. Como uma mulher, com a história dela, com as feridas dela, com o que ela própria não recebeu. Isto não a desculpa. Só a torna humana. E uma mãe humana é mais fácil de pousar do que um ideal que nunca existiu.

Depois, receber o que veio. Esta é difícil. Não quer dizer que foi suficiente. Quer dizer reconhecer: foi isto que veio. Houve isto, pelo menos isto. E em vez de recusares tudo porque não foi tudo, recebes o que houve, por pouco que tenha sido, porque recusar até o pouco deixa-te de mãos completamente vazias.

E o movimento mais importante de todos, aquele a que na constelação se chama tomar a vida. Ela deu-te a vida. Seja o que for que faltou depois, a vida ela deu-ta. E tu podes recebê-la, e fazer dela algo bom, sem ficares à espera do resto. Diz, devagar, se sentires que podes: tu deste-me a vida, recebo-a, e faço algo bom com ela.

E então sais do lugar de filha que espera, e entras no teu lugar de mulher inteira. Sou tua filha, tu és minha mãe, recebi o que pudeste dar, reconheço o que faltou, e agora sigo o meu caminho.

Repara que não te pedi para gostares do que aconteceu, nem para fingires que não doeu. Só para parares de viver à espera de uma entrega que já não vem, e voltares a vida para a frente, para onde ela ainda pode acontecer.

Quando estiveres pronta, escreve. E se chorares, deixa. As lágrimas aqui são o luto a sair, e isso é cura.`, en: "English version coming soon." },
    reading: { pt: `Antes de seres mãe, foste filha. E talvez aí algo te tenha faltado: presença, colo, proteção, ser vista, ser escolhida. A verdade primeiro, sem minimizar: algo faltou, doeu, e ainda dói. A mágoa esconde muitas vezes um luto que nunca se chorou, e tens direito a ele.

Mas a mágoa tem o olhar voltado para trás. Uma parte de ti ficou à espera de que ela um dia mude e dê o que não deu. E enquanto esperas, não segues.

O movimento não é perdoar à força, é parar de esperar o que não virá, para viver com o que tens: ver a falta, honrar a dor, diferenciar (o que ela pôde dar vs o que tu precisavas, nem sempre coincidem), ver a mãe como pessoa (com a história e as feridas dela, o que não a desculpa, só a torna humana), receber o que veio ("não foi suficiente, mas foi isto que veio"), e tomar a vida ("tu deste-me a vida, recebo-a, e faço dela algo bom").

"Sou tua filha, tu és minha mãe, recebi o que pudeste dar, reconheço o que faltou, e sigo o meu caminho."

Não é gostar do que aconteceu. É parar de viver à espera, e voltar a vida para a frente.`, en: "English version coming soon." },
    exerciseIntro: { pt: "Devagar, com cuidado contigo. Se em algum passo a dor for grande demais, para.", en: "Slowly, with care for yourself. If the pain grows too great at any step, stop." },
    steps: [
      { title: { pt: "Ver a falta", en: "See the lack" }, prompt: { pt: "Escreve, sem minimizar:\n\"O que me faltou foi...\"", en: "Write, without minimising:\n\"What I lacked was...\"" }, isIntegration: false },
      { title: { pt: "Honrar a dor", en: "Honour the pain" }, prompt: { pt: "Não corrijas o que escreveste. Só acrescenta:\n\"Isto doeu. Ainda dói. E tenho direito a esta dor.\"\nFica um instante com isto. Se vierem lágrimas, deixa.", en: "Don't correct what you wrote. Just add:\n\"This hurt. It still hurts. And I have the right to this pain.\"\nStay with this a moment. If tears come, let them." }, isIntegration: false },
      { title: { pt: "Diferenciar", en: "Differentiate" }, prompt: { pt: "O que é que a minha mãe pôde dar, com o que ela tinha?\nO que é que eu precisava de receber, e não coincidiu?", en: "What could my mother give, with what she had?\nWhat did I need to receive, that didn't match?" }, isIntegration: false },
      { title: { pt: "Ver a mãe como pessoa", en: "See your mother as a person" }, prompt: { pt: "O que sabes da história da tua mãe? Do que ela própria não recebeu? Escreve-a como mulher, não só como tua mãe.", en: "What do you know of your mother's story? Of what she herself didn't receive? Write about her as a woman, not just as your mother." }, isIntegration: false },
      { title: { pt: "Receber o que veio", en: "Receive what came" }, prompt: { pt: "Escreve:\n\"Não foi tudo o que eu precisava. Mas houve isto: ...\" (escreve o que houve, por pouco que pareça)", en: "Write:\n\"It wasn't all I needed. But there was this: ...\" (write what there was, however little)" }, isIntegration: false },
      { title: { pt: "Tomar a vida", en: "Take life" }, prompt: { pt: "Se sentires que podes, escreve:\n\"Tu deste-me a vida. Recebo-a. E faço dela algo bom. Sigo o meu caminho.\"", en: "If you feel you can, write:\n\"You gave me life. I receive it. And I make something good of it. I follow my own path.\"" }, isIntegration: true },
    ],
    cautionZone: { pt: "Se a mágoa tocar violência, abuso, negligência severa, ou trauma infantil significativo, procura acompanhamento de alguém preparado. Isto que carregas merece apoio profissional, e não tens de o atravessar sozinha. A app nunca diz \"basta aceitar a tua mãe\" nem \"tudo aconteceu por amor\".", en: "If the hurt touches violence, abuse, severe neglect, or significant childhood trauma, seek professional accompaniment. What you carry deserves professional support." },
  },
  rancor: {
    name: "rancor",
    title: { pt: "O rancor", en: "The resentment" },
    tag: { pt: "o que não largas", en: "what you won't release" },
    description: { pt: "A raiva de quem te deixou sozinha.", en: "The anger at who left you alone." },
    audioScript: { pt: `Chegámos ao fim do caminho, e ao que costuma ser o mais difícil de largar. O rancor. Aquela raiva que ficou, contra o pai que não foi pai, contra quem te deixou sozinha, contra a vida que te deu esta carga toda.

E quero começar por te dizer uma coisa que talvez nunca te tenham dito: o teu rancor não é um defeito de caráter. É uma ferida que ainda não foi reconhecida. Por baixo de toda a raiva, há quase sempre uma dor que ninguém viu, uma tristeza, um abandono, uma desilusão. O rancor é a casca dura que se forma por cima da ferida para a proteger. Enquanto estás zangada, não tens de tocar na parte que dói mesmo. Por isso, antes de tudo, eu não te vou pedir para largares a raiva. Vou pedir para olharmos o que ela está a proteger.

E quero ser muito clara numa coisa, porque é importante. Se o teu rancor é contra alguém que te fez mal a sério, que te bateu, que te abusou, que te violentou, então esse rancor é são, é justo, e é teu para o sentires o tempo que precisares. Nada do que eu disser aqui te pede para perdoar, para reconciliar, ou para fingir que aquilo "tinha de acontecer". Não tinha. Se é esse o teu caso, este caminho não é para ti agora, e o que mereces é alguém preparado ao teu lado, não um exercício numa app. Procura essa pessoa. A sério.

Mas se o teu rancor é o de uma ferida que já podes olhar, daquelas que não são abuso mas magoaram fundo, a ausência, a desilusão, o que faltou, então vamos fazer este último movimento juntas.

Primeiro, ver a ferida que está por baixo da raiva. Não a raiva, a ferida. O que é que doeu mesmo? Isto teve consequências na tua vida? Diz a verdade: isto doeu, e teve um preço.

Depois, uma diferenciação. Separar o que o outro fez, de quem o outro é. A pessoa não é só o erro dela. O teu pai, por exemplo, não é só "o ausente", é uma pessoa inteira que, entre outras coisas, falhou nisto. Ver a pessoa para além do ato não a desculpa, só te tira a ti o fardo de a reduzires a um inimigo que carregas para todo o lado.

Depois, devolver a responsabilidade. Tu andaste a carregar o erro dele como se fosse um peso teu. Não é. Diz, por dentro: isto que tu fizeste, pertence-te. As consequências das tuas escolhas, pertencem-te. Eu pousei-as. Não são minhas para carregar.

E aqui o movimento mais sistémico de todos: incluir sem aprovar. Isto não é absolver, não é dizer que está tudo bem. É só reconhecer um facto que a raiva tenta apagar: tu pertences ao sistema. Tu és o meu pai. Tu és a minha mãe. Tu és o pai do meu filho. Mesmo com tudo o que falhou. Porque quando excluímos alguém por completo, quando o transformamos só no seu erro, ficamos presos a ele para sempre, congelados naquela raiva. Incluí-lo como é, falho e tudo, é o que finalmente te solta.

Depois, aceitar a realidade. Não gostar. Não concordar. Só parar de lutar contra o que já aconteceu. Foi assim. Eu queria que tivesse sido diferente. Não foi. E enquanto exiges que o passado tivesse sido outro, ficas presa nele.

E por fim, o verdadeiro objetivo de tudo isto, que não é o outro, és tu. Recuperar a tua energia. Toda a força que andava investida em corrigir o passado, em remoer, em esperar um pedido de desculpas que talvez nunca venha, essa força volta para a tua vida, para a frente, para onde ainda podes ser feliz. Diz, devagar: isto aconteceu, teve um preço, e agora volto-me para a minha vida.

E repara, agora que chegámos ao fim. Lembras-te da mágoa, no caminho atrás? O rancor estava a protegê-la. Quando já olhaste a ferida de frente, a raiva já não tem tanto que guardar. Por isso é que deixámos o rancor para o fim. Ele afrouxa quando a dor por baixo já foi vista.

Quando estiveres pronta, escreve. E sai daqui mais leve, com a tua energia de volta nas tuas mãos.`, en: "English version coming soon." },
    reading: { pt: `O rancor não é defeito de caráter, é uma ferida que ainda não foi reconhecida. Por baixo da raiva há quase sempre tristeza, abandono, desilusão. O rancor é a casca dura sobre a ferida: enquanto estás zangada, não tocas no que dói mesmo.

Importante: se o rancor é contra quem te fez mal a sério (violência, abuso), ele é são e justo. Nada aqui te pede para perdoar ou reconciliar, e o que mereces é apoio profissional, não um exercício. Este caminho é para feridas que já podes olhar (a ausência, a desilusão, o que faltou).

O movimento: ver a ferida por baixo da raiva ("isto doeu, teve um preço"), diferenciar o que o outro fez de quem o outro é (a pessoa não é só o erro), devolver a responsabilidade ("isto pertence-te, não é meu para carregar"), incluir sem aprovar ("tu pertences ao sistema, és o meu pai/mãe", o que não absolve, mas solta), aceitar a realidade ("foi assim, queria que fosse diferente, não foi"), e voltar à própria vida (recuperar a energia investida em corrigir o passado).

"Isto aconteceu, teve um preço, e agora volto-me para a minha vida."

O rancor protegia a mágoa. Por isso vem no fim: quando a ferida já foi vista, a raiva afrouxa.`, en: "English version coming soon." },
    exerciseIntro: { pt: "Devagar. Lê primeiro a nota de cautela no fim se o teu rancor for de algo grave.", en: "Slowly. Read the caution note at the end first if your resentment is from something serious." },
    steps: [
      { title: { pt: "Ver a ferida", en: "See the wound" }, prompt: { pt: "Por baixo da raiva, o que está? Escreve a dor, não a raiva:\n\"Por baixo da minha raiva, o que doeu mesmo foi...\"", en: "Beneath the anger, what is there? Write the pain, not the anger:\n\"Beneath my anger, what really hurt was...\"" }, isIntegration: false },
      { title: { pt: "Diferenciar", en: "Differentiate" }, prompt: { pt: "A pessoa de quem tens rancor: escreve uma coisa que ela fez (o ato) e uma coisa que ela é para além disso (a pessoa inteira). Não para a desculpar, para a não reduzires a um inimigo.", en: "The person you resent: write one thing they did (the act) and one thing they are beyond that (the whole person). Not to excuse, but to not reduce them to an enemy." }, isIntegration: false },
      { title: { pt: "Devolver", en: "Return" }, prompt: { pt: "Escreve:\n\"Isto que fizeste, pertence-te. As consequências das tuas escolhas, pertencem-te. Eu pouso-as. Não são minhas para carregar.\"", en: "Write:\n\"What you did belongs to you. The consequences of your choices belong to you. I set them down. They are not mine to carry.\"" }, isIntegration: false },
      { title: { pt: "Incluir sem aprovar", en: "Include without approving" }, prompt: { pt: "Se sentires que podes (e só se for uma ferida não traumática), escreve:\n\"Tu pertences. És o/a [pai, mãe, pai do meu filho]. Não aprovo o que fizeste. E mesmo assim, reconheço o teu lugar.\"", en: "If you feel you can (only for non-traumatic wounds), write:\n\"You belong. You are [father, mother, my child's father]. I don't approve of what you did. And still, I recognise your place.\"" }, isIntegration: false },
      { title: { pt: "Aceitar a realidade", en: "Accept reality" }, prompt: { pt: "Escreve:\n\"Queria que tivesse sido diferente. Não foi. Foi assim.\"", en: "Write:\n\"I wished it had been different. It wasn't. It was so.\"" }, isIntegration: false },
      { title: { pt: "Voltar à tua vida", en: "Return to your life" }, prompt: { pt: "Escreve para onde queres pôr, a partir de agora, a energia que andava presa nessa raiva:\n\"A minha energia volta para...\"", en: "Write where you want to direct the energy that was stuck in that anger:\n\"My energy returns to...\"" }, isIntegration: true },
    ],
    cautionZone: { pt: "Se o rancor for contra alguém que te fez mal a sério (violência, abuso, agressão), ele é legítimo e a app não pede para o largar. Procura apoio especializado. A app nunca pressiona para perdoar, reconciliar, honrar um agressor, ou restabelecer contacto.", en: "If the resentment is towards someone who seriously harmed you (violence, abuse, assault), it is legitimate and this app does not ask you to let go. Seek specialised support. The app never pressures to forgive, reconcile, honour an aggressor, or re-establish contact." },
  },
};
