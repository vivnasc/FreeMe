// FreeMe slide template — 3 modos visuais que respeitam a identidade do produto:
//   1. photo-cream: foto top 60%, bloco creme/areia bottom 40% (texto terracota)
//   2. photo-dark:  foto cheia, gradiente escuro bottom 50% (texto creme + bold ouro)
//   3. type-only:   sem foto, fundo solido, tipografia centrada (bold ouro/terracota)
//
// Cada slide.layout (capa, conteudo, citacao, cta, assinatura, kinetic-line)
// mapeia para um destes 3 modos consoante tenha foto ou nao.

const PALETTE = {
  barro: "#8C4A36",
  barro2: "#9A5A43",
  terracota: "#C87A5B",
  areia: "#F3E4D6",
  areia2: "#EAD6C3",
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

function applyBold(body, boldList, boldColor) {
  let html = escapeHtml(body).replace(/\n/g, "<br />");
  for (const phrase of boldList || []) {
    const escaped = escapeHtml(phrase);
    const re = new RegExp(escapeRegex(escaped), "g");
    html = html.replace(re, `<strong style="color:${boldColor};font-weight:500">${escaped}</strong>`);
  }
  return html;
}

// Decide qual dos 3 modos visuais usar para um (layout, hasPhoto)
function visualModeFor(layout, hasPhoto) {
  if (layout === "kinetic-line") return hasPhoto ? "photo-dark" : "type-on-carvao";
  if (layout === "capa") return hasPhoto ? "photo-dark" : "type-on-barro";
  if (layout === "conteudo") return hasPhoto ? "photo-cream" : "type-on-creme";
  if (layout === "citacao") return "type-on-areia";
  if (layout === "cta") return "type-on-salvia";
  if (layout === "assinatura") return "type-on-carvao";
  return hasPhoto ? "photo-cream" : "type-on-creme";
}

function dimensions(layout) {
  return layout === "kinetic-line" ? { w: 1080, h: 1920 } : { w: 1080, h: 1350 };
}

const SPIRAL_SVG = `
  <svg viewBox="0 0 512 512" width="36" height="36" style="display:block">
    <path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425"
      fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round" />
  </svg>`;

function brandMark(color) {
  return `<div style="display:flex;align-items:center;gap:8px;color:${color};font-family:'Fraunces',serif;font-size:22px;font-style:italic;letter-spacing:.02em">${SPIRAL_SVG}FreeMe</div>`;
}

function handleSig(color) {
  return `<div style="color:${color};font-family:'Outfit',sans-serif;font-size:18px;letter-spacing:.05em;opacity:.7">@vivianne.dos.santos</div>`;
}

// Ghost number ornamental (estilo SyncHim 04) — grande, faded, top-right
function ghostNum(num, total, color) {
  if (!num || !total || num < 1) return "";
  const padded = String(num).padStart(2, "0");
  return `<div style="position:absolute;top:80px;right:80px;font-family:'Fraunces',serif;font-style:italic;font-size:280px;line-height:.85;color:${color};opacity:.13;pointer-events:none;z-index:1">${padded}</div>`;
}

// Dots indicator slides (estilo IG carousel) — bottom center
function slideDots(num, total, color) {
  if (!num || !total || total <= 1) return "";
  const dots = Array.from({ length: total }, (_, i) =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};opacity:${i === num - 1 ? .9 : .25}"></span>`
  ).join("");
  return `<div style="position:absolute;bottom:48px;left:50%;transform:translateX(-50%);display:flex;gap:10px;align-items:center;z-index:5">${dots}</div>`;
}

