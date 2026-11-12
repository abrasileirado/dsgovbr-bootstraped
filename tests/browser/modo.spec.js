"use strict";

// Seletor de modo claro/escuro (src/js/dsgovbr-bootstrapped-modo.js), usado no
// header de docs/exemplos/admin.html: segue o sistema por padrão, alterna pelo
// botão, guarda a escolha e mantém o aria-pressed em dia.

const { test, expect } = require("./fixtures");

const PAGINA = "/exemplos/admin.html";
const BOTAO = 'header .d-xl-flex [data-dsgovbr-modo]';

function modo(page) {
  return page.evaluate(() => document.documentElement.getAttribute("data-bs-theme"));
}

function fundo(page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

test.use({ viewport: { width: 1280, height: 800 } });

test("sem escolha salva, segue o sistema (claro)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(PAGINA);
  expect(await modo(page)).toBe("light");
  await expect(page.locator(BOTAO)).toHaveAttribute("aria-pressed", "false");
});

test("sem escolha salva, segue o sistema (escuro)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(PAGINA);
  expect(await modo(page)).toBe("dark");
  await expect(page.locator(BOTAO)).toHaveAttribute("aria-pressed", "true");
});

test("o botão alterna, troca as cores e a escolha vale na próxima página", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(PAGINA);
  const claro = await fundo(page);

  await page.locator(BOTAO).click();
  expect(await modo(page)).toBe("dark");
  await expect(page.locator(BOTAO)).toHaveAttribute("aria-pressed", "true");
  expect(await fundo(page)).not.toBe(claro);

  await page.reload();
  expect(await modo(page)).toBe("dark");

  await page.locator(BOTAO).click();
  expect(await modo(page)).toBe("light");
  expect(await fundo(page)).toBe(claro);
});

test("escolha salva vence o sistema; sem ela, a troca do sistema é seguida", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(PAGINA);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => modo(page)).toBe("dark");

  await page.locator(BOTAO).click(); // escolhe claro
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  expect(await modo(page)).toBe("light");
});

test("API e evento", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(PAGINA);
  const r = await page.evaluate(() => {
    const vistos = [];
    document.documentElement.addEventListener("dsgovbr:modo", (e) => vistos.push(e.detail.modo));
    window.dsgovbrModo.alternar();
    window.dsgovbrModo.aplicar("light");
    let erro = null;
    try {
      window.dsgovbrModo.aplicar("azul");
    } catch (e) {
      erro = e.message;
    }
    return { vistos, atual: window.dsgovbrModo.atual(), erro };
  });
  expect(r.vistos).toEqual(["dark", "light"]);
  expect(r.atual).toBe("light");
  expect(r.erro).toContain("modo inválido");
});
