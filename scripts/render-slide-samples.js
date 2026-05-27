const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SLIDES = [
  // CAPA com foto de fundo (MJ) + overlay + texto grande
  {
    layout: "capa-photo",
    body: "Um psiquiatra estudou mães\npor <strong>40 anos</strong>.\nO que descobriu sobre\na <strong>culpa materna</strong>\n<strong>assustou</strong> a comunidade médica.",
    photo: null, // placeholder: sem foto usa gradiente
  },
  // SPLIT: foto em cima, texto em baixo
  {
    layout: "split-top",
    body: "A culpa <strong>não as torna</strong>\n<strong>melhores mães</strong>.\n\nTorna-as mães que\n<strong>não conseguem educar</strong>.",
    photo: null,
  },
  // Texto puro, fundo creme, bold em barro
  {
    layout: "text-dark-on-light",
    body: "Porque quem se sente em dívida\ncede para compensar,\nnão põe limites,\npede desculpa por existir.\n\nE aos poucos\n<strong>abandona o seu lugar</strong>.",
  },
  // Citação serif italic, fundo areia
  {
    layout: "citacao",
    body: "Amar não exige\ndesapareceres.\nCuidar não exige\nanulares-te.\nServir não exige\nabandonares-te.",
  },
  // CTA final, fundo sálvia
  {
    layout: "cta",
    body: "Qual é o teu bloqueio?\n\nO FreeMe tem um\n<strong>diagnóstico grátis</strong>\nque te mostra em <strong>2 minutos</strong>.",
  },
];

