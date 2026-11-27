const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('/Users/documentos/node_modules/playwright');

const dir = __dirname;
const htmlPath = path.join(dir, 'template-destacadas.html');
const outputs = [
  ['#story-quien-soy', 'destacada-01-quien-soy.png'],
  ['#story-tutorias', 'destacada-02-tutorias.png'],
  ['#story-resultados', 'destacada-03-resultados.png'],
  ['#story-simuladores', 'destacada-04-simuladores.png'],
];

(async () => {
  console.log('Iniciando renderizado con Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 2200 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  for (const [selector, filename] of outputs) {
    const outPath = path.join(dir, filename);
    await page.locator(selector).screenshot({ path: outPath, animations: 'disabled' });
    console.log(`Renderizado exitoso: ${filename}`);
  }

  await browser.close();
  console.log('¡Todas las portadas destacadas generadas al 100%!');
})();
