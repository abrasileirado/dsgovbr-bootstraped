"use strict";

// Chave "Aplicar GOV.BR DS" do catálogo (src/site/catalogo.js): troca o CSS
// entre o tema e o Bootstrap puro, guarda a escolha entre páginas e reflete
// na URL. Também confere que os plugins de opt-in (tooltip, popover, toast)
// são iniciados pelo catálogo.

const { test, expect } = require("./fixtures");

const TEMA = "#catalogo-tema";
const FONTE = "#catalogo-fonte";
const CHAVE = "#catalogo-alternar-tema";

async function estado(page) {
  return page.evaluate(
    ([tema, fonte]) => ({
      href: document.querySelector(tema).getAttribute("href"),
      fonteDesligada: document.querySelector(fonte).disabled,
      atributo: document.documentElement.getAttribute("data-catalogo-tema"),
      corPrimaria: getComputedStyle(document.documentElement).getPropertyValue("--bs-primary").trim(),
    }),
    [TEMA, FONTE]
  );
}

test("padrão: GOV.BR DS ativo, com a Rawline", async ({ page }) => {
  await page.goto("/componentes/botao.html");
  await expect(page.locator(CHAVE)).toBeChecked();
  const s = await estado(page);
  expect(s.href).toBe("../assets/css/dsgovbr-bootstraped.css");
  expect(s.fonteDesligada).toBe(false);
  expect(s.atributo).toBe("dsgovbr");
  expect(s.corPrimaria).toBe("#1351b4");
});

test("?tema=bootstrap: Bootstrap puro, sem a Rawline, chave desligada", async ({ page }) => {
  await page.goto("/componentes/botao.html?tema=bootstrap");
  await expect(page.locator(CHAVE)).not.toBeChecked();
  const s = await estado(page);
  expect(s.href).toBe("../assets/vendor/bootstrap/css/bootstrap.min.css");
  expect(s.fonteDesligada).toBe(true);
  expect(s.atributo).toBe("bootstrap");
  expect(s.corPrimaria).toBe("#0d6efd");
});

test("alternar pela chave troca o CSS, atualiza a URL e vale para a próxima página", async ({ page }) => {
  await page.goto("/componentes/modal.html");
  await page.locator(CHAVE).uncheck();
  await expect.poll(async () => (await estado(page)).corPrimaria).toBe("#0d6efd");
  expect(new URL(page.url()).searchParams.get("tema")).toBe("bootstrap");

  await page.goto("/componentes/index.html");
  await expect(page.locator(CHAVE)).not.toBeChecked();
  expect((await estado(page)).href).toBe("../assets/vendor/bootstrap/css/bootstrap.min.css");

  await page.locator(CHAVE).check();
  await expect.poll(async () => (await estado(page)).corPrimaria).toBe("#1351b4");
  expect(new URL(page.url()).searchParams.get("tema")).toBe("dsgovbr");
});

test("valor inválido em ?tema= é ignorado", async ({ page }) => {
  await page.goto("/componentes/botao.html?tema=outro");
  await expect(page.locator(CHAVE)).toBeChecked();
  expect((await estado(page)).atributo).toBe("dsgovbr");
});

test("páginas de componente mostram o status da matriz e linkam o Bootstrap", async ({ page }) => {
  await page.goto("/componentes/collapse.html");
  const faixa = page.locator(".catalogo-status");
  await expect(faixa).toContainText("Status na matriz: Não suportado.");
  await expect(faixa.getByRole("link", { name: "documentação do Bootstrap 5.3" })).toHaveAttribute(
    "href",
    "https://getbootstrap.com/docs/5.3/components/collapse/"
  );
});

test("tooltip é iniciado pelo catálogo", async ({ page }) => {
  await page.goto("/componentes/tooltips.html");
  await page.getByRole("button", { name: "Em cima" }).hover();
  await expect(page.getByRole("tooltip", { name: "Dica em cima" })).toBeVisible();
});

test("popover é iniciado pelo catálogo", async ({ page }) => {
  await page.goto("/componentes/popovers.html");
  await page.getByRole("button", { name: "Em cima" }).click();
  await expect(page.locator(".popover:not(.position-relative) .popover-body")).toHaveText("O prazo conta a partir do envio.");
});

test("toast abre pelo botão do catálogo", async ({ page }) => {
  await page.goto("/componentes/toasts.html");
  await page.getByRole("button", { name: "Mostrar toast" }).click();
  await expect(page.locator("#toast-interativo")).toBeVisible();
});

test("modal abre e fecha com Esc", async ({ page }) => {
  await page.goto("/componentes/modal.html");
  await page.getByRole("button", { name: "Abrir modal", exact: true }).click();
  const dialogo = page.getByRole("dialog", { name: "Confirmar envio" });
  // o plugin só aceita Esc depois da transição de abertura, quando foca o modal
  await expect(dialogo).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
});
