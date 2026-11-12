"use strict";

// <dsgovbr-paginacao> (src/js/dsgovbr-bootstraped-componentes.js), demonstrado em
// /componentes/paginacao.html#web-component. A a11y de repouso está em a11y.spec.js
// e o visual em visual.spec.js; aqui: lógica, eventos, foco, teclado e axe nos estados.

const { test, expect } = require("./fixtures");
const AxeBuilder = require("@axe-core/playwright").default;

const PAGINA = "/componentes/paginacao.html";

test.use({ viewport: { width: 1280, height: 800 } });

test.beforeEach(async ({ page }) => {
  await page.goto(PAGINA);
  await expect(page.locator("#pag-lista")).toHaveAttribute("data-dsgovbr-montado", "");
});

function textos(loc) {
  return loc.locator(".page-item").evaluateAll((els) => els.map((e) => e.textContent.trim()));
}

test("lista numerada: janela com reticências, atual marcada e Anterior/Próxima", async ({ page }) => {
  const lista = page.locator("#pag-lista");
  expect(await textos(lista)).toEqual(["Anterior", "1", "…", "10", "11", "12", "13", "14", "…", "50", "Próxima"]);
  const atual = lista.locator(".page-item.active");
  await expect(atual).toHaveText("12");
  await expect(atual).toHaveAttribute("aria-current", "page");
  await expect(lista.getByRole("navigation", { name: "Paginação de resultados" })).toBeVisible();
  await expect(lista.getByRole("button", { name: "Página 13" })).toBeVisible();
  await expect(lista.locator(".page-item.disabled[aria-hidden=true]")).toHaveCount(2); // reticências
});

test("clicar numa página troca a atual, atualiza o atributo, avisa e mantém o foco no teclado", async ({ page }) => {
  const evento = page.evaluate(() => new Promise((resolve) => {
    document.addEventListener("dsgovbr:pagina", (e) => resolve({ ...e.detail, alvo: e.target.id }), { once: true });
  }));
  const lista = page.locator("#pag-lista");
  await lista.getByRole("button", { name: "Página 13" }).click();
  expect(await evento).toEqual({ pagina: 13, porPagina: 10, total: 500, totalPaginas: 50, origem: "pagina", alvo: "pag-lista" });
  await expect(lista).toHaveAttribute("pagina", "13");
  await expect(lista.locator(".page-item.active")).toHaveText("13");
  expect(await textos(lista)).toEqual(["Anterior", "1", "…", "11", "12", "13", "14", "15", "…", "50", "Próxima"]);

  // teclado: o foco não se perde quando o botão é recriado
  await lista.getByRole("button", { name: "Próxima página" }).focus();
  await page.keyboard.press("Enter");
  await expect(lista.locator(".page-item.active")).toHaveText("14");
  await expect(lista.getByRole("button", { name: "Próxima página" })).toBeFocused();
});

test("primeira e última página: Anterior/Próxima ficam desabilitados e o foco vai a um controle ativo", async ({ page }) => {
  const lista = page.locator("#pag-lista");
  await page.evaluate(() => { document.querySelector("#pag-lista").pagina = 1; });
  await expect(lista.locator(".page-item").first()).toHaveClass(/disabled/);
  await expect(lista.getByText("Anterior")).toHaveAttribute("aria-disabled", "true");
  expect(await textos(lista)).toEqual(["Anterior", "1", "2", "3", "4", "5", "…", "50", "Próxima"]);
  await page.evaluate(() => { document.querySelector("#pag-lista").pagina = 50; });
  await expect(lista.getByText("Próxima")).toHaveAttribute("aria-disabled", "true");
  expect(await textos(lista)).toEqual(["Anterior", "1", "…", "46", "47", "48", "49", "50", "Próxima"]);

  await lista.getByRole("button", { name: "Página 49" }).focus();
  await page.keyboard.press("Enter");
  await expect(lista.locator(".page-item.active")).toHaveText("49");
  // o botão focado deixou de existir (virou a atual): o foco vai para "Próxima"
  await expect(lista.getByRole("button", { name: "Próxima página" })).toBeFocused();
});

