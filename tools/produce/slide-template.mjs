// HTML template builder for FreeMe slide rendering.
// Matches the admin preview design. Used by the render pipeline.

const PALETTE = {
  barro: "#8C4A36",
  barro2: "#9A5A43",
  terracota: "#C87A5B",
  areia: "#F3E4D6",
  creme: "#FBF4EC",
  salvia: "#7D8A6A",
  carvao: "#2E241D",
  ouro: "#EBAE4A",
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyBold(body, boldList) {
  let html = escapeHtml(body).replace(/\n/g, "<br />");
  for (const phrase of boldList || []) {
    const escaped = escapeHtml(phrase);
    const re = new RegExp(escapeRegex(escaped), "g");
    html = html.replace(re, `<strong style="color:${PALETTE.ouro};font-weight:500">${escaped}</strong>`);
  }
  return html;
}

// width/height in px. 1080x1350 (4:5) for carousel, 1080x1920 (9:16) for video kinetic-line.
function dimensions(layout) {
  return layout === "kinetic-line" ? { w: 1080, h: 1920 } : { w: 1080, h: 1350 };
}

function bgFor(layout) {
  switch (layout) {
    case "capa": return { bg: PALETTE.barro, text: PALETTE.creme };
    case "conteudo": return { bg: PALETTE.creme, text: PALETTE.carvao };
    case "citacao": return { bg: PALETTE.areia, text: PALETTE.barro };
    case "cta": return { bg: PALETTE.salvia, text: PALETTE.creme };
    case "assinatura": return { bg: PALETTE.carvao, text: PALETTE.creme };
    case "kinetic-line": return { bg: PALETTE.carvao, text: PALETTE.creme };
    default: return { bg: PALETTE.creme, text: PALETTE.carvao };
  }
}

// Build the full HTML document for a single slide.
// `slide`: { layout, body, bold }
// `opts`: { photoUrl?, dayLabel?, isVideo? }
export function buildSlideHTML(slide, opts = {}) {
  const { w, h } = dimensions(slide.layout);
  const { bg, text } = bgFor(slide.layout);
  const body = applyBold(slide.body, slide.bold);
  const photoUrl = opts.photoUrl || null;

  const hasPhoto = Boolean(photoUrl);
  const textColorOnPhoto = "#FBF4EC";

  let inner = "";
  switch (slide.layout) {
    case "capa":
      inner = `
        <div class="frame capa">
          <p class="title">${body}</p>
          <p class="brand">FreeMe</p>
        </div>`;
      break;
    case "conteudo":
      inner = `<div class="frame conteudo"><p class="text">${body}</p></div>`;
      break;
    case "citacao":
      inner = `<div class="frame citacao"><p class="text">&ldquo;${body}&rdquo;</p></div>`;
      break;
    case "cta":
      inner = `
        <div class="frame cta">
          <p class="text">${body}</p>
          <div class="pill">freeme.viviannedossantos.com</div>
        </div>`;
      break;
    case "assinatura":
      inner = `
        <div class="frame assinatura">
          <svg viewBox="0 0 512 512" class="spiral">
            <path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425"
              fill="none" stroke="${PALETTE.terracota}" stroke-width="13" stroke-linecap="round" />
          </svg>
          <p class="name">${body}</p>
          <p class="handle">@viviannedossantos</p>
        </div>`;
      break;
    case "kinetic-line":
      inner = `<div class="frame kinetic"><p class="text">${body}</p></div>`;
      break;
    default:
      inner = `<div class="frame conteudo"><p class="text">${body}</p></div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Outfit:wght@200;300;400;500;600&display=block" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${w}px; height: ${h}px; overflow: hidden; }
  body {
    background: ${bg};
    color: ${hasPhoto ? textColorOnPhoto : text};
    font-family: 'Outfit', sans-serif;
    position: relative;
  }
  .photo {
    position: absolute; inset: 0;
    background-image: url('${photoUrl || ""}');
    background-size: cover;
    background-position: center;
  }
  .scrim {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%);
  }
  .frame {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 100px 90px;
    text-align: center;
    z-index: 2;
  }
  .frame.capa .title {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 72px;
    line-height: 1.18;
    letter-spacing: -0.02em;
  }
  .frame.capa .brand {
    margin-top: 36px;
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 34px;
    color: ${hasPhoto ? PALETTE.ouro : PALETTE.terracota};
    letter-spacing: 0.04em;
  }
  .frame.conteudo { justify-content: flex-start; padding-top: 200px; }
  .frame.conteudo .text {
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    font-size: 48px;
    line-height: 1.45;
    max-width: 880px;
    text-align: left;
  }
  .frame.citacao .text {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-weight: 300;
    font-size: 56px;
    line-height: 1.35;
    max-width: 860px;
  }
  .frame.cta .text {
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    font-size: 54px;
    line-height: 1.35;
    max-width: 880px;
    margin-bottom: 60px;
  }
  .frame.cta .pill {
    display: inline-block;
    background: ${PALETTE.creme};
    color: ${PALETTE.salvia};
    padding: 26px 64px;
    border-radius: 999px;
    font-family: 'Outfit', sans-serif;
    font-size: 32px;
    font-weight: 500;
  }
  .frame.assinatura .spiral { width: 96px; height: 96px; margin-bottom: 40px; }
  .frame.assinatura .name {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 42px;
    color: ${PALETTE.terracota};
    white-space: pre-line;
    line-height: 1.3;
  }
  .frame.assinatura .handle {
    margin-top: 18px;
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    color: rgba(251,244,236,0.55);
  }
  .frame.kinetic .text {
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    font-size: 70px;
    line-height: 1.3;
    max-width: 900px;
  }
  .corner {
    position: absolute; bottom: 50px; right: 70px; z-index: 3;
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    color: rgba(251,244,236,0.45);
    letter-spacing: 0.08em;
  }
</style>
</head>
<body>
${hasPhoto ? `<div class="photo"></div><div class="scrim"></div>` : ""}
${inner}
${opts.dayLabel ? `<div class="corner">${escapeHtml(opts.dayLabel)}</div>` : ""}
<script>window.READY = true;</script>
</body>
</html>`;
}
