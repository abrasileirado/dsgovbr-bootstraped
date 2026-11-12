"use strict";

// JS opcional dos web components (src/js/dsgovbr-bootstrapped-componentes.js).
// O comportamento no navegador é coberto por tests/browser/componentes.spec.js;
// aqui ficam as verificações que não precisam de DOM: sintaxe, os elementos
// definidos e o empacotamento (dist, site, pacote npm e release).

const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { read } = require("./helpers");

const ARQUIVO = "dsgovbr-bootstrapped-componentes.js";
const ELEMENTOS = ["dsgovbr-breadcrumb", "dsgovbr-menu", "dsgovbr-footer", "dsgovbr-header"];

test("o JS tem sintaxe válida", () => {
  assert.doesNotThrow(() => new vm.Script(read(`src/js/${ARQUIVO}`), { filename: ARQUIVO }));
});

test("define os quatro custom elements, sem Shadow DOM nem innerHTML", () => {
  const js = read(`src/js/${ARQUIVO}`);
  for (const nome of ELEMENTOS) {
    assert.ok(js.includes(`"${nome}"`), `${nome} não é definido`);
  }
  assert.ok(!/attachShadow/.test(js), "light DOM: o CSS do tema precisa valer (sem Shadow DOM)");
  assert.ok(!/innerHTML|insertAdjacentHTML/.test(js), "atributos não podem virar HTML (XSS)");
});

test("sem custom elements, o script não faz nada nem lança erro", () => {
  const janela = { document: { createElement() {} } };
  janela.window = janela;
  assert.doesNotThrow(() => vm.runInNewContext(read(`src/js/${ARQUIVO}`), janela));
});

test("o arquivo é copiado para dist/ e para docs/assets/ e entra na release e no teste do pacote", () => {
  assert.ok(read("scripts/build-js.js").includes(ARQUIVO), "build-js.js");
  assert.ok(read("scripts/build-docs-assets.js").includes(`dist/${ARQUIVO}`), "build-docs-assets.js");
  assert.ok(read("scripts/test-package.js").includes(`src/js/${ARQUIVO}`), "test-package.js");
  assert.ok(read(".github/workflows/release.yml").includes(`dist/${ARQUIVO}`), "release.yml");
  assert.ok(require("../package.json").files.includes("src/js/"), "src/js/ precisa estar em files do package.json");
});

test("o CSS do tema esconde o componente até montar e usa display: contents nos wrappers", () => {
  const css = read("dist/dsgovbr-bootstrapped.css");
  // asserções com ok(): se falhar, não despeja o CSS inteiro na saída
  const contents = /(dsgovbr-header,[\s\S]*?) \{\s*\n\s*display: contents;/.exec(css);
  assert.ok(contents, "regra display: contents dos wrappers");
  for (const nome of ["dsgovbr-header", "dsgovbr-footer", "dsgovbr-breadcrumb", "dsgovbr-cookiebar", "dsgovbr-paginacao", "dsgovbr-campo"]) {
    assert.ok(contents[1].includes(nome), `${nome} com display: contents`);
  }
  assert.ok(/dsgovbr-menu:not\(\[data-dsgovbr-montado\]\)/.test(css), "oculta até montar");
});

test("define os elementos filhos (dado) e o JS não usa mais slot= nem details", () => {
  const js = read(`src/js/${ARQUIVO}`);
  for (const nome of ["dsgovbr-item", "dsgovbr-pasta", "dsgovbr-menu-rodape", "dsgovbr-coluna", "dsgovbr-rede", "dsgovbr-logo", "dsgovbr-aviso",
    "dsgovbr-acesso-rapido", "dsgovbr-funcionalidades", "dsgovbr-usuario-menu", "dsgovbr-divisor", "dsgovbr-acoes",
    "dsgovbr-ajuda", "dsgovbr-erro", "dsgovbr-sucesso", "dsgovbr-opcao", "dsgovbr-campo-oculto",
    "dsgovbr-filtro", "dsgovbr-lote-acao", "dsgovbr-paginacao", "dsgovbr-modal", "dsgovbr-campo", "dsgovbr-tabela"]) {
    assert.ok(js.includes(`"${nome}"`), `${nome} não é definido`);
  }
  assert.ok(!/getAttribute\("slot"\)/.test(js), "a convenção slot= foi substituída por elementos filhos");
  const css = read("dist/dsgovbr-bootstrapped.css");
  const dados = /(dsgovbr-item,[\s\S]*?) \{\s*\n\s*display: none;/.exec(css);
  assert.ok(dados, "regra display: none dos elementos-dado");
  for (const nome of ["dsgovbr-item", "dsgovbr-cookies-texto", "dsgovbr-ajuda", "dsgovbr-opcao"]) {
    assert.ok(dados[1].includes(nome), `${nome} oculto fora de um pai`);
  }
});
