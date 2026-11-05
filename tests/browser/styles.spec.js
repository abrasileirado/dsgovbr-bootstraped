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

test.describe("paginação", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/componentes/paginacao.html");
  });

  test("links têm 32px, formato circular; ativo tem fundo GOV.BR DS", async ({ page }) => {
    const links = page.locator(".pagination .page-link");
    const first = await links.nth(1).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, radius: cs.borderTopLeftRadius };
    });
    expect(first.width).toBeGreaterThanOrEqual(32);
    expect(first.height).toBe(32);
    expect(parseFloat(first.radius)).toBeGreaterThan(100);
    const active = await css(page, ".page-item.active .page-link", ["background-color", "color", "font-weight"]);
    expect(active["background-color"]).toBe("rgb(12, 50, 111)");
    expect(active.color).toBe("rgb(255, 255, 255)");
    expect(active["font-weight"]).toBe("600");
  });

  test("hover destaca sem remover foco visível; desabilitado não navega", async ({ page }) => {
    const next = page.getByRole("link", { name: "Próxima" });
    await next.hover();
    await expect
      .poll(async () => (await css(page, "a.page-link:hover", ["background-image"]))["background-image"])
      .toContain("rgba(19, 81, 180, 0.16)");
    await next.focus();
    const focus = await css(page, "a.page-link:focus-visible", ["outline-style", "outline-width", "outline-color", "outline-offset"]);
    expect(focus).toMatchObject({ "outline-style": "dashed", "outline-width": "4px", "outline-color": "rgb(194, 133, 12)", "outline-offset": "4px" });
    await expect(page.locator(".page-item.disabled .page-link")).toHaveAttribute("aria-disabled", "true");
    await expect(page.locator(".page-item.active .page-link")).toHaveAttribute("aria-current", "page");
  });
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

// --- Issue #43: componentes do catálogo adaptados por tokens e CSS ---

// Uma tecla antes do focus() faz o Chromium tratar o foco como de teclado
// (:focus-visible). As abas inativas têm tabindex="-1" (plugin Tab), então
// não dá para chegar nelas só com Tab.
async function focoPorTeclado(page, seletor) {
  await page.keyboard.press("Shift");
  await page.locator(seletor).first().focus();
  return css(page, seletor, ["outline-style", "outline-color", "outline-width", "box-shadow"]);
}

function focoDourado(s) {
  expect(s["outline-style"]).toBe("dashed");
  expect(s["outline-color"]).toBe("rgb(194, 133, 12)");
  expect(s["outline-width"]).toBe("4px");
  expect(s["box-shadow"]).toBe("none");
}

test("accordion: cabeçalho sem fundo, azul, 16,8px, ícone antes do título, aberto em semi-bold", async ({ page }) => {
  await page.goto("/componentes/acordeao.html");
  const aberto = await css(page, "#acordeao-padrao .accordion-button:not(.collapsed)", [
    "background-color", "color", "font-size", "font-weight", "box-shadow",
  ]);
  expect(aberto["background-color"]).toBe("rgba(0, 0, 0, 0)");
  expect(aberto.color).toBe("rgb(19, 81, 180)");
  expect(aberto["font-size"]).toBe("16.8px");
  expect(aberto["font-weight"]).toBe("600");
  expect(aberto["box-shadow"]).toBe("none");
  const ordem = await page.locator(".accordion-button").first().evaluate((el) => getComputedStyle(el, "::after").order);
  expect(ordem).toBe("-1");
  const item = await css(page, ".accordion-item", ["border-left-width", "border-bottom-color"]);
  expect(item["border-left-width"]).toBe("0px");
  expect(item["border-bottom-color"]).toBe("rgb(204, 204, 204)");
});

test("foco tracejado dourado global: accordion, aba, item de lista e botão de fechar", async ({ page }) => {
  await page.goto("/componentes/acordeao.html");
  focoDourado(await focoPorTeclado(page, "#acordeao-padrao .accordion-button.collapsed"));
  await page.goto("/componentes/navs-abas.html");
  focoDourado(await focoPorTeclado(page, "#aba-endereco"));
  await page.goto("/componentes/list-group.html");
  focoDourado(await focoPorTeclado(page, ".list-group-item-action"));
  await page.goto("/componentes/botao-fechar.html");
  focoDourado(await focoPorTeclado(page, ".btn-close:not(:disabled)"));
});

