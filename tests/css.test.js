"use strict";

// Asserções no CSS compilado (dist/): as decisões já tomadas (tokens aplicados,
// formato dos componentes, RF-03, DP-06) não podem regredir sem o teste acusar.
// Pré-requisito: `npm run build`.

const test = require("node:test");
const assert = require("node:assert/strict");
const { read, block, decl } = require("./helpers");

const css = read("dist/dsgovbr-bootstraped.css");
const min = read("dist/dsgovbr-bootstraped.min.css");

test("RF-03: nenhuma classe .br-* no CSS (sem dependência oculta do GOV.BR DS)", () => {
  assert.doesNotMatch(css, /\.br-[a-z]/);
  assert.doesNotMatch(min, /\.br-[a-z]/);
});

test("fundamentos: tokens do GOV.BR DS aplicados no :root", () => {
  const root = block(css, ":root, [data-bs-theme=light]");
  assert.equal(decl(root, "--bs-primary"), "#1351b4");
  assert.equal(decl(root, "--bs-success"), "#168821");
  assert.equal(decl(root, "--bs-danger"), "#e52207");
  assert.equal(decl(root, "--bs-info"), "#155bcb");
  assert.equal(decl(root, "--bs-warning"), "#ffcd07");
  assert.equal(decl(root, "--bs-body-color"), "#333");
  assert.equal(decl(root, "--bs-border-color"), "#ccc");
  assert.equal(decl(root, "--bs-body-font-family"), '"Rawline", "Raleway", sans-serif');
});

test("DP-10: 14px só na tipografia (font-size-base), sem reescalar o root", () => {
  assert.equal(decl(block(css, ":root, [data-bs-theme=light]"), "--bs-body-font-size"), "0.875rem");
  assert.doesNotMatch(css, /^html \{[^}]*font-size/m);
});

test("botão: pílula, semi-bold e padding calibrado por tamanho", () => {
  const btn = block(css, ".btn");
  assert.equal(decl(btn, "--bs-btn-border-radius"), "50rem");
  assert.equal(decl(btn, "--bs-btn-font-weight"), "600");
  assert.equal(decl(btn, "--bs-btn-padding-x"), "1.5rem");
  assert.equal(decl(btn, "--bs-btn-padding-y"), "0.5rem");
  assert.equal(decl(block(css, ".btn-sm, .btn-group-sm > .btn"), "--bs-btn-padding-y"), "0.375rem");
  assert.equal(decl(block(css, ".btn-lg, .btn-group-lg > .btn"), "--bs-btn-padding-y"), "0.625rem");
});

test("DP-06: btn-secondary segue o cinza do Bootstrap (decisão do mantenedor)", () => {
  assert.equal(decl(block(css, ".btn-secondary"), "--bs-btn-bg"), "#6c757d");
});

test("campo de texto: raio 4px, borda cinza, padding e peso do GOV.BR DS", () => {
  const input = block(css, ".form-control");
  assert.equal(decl(input, "border-radius"), "4px");
  assert.equal(decl(input, "padding"), "0.5rem 1rem");
  assert.equal(decl(input, "font-weight"), "500");
  assert.equal(decl(input, "color"), "#333");
  assert.equal(decl(input, "border"), "var(--bs-border-width) solid #888");
});

test("checkbox e radio: caixa de 24px", () => {
  const box = block(css, ".form-check-input");
  assert.equal(decl(box, "width"), "24px");
  assert.equal(decl(box, "height"), "24px");
});

test("alerta: sem borda e sem raio", () => {
  const alert = block(css, ".alert");
  assert.equal(decl(alert, "--bs-alert-border"), "0 solid var(--bs-alert-border-color)");
  assert.equal(decl(alert, "--bs-alert-border-radius"), "0");
});

test("card: sem borda, sem raio, sombra aplicada sem depender de $enable-shadows", () => {
  const card = block(css, ".card");
  assert.equal(decl(card, "--bs-card-border-width"), "0");
  assert.equal(decl(card, "--bs-card-border-radius"), "0");
  assert.equal(decl(card, "--bs-card-box-shadow"), "0 1px 6px rgba(0, 0, 0, 0.16)");
  assert.equal(decl(card, "box-shadow"), "var(--bs-card-box-shadow)");
});

test("sombras do Bootstrap seguem desligadas (botão e campo não ganham sombra)", () => {
  assert.equal(decl(block(css, ".btn"), "box-shadow"), undefined);
  assert.equal(decl(block(css, ".form-control"), "box-shadow"), undefined);
});
