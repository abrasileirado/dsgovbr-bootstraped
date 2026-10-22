"use strict";

// A imagem do container no CI precisa ser a do @playwright/test instalado:
// com versões diferentes o Chromium da imagem não é o que o Playwright espera
// e as capturas de referência deixam de bater.

const test = require("node:test");
const assert = require("node:assert/strict");
const { read } = require("./helpers");

const version = require("@playwright/test/package.json").version;

test("ci.yml usa a imagem do Playwright na mesma versão do pacote", () => {
  const m = /image:\s*mcr\.microsoft\.com\/playwright:v([\d.]+)-/.exec(read(".github/workflows/ci.yml"));
  assert.ok(m, "imagem do Playwright não encontrada em ci.yml");
  assert.equal(m[1], version, "atualize ci.yml e @playwright/test juntos (e regenere as capturas)");
});

test("@playwright/test está fixado em versão exata", () => {
  const spec = require("../package.json").devDependencies["@playwright/test"];
  assert.match(spec, /^\d+\.\d+\.\d+$/, "use versão exata para a imagem do container acompanhar");
});
