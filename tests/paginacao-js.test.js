"use strict";

// <dsgovbr-paginacao>: a lógica da janela de páginas (função pura exposta em
// window.dsgovbrPaginacao.janela) roda aqui num contexto isolado (vm), sem DOM.
// O comportamento no navegador está em tests/browser/paginacao.spec.js.

const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { read } = require("./helpers");

function janela() {
  // customElements e HTMLElement de mentira: o script define as classes e as registra no vazio
  const janelaGlobal = { customElements: { get: () => undefined, define() {} } };
  janelaGlobal.window = janelaGlobal;
  vm.runInNewContext(read("src/js/dsgovbr-bootstrapped-componentes.js"), { window: janelaGlobal, document: { addEventListener() {} }, HTMLElement: class {} });
  return (...args) => JSON.parse(JSON.stringify(janelaGlobal.dsgovbrPaginacao.janela(...args)));
}

test("janela de páginas: primeira e última sempre aparecem, reticências onde faltam várias", () => {
  const j = janela();
  assert.deepEqual(j(50, 100, 5), [1, "…", 48, 49, 50, 51, 52, "…", 100]);
  assert.deepEqual(j(1, 100, 5), [1, 2, 3, 4, 5, "…", 100]);
  assert.deepEqual(j(100, 100, 5), [1, "…", 96, 97, 98, 99, 100]);
});

test("janela de páginas: um vão de uma página só mostra a página, sem reticências", () => {
  const j = janela();
  assert.deepEqual(j(4, 100, 5), [1, 2, 3, 4, 5, 6, "…", 100]);
  assert.deepEqual(j(97, 100, 5), [1, "…", 95, 96, 97, 98, 99, 100]);
  assert.deepEqual(j(5, 100, 3), [1, "…", 4, 5, 6, "…", 100]);
});

test("janela de páginas: poucas páginas aparecem todas; limites e entradas estranhas", () => {
  const j = janela();
  assert.deepEqual(j(1, 1, 5), [1]);
  assert.deepEqual(j(2, 7, 5), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(j(3, 8, 5), [1, 2, 3, 4, 5, "…", 8]);
  assert.deepEqual(j(99, 10, 5), [1, "…", 6, 7, 8, 9, 10]); // atual acima do total é limitada
  assert.deepEqual(j("x", 20, 1), [1, 2, 3, "…", 20]); // tamanho mínimo 3, atual inválida vira 1
});
