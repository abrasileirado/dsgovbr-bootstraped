"use strict";

// `test` do Playwright com a fonte e a rede externa isoladas: as páginas
// temáticas carregam a Rawline hospedada no site (docs/assets/fonts/rawline/,
// issue #45), mas as capturas visuais não podem variar com a fonte. A
// requisição é respondida com um CSS vazio; a existência do <link> é
// verificada de forma estática em pages.spec.js.

const base = require("@playwright/test");

const CDN_RAWLINE = /cdngovbr-ds\.estaleiro\.serpro\.gov\.br/;
const RAWLINE_LOCAL = /\/assets\/fonts\/rawline\/rawline\.css$/;
// Font Awesome 5 (ícones do GOV.BR DS, DP-05) nos exemplos: mesmo tratamento.
const CDN_FONT_AWESOME = /cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\//;

const test = base.test.extend({
  page: async ({ page }, use) => {
    await page.route(CDN_RAWLINE, (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: "/* Rawline stubada nos testes */" })
    );
    await page.route(RAWLINE_LOCAL, (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: "/* Rawline local stubada nos testes */" })
    );
    await page.route(CDN_FONT_AWESOME, (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: "/* Font Awesome stubado nos testes */" })
    );
    await use(page);
  },
});

module.exports = { test, expect: base.expect, CDN_RAWLINE, RAWLINE_LOCAL, CDN_FONT_AWESOME };
