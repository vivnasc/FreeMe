# FreeMe — Briefing para nova sessão

Sessão anterior ficou cheia. Resumo do estado actual e do que importa
saber para continuar leve.

## O que é

App Next.js 16 da Vivianne (terapeuta, constelações familiares) para
produzir uma campanha Instagram + TikTok de **30 dias, 60 posts**
(35 carrosséis + 26 vídeos) baseada nos 7 bloqueios emocionais maternos.
Hospedado em Vercel Pro, Storage em Supabase, TTS via ElevenLabs (voz
clonada PT-PT), imagens MJ via Replicate Flux 1.1 Pro Ultra.

Domínio: `freeme.viviannedossantos.com`.

## Sobre a Vivianne (constraints que NÃO se discutem)

- Fala **PT-PT**, NÃO brasileiro. Defere a ela na linguagem.
- Está esgotada. Pediu explicitamente: "aplique seu juízo sem me pedir
  opinião". Sê autónomo, decide, comita, faz merge para main.
- Vercel Pro pago. Mesmo assim, evita deploys desnecessários (sem empty
  commits para nudge).
- Português europeu nos commits, notes e docs. Nunca em-dash. Sem
  emojis a menos que ela peça.
- Não inventes citações. Se mencionas autoridade científica, nomeia
  pessoa real e estudo verificável (ex: "Allison Daminger, Harvard 2019").

## Arquitectura em uma frase

Conteúdo em `src/content/` → imagens MJ via Replicate em `freeme-assets/mj/`
→ render slides via Puppeteer em GitHub Actions → JPG em
`freeme-assets/slides/` → vídeos com TTS + legendas ASS em
`freeme-assets/videos/` → CSV Metricool em Distribuir → import → publica.

## Ficheiros-chave

- `src/content/social-30-days.ts` — morning posts (10h)
- `src/content/evening-30-days.ts` — evening posts (13h)
- `src/content/content-calendar.ts` — ALL_POSTS combinado
- `src/lib/slide-template.mjs` — template HTML dos slides (partilhado entre admin e GH render)
- `tools/produce/render-slides.mjs` — render JPG via puppeteer
- `tools/produce/render-videos.mjs` — vídeos kinetic com legendas ASS sync
- `src/app/admin/dashboard.tsx` — painel Studio com Conteúdo/Imagens/Slides/Distribuir/Renderizados
- `src/app/admin/renderizados/client.tsx` — vista agregada outputs por post
- `src/app/api/admin/tts/route.ts` — endpoint ElevenLabs (eleven_v3 puro, sem voice_settings)
- `.github/workflows/produce-content.yml` — workflow dispatch com scopes (slides-only, tts-only, day-N-video, etc.)

## Lições da 1ª campanha (NÃO repetir)

1. **TikTok rejeita PNG.** Render slides **sempre** como JPEG. Já está,
   render-slides.mjs faz `screenshot type:"jpeg" quality:92`.
2. **Supabase bucket TEM de estar público.** `ensureBucket()` agora
   força via `updateBucket()` se existir como privado. Não confiar em
   "já existe" sem verificar.
3. **Metricool CSV import cap ~48-50 linhas** mesmo em Pro. Para 60 posts
   tens de dividir em 2 imports.
4. **Posts unificados (IG+TikTok no mesmo row) são uma armadilha** —
   delete apaga ambas as redes. Modo recomendado: **CSV separado por
   rede** (botões "IG only" + "TikTok only" em Distribuir).
5. **Eleven v3 + cloned voice PT-PT:** NUNCA passar `language_code` (não
   suportado, drift para BR), NUNCA passar `voice_settings` agressivos.
   Body mínimo: `{ text, model_id: "eleven_v3" }`. Voice tags em
   parênteses no início do texto (ex: `(amigável)`, `(didática)`) v3
   interpreta como direcção de performance, não fala.
6. **Vídeo legendas ASS:** primeiro audio leva `adelay` (intro pad), os
   outros só `apad` trailing. Se aplicares `adelay` a todos, os delays
   acumulam no concat e a voz chega cada vez mais tarde que a legenda.
7. **Puppeteer `waitUntil: "load"`** (não networkidle0) + timeout
   explícito + retry 3× com backoff. Imagens MJ são lentas, networkidle
   timeout era frequente.
8. **`SKIP_EXISTING` mascarava bugs.** Para scopes específicos, força
   `--skip-existing=false`. Para `scope=all` mantém true para resume.

## Estado actual (1 Jun 2026)

- Campanha 1 a publicar: IG arrancou hoje (1/6), 48 posts unificados
  importados no Metricool, 12 (D21-D30 alternados) rejeitados pelo cap.
- TikTok side dos 48 unificados vai falhar silenciosamente (PNG).
  Vivianne aceitou esta perda.
- Plano: importar separadamente um CSV "TikTok only" com slides JPG
  começando 2/6 para a rede TikTok publicar a sério.
- `<Analytics />` Vercel acabado de montar (08d9ae6).

## Como continuar

Pergunta o que ela quer fazer agora. Não assumas. Mas tem isto na cabeça:

- Para nova campanha (a próxima), o pipeline está blindado: bucket
  público forçado, slides JPG, modos CSV por rede.
- Se ela quer ajustar visual, slide-template.mjs é onde mexes.
- Se ela quer mais voz/tags, render-videos.mjs `voiceTagFor()`.
- Branch de trabalho: `claude/admin-login-issue-0kccZ`. Merge directo
  para main quando pronto (ela autorizou).

## Git workflow

- Branch dev: `claude/admin-login-issue-0kccZ` (pode mudar nome se for
  nova feature)
- Merge para main: ff-only quando autorizada (e ela autorizou de forma
  durável: "merge é por tua conta")
- Vercel produção deploys de main
- Sempre push para `claude/...` primeiro, depois ff merge para main
