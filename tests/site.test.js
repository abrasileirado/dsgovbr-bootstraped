"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { lerCabecalho, faixaStatus, BOOTSTRAP_DOCS } = require("../scripts/build-site");

const ROOT = path.join(__dirname, "..");
const FRAGMENTOS = path.join(ROOT, "src/site/componentes");
const COMPONENTES_BOOTSTRAP = path.join(ROOT, "vendor/bootstrap/site/src/content/docs/components");

function fragmentos() {
  return fs
    .readdirSync(FRAGMENTOS)
    .filter((f) => f.endsWith(".html"))
    .map((file) => ({ file, ...lerCabecalho(file, fs.readFileSync(path.join(FRAGMENTOS, file), "utf8")) }));
}

test("todo componente da documentação do Bootstrap tem página no catálogo", () => {
  const slugs = fs
    .readdirSync(COMPONENTES_BOOTSTRAP)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
  assert.ok(slugs.length >= 24, `esperados ao menos 24 componentes no Bootstrap, achados ${slugs.length}`);

  const cobertos = new Set(fragmentos().map((f) => f.meta.bootstrap).filter(Boolean));
  const faltando = slugs.filter((s) => !cobertos.has(s));
  assert.deepEqual(faltando, [], `componentes do Bootstrap sem página: ${faltando.join(", ")}`);
});

test("cada componente do Bootstrap tem uma única página", () => {
  const vistos = new Map();
  for (const { file, meta } of fragmentos()) {
    if (!meta.bootstrap) continue;
    assert.ok(!vistos.has(meta.bootstrap), `${meta.bootstrap} em ${vistos.get(meta.bootstrap)} e ${file}`);
    vistos.set(meta.bootstrap, file);
  }
});

test("o índice do catálogo aponta para todas as páginas", () => {
  const indice = fs.readFileSync(path.join(FRAGMENTOS, "index.html"), "utf8");
  for (const { file } of fragmentos()) {
    if (file === "index.html") continue;
    assert.ok(indice.includes(`href="${file}"`), `${file} não está no índice do catálogo`);
  }
});

test("o índice de exemplos aponta para todos os exemplos, inclusive o login", () => {
  const dir = path.join(ROOT, "docs/exemplos");
  const indice = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const exemplos = fs.readdirSync(dir).filter((f) => f.endsWith(".html") && f !== "index.html");
  assert.ok(exemplos.includes("login.html"), "falta o exemplo de login");
  for (const file of exemplos) {
    assert.ok(indice.includes(`href="${file}"`), `${file} não está no índice de exemplos`);
  }
});

test("toda página de componente declara o status e tem a seção de diferenças", () => {
  for (const { file, meta, content } of fragmentos()) {
    if (file === "index.html") continue;
    assert.ok(meta.status, `${file}: falta "<!-- status: ... -->"`);
    assert.match(content, /Diferenças[^<]*GOV\.BR DS/, `${file}: falta a seção de diferenças conhecidas`);
  }
});

test("cabeçalho: lê title, status e bootstrap e devolve o resto como conteúdo", () => {
  const raw = "<!-- title: T -->\n<!-- status: Limitado -->\n<!-- bootstrap: modal -->\n<h1>x</h1>\n";
  const { meta, content } = lerCabecalho("x.html", raw);
  assert.deepEqual(meta, { title: "T", status: "Limitado", bootstrap: "modal" });
  assert.equal(content, "<h1>x</h1>\n");
});

test("cabeçalho: exige title e rejeita status ou slug inválidos", () => {
  assert.throws(() => lerCabecalho("x.html", "<h1>x</h1>"), /faltando comentário/);
  assert.throws(() => lerCabecalho("x.html", "<!-- title: T -->\n<!-- status: Pronto -->\n"), /status "Pronto" inválido/);
  assert.throws(() => lerCabecalho("x.html", "<!-- title: T -->\n<!-- bootstrap: ../x -->\n"), /slug/);
});

test("faixa de status: vazia sem metadados; explica 'Não suportado' e linka o Bootstrap", () => {
  assert.equal(faixaStatus({ title: "T" }), "");
  const faixa = faixaStatus({ status: "Não suportado", bootstrap: "modal" });
  assert.match(faixa, /Status na matriz:<\/strong> Não suportado\./);
  assert.match(faixa, /tokens globais/);
  assert.ok(faixa.includes(`href="${BOOTSTRAP_DOCS}modal/"`));
  assert.doesNotMatch(faixaStatus({ status: "Limitado" }), /tokens globais/);
});