test("aba: sem moldura, sublinhado de 4px em --active, 20,16px", async ({ page }) => {
  await page.goto("/componentes/navs-abas.html");
  const ativa = await css(page, "#aba-dados", [
    "border-bottom-width", "border-bottom-color", "border-top-width", "color", "font-size",
  ]);
  expect(ativa["border-bottom-width"]).toBe("4px");
  expect(ativa["border-bottom-color"]).toBe("rgb(12, 50, 111)");
  expect(ativa["border-top-width"]).toBe("0px");
  expect(ativa.color).toBe("rgb(12, 50, 111)");
  expect(ativa["font-size"]).toBe("20.16px");
  await page.locator("#aba-endereco").click();
  await expect(page.locator("#painel-endereco")).toBeVisible();
});

test("botão de fechar: círculo de 40px", async ({ page }) => {
  await page.goto("/componentes/botao-fechar.html");
  const s = await css(page, ".btn-close", ["width", "border-top-left-radius"]);
  expect(Math.round(s.height)).toBe(40);
  expect(s["border-top-left-radius"]).toBe("50%");
});

test("list group: selecionado em --selected, sem moldura lateral", async ({ page }) => {
  await page.goto("/componentes/list-group.html");
  const s = await css(page, ".list-group-item.active", ["background-color", "border-left-width"]);
  expect(s["background-color"]).toBe("rgb(38, 112, 232)");
  expect(s["border-left-width"]).toBe("0px");
});

test("breadcrumb: chevron como divisor e ícone de casa no primeiro link", async ({ page }) => {
  await page.goto("/componentes/breadcrumb.html");
  const divisor = await page
    .locator(".breadcrumb-item + .breadcrumb-item")
    .first()
    .evaluate((el) => getComputedStyle(el, "::before").content);
  expect(divisor).toBe('"›"');
  const casa = await page
    .locator(".breadcrumb-item:first-child > a")
    .first()
    .evaluate((el) => getComputedStyle(el, "::before").maskImage || getComputedStyle(el, "::before").webkitMaskImage);
  expect(casa).toContain("data:image/svg+xml");
});

test("tooltip: fundo azul informativo, texto branco, raio 4px", async ({ page }) => {
  await page.goto("/componentes/tooltips.html");
  const s = await css(page, ".tooltip.position-relative .tooltip-inner", [
    "background-color", "color", "border-top-left-radius", "padding-top",
  ]);
  expect(s["background-color"]).toBe("rgb(21, 91, 203)");
  expect(s.color).toBe("rgb(255, 255, 255)");
  expect(s["border-top-left-radius"]).toBe("4px");
  expect(s["padding-top"]).toBe("16px");
});

test("spinner: azul interativo, 44px no padrão e 24px no -sm", async ({ page }) => {
  await page.goto("/componentes/spinners.html");
  // height computado: a caixa gira na animação, então getBoundingClientRect varia
  const padrao = await css(page, ".spinner-border:not(.spinner-border-sm):not([style])", ["height", "border-top-color", "border-top-width"]);
  expect(padrao.height).toBe("44px");
  expect(padrao["border-top-color"]).toBe("rgb(19, 81, 180)");
  expect(padrao["border-top-width"]).toBe("4px");
  const pequeno = await css(page, "p > .spinner-border-sm", ["height", "border-top-width"]);
  expect(pequeno.height).toBe("24px");
  expect(pequeno["border-top-width"]).toBe("2px");
});

test("modal: sem raio, título em negrito de 16,8px, fundo preto a 45%", async ({ page }) => {
  await page.goto("/componentes/modal.html");
  const s = await css(page, ".modal.position-static .modal-content", ["border-top-left-radius", "border-top-width"]);
  expect(s["border-top-left-radius"]).toBe("0px");
  expect(s["border-top-width"]).toBe("0px");
  const titulo = await css(page, ".modal.position-static .modal-title", ["font-size", "font-weight"]);
  expect(titulo["font-size"]).toBe("16.8px");
  expect(titulo["font-weight"]).toBe("700");
  await page.getByRole("button", { name: "Abrir modal", exact: true }).click();
  await expect(page.locator(".modal-backdrop.show")).toHaveCSS("opacity", "0.45");
});

