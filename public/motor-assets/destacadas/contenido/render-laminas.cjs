const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('/Users/documentos/node_modules/playwright');

const dir = __dirname;
const htmlPath = path.join(dir, 'laminas-destacadas.html');
const outputs = [
  ['#slide-qs-1', 'lamina-01-quien-soy-presentacion.png'],
  ['#slide-qs-2', 'lamina-02-quien-soy-metodo.png'],
  ['#slide-tut-1', 'lamina-03-tutorias-individual.png'],
  ['#slide-tut-2', 'lamina-04-tutorias-programa-paes.png'],
  ['#slide-tut-3', 'lamina-05-tutorias-programa-ingenieria.png'],
  ['#slide-sim-1', 'lamina-06-simulador-calculadoras-web.png'],
];

(async () => {
  console.log('Iniciando renderizado de láminas interiores...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 2200 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  for (const [selector, filename] of outputs) {
    const outPath = path.join(dir, filename);
    await page.locator(selector).screenshot({ path: outPath, animations: 'disabled' });
    console.log(`Lámina renderizada: ${filename}`);
  }

  await browser.close();
  console.log('¡Todas las láminas interiores generadas exitosamente!');
})();