function buildHTML(slide) {
  const layouts = {
    "capa-photo": {
      bg: `linear-gradient(180deg, rgba(140,74,54,0.15) 0%, rgba(94,53,39,0.85) 50%, rgba(46,36,29,0.95) 100%)`,
      text: '#FBF4EC',
      accent: '#F0C9B0',
      fontSize: '72px',
      fontWeight: '400',
      fontFamily: "'Outfit', sans-serif",
      textAlign: 'left',
      justify: 'flex-end',
      padding: '80px 70px 140px',
      hasSwipe: true,
    },
    "split-top": {
      bg: '#2E241D',
      text: '#FBF4EC',
      accent: '#C87A5B',
      fontSize: '66px',
      fontWeight: '300',
      fontFamily: "'Outfit', sans-serif",
      textAlign: 'left',
      justify: 'flex-end',
      padding: '0 70px 120px',
      splitPhoto: true,
    },
    "text-dark-on-light": {
      bg: '#FBF4EC',
      text: '#2E241D',
      accent: '#8C4A36',
      fontSize: '64px',
      fontWeight: '300',
      fontFamily: "'Outfit', sans-serif",
      textAlign: 'left',
      justify: 'center',
      padding: '80px 70px',
    },
    "citacao": {
      bg: '#F3E4D6',
      text: '#8C4A36',
      accent: '#7D8A6A',
      fontSize: '68px',
      fontWeight: '300',
      fontFamily: "'Fraunces', serif",
      fontStyle: 'italic',
      textAlign: 'left',
      justify: 'center',
      padding: '80px 70px',
    },
    "cta": {
      bg: '#7D8A6A',
      text: '#FBF4EC',
      accent: '#F3E4D6',
      fontSize: '64px',
      fontWeight: '400',
      fontFamily: "'Outfit', sans-serif",
      textAlign: 'center',
      justify: 'center',
      padding: '80px 70px',
      hasCTA: true,
    },
  };

  const L = layouts[slide.layout];

  return `<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Outfit:wght@200;300;400;500;600&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1350px;
    overflow: hidden; position: relative;
    font-family: ${L.fontFamily};
  }

  .bg-solid {
    position: absolute; inset: 0;
    background: ${L.bg};
  }

  .bg-gradient-photo {
    position: absolute; inset: 0;
    background: linear-gradient(180deg,
      rgba(140,74,54,0.05) 0%,
      rgba(140,74,54,0.3) 30%,
      rgba(94,53,39,0.75) 55%,
      rgba(46,36,29,0.92) 80%,
      rgba(46,36,29,0.98) 100%
    );
  }

  .bg-photo-placeholder {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 30%, #9A5A43 0%, #5E3527 60%, #2E241D 100%);
  }

  .split-photo-area {
    position: absolute; top: 0; left: 0; right: 0; height: 540px;
    background: radial-gradient(ellipse at 50% 50%, #9A5A43 0%, #5E3527 70%, #2E241D 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .split-photo-area .placeholder-text {
    font-family: 'Outfit', sans-serif; font-size: 20px; color: rgba(251,244,236,0.25);
    letter-spacing: 0.15em; text-transform: uppercase;
  }

  .grain {
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 2;
  }

  .content {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: ${L.textAlign === 'center' ? 'center' : 'flex-start'};
    justify-content: ${L.justify};
    padding: ${L.padding};
    z-index: 3;
  }

  .body {
    font-size: ${L.fontSize};
    line-height: 1.3;
    font-weight: ${L.fontWeight};
    color: ${L.text};
    text-align: ${L.textAlign};
    ${L.fontStyle ? `font-style: ${L.fontStyle};` : ''}
  }
  .body strong {
    font-weight: 600;
    color: ${L.accent};
  }

  .swipe {
    position: absolute; bottom: 70px; right: 70px;
    display: flex; align-items: center; gap: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 20px; color: ${L.text}; opacity: 0.4;
    letter-spacing: 0.08em; z-index: 4;
  }

  .brand {
    position: absolute; bottom: 70px; left: 70px;
    display: flex; align-items: center; gap: 10px;
    z-index: 4;
  }
  .brand span {
    font-family: 'Outfit', sans-serif;
    font-size: 16px; color: ${L.text}; opacity: 0.3;
    letter-spacing: 0.06em;
  }
  .spiral { width: 26px; height: 26px; opacity: 0.3; }

  .dots {
    position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 5px; z-index: 4;
  }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: ${L.text}; opacity: 0.12; }
  .dot.active { opacity: 0.5; }

  .cta-btn {
    margin-top: 50px;
    display: inline-block;
    padding: 22px 56px;
    border-radius: 50px;
    background: ${L.text};
    color: ${L.bg === '#7D8A6A' ? '#7D8A6A' : '#8C4A36'};
    font-size: 28px; font-weight: 500;
    font-family: 'Outfit', sans-serif;
    letter-spacing: 0.02em;
  }

  .freeme-logo {
    position: absolute; top: 60px; left: 70px;
    font-family: 'Fraunces', serif; font-size: 28px;
    color: ${L.text}; opacity: 0.5; z-index: 4;
    font-weight: 300;
  }
  .freeme-logo em { font-weight: 500; font-style: italic; }
</style>
</head>
<body>
  ${slide.layout === 'capa-photo' ? '<div class="bg-photo-placeholder"></div><div class="bg-gradient-photo"></div>' : '<div class="bg-solid"></div>'}
  ${slide.layout === 'split-top' ? '<div class="split-photo-area"><span class="placeholder-text">Imagem MJ aqui</span></div>' : ''}
  <div class="grain"></div>
  <div class="freeme-logo">Free<em>Me</em></div>
  <div class="content">
    <div class="body">${slide.body}</div>
    ${L.hasCTA ? '<div class="cta-btn">freeme.viviannedossantos.com</div>' : ''}
  </div>
  ${L.hasSwipe ? '<div class="swipe"><span>Arraste para o lado</span><span style="font-size:24px">→</span></div>' : ''}
  <div class="brand">
    <svg class="spiral" viewBox="0 0 512 512"><path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425" fill="none" stroke="${L.text}" stroke-width="14" stroke-linecap="round"/></svg>
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
    await new Promise(r => setTimeout(r, 400));
    const filename = `slide-${i + 1}-${slide.layout}.png`;
    await page.screenshot({
      path: path.join(outDir, filename),
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
    });
    await page.close();
    console.log(`✓ ${filename}`);
  }

  await browser.close();
  console.log(`\nDone. ${SLIDES.length} slides in ${outDir}`);
})();