test.describe("header, menu e footer (issue #45)", () => {
  test("navbar clara: sombra, título na cor do texto, links interativos, acionador circular", async ({ page }) => {
    await page.goto("/componentes/navbar.html");
    const nav = await css(page, ".navbar:not([data-bs-theme])", ["box-shadow", "padding-top", "background-color"]);
    expect(nav["box-shadow"]).toBe("rgba(0, 0, 0, 0.16) 0px 1px 6px 0px");
    expect(nav["padding-top"]).toBe("16px");
    expect(nav["background-color"]).toBe("rgb(255, 255, 255)");
    const marca = await css(page, ".navbar:not([data-bs-theme]) .navbar-brand", ["color", "font-size"]);
    expect(marca.color).toBe("rgb(51, 51, 51)");
    expect(marca["font-size"]).toBe("24.192px"); // viewport desktop (lg)
    const link = await css(page, ".navbar:not([data-bs-theme]) .nav-link:not(.active):not(.disabled):not(.dropdown-toggle)", ["color"]);
    expect(link.color).toBe("rgb(19, 81, 180)");
    const ativo = await css(page, ".navbar:not([data-bs-theme]) .nav-link.active", ["color", "font-weight"]);
    expect(ativo.color).toBe("rgb(12, 50, 111)");
    expect(ativo["font-weight"]).toBe("600");
  });

  test("navbar escura: fundo --background-dark e links --interactive-dark", async ({ page }) => {
    await page.goto("/componentes/navbar.html");
    const nav = await css(page, '.navbar[data-bs-theme="dark"]', ["background-color"]);
    expect(nav["background-color"]).toBe("rgb(7, 29, 65)");
    const link = await css(page, '.navbar[data-bs-theme="dark"] .nav-link:not(.active)', ["color"]);
    expect(link.color).toBe("rgb(197, 212, 235)");
    const marca = await css(page, '.navbar[data-bs-theme="dark"] .navbar-brand', ["color"]);
    expect(marca.color).toBe("rgb(255, 255, 255)");
  });

  test("acionador do menu: círculo de 40px sem borda e foco dourado", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/componentes/navbar.html");
    const t = await css(page, ".navbar-toggler", ["border-top-width", "border-top-left-radius", "width"]);
    expect(t.height).toBe(40);
    expect(t.width).toBe("40px");
    expect(t["border-top-width"]).toBe("0px");
    expect(t["border-top-left-radius"]).toBe("50%");
    const marca = await css(page, ".navbar-brand", ["font-size"]);
    expect(marca["font-size"]).toBe("14px"); // celular
    focoDourado(await focoPorTeclado(page, ".navbar-toggler"));
  });

  test("footer escuro: fundo --background-dark, texto --color-dark, foco --focus-color-dark", async ({ page }) => {
    await page.goto("/exemplos/admin.html");
    const f = await css(page, "footer", ["background-color", "color"]);
    expect(f["background-color"]).toBe("rgb(7, 29, 65)");
    expect(f.color).toBe("rgb(255, 255, 255)");
    const link = await css(page, "footer .nav-link", ["color"]);
    expect(link.color).toBe("rgb(197, 212, 235)");
    const foco = await focoPorTeclado(page, "footer .nav-link");
    expect(foco["outline-style"]).toBe("dashed");
    expect(foco["outline-color"]).toBe("rgb(255, 190, 46)");
  });

  test("painel: Header com duas linhas, busca, Entrar e botões circulares", async ({ page }) => {
    await page.goto("/exemplos/admin.html");
    const sub = await css(page, ".navbar-brand + .navbar-text", ["font-size", "font-weight", "color", "display"]);
    expect(sub.display).toBe("block");
    expect(sub["font-size"]).toBe("14px"); // xl
    expect(sub["font-weight"]).toBe("500");
    expect(sub.color).toBe("rgb(51, 51, 51)");
    const busca = await css(page, '[role="search"] .form-control', ["background-color", "font-size", "min-height"]);
    expect(busca["background-color"]).toBe("rgb(248, 248, 248)");
    expect(busca["font-size"]).toBe("16.8px");
    expect(busca.height).toBe(40);
    const entrar = await css(page, ".navbar .btn-light", ["background-color", "color", "font-size", "border-top-left-radius"]);
    expect(entrar["background-color"]).toBe("rgb(248, 248, 248)");
    expect(entrar.color).toBe("rgb(19, 81, 180)");
    expect(entrar.height).toBe(32);
    const circulo = await page.getByRole("button", { name: "Abrir menu" }).boundingBox();
    expect([circulo.width, circulo.height]).toEqual([32, 32]);
    const vr = await css(page, ".navbar .vr", ["background-color", "opacity"]);
    expect(vr["background-color"]).toBe("rgb(204, 204, 204)");
    expect(vr.opacity).toBe("1");
  });

  test("painel: Menu em offcanvas com pasta, ativo em --active, foco e Escape", async ({ page }) => {
    await page.goto("/exemplos/admin.html");
    const menu = page.locator("#menu-principal");
    const abrir = page.getByRole("button", { name: "Abrir menu" });
    await abrir.click();
    await expect(menu).toHaveClass(/show/);
    await expect(menu).toBeFocused();
    const ativo = await css(page, "#menu-principal .list-group-item.active", ["background-color", "color"]);
    expect(ativo["background-color"]).toBe("rgb(12, 50, 111)");
    expect(ativo.color).toBe("rgb(255, 255, 255)");
    const item = await css(page, "#menu-principal .list-group-item:not(.active)", ["color", "padding-top"]);
    expect(item.color).toBe("rgb(19, 81, 180)");
    expect(item["padding-top"]).toBe("16px");
    const sub = await css(page, "#menu-cadastros > .list-group", ["background-color"]);
    expect(sub["background-color"]).toBe("rgb(248, 248, 248)");

    const pasta = page.getByRole("button", { name: "Relatórios" });
    await expect(pasta).toHaveAttribute("aria-expanded", "false");
    await pasta.click();
    await expect(page.locator("#menu-relatorios")).toHaveClass(/show/);
    await expect(pasta).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveClass(/show/);
    await expect(abrir).toBeFocused();
  });

  test("painel no celular: menu cabe na tela e busca abre por Collapse", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/exemplos/admin.html");
    await expect(page.locator("#busca-header")).toBeHidden();
    await page.getByRole("button", { name: "Abrir busca" }).click();
    await expect(page.locator("#busca-geral")).toBeVisible();
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.locator("#menu-principal");
    await expect(menu).toHaveClass(/show/);
    await expect(menu).toBeFocused();
    const caixa = await menu.boundingBox();
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(375);
  });

  test("footer: categorias e itens de 56px", async ({ page }) => {
    await page.goto("/exemplos/admin.html");
    const h = await css(page, "footer h2", ["font-size", "font-weight", "text-transform", "color"]);
    expect(h["font-size"]).toBe("11.662px");
    expect(h["font-weight"]).toBe("700");
    expect(h["text-transform"]).toBe("uppercase");
    expect(h.color).toBe("rgb(197, 212, 235)");
    expect(h.height).toBe(56);
    const link = await css(page, "footer .nav-link", []);
    expect(link.height).toBe(56);
  });

  test("skip link aparece no foco e leva ao conteúdo", async ({ page }) => {
    await page.goto("/exemplos/admin.html");
    await page.keyboard.press("Tab");
    const pular = page.getByRole("link", { name: "Ir para o conteúdo" });
    await expect(pular).toBeFocused();
    await expect(pular).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("#conteudo")).toBeFocused();
  });
});

