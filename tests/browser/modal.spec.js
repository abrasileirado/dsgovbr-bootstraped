"use strict";

// <dsgovbr-modal> (src/js/dsgovbr-bootstrapped-componentes.js), demonstrado em
// /componentes/modal.html#web-component. Reusa o plugin Modal do Bootstrap: aqui
// ficam abrir/fechar por acionador e API, Escape, backdrop estático, retorno do
// foco, contenção por Tab, evento e axe com o modal aberto (claro e escuro).

const { test, expect } = require("./fixtures");
const AxeBuilder = require("@axe-core/playwright").default;

const PAGINA = "/componentes/modal.html";

test.use({ viewport: { width: 1280, height: 800 } });

test.beforeEach(async ({ page }) => {
  await page.goto(PAGINA);
  await expect(page.locator("#wc-modal")).toHaveAttribute("data-dsgovbr-montado", "");
});

function dialogo(page, nome) {
  return page.getByRole("dialog", { name: nome });
}

// O modal tem fade (.3s): foco e contraste só valem com ele opaco.
async function aberto(page, nome) {
  const d = dialogo(page, nome);
  await expect(d).toBeVisible();
  await expect.poll(() => d.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await expect(d).toBeFocused(); // o plugin foca o diálogo ao terminar a transição
  return d;
}

test("monta o markup do Bootstrap: host é o .modal, título, fechar, corpo e rodapé", async ({ page }) => {
  const host = page.locator("#wc-modal");
  await expect(host).toHaveClass(/modal/);
  await expect(host).toHaveClass(/fade/);
  await expect(host).toHaveAttribute("aria-labelledby", "wc-modal-titulo");
  await expect(host.locator(".modal-dialog")).toHaveClass(/modal-dialog-centered/);
  await expect(host.locator(".modal-title")).toHaveText("Confirmar envio");
  await expect(host.locator(".modal-header .btn-close")).toHaveAttribute("aria-label", "Fechar");
  await expect(host.locator(".modal-body")).toContainText("Depois de enviada");
  await expect(host.locator(".modal-footer .btn")).toHaveText(["Cancelar", "Enviar"]);
  await expect(page.locator("dsgovbr-acoes")).toHaveCount(0); // consumido
});

test("data-dsgovbr-modal-abrir abre; Cancelar fecha; o foco volta ao acionador", async ({ page }) => {
  const gatilho = page.getByRole("button", { name: /data-dsgovbr-modal-abrir/ });
  await gatilho.focus();
  await page.keyboard.press("Enter");
  const d = await aberto(page, "Confirmar envio");
  await expect(d).toBeFocused();
  await d.getByRole("button", { name: "Cancelar" }).click();
  await expect(d).toBeHidden();
  await expect(gatilho).toBeFocused();
});

test("Escape e o botão de fechar fecham o modal padrão", async ({ page }) => {
  await page.getByRole("button", { name: /data-dsgovbr-modal-abrir/ }).click();
  const d = await aberto(page, "Confirmar envio");
  await page.keyboard.press("Escape");
  await expect(d).toBeHidden();
  await page.getByRole("button", { name: /data-dsgovbr-modal-abrir/ }).click();
  await aberto(page, "Confirmar envio");
  await d.getByRole("button", { name: "Fechar" }).click();
  await expect(d).toBeHidden();
});

test("estático (data-bs-toggle): tamanho lg, rolagem e não fecha com Escape nem clicando fora", async ({ page }) => {
  await page.getByRole("button", { name: /data-bs-toggle/ }).click();
  const d = await aberto(page, "Termos de uso");
  await expect(d.locator(".modal-dialog")).toHaveClass(/modal-lg/);
  await expect(d.locator(".modal-dialog")).toHaveClass(/modal-dialog-scrollable/);
  await page.keyboard.press("Escape");
  await page.mouse.click(5, 400); // fora do diálogo
  await expect(d).toBeVisible();
  await d.getByRole("button", { name: "Li e aceito" }).click();
  await expect(d).toBeHidden();
});

test("foco preso no modal: Tab não sai dele (o <body> é a volta do ciclo)", async ({ page }) => {
  await page.getByRole("button", { name: /data-dsgovbr-modal-abrir/ }).click();
  const d = await aberto(page, "Confirmar envio");
  const dentro = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    dentro.push(await d.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body));
  }
  expect(dentro.every(Boolean)).toBe(true);
});