test("itens por página: muda a contagem, volta à página 1 e avisa com a origem por-pagina", async ({ page }) => {
  const el = page.locator("#pag-itens");
  await expect(el.getByText("1-10 de 100 itens")).toBeVisible();
  await expect(el.getByLabel("Exibir")).toHaveValue("10");
  const evento = page.evaluate(() => new Promise((resolve) => {
    document.addEventListener("dsgovbr:pagina", (e) => resolve(e.detail), { once: true });
  }));
  await el.getByLabel("Exibir").selectOption("25");
  expect(await evento).toEqual({ pagina: 1, porPagina: 25, total: 100, totalPaginas: 4, origem: "por-pagina" });
  await expect(el).toHaveAttribute("por-pagina", "25");
  await expect(el.getByText("1-25 de 100 itens")).toBeVisible();
  expect(await textos(el)).toEqual(["Anterior", "1", "2", "3", "4", "Próxima"]);
  await el.getByRole("button", { name: "Próxima página" }).click();
  await expect(el.getByText("26-50 de 100 itens")).toBeVisible();
});

test("compacta: Exibir, informação, seletor de página e setas", async ({ page }) => {
  const el = page.locator("#pag-compacta");
  await expect(el.getByText("11-20 de 100 itens")).toBeVisible();
  await expect(el.getByLabel("Página", { exact: true })).toHaveValue("2");
  await expect(el.getByLabel("Página", { exact: true }).locator("option")).toHaveCount(10);
  await el.getByLabel("Página", { exact: true }).focus();
  await el.getByLabel("Página", { exact: true }).selectOption("5");
  await expect(el.getByText("41-50 de 100 itens")).toBeVisible();
  await expect(el.getByLabel("Página", { exact: true })).toBeFocused();
  await el.getByRole("button", { name: "Próxima página" }).click();
  await expect(el.getByLabel("Página", { exact: true })).toHaveValue("6");
  await el.getByLabel("Página", { exact: true }).selectOption("10");
  await expect(el.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  await expect(el.getByRole("button", { name: "Página anterior" })).toBeEnabled();
});

test("href: controles viram links reais com o modelo e o evento ainda dispara", async ({ page }) => {
  const el = page.locator("#pag-links");
  expect(await textos(el)).toEqual(["Anterior", "1", "2", "3", "4", "…", "9", "Próxima"]);
  await expect(el.getByRole("link", { name: "Página 4" })).toHaveAttribute("href", "#pagina-4");
  await expect(el.getByRole("link", { name: "Próxima página" })).toHaveAttribute("href", "#pagina-4");
  await el.getByRole("link", { name: "Página 4" }).click();
  await expect(page).toHaveURL(/#pagina-4$/);
  await expect(el.locator(".page-item.active")).toHaveText("4");
});

test("página fora dos limites é corrigida na leitura; total zero e totais pequenos", async ({ page }) => {
  const r = await page.evaluate(() => {
    const mk = (attrs) => {
      const el = document.createElement("dsgovbr-paginacao");
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.body.append(el);
      return el;
    };
    const a = mk({ total: "30", "por-pagina": "10", pagina: "99" });
    const b = mk({ total: "0", compacta: "", informacao: "" });
    const c = mk({ total: "5", pagina: "abc" });
    return [a.pagina, a.querySelector(".active").textContent, b.textContent.includes("0 itens"), c.pagina, c.querySelectorAll(".page-item").length];
  });
  expect(r).toEqual([3, "3", true, 1, 3]);
});

test("janela(): primeira e última sempre, uma página só no vão vira a página", async ({ page }) => {
  const r = await page.evaluate(() => {
    const j = window.dsgovbrPaginacao.janela;
    return [j(50, 100, 5), j(1, 100, 5), j(100, 100, 5), j(4, 100, 5), j(3, 8, 5), j(1, 1, 5), j(2, 7, 5)];
  });
  expect(r).toEqual([
    [1, "…", 48, 49, 50, 51, 52, "…", 100],
    [1, 2, 3, 4, 5, "…", 100],
    [1, "…", 96, 97, 98, 99, 100],
    [1, 2, 3, 4, 5, 6, "…", 100],
    [1, 2, 3, 4, 5, "…", 8],
    [1],
    [1, 2, 3, 4, 5, 6, 7],
  ]);
});

test("axe: lista, compacta e estados desabilitados, no claro e no escuro", async ({ page }) => {
  for (const modo of ["light", "dark"]) {
    await page.evaluate((m) => document.documentElement.setAttribute("data-bs-theme", m), modo);
    await page.waitForTimeout(300); // as cores dos botões têm transição (.15s)
    await page.evaluate(() => { document.querySelector("#pag-lista").pagina = 1; });
    const { violations } = await new AxeBuilder({ page })
      .include("#web-component")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(violations.map((v) => ({ regra: v.id, alvos: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })), modo).toEqual([]);
  }
});
