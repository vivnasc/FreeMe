const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SLIDES = [
  {
    layout: "capa",
    body: "Um psiquiatra estudou mães\npor 40 anos. O que descobriu\nsobre a culpa materna\nassustou a comunidade médica.",
    bold: ["40 anos", "culpa materna", "assustou"],
    day: 1,
  },
  {
    layout: "conteudo",
    body: "A culpa não as torna\nmelhores mães.\n\nTorna-as mães que\nnão conseguem educar.",
    bold: ["não as torna melhores mães", "não conseguem educar"],
    day: 1,
  },
  {
    layout: "capa",
    body: "Um estudo de Harvard analisou\n12.000 mães.\n\n87% carregam responsabilidades\nque não são suas.\nE nem sabem.",
    bold: ["12.000 mães", "87%", "não são suas"],
    day: 3,
  },
  {
    layout: "citacao",
    body: "Amar não exige desapareceres.\nCuidar não exige anulares-te.\nServir não exige abandonares-te.",
    day: 6,
  },
  {
    layout: "cta",
    body: "7 perguntas. 2 minutos.\nDescobre qual dos 7 bloqueios\nte prende mais.\n\nDiagnóstico grátis.",
    bold: ["7 perguntas", "2 minutos"],
    day: 7,
  },
];

function applyBold(text, bolds) {
  if (!bolds || bolds.length === 0) return text.replace(/\n/g, '<br>');
  let html = text;
  for (const b of bolds) {
    html = html.replace(b, `<strong>${b}</strong>`);
  }
  return html.replace(/\n/g, '<br>');
}

function buildHTML(slide) {
  const palettes = {
    capa: { bg: '#8C4A36', text: '#FBF4EC', accent: '#C87A5B' },
    conteudo: { bg: '#FBF4EC', text: '#2E241D', accent: '#8C4A36' },
    citacao: { bg: '#F3E4D6', text: '#8C4A36', accent: '#7D8A6A' },
    cta: { bg: '#7D8A6A', text: '#FBF4EC', accent: '#F3E4D6' },
  };
  const p = palettes[slide.layout] || palettes.conteudo;
  const bodyHTML = applyBold(slide.body, slide.bold);

  return `<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Outfit:wght@200;300;400;500;600&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1350px;
    background: ${p.bg};
    color: ${p.text};
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px;
    font-family: 'Outfit', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .grain {
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
  }
  .meta {
    position: absolute; top: 60px; left: 80px; right: 80px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 18px; letter-spacing: 0.15em; text-transform: uppercase;
    opacity: 0.4;
  }
  .body {
    font-size: ${slide.layout === 'capa' ? '52px' : slide.layout === 'citacao' ? '48px' : '46px'};
    line-height: 1.35;
    text-align: ${slide.layout === 'citacao' ? 'center' : 'left'};
    font-weight: ${slide.layout === 'capa' ? '300' : '300'};
    font-family: ${slide.layout === 'citacao' ? "'Fraunces', serif" : "'Outfit', sans-serif"};
    font-style: ${slide.layout === 'citacao' ? 'italic' : 'normal'};
    max-width: 920px;
    position: relative; z-index: 1;
  }
  .body strong {
    font-weight: 600;
    color: ${slide.layout === 'capa' ? '#F0C9B0' : p.accent};
  }
  .swipe {
    position: absolute; bottom: 60px; right: 80px;
    display: flex; align-items: center; gap: 8px;
    font-size: 16px; opacity: 0.4; letter-spacing: 0.1em;
  }
  .swipe-arrow { font-size: 22px; }
  .brand {
    position: absolute; bottom: 60px; left: 80px;
    display: flex; align-items: center; gap: 12px;
    font-size: 16px; opacity: 0.35; letter-spacing: 0.08em;
  }
  .spiral { width: 28px; height: 28px; }
  .dots {
    position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 6px;
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: ${p.text}; opacity: 0.15; }
  .dot.active { opacity: 0.6; }
  .cta-btn {
    margin-top: 40px;
    display: inline-block;
    padding: 20px 52px;
    border-radius: 50px;
    background: ${p.text};
    color: ${p.bg};
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.03em;
  }
</style>
</head>
<body>
  <div class="grain"></div>
  <div class="meta">
    <span>FreeMe</span>
    <span>Dia ${slide.day}</span>
  </div>
  <div class="body">${bodyHTML}</div>
  ${slide.layout === 'capa' ? '<div class="swipe"><span>Arraste para o lado</span><span class="swipe-arrow">→</span></div>' : ''}
  ${slide.layout === 'cta' ? '<div class="cta-btn">freeme.viviannedossantos.com</div>' : ''}
  <div class="brand">
    <svg class="spiral" viewBox="0 0 512 512"><path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425" fill="none" stroke="${p.text}" stroke-width="14" stroke-linecap="round" opacity="0.4"/></svg>
    <span>viviannedossantos</span>
  </div>
  <div class="dots">${Array.from({length: 10}, (_, i) => `<div class="dot${i === 0 ? ' active' : ''}"></div>`).join('')}</div>
</body>
</html>`;
}

(async () => {
  const outDir = path.join(__dirname, 'slide-samples');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (let i = 0; i < SLIDES.length; i++) {
    const slide = SLIDES[i];
    const html = buildHTML(slide);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({
      path: path.join(outDir, `slide-${i + 1}-${slide.layout}.png`),
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
    });
    await page.close();
    console.log(`✓ slide-${i + 1}-${slide.layout}`);
  }

  await browser.close();
  console.log(`\nDone. ${SLIDES.length} slides in ${outDir}`);
})();
