"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function read(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    throw new Error(
      `${rel} não encontrado. Rode \`git submodule update --init --recursive\` e \`npm run build\`.`
    );
  }
  return fs.readFileSync(file, "utf8");
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

// Valor de uma variável Sass ($nome: valor;), sem `!default`, com espaços
// normalizados e hex em minúsculas.
function scssVar(text, name) {
  const m = new RegExp(`^\\$${escapeRe(name)}:\\s*([^;]+);`, "m").exec(text);
  return m ? normalize(m[1].replace(/!default/, "")) : undefined;
}

// Valor de uma custom property CSS declarada em Sass (--nome: valor;).
function cssProp(text, name) {
  const m = new RegExp(`${escapeRe(name)}:\\s*([^;]+);`).exec(text);
  return m ? normalize(m[1]) : undefined;
}

// Corpo de declarações de todas as regras cujo seletor é exatamente `selector`
// (saída expandida do Sass), em ordem — como na cascata, a última vence.
// Seletores com vírgula aceitam quebra de linha.
function block(css, selector) {
  const sel = selector
    .split(",")
    .map((s) => escapeRe(s.trim()))
    .join(",\\s*");
  const re = new RegExp(`^${sel} \\{\\n([\\s\\S]*?)\\n\\}`, "gm");
  const found = [...css.matchAll(re)];
  if (found.length === 0) {
    throw new Error(`regra "${selector}" não encontrada no CSS compilado`);
  }
  return found.map((m) => m[1]).join("\n");
}

// Valor da última declaração "prop: valor;" dentro de um bloco.
function decl(body, prop) {
  const re = new RegExp(`^\\s*${escapeRe(prop)}:\\s*(.+?);\\s*$`, "gm");
  const all = [...body.matchAll(re)];
  return all.length ? all[all.length - 1][1].trim() : undefined;
}

module.exports = { ROOT, read, scssVar, cssProp, normalize, block, decl };
