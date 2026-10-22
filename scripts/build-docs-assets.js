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
  ["dist/dsgovbr-bootstraped.min.css", "docs/assets/css/dsgovbr-bootstraped.css"],
  // Bootstrap puro, para a página de comparação "antes/depois", e seu JS
  ["vendor/bootstrap/dist/css/bootstrap.min.css", "docs/assets/vendor/bootstrap/css/bootstrap.min.css"],
  ["vendor/bootstrap/dist/js/bootstrap.bundle.min.js", "docs/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"],
  // aviso de licença do que é redistribuído no site (MIT)
  ["vendor/bootstrap/LICENSE", "docs/assets/vendor/bootstrap/LICENSE"],
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
