# PROMPT PARA CLAUDE CODE, APP FREEME

Cola na raiz de um projeto novo. App de percurso terapêutico para mães, sobre os 7 bloqueios emocionais que as prendem. Bilingue PT/EN. Executa por fases, parando no fim de cada uma.

Eu (Vivianne) forneço todo o conteúdo terapêutico em ficheiros markdown (os 7 bloqueios, o diagnóstico, a validação), que tu integras. NÃO inventes conteúdo terapêutico; usa o que te dou. O método é constelação sistémica e tem regras de segurança que NÃO podem ser violadas (ver secção segurança).

## STACK
- App: Expo / React Native (iOS e Android), ou Next.js PWA se preferir começar web. Decidir comigo na fase 0.
- Backend e dados: o MEU Supabase (auth, base de dados). Sem serviços externos pagos.
- Áudio: ficheiros de voz (minha voz ou clonada), guardados e tocados dentro da app, nunca no YouTube.
- Bilingue: PT (padrão) e EN, com i18n. O conteúdo terapêutico existe nas duas línguas (forneço PT primeiro, EN depois).
REGRA DE ESCRITA: sem travessões (em-dash, en-dash) em nenhum texto. Vírgula, ponto, dois pontos, parênteses.

## IDENTIDADE VISUAL
Paleta maternal e acolhedora, própria do FreeMe (diferente dos outros produtos da Vivianne):
- Barro / terracota profundo: #8C4A36
- Terracota luz: #C87A5B
- Areia (fundo claro): #F3E4D6
- Sálvia (serenidade): #7D8A6A
- Creme: #FBF4EC
- Carvão (texto): #2E241D
Fontes: Fraunces (serif, títulos e conteúdo de leitura longa) e Outfit (sans, interface).
Tom visual: muito espaço, suave, acolhedor, "colo". A cor acompanha a jornada (barro na entrada/ferida, areia na reflexão, sálvia na serenidade). Sem gamificação agressiva, sem streaks, sem números a pressionar.
Logo/ícone: ainda por definir (a Vivianne decide depois). Não inventar um; deixar espaço.

## ESTRUTURA DA APP

### 1. Entrada e conta
- Ecrã de abertura: nome FreeMe, slogan "a culpa não é boa conselheira" (PT) / equivalente EN, mensagem de acolhimento ("não vieste tarde, vieste a tempo de ti").
- Auth via Supabase (email, ou social). Percurso e anotações guardados por utilizadora, privados.

### 2. Diagnóstico (o espelho)
- 7 situações do dia a dia (forneço em DIAGNOSTICO_v2.md). Cada resposta soma, em silêncio, a um ou mais dos 7 bloqueios. As opções NUNCA nomeiam o bloqueio.
- No fim, calcula o(s) bloqueio(s) mais ativo(s) e devolve o MAPA (barras dos 7 bloqueios ordenadas, dominante nomeado com ternura).
- Monta um PERCURSO ADAPTATIVO (ver lógica abaixo), não uma escada fixa.

### 3. O percurso (os bloqueios)
- 7 bloqueios. ORDEM TERAPÊUTICA SEGURA: peso, vazio, culpa, medo, vergonha, mágoa, rancor. (a numeração dos ficheiros é só etiqueta temática, NÃO a ordem)
- Árvore de dependências: vazio<-peso; culpa<-peso+vazio; medo<-culpa; vergonha<-culpa; mágoa<-vergonha; rancor<-mágoa.
- A app NÃO obriga aos 7. Inclui os bloqueios ativos no diagnóstico e os de que dependem. Começa sempre pelo concreto (peso/vazio) para criar alívio e recursos antes do fundo (mágoa/rancor).
- Cada bloqueio tem 4 camadas (forneço o conteúdo em bloqueio-XX-*.md):
  a) ÁUDIO: a minha voz a guiar o movimento (8 a 13 min). Player simples, sem distrações.
  b) LEITURA: o texto para o olho.
  c) EXERCÍCIO: passos guiados, cada um com campo de escrita. O ÚLTIMO passo de cada bloqueio (a "integração") é guardado para a validação final.
  d) ANOTAÇÕES: privadas, guardadas no Supabase, por utilizadora e por bloqueio.
