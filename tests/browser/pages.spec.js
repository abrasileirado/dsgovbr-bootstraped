"use strict";

// Toda página publicada carrega sem requisição falha (404) e sem erro de
// console. Pega referência a arquivo fora de docs/, que funciona num servidor
// que serve o repositório inteiro mas quebra no GitHub Pages.

const { test, expect } = require("./fixtures");
const { allPages } = require("./pages");

const fs = require("fs");
const path = require("path");

const CDN_RAWLINE_URL = "https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css";
const DOCS = path.join(__dirname, "..", "..", "docs");
// o "antes" da comparação é Bootstrap puro: sem tema, sem a fonte do GOV.BR DS
const SEM_TEMA = ["/exemplos/comparacao-padrao.html"];

test("a URL da Rawline é a mesma documentada em getting-started.md", () => {
  const doc = fs.readFileSync(path.join(DOCS, "getting-started.md"), "utf8");
  expect(doc).toContain(CDN_RAWLINE_URL);
});

for (const url of allPages) {
  const esperado = !SEM_TEMA.includes(url);
  test(`${url}: ${esperado ? "carrega" : "não carrega"} a fonte Rawline do CDN`, () => {
    const html = fs.readFileSync(path.join(DOCS, url), "utf8");
    expect(html.includes(CDN_RAWLINE_URL)).toBe(esperado);
  });
}

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