export function buildSlideHTML(slide, opts = {}) {
  const { w, h } = dimensions(slide.layout);
  const hasPhoto = Boolean(opts.photoUrl);
  const mode = visualModeFor(slide.layout, hasPhoto);
  const slideIndex = opts.slideIndex; // 1-based
  const totalSlides = opts.totalSlides;
  const showDots = opts.isCarousel && totalSlides && totalSlides > 1 && slide.layout !== "assinatura";

  let bg = PALETTE.creme;
  let textBox = "";

  const boldOuro = PALETTE.ouro;
  const boldTerracota = PALETTE.terracota;

  switch (mode) {
    case "photo-cream": {
      // Foto domina (limpa ate 72%), transicao breve, cream zone so para texto (bottom 18%).
      bg = PALETTE.areia;
      const body = applyBold(slide.body, slide.bold, boldTerracota);
      textBox = `
        <div style="position:absolute;inset:0;background-image:url('${opts.photoUrl}');background-size:cover;background-position:center"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(243,228,214,0) 0%,rgba(243,228,214,0) 72%,rgba(243,228,214,0.4) 78%,${PALETTE.areia} 82%,${PALETTE.areia} 100%)"></div>
        <div style="position:absolute;top:24px;left:36px;color:${PALETTE.creme};z-index:3">${brandMark(PALETTE.creme)}</div>
        <div style="position:absolute;left:0;right:0;bottom:0;top:84%;padding:0 70px 90px;display:flex;flex-direction:column;justify-content:flex-end;z-index:3">
          <p style="font-family:'Outfit',sans-serif;font-weight:300;font-size:38px;line-height:1.25;color:${PALETTE.carvao}">${body}</p>
        </div>
        <div style="position:absolute;bottom:28px;left:70px;z-index:5">${handleSig(PALETTE.barro)}</div>`;
      break;
    }
    case "photo-dark": {
      // Foto cheia, gradiente carvao bottom 50%, texto creme + bold ouro
      const body = applyBold(slide.body, slide.bold, boldOuro);
      const isCapa = slide.layout === "capa";
      textBox = `
        <div style="position:absolute;inset:0;background-image:url('${opts.photoUrl}');background-size:cover;background-position:center"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02) 0%,rgba(46,36,29,.20) 35%,rgba(46,36,29,.70) 65%,rgba(46,36,29,.95) 100%)"></div>
        <div style="position:absolute;top:36px;left:48px;color:${PALETTE.creme}">${brandMark(PALETTE.creme)}</div>
        <div style="position:absolute;bottom:120px;left:0;right:0;padding:0 70px;color:${PALETTE.creme}">
          <p style="font-family:${isCapa ? "'Fraunces',serif" : "'Outfit',sans-serif"};font-weight:${isCapa ? 400 : 300};font-size:${isCapa ? 64 : 56}px;line-height:1.22">${body}</p>
        </div>
        <div style="position:absolute;bottom:48px;right:48px">${handleSig(PALETTE.creme)}</div>`;
      break;
    }
    case "type-on-creme": {
      bg = PALETTE.creme;
      const body = applyBold(slide.body, slide.bold, boldTerracota);
      const ghost = ghostNum(slideIndex, totalSlides, PALETTE.barro);
      textBox = `
        ${ghost}
        <div style="position:absolute;top:36px;left:48px;color:${PALETTE.barro};z-index:2">${brandMark(PALETTE.barro)}</div>
        <div style="position:absolute;inset:0;padding:160px 80px 180px;display:flex;align-items:center;z-index:2">
          <p style="font-family:'Outfit',sans-serif;font-weight:300;font-size:64px;line-height:1.32;color:${PALETTE.carvao};max-width:920px">${body}</p>
        </div>
        <div style="position:absolute;bottom:48px;left:80px;z-index:5">${handleSig(PALETTE.barro)}</div>`;
      break;
    }
    case "type-on-areia": {
      bg = PALETTE.areia;
      const body = applyBold(slide.body, slide.bold, boldTerracota);
      const ghost = ghostNum(slideIndex, totalSlides, PALETTE.barro);
      textBox = `
        ${ghost}
        <div style="position:absolute;top:36px;left:48px;color:${PALETTE.barro};z-index:2">${brandMark(PALETTE.barro)}</div>
        <div style="position:absolute;inset:0;padding:160px 80px 180px;display:flex;align-items:center;justify-content:center;z-index:2">
          <p style="font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:68px;line-height:1.3;color:${PALETTE.barro};text-align:center;max-width:900px">&ldquo;${body}&rdquo;</p>
        </div>
        <div style="position:absolute;bottom:48px;left:80px;z-index:5">${handleSig(PALETTE.barro)}</div>`;
      break;
    }
    case "type-on-barro": {
      bg = PALETTE.barro;
      const body = applyBold(slide.body, slide.bold, boldOuro);
      const ghost = ghostNum(slideIndex, totalSlides, PALETTE.creme);
      textBox = `
        ${ghost}
        <div style="position:absolute;top:36px;left:48px;color:${PALETTE.creme};z-index:2">${brandMark(PALETTE.creme)}</div>
        <div style="position:absolute;inset:0;padding:160px 80px 180px;display:flex;align-items:center;z-index:2">
          <p style="font-family:'Fraunces',serif;font-weight:400;font-size:78px;line-height:1.18;color:${PALETTE.creme};max-width:920px">${body}</p>
        </div>
        <div style="position:absolute;bottom:48px;left:80px;z-index:5">${handleSig(PALETTE.creme)}</div>`;
      break;
    }
    case "type-on-salvia": {
      const salviaProfunda = "#5A6857";
      bg = salviaProfunda;
      const body = applyBold(slide.body, slide.bold, PALETTE.ouro);
      const ghost = ghostNum(slideIndex, totalSlides, PALETTE.creme);
      textBox = `
        ${ghost}
        <div style="position:absolute;top:36px;left:48px;color:${PALETTE.creme};z-index:2">${brandMark(PALETTE.creme)}</div>
        <div style="position:absolute;inset:0;padding:160px 80px 180px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:2">
          <p style="font-family:'Outfit',sans-serif;font-weight:300;font-size:62px;line-height:1.3;color:${PALETTE.creme};max-width:920px;margin-bottom:64px">${body}</p>
          <div style="background:${PALETTE.creme};color:${salviaProfunda};padding:26px 60px;border-radius:999px;font-family:'Outfit',sans-serif;font-size:32px;font-weight:500">freeme.viviannedossantos.com</div>
        </div>
        <div style="position:absolute;bottom:48px;left:80px;z-index:5">${handleSig(PALETTE.creme)}</div>`;
      break;
    }
    case "type-on-carvao": {
      bg = PALETTE.carvao;
      const isAssinatura = slide.layout === "assinatura";
      const ghost = isAssinatura ? "" : ghostNum(slideIndex, totalSlides, PALETTE.creme);
      if (isAssinatura) {
        // Assinatura redesenhada: spiral grande + nome + tagline + linha + handle
        textBox = `
          <div style="position:absolute;top:36px;left:48px;color:${PALETTE.creme}">${brandMark(PALETTE.creme)}</div>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px">
            <div style="color:${PALETTE.terracota};margin-bottom:56px;width:140px;height:140px">${SPIRAL_SVG.replace('width="36" height="36"','width="140" height="140"').replace('stroke-width="22"','stroke-width="18"')}</div>
            <p style="font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:60px;color:${PALETTE.creme};margin-bottom:18px">Vivianne dos Santos</p>
            <div style="width:80px;height:1px;background:${PALETTE.terracota};opacity:.6;margin-bottom:18px"></div>
            <p style="font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:36px;color:${PALETTE.terracota};letter-spacing:.04em;margin-bottom:64px">A Travessia da Mãe</p>
            <p style="font-family:'Outfit',sans-serif;font-size:24px;color:${PALETTE.creme};opacity:.6;letter-spacing:.06em">@vivianne.dos.santos</p>
            <p style="font-family:'Outfit',sans-serif;font-size:20px;color:${PALETTE.creme};opacity:.4;letter-spacing:.04em;margin-top:8px">freeme.viviannedossantos.com</p>
          </div>`;
      } else {
        const body = applyBold(slide.body, slide.bold, boldOuro);
        textBox = `
          ${ghost}
          <div style="position:absolute;top:36px;left:48px;color:${PALETTE.creme};z-index:2">${brandMark(PALETTE.creme)}</div>
          <div style="position:absolute;inset:0;padding:160px 80px 180px;display:flex;align-items:center;z-index:2">
            <p style="font-family:'Outfit',sans-serif;font-weight:300;font-size:82px;line-height:1.22;color:${PALETTE.creme};max-width:920px">${body}</p>
          </div>
          <div style="position:absolute;bottom:48px;left:80px;z-index:5">${handleSig(PALETTE.creme)}</div>`;
      }
      break;
    }
  }

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Outfit:wght@200;300;400;500;600&display=block" rel="stylesheet" />
<style>* { margin:0; padding:0; box-sizing:border-box } html,body { width:${w}px; height:${h}px; overflow:hidden } body { background:${bg}; position:relative }</style>
</head><body>${textBox}${slideDots(slideIndex, totalSlides, mode.startsWith("photo") || mode.includes("barro") || mode.includes("salvia") || mode.includes("carvao") ? PALETTE.creme : PALETTE.barro)}<script>window.READY=true</script></body></html>`;
}
