"use strict";

const fs = require("fs");
const path = require("path");

const DOCS = path.join(__dirname, "..", "..", "docs");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      return e.name === "assets" ? [] : walk(full);
    }
    return e.name.endsWith(".html") ? [full] : [];
  });
}

// URLs (relativas à raiz de docs/) de todas as páginas HTML publicadas.
const allPages = walk(DOCS)
  .map((f) => "/" + path.relative(DOCS, f).split(path.sep).join("/"))
  .sort();

const componentPages = allPages.filter((p) => p.startsWith("/componentes/") && p !== "/componentes/index.html");

// Páginas que exercitam o tema para a11y e visual: componentes + exemplo de login.
const themedPages = [...componentPages, "/exemplos/login.html"];

module.exports = { allPages, componentPages, themedPages };
