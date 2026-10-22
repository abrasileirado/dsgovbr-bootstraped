"use strict";

// Toda página publicada carrega sem requisição falha (404) e sem erro de
// console. Pega referência a arquivo fora de docs/, que funciona num servidor
// que serve o repositório inteiro mas quebra no GitHub Pages.

const { test, expect } = require("@playwright/test");
const { allPages } = require("./pages");

test("há páginas para testar", () => {
  expect(allPages.length).toBeGreaterThan(5);
});

for (const url of allPages) {
  test(`${url} carrega sem 404 nem erro de console`, async ({ page }) => {
    const problemas = [];
    page.on("response", (r) => {
      if (r.status() >= 400) {
        problemas.push(`HTTP ${r.status()} ${r.url()}`);
      }
    });
    page.on("requestfailed", (r) => problemas.push(`falhou ${r.url()}`));
    page.on("console", (m) => {
      if (m.type() === "error") {
        problemas.push(`console: ${m.text()}`);
      }
    });
    page.on("pageerror", (e) => problemas.push(`erro de página: ${e.message}`));

    await page.goto(url);
    await page.waitForLoadState("networkidle");

    expect(problemas).toEqual([]);
  });
}
