# Presença da Vivianne no percurso, prompts Midjourney

Sete imagens, uma por bloqueio, geradas no Midjourney **v7** com a tua
referência (`--oref`, Omni Reference) para ser mesmo o teu rosto, com **postura
própria de cada contexto** (nada genérico). És a presença calma que acompanha,
nunca o sofrimento em si.

## Como usar

1. Cola cada prompt no Midjourney v7 (um por bloqueio). Começam por
   `same woman serene` de propósito, para reforçar a coerência.
2. Em v7 a referência é Omni Reference: `--oref <url> --ow 800` (o `--ow` vai
   até 1000). O `--cw` não é suportado em v7.
3. Guarda cada imagem como `public/images/journey/<bloqueio>.jpg` com estes
   nomes exactos: `peso`, `vazio`, `culpa`, `medo`, `vergonha`, `magoa`,
   `rancor`. Aparecem sozinhas no topo de cada bloqueio.
4. A faixa no topo é `3:2`, recortada ao centro. Convém a Vivianne ficar
   centrada.

A referência de personagem usada está em `src/content/journey-companions.ts`
(`CHARACTER_REF`), com as cenas e os parâmetros, caso queiras afinar.

## Os 7 prompts

### Peso (`peso.jpg`)

```
same woman serene gently setting a heavy woven basket down onto a rustic wooden table, shoulders softening, the quiet exhale of relief as a weight is finally released, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --oref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --ow 800 --ar 3:2 --style raw --v 7
```

### Vazio (`vazio.jpg`)

```
same woman serene standing by a sunlit window holding a warm cup with both hands, soft morning light filling a quiet warm room, a feeling of being gently filled and present, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --oref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --ow 800 --ar 3:2 --style raw --v 7
```

### Culpa (`culpa.jpg`)

```
same woman serene resting one open hand softly over her own heart, eyes lowered then lifting with gentle self-forgiveness, tender compassion toward herself, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --oref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --ow 800 --ar 3:2 --style raw --v 7
```

### Medo (`medo.jpg`)

```
same woman serene standing calmly in an open doorway facing soft morning light, one foot stepping forward with quiet courage, steady and unafraid, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --oref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --ow 800 --ar 3:2 --style raw --v 7
```

### Vergonha (`vergonha.jpg`)

```
same woman serene standing tall in soft warm light, head lifted gently, shoulders open and at ease, dignified self-acceptance with nothing to hide, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --oref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --ow 800 --ar 3:2 --style raw --v 7
```

### Mágoa (`magoa.jpg`)

```
same woman serene cradling a small green seedling in her cupped hands, tending it tenderly, the gentle healing of an old wound, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --oref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --ow 800 --ar 3:2 --style raw --v 7
```

### Rancor (`rancor.jpg`)

```
same woman serene opening both hands toward a golden field at sunset, releasing dried leaves to the wind, letting go into freedom and lightness, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --oref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --ow 800 --ar 3:2 --style raw --v 7
```
