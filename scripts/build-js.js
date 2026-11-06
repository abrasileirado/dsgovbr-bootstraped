#!/usr/bin/env node
"use strict";

// Copia o JS opcional de src/js/ para dist/. Não há minificação: são poucas
// linhas, sem dependência, e o arquivo legível facilita a auditoria.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ARQUIVOS = ["dsgovbr-bootstraped-modo.js"];

for (const nome of ARQUIVOS) {
  const de = path.join(ROOT, "src/js", nome);
  const para = path.join(ROOT, "dist", nome);
  if (!fs.existsSync(de)) {
    throw new Error(`src/js/${nome} não encontrado`);
  }
  fs.mkdirSync(path.dirname(para), { recursive: true });
  fs.copyFileSync(de, para);
  console.log(`dist/${nome} <- src/js/${nome}`);
}
