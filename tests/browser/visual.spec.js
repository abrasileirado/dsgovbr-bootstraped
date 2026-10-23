"use strict";

// Regressão visual (RNF-09): capturas de referência em dois tamanhos de tela.
// Só roda com VISUAL=1, no container oficial do Playwright (Linux), que é onde
// as imagens de referência são geradas. Para regenerar:
//   npm run test:visual:update   (precisa de Docker)

const { test, expect } = require("./fixtures");
const { themedPages } = require("./pages");

test.skip(!process.env.VISUAL, "visuais só rodam com VISUAL=1 (container do Playwright)");

const TELAS = [
  { nome: "desktop", width: 1280, height: 800 },
  { nome: "mobile", width: 375, height: 667 },
];

for (const tela of TELAS) {
  for (const url of themedPages) {
    test(`${url} em ${tela.nome}`, async ({ page }) => {
      await page.setViewportSize({ width: tela.width, height: tela.height });
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const nome = url.replace(/^\//, "").replace(/\.html$/, "").replace(/\//g, "-");
      await expect(page).toHaveScreenshot(`${nome}-${tela.nome}.png`, { fullPage: true });
    });
  }
}
