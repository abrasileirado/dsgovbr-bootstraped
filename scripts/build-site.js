#!/usr/bin/env node
"use strict";

// Gera docs/componentes/*.html a partir de um template único
// (src/site/layout.html) + fragmentos de conteúdo (src/site/componentes/).
//
// Cada fragmento começa com um cabeçalho de comentários, um por linha:
//
//   <!-- title: Componente: Modal — dsgovbr-bootstraped -->   (obrigatório)
//   <!-- status: Não suportado -->                            (opcional)
//   <!-- bootstrap: modal -->                                 (opcional)
//
// "title" vira o <title> da página. "status" (um dos STATUS abaixo) e
// "bootstrap" (o nome da página do componente em
// https://getbootstrap.com/docs/5.3/components/) geram a faixa de status no
// topo da página. O resto do arquivo é o conteúdo do <main> (a navegação e a
// chave de tema já vêm do layout, não precisa repetir em cada página).
//
// Ver docs/desenvolvimento.md para o passo a passo de criar um componente novo.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LAYOUT_PATH = path.join(ROOT, "src/site/layout.html");
const SRC_DIR = path.join(ROOT, "src/site/componentes");
const OUT_DIR = path.join(ROOT, "docs/componentes");

const BOOTSTRAP_DOCS = "https://getbootstrap.com/docs/5.3/components/";
const STATUS = ["Planejado", "Experimental", "Limitado", "Estável", "Não suportado"];

const HEADER_RE = /^<!--\s*(title|status|bootstrap):\s*(.*?)\s*-->\s*\n/;

function lerCabecalho(file, raw) {
  const meta = {};
  let rest = raw;
  let match;
  while ((match = rest.match(HEADER_RE))) {
    meta[match[1]] = match[2];
    rest = rest.slice(match[0].length);
  }
  if (!meta.title) {
    throw new Error(
      `src/site/componentes/${file}: faltando comentário "<!-- title: ... -->" na primeira linha`
    );
  }
  if (meta.status && !STATUS.includes(meta.status)) {
    throw new Error(
      `src/site/componentes/${file}: status "${meta.status}" inválido (use: ${STATUS.join(", ")})`
    );
  }
  if (meta.bootstrap && !/^[a-z-]+$/.test(meta.bootstrap)) {
    throw new Error(`src/site/componentes/${file}: "bootstrap: ${meta.bootstrap}" deve ser o slug da página`);
  }
  return { meta, content: rest };
}

function faixaStatus(meta) {
  if (!meta.status && !meta.bootstrap) {
    return "";
  }
  const partes = [];
  if (meta.status) {
    const nota =
      meta.status === "Não suportado"
        ? " Sem adaptação própria: com o GOV.BR DS ativo, o componente recebe só os tokens globais (cores, fonte e tamanho base)."
        : "";
    partes.push(`<strong>Status na matriz:</strong> ${meta.status}.${nota}`);
  }
  if (meta.bootstrap) {
    const url = `${BOOTSTRAP_DOCS}${meta.bootstrap}/`;
    partes.push(`Referência: <a href="${url}">documentação do Bootstrap 5.3</a>.`);
  }
  return `<p class="catalogo-status" data-status="${meta.status || ""}">${partes.join(" ")}</p>`;
}

function build() {
  const layout = fs.readFileSync(LAYOUT_PATH, "utf8");
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".html"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
    const { meta, content } = lerCabecalho(file, raw);
    // funções de substituição: o conteúdo pode ter "$&", "$1"... literais
    const html = layout
      .replace("<!--TITLE-->", () => meta.title)
      .replace("<!--STATUS-->", () => faixaStatus(meta))
      .replace("<!--CONTENT-->", () => content);
    fs.writeFileSync(path.join(OUT_DIR, file), html);
    console.log(`docs/componentes/${file} gerado a partir de src/site/componentes/${file}`);
  }
}

if (require.main === module) {
  build();
}

module.exports = { lerCabecalho, faixaStatus, STATUS, BOOTSTRAP_DOCS };
