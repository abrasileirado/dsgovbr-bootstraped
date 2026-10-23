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

test("botão: sem borda nos preenchidos, 1px nos outline, altura mínima 32/40/48px (GOV.BR DS)", () => {
  const btn = block(css, ".btn");
  assert.equal(decl(btn, "--bs-btn-border-width"), "0");
  assert.equal(decl(btn, "min-height"), "40px");
  assert.equal(decl(btn, "display"), "inline-flex");
  assert.equal(decl(block(css, ".btn-sm, .btn-group-sm > .btn"), "min-height"), "32px");
  assert.equal(decl(block(css, ".btn-lg, .btn-group-lg > .btn"), "min-height"), "48px");
  assert.equal(decl(block(css, "[class*=btn-outline-]"), "--bs-btn-border-width"), "1px");
});

test("foco: contorno dourado tracejado no botão, borda e anel dourados no campo (GOV.BR DS)", () => {
  const btn = block(css, ".btn:focus-visible, .btn-check:focus-visible + .btn");
  assert.equal(decl(btn, "outline"), "4px dashed #c2850c");
  assert.equal(decl(btn, "outline-offset"), "4px");
  assert.equal(decl(btn, "box-shadow"), "none");
  const campo = block(css, ".form-control:focus, .form-select:focus");
  assert.equal(decl(campo, "border-color"), "#c2850c !important");
  assert.equal(decl(campo, "box-shadow"), "0 0 0 2px #c2850c !important");
});

test("contraste: texto do btn-outline-warning escurecido (WCAG 1.4.3)", () => {
  assert.equal(decl(block(css, ".btn-outline-warning"), "--bs-btn-color"), "#776017");
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

test("validação: 2px visuais (borda de 1px + sombra interna de 1px na cor do estado)", () => {
  const invalido = block(css, ".form-control.is-invalid, .form-select.is-invalid, .was-validated .form-control:invalid, .was-validated .form-select:invalid");
  assert.equal(decl(invalido, "box-shadow"), "inset 0 0 0 1px var(--bs-form-invalid-border-color)");
  const valido = block(css, ".form-control.is-valid, .form-select.is-valid, .was-validated .form-control:valid, .was-validated .form-select:valid");
  assert.equal(decl(valido, "box-shadow"), "inset 0 0 0 1px var(--bs-form-valid-border-color)");
});

test("checkbox e radio: caixa de 24px", () => {
  const box = block(css, ".form-check-input");
  assert.equal(decl(box, "width"), "24px");
  assert.equal(decl(box, "height"), "24px");
});

test("checkbox e radio: caixa centrada na linha do rótulo e 8px entre linhas", () => {
  assert.equal(decl(block(css, ".form-check-input"), "margin-top"), "calc((var(--bs-body-line-height) * 1em - 24px) / 2)");
  const linha = block(css, ".form-check");
  assert.equal(decl(linha, "min-height"), "24px");
  assert.equal(decl(linha, "margin-bottom"), "0.5rem");
});

test("alerta: sem borda e sem raio", () => {
  const alert = block(css, ".alert");
  assert.equal(decl(alert, "--bs-alert-border"), "0 solid var(--bs-alert-border-color)");
  assert.equal(decl(alert, "--bs-alert-border-radius"), "0");
});

test("alerta: ícone de severidade por ::before (máscara SVG), só nas quatro severidades", () => {
  const cores = { success: "var(--bs-success)", danger: "var(--bs-danger)", info: "var(--bs-info)", warning: "var(--bs-body-color)" };
  for (const [nome, cor] of Object.entries(cores)) {
    const icone = block(css, `.alert-${nome}::before`);
    assert.equal(decl(icone, "content"), '""', nome);
    assert.equal(decl(icone, "background-color"), cor, nome);
    assert.ok(decl(icone, "mask").startsWith('url("data:image/svg+xml,'), `${nome}: mask`);
    assert.ok(decl(icone, "-webkit-mask").startsWith('url("data:image/svg+xml,'), `${nome}: -webkit-mask`);
  }
  for (const extensao of ["primary", "secondary", "light", "dark"]) {
    assert.ok(!css.includes(`.alert-${extensao}::before`), extensao);
  }
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

test("badge: aparência da tag estática GOV.BR DS e utilidades de contraste", () => {
  const badge = block(css, ".badge");
  assert.equal(decl(badge, "background-color"), "#071d41");
  assert.equal(decl(badge, "--bs-badge-color"), "#fff");
  assert.equal(decl(badge, "color"), "var(--bs-badge-color)");
  assert.equal(decl(badge, "--bs-badge-border-radius"), "4px");
  assert.equal(decl(badge, "border-radius"), "var(--bs-badge-border-radius)");
  assert.equal(decl(badge, "font-size"), "14px");
  assert.equal(decl(badge, "--bs-badge-font-weight"), "500");
  assert.equal(decl(badge, "font-weight"), "var(--bs-badge-font-weight)");
  assert.equal(decl(badge, "line-height"), "inherit");
  assert.equal(decl(badge, "min-height"), "28px");
  assert.equal(decl(badge, "padding"), "0 12px");
  assert.equal(decl(block(css, ".badge + .badge"), "margin-left"), "4px");
  assert.match(css, /\.text-bg-warning\s*\{[^}]*color:\s*#000\s*!important/s);
});

test("paginação: links circulares, espaçados, ativo azul e foco dourado", () => {
  const pagination = block(css, ".pagination");
  assert.equal(decl(pagination, "gap"), "4px");
  assert.equal(decl(pagination, "margin-bottom"), "0");
  assert.equal(decl(pagination, "--bs-pagination-color"), "#1351b4");
  assert.equal(decl(block(css, ".page-item:not(:first-child) .page-link"), "margin-left"), "0");
  assert.equal(decl(pagination, "--bs-pagination-bg"), "transparent");
  assert.equal(decl(pagination, "--bs-pagination-border-color"), "transparent");
  const link = block(css, ".page-link");
  assert.equal(decl(link, "min-height"), "32px");
  assert.equal(decl(link, "min-width"), "32px");
  assert.match(decl(block(css, ".page-link:hover:not(:disabled):not([aria-disabled=true])"), "background-image"), /rgba\(19, 81, 180, 0\.16\)/);
  assert.equal(decl(block(css, ".page-item .page-link"), "border-radius"), "var(--bs-pagination-border-radius)");
  assert.equal(decl(block(css, ".page-item.active .page-link, .page-link.active"), "font-weight"), "600");
  const focus = block(css, ".page-link:focus-visible");
  assert.equal(decl(focus, "outline"), "4px dashed #c2850c");
  assert.equal(decl(focus, "outline-offset"), "4px");
  assert.equal(decl(block(css, ".page-item.disabled .page-link, .page-link:disabled, .page-link[aria-disabled=true]"), "pointer-events"), "none");
});
