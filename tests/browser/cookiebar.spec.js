"use strict";

// Consentimento de cookies (src/js/dsgovbr-bootstrapped-cookies.js): barra,
// modal de configurações, botão flutuante, API e evento, na página de
// /componentes/cookiebar.html. O visual está em visual.spec.js e a a11y de
// repouso em a11y.spec.js; aqui o axe roda também com o modal aberto e no escuro.

const { test, expect } = require("./fixtures");
const AxeBuilder = require("@axe-core/playwright").default;

const PAGINA = "/componentes/cookiebar.html";
const CHAVE = "dsgovbr-bootstrapped:cookies";

test.use({ viewport: { width: 1280, height: 800 } });

function armazenado(page) {
  return page.evaluate((chave) => JSON.parse(window.localStorage.getItem(chave)), CHAVE);
}

function barra(page) {
  return page.getByRole("region", { name: "Aviso de cookies" });
}

function botaoFlutuante(page) {
  return page.getByRole("button", { name: "Configurações de cookies" });
}

// O modal tem fade (.3s): axe (contraste) e foco só valem com ele opaco e o foco já preso.
async function modalAberto(page) {
  const modal = page.getByRole("dialog", { name: "Configurações de cookies" });
  await expect(modal).toBeVisible();
  await expect.poll(() => modal.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await expect(modal).toBeFocused();
  return modal;
}

async function violacoes(page) {
  // só o componente: o resto da página (barra do catálogo) tem as próprias cores fixas
  const { violations } = await new AxeBuilder({ page }).include("dsgovbr-cookiebar").withTags(["wcag2a", "wcag2aa"]).analyze();
  return violations.map((v) => ({ regra: v.id, alvos: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
}

test.beforeEach(async ({ page }) => {
  await page.goto(PAGINA);
});

test("sem escolha salva, mostra a barra e esconde o botão flutuante", async ({ page }) => {
  await expect(page.locator("dsgovbr-cookiebar")).toHaveAttribute("data-dsgovbr-montado", "");
  await expect(barra(page)).toBeVisible();
  await expect(barra(page).getByRole("link", { name: "Declaração de Cookies" })).toBeVisible();
  for (const nome of ["Gerenciar cookies", "Rejeitar cookies", "Aceitar cookies"]) {
    await expect(barra(page).getByRole("button", { name: nome })).toBeVisible();
  }
  await expect(botaoFlutuante(page)).toBeHidden();
  expect(await armazenado(page)).toBeNull();
});

test("a barra fica no rodapé, com a sombra para cima, e não bloqueia a página", async ({ page }) => {
  const caixa = await barra(page).boundingBox();
  expect(caixa.y + caixa.height).toBeCloseTo(800, 0);
  await expect(barra(page)).toHaveCSS("box-shadow", /rgba\(0, 0, 0, 0\.16\) 0px -6px 6px/);
  await expect(page.locator(".offcanvas-backdrop, .modal-backdrop")).toHaveCount(0);
  await page.getByRole("link", { name: "Componentes" }).first().focus(); // o foco continua livre na página
});

test("aceitar: grava todos os grupos, avisa, esconde a barra e leva o foco ao botão", async ({ page }) => {
  const evento = page.evaluate(() => new Promise((resolve) => {
    document.documentElement.addEventListener("dsgovbr:cookies", (e) => resolve(e.detail), { once: true });
  }));
  await barra(page).getByRole("button", { name: "Aceitar cookies" }).click();
  expect(await evento).toEqual({ grupos: { necessarios: true, desempenho: true, funcionais: true }, origem: "aceitar" });
  expect(await armazenado(page)).toEqual({ v: 1, grupos: { desempenho: true, funcionais: true } });
  await expect(barra(page)).toBeHidden();
  await expect(botaoFlutuante(page)).toBeVisible();
  await expect(botaoFlutuante(page)).toBeFocused();
});

test("rejeitar: grava só os necessários", async ({ page }) => {
  await barra(page).getByRole("button", { name: "Rejeitar cookies" }).click();
  expect(await armazenado(page)).toEqual({ v: 1, grupos: { desempenho: false, funcionais: false } });
  expect(await page.evaluate(() => window.dsgovbrCookies.escolha())).toEqual({ necessarios: true, desempenho: false, funcionais: false });
});

test("gerenciar: o modal traz os grupos, com os necessários sempre ativos e bloqueados", async ({ page }) => {
  await barra(page).getByRole("button", { name: "Gerenciar cookies" }).click();
  const modal = page.getByRole("dialog", { name: "Configurações de cookies" });
  await expect(modal).toBeVisible();
  const necessarios = modal.getByRole("switch", { name: "Estritamente necessários" });
  await expect(necessarios).toBeChecked();
  await expect(necessarios).toBeDisabled();
  await expect(modal.getByRole("switch", { name: "Desempenho" })).not.toBeChecked();
  await expect(modal.getByRole("switch", { name: "Desempenho" })).toHaveAccessibleDescription("Medem o uso do site para melhorá-lo.");
  await expect(modal.getByRole("button", { name: "Rejeitar cookies" })).toBeVisible();
  await expect(modal.getByRole("button", { name: "Salvar" })).toBeVisible();
});

test("salvar: grava os grupos marcados, fecha o modal e o foco vai ao botão flutuante", async ({ page }) => {
  await barra(page).getByRole("button", { name: "Gerenciar cookies" }).click();
  const modal = page.getByRole("dialog", { name: "Configurações de cookies" });
  await modal.getByRole("switch", { name: "Funcionais" }).check();
  await modal.getByRole("button", { name: "Salvar" }).click();
  await expect(modal).toBeHidden();
  expect(await armazenado(page)).toEqual({ v: 1, grupos: { desempenho: false, funcionais: true } });
  expect(await page.evaluate(() => [window.dsgovbrCookies.permitido("funcionais"), window.dsgovbrCookies.permitido("desempenho")])).toEqual([true, false]);
  await expect(barra(page)).toBeHidden();
  await expect(botaoFlutuante(page)).toBeFocused();
});

test("o botão flutuante reabre as configurações já preenchidas; Escape fecha sem mudar nada", async ({ page }) => {
  await barra(page).getByRole("button", { name: "Aceitar cookies" }).click();
  await botaoFlutuante(page).click();
  const modal = page.getByRole("dialog", { name: "Configurações de cookies" });
  await expect(modal.getByRole("switch", { name: "Desempenho" })).toBeChecked();
  await expect(modal.getByRole("switch", { name: "Funcionais" })).toBeChecked();
  await modal.getByRole("switch", { name: "Desempenho" }).uncheck();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  expect(await armazenado(page)).toEqual({ v: 1, grupos: { desempenho: true, funcionais: true } });
  await botaoFlutuante(page).click(); // descartado: volta ao valor salvo
  await expect(modal.getByRole("switch", { name: "Desempenho" })).toBeChecked();
});

test("a escolha vale na próxima visita: sem barra, só o botão", async ({ page }) => {
  await barra(page).getByRole("button", { name: "Aceitar cookies" }).click();
  await page.reload();
  await expect(page.locator("dsgovbr-cookiebar")).toHaveAttribute("data-dsgovbr-montado", "");
  await expect(barra(page)).toBeHidden();
  await expect(botaoFlutuante(page)).toBeVisible();
});

test.describe("API", () => {
  test("escolha, permitido, definir e limpar, com o evento a cada mudança", async ({ page }) => {
    const r = await page.evaluate(() => {
      const c = window.dsgovbrCookies;
      const vistos = [];
      document.documentElement.addEventListener("dsgovbr:cookies", (e) => vistos.push([e.detail.origem, e.detail.grupos]));
      const antes = [c.escolha(), c.permitido("desempenho"), c.permitido("necessarios")];
      c.definir({ desempenho: true });
      const depois = [c.escolha(), c.permitido("desempenho"), c.permitido("funcionais")];
      c.limpar();
      return { antes, depois, vistos, fim: c.escolha() };
    });
    expect(r.antes).toEqual([null, false, true]);
    expect(r.depois).toEqual([{ necessarios: true, desempenho: true }, true, false]);
    expect(r.vistos).toEqual([["api", { necessarios: true, desempenho: true }], ["limpar", null]]);
    expect(r.fim).toBeNull();
  });

  test("limpar traz a barra de volta; definir esconde", async ({ page }) => {
    await page.evaluate(() => window.dsgovbrCookies.definir({ desempenho: true, funcionais: true }));
    await expect(barra(page)).toBeHidden();
    await expect(botaoFlutuante(page)).toBeVisible();
    await page.evaluate(() => window.dsgovbrCookies.limpar());
    await expect(barra(page)).toBeVisible();
    await expect(botaoFlutuante(page)).toBeHidden();
  });

  test("abrir abre as configurações; entradas inválidas dão erro claro", async ({ page }) => {
    await page.evaluate(() => window.dsgovbrCookies.abrir());
    await expect(page.getByRole("dialog", { name: "Configurações de cookies" })).toBeVisible();
    const erros = await page.evaluate(() => {
      const c = window.dsgovbrCookies;
      const pega = (f) => { try { f(); return null; } catch (e) { return e.message; } };
      return [pega(() => c.definir(null)), pega(() => c.definir({ "x y": true }))];
    });
    expect(erros[0]).toContain("informe um objeto");
    expect(erros[1]).toContain("nome de grupo inválido");
  });

  test("localStorage ilegível ou de outra versão é tratado como sem escolha", async ({ page }) => {
    await page.evaluate((chave) => window.localStorage.setItem(chave, "{não é json"), CHAVE);
    await page.reload();
    await expect(barra(page)).toBeVisible();
    await page.evaluate((chave) => window.localStorage.setItem(chave, JSON.stringify({ v: 99, grupos: { desempenho: true } })), CHAVE);
    expect(await page.evaluate(() => window.dsgovbrCookies.escolha())).toBeNull();
  });
});

test.describe("acessibilidade", () => {
  test("axe: barra, modal aberto e botão flutuante, no claro e no escuro", async ({ page }) => {
    for (const modo of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: modo });
      await page.evaluate((m) => document.documentElement.setAttribute("data-bs-theme", m), modo);
      await page.evaluate(() => window.dsgovbrCookies.limpar());
      expect(await violacoes(page), `${modo}: barra`).toEqual([]);

      await barra(page).getByRole("button", { name: "Gerenciar cookies" }).click();
      await modalAberto(page);
      expect(await violacoes(page), `${modo}: modal`).toEqual([]);

      await page.getByRole("dialog").getByRole("button", { name: "Salvar" }).click();
      await expect(page.getByRole("dialog")).toBeHidden();
      expect(await violacoes(page), `${modo}: botão`).toEqual([]);
    }
  });

  test("teclado: Tab chega aos botões da barra e o modal prende o foco", async ({ page }) => {
    await barra(page).getByRole("button", { name: "Gerenciar cookies" }).focus();
    await page.keyboard.press("Enter");
    const modal = await modalAberto(page);
    // o foco nunca cai num elemento da página atrás do modal (o <body> é a "volta" do ciclo)
    const dentro = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      dentro.push(await modal.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body));
    }
    expect(dentro.every(Boolean)).toBe(true);
  });
});

