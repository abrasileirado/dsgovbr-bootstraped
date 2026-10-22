"use strict";

// Estilos computados no navegador real: o que o usuário vê, não só o que está
// no arquivo CSS. As alturas são aproximações deliberadas (32/40/48px — ver
// "Diferenças conhecidas" nas páginas), por isso faixas e não valores exatos.

const { test, expect } = require("@playwright/test");

async function css(page, selector, props) {
  return page.locator(selector).first().evaluate((el, ps) => {
    const cs = getComputedStyle(el);
    const out = { height: el.getBoundingClientRect().height };
    for (const p of ps) {
      out[p] = cs.getPropertyValue(p);
    }
    return out;
  }, props);
}

test.describe("botão", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/componentes/botao.html");
  });

  test("btn-primary: azul do GOV.BR DS, pílula, semi-bold, 14px", async ({ page }) => {
    const s = await css(page, ".btn-primary", ["background-color", "border-top-left-radius", "font-weight", "font-size"]);
    expect(s["background-color"]).toBe("rgb(19, 81, 180)");
    expect(parseFloat(s["border-top-left-radius"])).toBeGreaterThan(100);
    expect(s["font-weight"]).toBe("600");
    expect(s["font-size"]).toBe("14px");
  });

  test("alturas aproximam 32/40/48px", async ({ page }) => {
    expect((await css(page, ".btn-primary.btn-sm", [])).height).toBeGreaterThan(30);
    expect((await css(page, ".btn-primary.btn-sm", [])).height).toBeLessThan(35);
    const md = (await css(page, ".btn-primary:not(.btn-sm):not(.btn-lg)", [])).height;
    expect(md).toBeGreaterThan(37);
    expect(md).toBeLessThan(43);
    const lg = (await css(page, ".btn-primary.btn-lg", [])).height;
    expect(lg).toBeGreaterThan(46);
    expect(lg).toBeLessThan(51);
  });

  test("teclado: Tab chega ao botão e mostra o anel de foco", async ({ page }) => {
    // avança com Tab (links de navegação primeiro) até chegar num botão
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      if (await page.evaluate(() => document.activeElement.classList.contains("btn"))) {
        break;
      }
    }
    const focado = page.locator(".btn:focus-visible").first();
    await expect(focado).toBeVisible();
    const shadow = await focado.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe("none");
  });

  test("desabilitado não recebe foco", async ({ page }) => {
    await expect(page.locator(".btn[disabled]").first()).toBeDisabled();
  });
});

test.describe("campos e seleção", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/componentes/formularios.html");
  });

  test("form-control: raio 4px, borda cinza, altura ~40px", async ({ page }) => {
    const s = await css(page, "#nome", ["border-top-left-radius", "border-top-color", "font-weight"]);
    expect(s["border-top-left-radius"]).toBe("4px");
    expect(s["border-top-color"]).toBe("rgb(136, 136, 136)");
    expect(s["font-weight"]).toBe("500");
    expect(s.height).toBeGreaterThan(37);
    expect(s.height).toBeLessThan(43);
  });

  test("validação: borda vermelha em is-invalid e verde em is-valid", async ({ page }) => {
    expect((await css(page, "#email", ["border-top-color"]))["border-top-color"]).toBe("rgb(229, 34, 7)");
    expect((await css(page, "#cpf", ["border-top-color"]))["border-top-color"]).toBe("rgb(22, 136, 33)");
  });

  test("checkbox: caixa de 24px; marcado fica azul", async ({ page }) => {
    const box = await page.locator("#check1").boundingBox();
    expect(Math.round(box.width)).toBe(24);
    expect(Math.round(box.height)).toBe(24);
    expect((await css(page, "#check1", ["background-color"]))["background-color"]).toBe("rgb(19, 81, 180)");
  });

  test("teclado: espaço marca e desmarca o checkbox", async ({ page }) => {
    const c = page.locator("#check2");
    await c.focus();
    await page.keyboard.press("Space");
    await expect(c).toBeChecked();
    await page.keyboard.press("Space");
    await expect(c).not.toBeChecked();
  });

  test("label associado: clicar no texto foca o campo", async ({ page }) => {
    await page.getByText("Nome completo", { exact: true }).click();
    await expect(page.locator("#nome")).toBeFocused();
  });
});

test("alerta: sem borda e sem raio; fechar remove o alerta", async ({ page }) => {
  await page.goto("/componentes/alertas.html");
  const s = await css(page, ".alert-success", ["border-top-width", "border-top-left-radius"]);
  expect(s["border-top-width"]).toBe("0px");
  expect(s["border-top-left-radius"]).toBe("0px");
  const fechavel = page.locator(".alert-dismissible");
  await expect(fechavel).toBeVisible();
  await fechavel.getByRole("button", { name: "Fechar" }).click();
  await expect(fechavel).toHaveCount(0);
});

test("card: sem borda e sem raio, com sombra suave", async ({ page }) => {
  await page.goto("/componentes/cards.html");
  const s = await css(page, ".card", ["border-top-width", "border-top-left-radius", "box-shadow"]);
  expect(s["border-top-width"]).toBe("0px");
  expect(s["border-top-left-radius"]).toBe("0px");
  expect(s["box-shadow"]).toContain("rgba(0, 0, 0, 0.16)");
});

test("tipografia global: Rawline declarada, 14px no corpo", async ({ page }) => {
  await page.goto("/componentes/botao.html");
  const s = await css(page, "body", ["font-family", "font-size", "color"]);
  expect(s["font-family"]).toContain("Rawline");
  expect(s["font-size"]).toBe("14px");
  expect(s.color).toBe("rgb(51, 51, 51)");
});