test.describe("select e switch (issue #46)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/componentes/formularios.html");
  });

  test("select: superfície do campo de texto, 40px de respiro e seta interativa", async ({ page }) => {
    const s = await css(page, "#select1", [
      "border-top-left-radius", "border-top-color", "font-weight", "padding-right", "background-position", "background-image",
    ]);
    expect(s["border-top-left-radius"]).toBe("4px");
    expect(s["border-top-color"]).toBe("rgb(136, 136, 136)");
    expect(s["font-weight"]).toBe("500");
    expect(s["padding-right"]).toBe("40px");
    expect(s["background-position"]).toMatch(/^calc\(100% - 12px\) 50%/); // right 12px center
    expect(s["background-image"]).toContain("%231351b4"); // --interactive
    const campo = (await css(page, "#nome", [])).height;
    expect(Math.abs(s.height - campo)).toBeLessThan(1);
  });

  test("select: foco dourado e erro com 2px visuais", async ({ page }) => {
    await page.locator("#select1").focus();
    await expect.poll(async () => (await css(page, "#select1", ["border-top-color"]))["border-top-color"]).toBe("rgb(194, 133, 12)");
    // a transição do campo (.15s) passa por valores intermediários: espera o final
    await expect.poll(async () => (await css(page, "#select1", ["box-shadow"]))["box-shadow"]).toBe("rgb(194, 133, 12) 0px 0px 0px 2px");
    const e = await css(page, "#select-erro", ["box-shadow"]);
    expect(e["box-shadow"]).toBe("rgb(229, 34, 7) 0px 0px 0px 1px inset");
  });

  test("switch: trilho 52x30 branco, botão de 22px cinza/azul a 4px da borda", async ({ page }) => {
    const props = ["background-color", "border-top-color", "background-size", "background-position", "background-image"];
    const off = await css(page, "#switch2", props);
    const on = await css(page, "#switch1", props);
    const caixa = await page.locator("#switch2").boundingBox();
    expect([caixa.width, caixa.height]).toEqual([52, 30]);
    for (const s of [off, on]) {
      expect(s["background-color"]).toBe("rgb(255, 255, 255)");
      expect(s["border-top-color"]).toBe("rgb(204, 204, 204)");
      expect(s["background-size"]).toBe("22px 22px");
    }
    expect(off["background-position"]).toBe("3px 50%"); // left 3px center
    expect(on["background-position"]).toBe("calc(100% - 3px) 50%"); // right 3px center
    expect(off["background-image"]).toContain("%23ccc");
    expect(on["background-image"]).toContain("%235992ed");
  });

  test("switch: hover em camada, foco dourado por teclado e alterna com espaço", async ({ page }) => {
    await page.locator("#switch2").hover();
    expect((await css(page, "#switch2", ["background-image"]))["background-image"]).toContain("linear-gradient");
    await page.locator("#switch1").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#switch2")).toBeFocused();
    await expect.poll(async () => (await css(page, "#switch2", ["box-shadow"]))["box-shadow"]).toBe("rgb(194, 133, 12) 0px 0px 0px 2px");
    await page.keyboard.press("Space");
    await expect(page.locator("#switch2")).toBeChecked();
  });

  test("switch reverso: rótulo à esquerda, como o padrão do GOV.BR DS", async ({ page }) => {
    const input = await page.locator("#switch4").boundingBox();
    const label = await page.locator("label[for=switch4]").boundingBox();
    expect(input.x).toBeGreaterThan(label.x + label.width);
  });
});

