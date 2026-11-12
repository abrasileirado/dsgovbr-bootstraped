"use strict";

// Recursos dos web components para aplicações renderizadas no servidor (issues
// #76 a #81): busca do header com ação e autocomplete, itens que enviam por POST,
// ações em lote e filtros da tabela e menu com badge e pastas aninhadas. Os
// elementos são criados por script na página do catálogo; as rotas de rede são
// simuladas com page.route.

const { test, expect } = require("./fixtures");

const CATALOGO = "/componentes/web-components.html";

test.use({ viewport: { width: 1280, height: 800 } });

test.beforeEach(async ({ page }) => {
  await page.goto(CATALOGO);
});

// Cria <dsgovbr-header id="h-teste"> com os atributos e, se vier, o HTML dos filhos.
async function montarHeader(page, atributos, filhos = "") {
  await page.evaluate(
    ({ atributos, filhos }) => {
      const h = document.createElement("dsgovbr-header");
      h.id = "h-teste";
      h.setAttribute("estatico", "");
      for (const [nome, valor] of Object.entries(atributos)) {
        h.setAttribute(nome, valor === true ? "" : valor);
      }
      h.innerHTML = filhos;
      document.body.prepend(h);
    },
    { atributos, filhos }
  );
  await expect(page.locator("#h-teste")).toHaveAttribute("data-dsgovbr-montado", "");
}

