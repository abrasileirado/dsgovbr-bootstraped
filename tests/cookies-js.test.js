"use strict";

// JS opcional de consentimento (src/js/dsgovbr-bootstraped-cookies.js). O
// comportamento no navegador é coberto por tests/browser/cookiebar.spec.js; aqui
// a API roda num contexto isolado (vm) com localStorage e DOM de mentira.

const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { read } = require("./helpers");

const ARQUIVO = "dsgovbr-bootstraped-cookies.js";

function carregar({ storage, semStorage = false } = {}) {
  const dados = storage || {};
  const eventos = [];
  const documento = {
    documentElement: { dispatchEvent: (e) => eventos.push(e) },
    addEventListener() {},
    querySelector: () => null,
  };
  const janela = {
    document: documento,
    localStorage: semStorage
      ? { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); }, removeItem() { throw new Error("bloqueado"); } }
      : { getItem: (k) => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = String(v); }, removeItem: (k) => { delete dados[k]; } },
    CustomEvent: class { constructor(tipo, init) { this.type = tipo; this.detail = init.detail; } },
  };
  janela.window = janela;
  vm.runInNewContext(read(`src/js/${ARQUIVO}`), { ...janela, CustomEvent: janela.CustomEvent, document: documento, window: janela, console });
  // objetos criados dentro do vm têm outro Object.prototype: normaliza para comparar
  const plano = (v) => JSON.parse(JSON.stringify(v));
  const api = janela.dsgovbrCookies;
  return {
    api: { ...api, escolha: () => plano(api.escolha()) },
    dados,
    get eventos() {
      return eventos.map((e) => ({ type: e.type, detail: plano(e.detail) }));
    },
  };
}

test("o JS tem sintaxe válida e define o elemento sem Shadow DOM nem innerHTML", () => {
  const js = read(`src/js/${ARQUIVO}`);
  assert.doesNotThrow(() => new vm.Script(js, { filename: ARQUIVO }));
  assert.ok(js.includes('"dsgovbr-cookiebar"'));
  assert.ok(!/attachShadow/.test(js), "light DOM: o CSS do tema precisa valer");
  assert.ok(!/innerHTML|insertAdjacentHTML/.test(js), "atributos não podem virar HTML (XSS)");
  assert.ok(!/class:\s*"[^"]*\boffcanvas\b(?!-)[^"]*\bshow\b/.test(js), "o Bootstrap abre sozinho todo .offcanvas.show");
});

test("API: sem escolha, escolha() é null, necessarios é sempre permitido e o resto não", () => {
  const { api } = carregar();
  assert.equal(api.escolha(), null);
  assert.equal(api.permitido("necessarios"), true);
  assert.equal(api.permitido("desempenho"), false);
});

test("API: definir grava, normaliza para booleano, ignora necessarios e dispara o evento", () => {
  const ctx = carregar();
  const { api, dados } = ctx;
  api.definir({ desempenho: true, funcionais: "sim", necessarios: false }, "salvar");
  assert.deepEqual(JSON.parse(dados["dsgovbr-bootstraped:cookies"]), { v: 1, grupos: { desempenho: true, funcionais: false } });
  assert.deepEqual(api.escolha(), { necessarios: true, desempenho: true, funcionais: false });
  assert.equal(api.permitido("desempenho"), true);
  assert.equal(api.permitido("funcionais"), false);
  const eventos = ctx.eventos;
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].type, "dsgovbr:cookies");
  assert.deepEqual(eventos[0].detail, { grupos: { necessarios: true, desempenho: true, funcionais: false }, origem: "salvar" });
});

test("API: limpar apaga a escolha e avisa com grupos null", () => {
  const ctx = carregar();
  const { api, dados } = ctx;
  api.definir({ desempenho: true });
  api.limpar();
  assert.equal(api.escolha(), null);
  assert.equal(Object.keys(dados).length, 0);
  assert.deepEqual(ctx.eventos[1].detail, { grupos: null, origem: "limpar" });
});

test("API: entradas inválidas dão erro claro", () => {
  const { api } = carregar();
  assert.throws(() => api.definir(null), /informe um objeto/);
  assert.throws(() => api.definir({ "x y": true }), /nome de grupo inválido/);
  assert.throws(() => api.abrir(), /não há <dsgovbr-cookiebar>/);
});

test("API: JSON ilegível ou de outra versão vira 'sem escolha'", () => {
  assert.equal(carregar({ storage: { "dsgovbr-bootstraped:cookies": "{não é json" } }).api.escolha(), null);
  assert.equal(carregar({ storage: { "dsgovbr-bootstraped:cookies": JSON.stringify({ v: 9, grupos: { a: true } }) } }).api.escolha(), null);
  const ok = carregar({ storage: { "dsgovbr-bootstraped:cookies": JSON.stringify({ v: 1, grupos: { desempenho: true } }) } });
  assert.equal(ok.api.permitido("desempenho"), true);
});

test("API: com localStorage bloqueado a escolha vale só na página aberta", () => {
  const { api } = carregar({ semStorage: true });
  api.definir({ desempenho: true });
  assert.equal(api.permitido("desempenho"), true);
  api.limpar();
  assert.equal(api.escolha(), null);
});

test("empacotamento: build, docs/assets, teste do pacote e release", () => {
  assert.ok(read("scripts/build-js.js").includes(ARQUIVO));
  assert.ok(read("scripts/build-docs-assets.js").includes(`dist/${ARQUIVO}`));
  assert.ok(read("scripts/test-package.js").includes(`src/js/${ARQUIVO}`));
  assert.ok(read(".github/workflows/release.yml").includes(`dist/${ARQUIVO}`));
});

test("define os elementos filhos do cookiebar e não usa slot=", () => {
  const js = read(`src/js/${ARQUIVO}`);
  assert.ok(js.includes('"dsgovbr-cookies-grupo"') && js.includes('"dsgovbr-cookies-texto"'));
  assert.ok(!/getAttribute\("slot"\)/.test(js));
});