test("elemento sem grupos declarados usa só o necessário e o texto padrão", async ({ page }) => {
  const r = await page.evaluate(() => {
    document.querySelector("dsgovbr-cookiebar").remove();
    const el = document.createElement("dsgovbr-cookiebar");
    document.body.append(el);
    return {
      interruptores: el.querySelectorAll(".modal input[type=checkbox]").length,
      texto: el.querySelector("section p").textContent,
    };
  });
  expect(r.interruptores).toBe(1);
  expect(r.texto).toContain("Usamos cookies");
});

test.describe("painel: botão de ação rápida no header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exemplos/admin.html");
  });

  test("o header traz o botão de cookies (antes do modo escuro) e o cookiebar não duplica o flutuante", async ({ page }) => {
    const rapido = page.locator("header .d-xl-flex").getByRole("button", { name: "Configurações de cookies" });
    await expect(rapido).toBeVisible();
    const nomes = await page.locator("header div.d-xl-flex > *").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    expect(nomes).toEqual(["Configurações de cookies", "Modo escuro"]);
    await expect(page.locator(".dsgovbr-cookiebar-botao")).toBeHidden();
    // Relatórios e Suporte saíram do header
    await expect(page.locator("header").getByRole("link", { name: "Suporte" })).toHaveCount(0);
    await expect(page.locator("header").getByRole("link", { name: "Relatórios" })).toHaveCount(0);
  });

  test("o botão do header abre as configurações, mesmo com a escolha já feita", async ({ page }) => {
    await barra(page).getByRole("button", { name: "Aceitar cookies" }).click();
    await expect(barra(page)).toBeHidden();
    // sem botão flutuante, o foco vai ao acionador do header
    await expect(page.locator("header .d-xl-flex").getByRole("button", { name: "Configurações de cookies" })).toBeFocused();
    await page.locator("header .d-xl-flex").getByRole("button", { name: "Configurações de cookies" }).click();
    const modal = await modalAberto(page);
    await expect(modal.getByRole("switch", { name: "Desempenho" })).toBeChecked();
    await modal.getByRole("button", { name: "Rejeitar cookies" }).click();
    await expect(modal).toBeHidden();
    expect(await page.evaluate((c) => JSON.parse(localStorage.getItem(c)).grupos, CHAVE)).toEqual({ desempenho: false, funcionais: false });
    await expect(page.locator("header .d-xl-flex").getByRole("button", { name: "Configurações de cookies" })).toBeFocused();
  });

  test("no celular, o item de cookies fica no menu de funcionalidades", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.getByRole("button", { name: "Abrir funcionalidades do sistema" }).click();
    await page.locator("header .dropdown-menu.show").getByRole("button", { name: "Configurações de cookies" }).click();
    await modalAberto(page);
  });

  test("sem erro de console", async ({ page }) => {
    const erros = [];
    page.on("pageerror", (e) => erros.push(e.message));
    await page.reload();
    await barra(page).getByRole("button", { name: "Gerenciar cookies" }).click();
    expect(erros).toEqual([]);
  });
});