test.describe("#76 busca do header", () => {
  test("busca-acao, busca-nome, busca-valor e busca-id configuram o formulário", async ({ page }) => {
    await montarHeader(page, { busca: true, "busca-acao": "/busca/", "busca-nome": "termo", "busca-valor": "abc", "busca-id": "campo-busca" });
    const form = page.locator("#h-teste form[role=search]");
    await expect(form).toHaveAttribute("action", "/busca/");
    await expect(form).toHaveAttribute("method", "get");
    const campo = page.locator("#campo-busca");
    await expect(campo).toHaveAttribute("name", "termo");
    await expect(campo).toHaveValue("abc");
    await expect(form.locator("label")).toHaveAttribute("for", "campo-busca");
  });

  test("só com busca-acao o campo se chama q", async ({ page }) => {
    await montarHeader(page, { busca: true, "busca-acao": "/busca/" });
    await expect(page.locator("#h-teste input[type=search]")).toHaveAttribute("name", "q");
  });

  test("sem os atributos novos nada muda: sem action, method nem name", async ({ page }) => {
    await montarHeader(page, { busca: true });
    const form = page.locator("#h-teste form[role=search]");
    expect(await form.getAttribute("action")).toBeNull();
    expect(await form.getAttribute("method")).toBeNull();
    expect(await page.locator("#h-teste input[type=search]").getAttribute("name")).toBeNull();
    await expect(page.locator("#h-teste .dsgovbr-autocomplete")).toHaveCount(0);
  });

  test("autocomplete: sugere depois de 2 caracteres, navega por teclado e envia o formulário", async ({ page }) => {
    const pedidos = [];
    await page.route("**/sugestoes/**", (route) => {
      pedidos.push(new URL(route.request().url()).search);
      route.fulfill({ contentType: "application/json", body: JSON.stringify([{ label: "Alfa", value: "alfa" }, "alfabeto", { label: "Alface" }]) });
    });
    await page.route("**/busca/**", (route) => route.fulfill({ contentType: "text/html", body: "<title>busca</title>" }));
    await montarHeader(page, { busca: true, "busca-acao": "/busca/", "busca-nome": "termo", "busca-id": "campo-busca", "busca-autocomplete": "/sugestoes/" });

    const campo = page.locator("#campo-busca");
    await expect(campo).toHaveAttribute("role", "combobox");
    await expect(campo).toHaveAttribute("aria-expanded", "false");

    await campo.fill("a");
    await page.waitForTimeout(500);
    expect(pedidos).toEqual([]); // 1 caractere: não pede

    await campo.fill("al");
    const opcoes = page.locator("#h-teste [role=option]");
    await expect(opcoes).toHaveCount(3);
    expect(pedidos).toEqual(["?termo=al"]);
    await expect(campo).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#h-teste [role=listbox]")).toBeVisible();

    await campo.press("ArrowDown");
    await expect(opcoes.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(campo).toHaveAttribute("aria-activedescendant", (await opcoes.nth(0).getAttribute("id")) || "");
    await campo.press("ArrowDown");
    await campo.press("ArrowUp");
    await expect(opcoes.nth(0)).toHaveClass(/active/);

    await campo.press("Escape");
    await expect(page.locator("#h-teste [role=listbox]")).toBeHidden();
    await expect(campo).toHaveAttribute("aria-expanded", "false");

    await campo.fill("alf");
    await expect.poll(() => pedidos.length).toBe(2);
    await expect(campo).toHaveAttribute("aria-expanded", "true");
    await expect(opcoes).toHaveCount(3);
    await expect(opcoes.nth(0)).not.toHaveClass(/active/); // lista nova: nenhuma opção ativa
    await campo.press("ArrowDown");
    await campo.press("ArrowDown");
    await campo.press("Enter");
    await page.waitForURL(/\/busca\/\?termo=alfabeto$/);
  });

  test("clicar numa sugestão envia o valor dela e clicar fora fecha a lista", async ({ page }) => {
    await page.route("**/sugestoes/**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify([{ label: "Rótulo", value: "valor-x" }]) }));
    await page.route("**/busca/**", (route) => route.fulfill({ contentType: "text/html", body: "<title>busca</title>" }));
    await montarHeader(page, { busca: true, "busca-acao": "/busca/", "busca-autocomplete": "/sugestoes/" });
    const campo = page.locator("#h-teste input[type=search]");
    await campo.fill("ro");
    await expect(page.getByRole("option", { name: "Rótulo" })).toBeVisible();
    await page.evaluate(() => document.body.click()); // clique fora do formulário
    await expect(page.locator("#h-teste [role=listbox]")).toBeHidden();
    await campo.fill("rot");
    // o header fixo do catálogo cobre a lista nesta página: dispara o clique direto
    await page.getByRole("option", { name: "Rótulo" }).dispatchEvent("click");
    await page.waitForURL(/\/busca\/\?q=valor-x$/);
  });

  test("sem resultado mostra a mensagem e erro do endpoint fecha a lista", async ({ page }) => {
    let status = 200;
    await page.route("**/sugestoes/**", (route) => route.fulfill({ status, contentType: "application/json", body: "[]" }));
    await montarHeader(page, { busca: true, "busca-acao": "/busca/", "busca-autocomplete": "/sugestoes/" });
    const campo = page.locator("#h-teste input[type=search]");
    await campo.fill("zz");
    await expect(page.getByText("Nenhum resultado encontrado")).toBeVisible();
    status = 500;
    await campo.fill("zzz");
    await expect(page.locator("#h-teste [role=listbox]")).toBeHidden();
  });

  test("só aceita endpoint da mesma origem", async ({ page }) => {
    let pedidos = 0;
    await page.route("http://externo.test/**", (route) => { pedidos += 1; route.abort(); });
    await montarHeader(page, { busca: true, "busca-acao": "/busca/", "busca-autocomplete": "http://externo.test/sugestoes/" });
    await page.locator("#h-teste input[type=search]").fill("abc");
    await page.waitForTimeout(500);
    expect(pedidos).toBe(0);
    await expect(page.locator("#h-teste [role=listbox]")).toHaveCount(0);
  });

  test("sugestões viram texto, nunca HTML", async ({ page }) => {
    await page.route("**/sugestoes/**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(['<img src=x onerror="window.__xss=true">']) }));
    await montarHeader(page, { busca: true, "busca-acao": "/busca/", "busca-autocomplete": "/sugestoes/" });
    await page.locator("#h-teste input[type=search]").fill("ab");
    await expect(page.locator("#h-teste [role=option]")).toHaveCount(1);
    expect(await page.locator("#h-teste [role=option] img").count()).toBe(0);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });
});