- Ritmo guiado: entre bloqueios, intervalo sugerido (ex: 3 a 4 dias). A app pode abrir o seguinte só após o intervalo (configurável). Protege a profundidade.

### 4. Validação final (a chegada)
- Forneço em VALIDACAO_FINAL.md. Recolhe as anotações de integração de cada bloqueio + o mapa inicial.
- 5 ecrãs: o antes (mapa inicial + 1ª anotação), o caminho (frases-chave de cada integração), o agora (última anotação vs primeira), a voz (áudio final meu), o símbolo (frase íntima, não certificado).
- A validação SÓ funciona se as anotações de integração forem guardadas. Garante essa persistência desde o início.

## SEGURANÇA (NÃO NEGOCIÁVEL, é uma app sobre feridas reais)
- A app usa PRINCÍPIOS da constelação como reflexão e auto-observação. NÃO é sessão clínica. Mostrar, na entrada e onde fizer sentido: "o FreeMe não substitui acompanhamento terapêutico."
- Cada bloqueio tem uma ZONA DE CAUTELA (definida no respetivo ficheiro). Implementa um mecanismo: se a utilizadora indicar (por escolha ou por palavras-chave nas anotações, se optarmos por detetar) temas de trauma grave (luto de filho, aborto, abuso, violência, suicídio, ideação de auto-agressão, sinais de depressão/burnout), a app NÃO conduz o movimento sistémico. Em vez disso, mostra acolhimento e encaminha para apoio profissional.
- NUNCA pressionar para perdoar, reconciliar, ou honrar um agressor (ver bloqueio rancor e mágoa).
- Incluir, acessível em qualquer ecrã, um botão discreto de "preciso de ajuda agora" com recursos de apoio (linhas de crise locais, a configurar por país; PT e Moçambique no mínimo).
- Não fazer interpretações automáticas de destinos nem atribuir causas sistémicas a sintomas.

## FASES DE EXECUÇÃO (parar no fim de cada uma)
0. Setup: escolher Expo vs PWA comigo. Projeto, Supabase, i18n PT/EN, paleta, fontes.
1. Auth + estrutura de dados (utilizadora, percurso, anotações, progresso). Garantir persistência das anotações.
2. Diagnóstico: 7 situações, cálculo, mapa, geração do percurso adaptativo.
3. Um bloqueio completo (começa pelo PESO): as 4 camadas (áudio, leitura, exercício com escrita guardada, anotações). Modelo para os outros.
4. Os restantes 6 bloqueios, no mesmo molde.
5. Ritmo guiado (intervalos entre bloqueios) e zona de cautela / encaminhamento de segurança.
6. Validação final (5 ecrãs).
7. Bilingue EN completo. Polish visual. Preparar publicação.

Começa pela Fase 0. Mostra-me as opções de stack e espera a minha decisão antes de avançar.

## FICHEIROS QUE EU FORNEÇO
- ESTRUTURA_TERAPEUTICA.md (a planta)
- SETE_BLOQUEIOS.md (visão dos 7 + constelação como método + cuidado ético)
- METODO_CONSTELACAO.md (o método sistémico de cada bloqueio + ordem terapêutica + árvore de dependências + segurança)
- DIAGNOSTICO_v2.md (o diagnóstico)
- VALIDACAO_FINAL.md (a validação)
- bloqueio-01-culpa-pt.md, bloqueio-02-medo-pt.md, bloqueio-03-vergonha-pt.md, bloqueio-04-rancor-pt.md, bloqueio-05-magoa-pt.md, bloqueio-06-vazio-pt.md, bloqueio-07-peso-pt.md (o conteúdo das 4 camadas de cada bloqueio)
- Áudios (a gravar): a minha voz para cada guião.