test("API abrir/fechar/alternar/aberto e evento dsgovbr:modal", async ({ page }) => {
  const eventos = await page.evaluate(async () => {
    const m = document.querySelector("#wc-modal");
    const vistos = [];
    document.addEventListener("dsgovbr:modal", (e) => vistos.push([e.target.id, e.detail.aberto]));
    const espera = (tipo) => new Promise((r) => m.addEventListener(tipo, r, { once: true }));
    const antes = m.aberto;
    const a = espera("shown.bs.modal");
    m.abrir();
    await a;
    const durante = m.aberto;
    const f = espera("hidden.bs.modal");
    m.alternar();
    await f;
    return { antes, durante, depois: m.aberto, vistos };
  });
  expect(eventos).toEqual({ antes: false, durante: true, depois: false, vistos: [["wc-modal", true], ["wc-modal", false]] });
});

test("sem o bootstrap.bundle: erro claro; acionador com alvo inexistente só registra no console", async ({ page }) => {
  const r = await page.evaluate(() => {
    const bs = window.bootstrap;
    window.bootstrap = undefined;
    let erro = null;
    try {
      document.querySelector("#wc-modal").abrir();
    } catch (e) {
      erro = e.message;
    }
    window.bootstrap = bs;
    return erro;
  });
  expect(r).toContain("carregue o bootstrap.bundle");
  const logs = [];
  page.on("console", (m) => { if (m.type() === "error") logs.push(m.text()); });
  await page.evaluate(() => {
    const b = document.createElement("button");
    b.setAttribute("data-dsgovbr-modal-abrir", "#nao-existe");
    document.body.append(b);
    b.click();
  });
  expect(logs.join(" ")).toContain("não há <dsgovbr-modal>");
});

test("elemento criado por script monta, gera id e abre", async ({ page }) => {
  const r = await page.evaluate(async () => {
    const m = document.createElement("dsgovbr-modal");
    m.setAttribute("titulo", "Criado por script");
    m.setAttribute("tamanho", "tela-cheia");
    m.textContent = "Corpo";
    document.body.append(m);
    const shown = new Promise((res) => m.addEventListener("shown.bs.modal", res, { once: true }));
    m.abrir();
    await shown;
    return [m.id.startsWith("dsgovbr-modal-"), m.querySelector(".modal-dialog").className, m.aberto, m.querySelector(".modal-footer") === null];
  });
  expect(r).toEqual([true, "modal-dialog modal-fullscreen", true, true]);
});

test("título vindo de atributo vira texto, nunca HTML", async ({ page }) => {
  const r = await page.evaluate(() => {
    window.__xss = false;
    const m = document.createElement("dsgovbr-modal");
    m.setAttribute("titulo", '<img src=x onerror="window.__xss=true">');
    document.body.append(m);
    return [m.querySelectorAll("img").length, m.querySelector(".modal-title").textContent, window.__xss];
  });
  expect(r[0]).toBe(0);
  expect(r[1]).toContain("<img");
  expect(r[2]).toBe(false);
});

test("axe: modal aberto, no claro e no escuro", async ({ page }) => {
  for (const modo of ["light", "dark"]) {
    await page.evaluate((m) => document.documentElement.setAttribute("data-bs-theme", m), modo);
    await page.getByRole("button", { name: /data-bs-toggle/ }).click();
    await aberto(page, "Termos de uso");
    const { violations } = await new AxeBuilder({ page }).include("#wc-modal-estatico").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(violations.map((v) => ({ regra: v.id, alvos: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })), modo).toEqual([]);
    await dialogo(page, "Termos de uso").getByRole("button", { name: "Li e aceito" }).click();
    await expect(dialogo(page, "Termos de uso")).toBeHidden();
  }
});
