"use strict";

// Estilos computados no navegador real: o que o usuário vê, não só o que está
// no arquivo CSS. As alturas são aproximações deliberadas (32/40/48px — ver
// "Diferenças conhecidas" nas páginas), por isso faixas e não valores exatos.

const { test, expect } = require("./fixtures");

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

  test("altura exata 32/40/48px, em variantes preenchidas e outline", async ({ page }) => {
    for (const [seletor, altura] of [
      [".btn-primary.btn-sm", 32],
      [".btn-primary:not(.btn-sm):not(.btn-lg)", 40],
      [".btn-primary.btn-lg", 48],
      [".btn-danger:not(.btn-sm):not(.btn-lg)", 40],
      [".btn-outline-primary", 40],
      [".btn-link", 40],
    ]) {
      expect((await css(page, seletor, [])).height, seletor).toBe(altura);
    }
  });

  test("borda: zero nas preenchidas, 1px nas outline", async ({ page }) => {
    expect((await css(page, ".btn-primary", ["border-top-width"]))["border-top-width"]).toBe("0px");
    expect((await css(page, ".btn-warning", ["border-top-width"]))["border-top-width"]).toBe("0px");
    expect((await css(page, ".btn-outline-primary", ["border-top-width"]))["border-top-width"]).toBe("1px");
  });

  test("teclado: Tab chega ao botão e mostra o contorno dourado tracejado", async ({ page }) => {
    // avança com Tab (links de navegação primeiro) até chegar num botão
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      if (await page.evaluate(() => document.activeElement.classList.contains("btn"))) {
        break;
      }
    }
    const focado = page.locator(".btn:focus-visible").first();
    await expect(focado).toBeVisible();
    const f = await focado.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, offset: cs.outlineOffset, shadow: cs.boxShadow };
    });
    // contorno tracejado dourado do GOV.BR DS (#c2850c), 4px, afastado 4px
    expect(f).toEqual({ style: "dashed", width: "4px", color: "rgb(194, 133, 12)", offset: "4px", shadow: "none" });
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

  test("validação: 2px visuais na cor do estado, sem mudar a altura do campo", async ({ page }) => {
    const normal = (await css(page, "#nome", [])).height;
    const inv = await css(page, "#email", ["box-shadow", "border-top-width"]);
    const val = await css(page, "#cpf", ["box-shadow", "border-top-width"]);
    expect(inv["box-shadow"]).toBe("rgb(229, 34, 7) 0px 0px 0px 1px inset");
    expect(val["box-shadow"]).toBe("rgb(22, 136, 33) 0px 0px 0px 1px inset");
    expect(inv["border-top-width"]).toBe("1px");
    expect(inv.height).toBe(normal);
    expect(val.height).toBe(normal);
  });

  test("checkbox: caixa de 24px; marcado fica azul", async ({ page }) => {
    const box = await page.locator("#check1").boundingBox();
    expect(Math.round(box.width)).toBe(24);
    expect(Math.round(box.height)).toBe(24);
    expect((await css(page, "#check1", ["background-color"]))["background-color"]).toBe("rgb(19, 81, 180)");
  });

  test("checkbox: centrado na linha do rótulo e 8px entre as linhas", async ({ page }) => {
    const caixa = await page.locator("#check1").boundingBox();
    const rotulo = await page.locator("label[for=check1]").boundingBox();
    const centroCaixa = caixa.y + caixa.height / 2;
    const centroRotulo = rotulo.y + rotulo.height / 2;
    expect(Math.abs(centroCaixa - centroRotulo)).toBeLessThanOrEqual(1);
    const proxima = await page.locator("#check2").boundingBox();
    const vao = proxima.y - (caixa.y + caixa.height);
    expect(vao).toBeGreaterThanOrEqual(7);
    expect(vao).toBeLessThanOrEqual(9);
  });

  test("teclado: espaço marca e desmarca o checkbox", async ({ page }) => {
    const c = page.locator("#check2");
    await c.focus();
    await page.keyboard.press("Space");
    await expect(c).toBeChecked();
    await page.keyboard.press("Space");
    await expect(c).not.toBeChecked();
  });

  test("foco: borda dourada e anel de 2px, também no campo inválido", async ({ page }) => {
    for (const id of ["#nome", "#email"]) {
      await page.locator(id).focus();
      // o campo anima a borda e o anel (transition de 150ms): espera terminar
      await expect
        .poll(async () => (await css(page, id, ["border-top-color"]))["border-top-color"], { message: id })
        .toBe("rgb(194, 133, 12)");
      await expect
        .poll(async () => (await css(page, id, ["box-shadow"]))["box-shadow"], { message: id })
        .toContain("rgb(194, 133, 12) 0px 0px 0px 2px");
    }
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

test("badge estático: aparência GOV.BR DS e variantes Bootstrap preservam contraste", async ({ page }) => {
  await page.goto("/componentes/badges.html");
  const base = await css(page, ".badge:not([class*=text-bg-])", ["background-color", "color", "border-radius", "font-size", "font-weight", "line-height", "padding"]);
  expect(base["background-color"]).toBe("rgb(7, 29, 65)");
  expect(base.color).toBe("rgb(255, 255, 255)");
  expect(base["border-radius"]).toBe("4px");
  expect(base["font-size"]).toBe("14px");
  expect(base["font-weight"]).toBe("500");
  expect(base["line-height"]).toBe("21px");
  expect(base.padding).toBe("0px 12px");
  const altura = await page.locator(".badge:not([class*=text-bg-])").evaluate((el) => el.getBoundingClientRect().height);
  expect(altura).toBe(28);
  const warning = await css(page, ".badge.text-bg-warning", ["background-color", "color"]);
  expect(warning.color).toBe("rgb(0, 0, 0)");
  const counter = page.locator("button.btn .badge");
  await expect(counter).toHaveText("4");
  await expect(page.locator("button.btn")).toHaveAccessibleName("Mensagens 4");
});

test("alerta: ícone de severidade nas quatro severidades e nenhum nas extensões", async ({ page }) => {
  await page.goto("/componentes/alertas.html");
  const pseudo = (cls) =>
    page.locator(`.alert-${cls}`).first().evaluate((el) => {
      const cs = getComputedStyle(el, "::before");
      return { content: cs.content, largura: cs.width, mascara: cs.maskImage, recuo: getComputedStyle(el).paddingLeft };
    });
  for (const cls of ["success", "danger", "warning", "info"]) {
    const p = await pseudo(cls);
    expect(p.content, cls).toBe('""');
    expect(p.largura, cls).toBe("20px");
    expect(p.mascara, cls).toContain("data:image/svg+xml");
    expect(p.recuo, cls).toBe("48px"); // 16px de padding + 20px do ícone + 12px de respiro
  }
  for (const cls of ["primary", "secondary", "light", "dark"]) {
    const p = await page.locator(`.alert-${cls}`).count();
    if (p > 0) {
      expect((await pseudo(cls)).content, cls).toBe("none");
    }
  }
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
