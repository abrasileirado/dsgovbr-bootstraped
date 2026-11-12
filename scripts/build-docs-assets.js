#!/usr/bin/env node
"use strict";

// Copia para docs/assets/ (gerado, fora do git) tudo que as páginas de
// documentação carregam. O GitHub Pages publica só docs/, então nada pode ser
// referenciado fora dessa pasta.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const COPIES = [
  // nosso CSS compilado (minificado)
  ["dist/dsgovbr-bootstrapped.min.css", "docs/assets/css/dsgovbr-bootstrapped.css"],
  // seletor de modo claro/escuro (opcional)
  ["dist/dsgovbr-bootstrapped-modo.js", "docs/assets/js/dsgovbr-bootstrapped-modo.js"],
  // web components de header, menu, footer e breadcrumb (opcional)
  ["dist/dsgovbr-bootstrapped-componentes.js", "docs/assets/js/dsgovbr-bootstrapped-componentes.js"],
  // consentimento de cookies: <dsgovbr-cookiebar> e API (opcional)
  ["dist/dsgovbr-bootstrapped-cookies.js", "docs/assets/js/dsgovbr-bootstrapped-cookies.js"],
  // Bootstrap puro, para a página de comparação "antes/depois", e seu JS
  ["vendor/bootstrap/dist/css/bootstrap.min.css", "docs/assets/vendor/bootstrap/css/bootstrap.min.css"],
  ["vendor/bootstrap/dist/js/bootstrap.bundle.min.js", "docs/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"],
  // chave de tema e inicialização de plugins do catálogo (docs/componentes/)
  ["src/site/catalogo.js", "docs/assets/js/catalogo.js"],
  // aviso de licença do que é redistribuído no site (MIT)
  ["vendor/bootstrap/LICENSE", "docs/assets/vendor/bootstrap/LICENSE"],
  // fonte Rawline (SIL OFL 1.1) hospedada no site: o CDN do SERPRO não manda
  // CORS, então não aceita integrity (SRI). Copia CSS, woff2 e OFL.txt.
  ...fs.readdirSync(path.join(ROOT, "src/site/fonts/rawline")).map((f) => [
    `src/site/fonts/rawline/${f}`,
    `docs/assets/fonts/rawline/${f}`,
  ]),
];

for (const [from, to] of COPIES) {
  const src = path.join(ROOT, from);
  if (!fs.existsSync(src)) {
    throw new Error(`${from} não encontrado (rode build:css e inicialize os submodules)`);
  }
  const dest = path.join(ROOT, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`${to} <- ${from}`);
}