test.describe("auxiliares (issue #47)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/componentes/auxiliares.html");
  });

  test("skiplink: fixo no topo com sombra, 300px e itens de 56px ao receber foco", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Atalhos da página" });
    const link = page.getByRole("link", { name: "Ir para o skiplink" });
    await link.focus();
    await expect(link).toBeVisible();
    const s = await css(page, "nav.visually-hidden-focusable", ["position", "top", "left", "box-shadow", "background-color", "min-width"]);
    expect(s.position).toBe("fixed");
    expect(s.top).toBe("0px");
    expect(s.left).toBe("16px");
    expect(s["box-shadow"]).toBe("rgba(0, 0, 0, 0.16) 0px 6px 6px 0px");
    expect(s["background-color"]).toBe("rgb(255, 255, 255)");
    expect(s["min-width"]).toBe("300px");
    expect((await link.boundingBox()).height).toBe(56);
    await page.keyboard.press("Enter");
    await expect(page.locator("#skiplink")).toBeFocused();
    await expect(nav).not.toBeInViewport();
  });

  test("sign-in: .btn-light cinza-claro com texto interativo, também no escuro", async ({ page }) => {
    const props = ["background-color", "color", "padding-left", "border-top-left-radius"];
    const claro = await css(page, "section .btn-light", props);
    expect(claro["background-color"]).toBe("rgb(248, 248, 248)");
    expect(claro.color).toBe("rgb(19, 81, 180)");
    expect(claro["padding-left"]).toBe("16px");
    expect(claro.height).toBe(40);
    const escuro = await css(page, '[data-bs-theme="dark"] .btn-light', props);
    expect(escuro["background-color"]).toBe("rgb(7, 29, 65)");
    expect(escuro.color).toBe("rgb(197, 212, 235)");
    const img = await page.locator(".btn-light img").boundingBox();
    expect(img.height).toBeLessThanOrEqual(20);
  });

  test("avatar: círculos de 40, 100 e 160px", async ({ page }) => {
    const tamanhos = await page.locator("img.rounded-circle").evaluateAll((els) =>
      els.map((e) => [e.getBoundingClientRect().width, getComputedStyle(e).borderTopLeftRadius])
    );
    expect(tamanhos.map((t) => t[0])).toEqual([40, 100, 160]);
    for (const [, raio] of tamanhos) expect(raio).toBe("50%");
  });

  test("cookiebar: painel inferior com sombra para cima, sem fechar no Escape", async ({ page }) => {
    await page.getByRole("button", { name: "Ver aviso de cookies" }).click();
    const painel = page.locator("#cookiebar");
    await expect(painel).toHaveClass(/show/);
    const s = await css(page, "#cookiebar", ["box-shadow", "border-top-width"]);
    expect(s["box-shadow"]).toBe("rgba(0, 0, 0, 0.16) 0px -6px 6px 0px");
    expect(s["border-top-width"]).toBe("0px");
    await page.keyboard.press("Escape");
    await expect(painel).toHaveClass(/show/);
    await page.getByRole("button", { name: "Definir cookies" }).click();
    await expect(page.locator("#cookiebar-grupos")).toHaveClass(/show/);
    await page.getByRole("button", { name: "Aceitar" }).click();
    await expect(painel).not.toHaveClass(/show/);
  });
});
