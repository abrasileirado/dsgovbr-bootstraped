#!/usr/bin/env node
"use strict";

// Gera docs/componentes/*.html a partir de um template único
// (src/site/layout.html) + fragmentos de conteúdo (src/site/componentes/).
//
// Cada fragmento começa com um comentário "<!-- title: ... -->" na primeira
// linha (usado como <title> da página) e o resto é o conteúdo do <body>
// (a navegação padrão já vem do layout, não precisa repetir em cada página).
//
// Ver docs/desenvolvimento.md para o passo a passo de criar um componente novo.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LAYOUT_PATH = path.join(ROOT, "src/site/layout.html");
const SRC_DIR = path.join(ROOT, "src/site/componentes");
const OUT_DIR = path.join(ROOT, "docs/componentes");

const TITLE_RE = /^<!--\s*title:\s*(.*?)\s*-->\s*\n/;

function build() {
  const layout = fs.readFileSync(LAYOUT_PATH, "utf8");
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".html"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
    const match = raw.match(TITLE_RE);
    if (!match) {
      throw new Error(
        `src/site/componentes/${file}: faltando comentário "<!-- title: ... -->" na primeira linha`
      );
    }
    const title = match[1];
    const content = raw.slice(match[0].length);
    const html = layout.replace("<!--TITLE-->", title).replace("<!--CONTENT-->", content);
    fs.writeFileSync(path.join(OUT_DIR, file), html);
    console.log(`docs/componentes/${file} gerado a partir de src/site/componentes/${file}`);
  }
}

build();
