# Presença da Vivianne no percurso, prompts Midjourney

Sete imagens, uma por bloqueio, geradas no Midjourney com a tua referência de
personagem (`--cref`) para ser mesmo o teu rosto, com **postura própria de cada
contexto** (nada genérico). És a presença calma que acompanha, nunca o
sofrimento em si.

## Como usar

1. Cola cada prompt no Midjourney (um por bloqueio).
2. `--cw 50` mantém o teu rosto mas deixa a cena e a postura mudar. Sobe para
   `--cw 100` para fixar também roupa e cabelo; desce para `--cw 0` para só o
   rosto.
3. Em Midjourney **v7** troca `--cref <url>` por `--oref <url>` e `--cw` por
   `--ow` (a referência de personagem chama-se Omni Reference no v7).
4. Guarda cada imagem como `public/images/journey/<bloqueio>.jpg` com estes
   nomes exactos: `peso`, `vazio`, `culpa`, `medo`, `vergonha`, `magoa`,
   `rancor`. Aparecem sozinhas no topo de cada bloqueio.

A referência de personagem usada está em `src/content/journey-companions.ts`
(`CHARACTER_REF`), com as cenas e os parâmetros, caso queiras afinar.

## Os 7 prompts

### Peso (`peso.jpg`)

```
A serene woman gently setting a heavy woven basket down onto a rustic wooden table, shoulders softening, the quiet exhale of relief as a weight is finally released, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --cref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --cw 50 --ar 3:2 --style raw --v 6.1
```

### Vazio (`vazio.jpg`)

```
A serene woman standing by a sunlit window holding a warm cup with both hands, soft morning light filling a quiet warm room, a feeling of being gently filled and present, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --cref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --cw 50 --ar 3:2 --style raw --v 6.1
```

### Culpa (`culpa.jpg`)

```
A serene woman resting one open hand softly over her own heart, eyes lowered then lifting with gentle self-forgiveness, tender compassion toward herself, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --cref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --cw 50 --ar 3:2 --style raw --v 6.1
```

### Medo (`medo.jpg`)

```
A serene woman standing calmly in an open doorway facing soft morning light, one foot stepping forward with quiet courage, steady and unafraid, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --cref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --cw 50 --ar 3:2 --style raw --v 6.1
```

### Vergonha (`vergonha.jpg`)

```
A serene woman standing tall in soft warm light, head lifted gently, shoulders open and at ease, dignified self-acceptance with nothing to hide, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --cref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --cw 50 --ar 3:2 --style raw --v 6.1
```

### Mágoa (`magoa.jpg`)

```
A serene woman cradling a small green seedling in her cupped hands, tending it tenderly, the gentle healing of an old wound, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --cref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --cw 50 --ar 3:2 --style raw --v 6.1
```

### Rancor (`rancor.jpg`)

```
A serene woman opening both hands toward a golden field at sunset, releasing dried leaves to the wind, letting go into freedom and lightness, wearing earthy terracotta and cream natural linen, warm golden natural light, cinematic photographic, shallow depth of field, terracotta and cream palette, hopeful and emotionally warm --cref https://cdn.midjourney.com/u/9e6b2fad-a231-497f-9b71-c772cb0e82cd/4c7c7ed6d9a2502d58373d2b0f47824679a64746448f6e1581a0be01baf02e67_384_N.png --cw 50 --ar 3:2 --style raw --v 6.1
```
