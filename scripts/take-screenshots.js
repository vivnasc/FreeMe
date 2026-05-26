const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const screens = [
    { name: 'landing-hero', url: 'http://localhost:3000/pt', width: 390, height: 844 },
    { name: 'landing-bloqueios', url: 'http://localhost:3000/pt', width: 390, height: 844, scroll: 2800 },
    { name: 'landing-como', url: 'http://localhost:3000/pt', width: 390, height: 844, scroll: 4200 },
    { name: 'login', url: 'http://localhost:3000/pt/auth/login', width: 390, height: 844 },
    { name: 'register', url: 'http://localhost:3000/pt/auth/register', width: 390, height: 844 },
  ];

  for (const s of screens) {
    const page = await browser.newPage();
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 3 });
    await page.goto(s.url, { waitUntil: 'networkidle0', timeout: 15000 });
    if (s.scroll) {
      await page.evaluate((y) => window.scrollTo(0, y), s.scroll);
      await new Promise(r => setTimeout(r, 500));
    }
    await page.screenshot({
      path: path.join(__dirname, `mockup-${s.name}.png`),
      clip: { x: 0, y: 0, width: s.width, height: s.height },
    });
    await page.close();
    console.log(`✓ ${s.name}`);
  }

  await browser.close();
  console.log('Done');
})();
