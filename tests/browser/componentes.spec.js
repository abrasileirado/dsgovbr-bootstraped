"use strict";

// Web components (src/js/dsgovbr-bootstraped-componentes.js) usados em
// docs/exemplos/admin.html e demonstrados em /componentes/web-components.html.
// O visual está em visual.spec.js e a a11y (axe) em a11y.spec.js.

const { test, expect } = require("./fixtures");

const PAINEL = "/exemplos/admin.html";
const CATALOGO = "/componentes/web-components.html";

test.use({ viewport: { width: 1280, height: 800 } });

test.describe("painel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAINEL);
  });

  test("os quatro componentes montam e deixam de ficar escondidos", async ({ page }) => {
    for (const nome of ["dsgovbr-header", "dsgovbr-menu", "dsgovbr-footer", "dsgovbr-breadcrumb"]) {
      await expect(page.locator(nome)).toHaveAttribute("data-dsgovbr-montado", "");
    }
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("os landmarks reais existem: banner, contentinfo e navs com nome", async ({ page }) => {
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Trilha de navegação" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Acesso rápido" })).toHaveCount(0); // é <ul>, não <nav>
    await expect(page.getByRole("list", { name: "Acesso rápido" })).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();
    for (const nome of ["Sistema", "Ajuda", "Privacidade"]) {
      await expect(page.getByRole("navigation", { name: nome, exact: true })).toBeVisible();
    }
  });

  test("os hosts do header, footer e breadcrumb não criam caixa (display: contents)", async ({ page }) => {
    for (const nome of ["dsgovbr-header", "dsgovbr-footer", "dsgovbr-breadcrumb"]) {
      await expect(page.locator(nome)).toHaveCSS("display", "contents");
    }
    // o wrapper gerado (header + barra da página) é o que gruda no topo, relativo ao <body>
    await expect(page.locator("dsgovbr-header > .sticky-top")).toHaveCSS("position", "sticky");
  });

  test("breadcrumb: último item é a página atual e o primeiro é link", async ({ page }) => {
    const itens = page.locator("dsgovbr-header .breadcrumb .breadcrumb-item");
    await expect(itens).toHaveCount(3);
    await expect(itens.nth(0).getByRole("link", { name: "Início" })).toBeVisible();
    await expect(itens.nth(2)).toHaveAttribute("aria-current", "page");
    await expect(itens.nth(2)).toHaveClass(/active/);
    await expect(itens.nth(2).locator("a")).toHaveCount(0);
    await expect(page.locator("dsgovbr-header .breadcrumb")).toHaveClass(/mb-1/); // compacto dentro do header
  });

  test("header: título da página, ação e usuário vêm dos atributos e slots", async ({ page }) => {
    await expect(page.locator("dsgovbr-header h1")).toHaveText("Usuários");
    await expect(page.locator("dsgovbr-header").getByRole("button", { name: "Adicionar usuário" })).toBeVisible();
    await page.getByRole("button", { name: "Maria Silva" }).click();
    await expect(page.getByRole("link", { name: "Meu perfil" })).toBeVisible();
    await expect(page.locator("header .dropdown-menu.show .dropdown-divider")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Sair" })).toHaveAttribute("href", "login.html");
  });

  test("header: o botão de menu aponta para o dsgovbr-menu e o abre", async ({ page }) => {
    const abrir = page.getByRole("button", { name: "Abrir menu" });
    await expect(abrir).toHaveAttribute("data-bs-target", "#menu-principal");
    await expect(page.locator("dsgovbr-menu#menu-principal")).toHaveClass(/offcanvas-start/);
    await abrir.click();
    await expect(page.locator("#menu-principal")).toHaveClass(/show/);
    await expect(page.getByRole("dialog", { name: "Administração do Sistema" })).toBeVisible();
  });

  test("menu: item atual, pasta aberta por padrão e pasta fechada abre por Collapse", async ({ page }) => {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.locator("#menu-principal");
    await expect(menu.getByRole("navigation", { name: "Menu principal" })).toBeVisible();
    const atual = menu.locator("a[aria-current=page]");
    await expect(atual).toHaveText("Usuários");
    await expect(atual).toHaveClass(/active/);
    await expect(menu.getByRole("button", { name: "Cadastros" })).toHaveAttribute("aria-expanded", "true");
    await expect(menu.getByRole("button", { name: "Relatórios" })).toHaveAttribute("aria-expanded", "false");
    await expect(menu.getByRole("link", { name: "Estatísticas" })).toBeHidden();
    await menu.getByRole("button", { name: "Relatórios" }).click();
    await expect(menu.getByRole("link", { name: "Estatísticas" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Fechar o menu" })).toBeVisible();
    // o rodapé em HTML livre foi movido para dentro do menu
    await expect(menu.getByText("Creative Commons Atribuição 4.0")).toBeVisible();
  });

  test("footer: escuro, com colunas, redes sociais nomeadas e aviso", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toHaveAttribute("data-bs-theme", "dark");
    await expect(footer.locator("h2")).toHaveText(["Sistema", "Ajuda", "Privacidade"]);
    await expect(footer.getByRole("link", { name: "Termos de uso" })).toBeVisible();
    for (const rede of ["Facebook", "Twitter", "YouTube"]) {
      await expect(footer.getByRole("link", { name: rede })).toBeVisible();
    }
    await expect(footer.getByText("Licença MIT.")).toBeVisible();
  });

  test("modo escuro: os dois botões do header ficam em dia com aria-pressed", async ({ page }) => {
    const botoes = page.locator("header [data-dsgovbr-modo]");
    await expect(botoes).toHaveCount(2); // desktop e menu do celular
    await page.evaluate(() => window.dsgovbrModo.aplicar("light"));
    await expect(botoes.first()).toHaveAttribute("aria-pressed", "false");
    await page.evaluate(() => window.dsgovbrModo.aplicar("dark"));
    for (const i of [0, 1]) {
      await expect(botoes.nth(i)).toHaveAttribute("aria-pressed", "true");
    }
  });

  test("sem erro de console ao montar", async ({ page }) => {
    const erros = [];
    page.on("pageerror", (e) => erros.push(e.message));
    await page.reload();
    expect(erros).toEqual([]);
  });
});

test.describe("celular", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("acesso rápido e funcionalidades viram dropdowns; busca e modo continuam acessíveis", async ({ page }) => {
    await page.goto(PAINEL);
    await page.getByRole("button", { name: "Abrir acesso rápido" }).click();
    await expect(page.getByRole("link", { name: "Documentação" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Abrir funcionalidades do sistema" }).click();
    await expect(page.getByRole("link", { name: "Suporte" })).toBeVisible();
    await page.getByRole("button", { name: "Modo escuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", /dark|light/);
  });
});

test.describe("API dos elementos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CATALOGO);
  });

  test("elemento criado por script e anexado depois também monta", async ({ page }) => {
    const nome = await page.evaluate(() => {
      const bc = document.createElement("dsgovbr-breadcrumb");
      bc.innerHTML = '<a href="/">Raiz</a><span>Folha</span>';
      document.body.append(bc);
      return bc.querySelector(".breadcrumb-item.active").textContent;
    });
    expect(nome).toBe("Folha");
  });

  test("mudar um atributo remonta o componente", async ({ page }) => {
    const rotulo = await page.evaluate(() => {
      const bc = document.querySelector("main > section dsgovbr-breadcrumb");
      bc.setAttribute("rotulo", "Onde estou");
      return bc.querySelector("nav").getAttribute("aria-label");
    });
    expect(rotulo).toBe("Onde estou");
    await expect(page.getByRole("navigation", { name: "Onde estou" })).toBeVisible();
  });

  test("valores de atributo viram texto, nunca HTML", async ({ page }) => {
    const r = await page.evaluate(() => {
      window.__xss = false;
      const h = document.createElement("dsgovbr-header");
      h.setAttribute("titulo", '<img src=x onerror="window.__xss=true">');
      h.setAttribute("usuario", '"><script>window.__xss=true<\/script>');
      document.body.append(h);
      return { imgs: h.querySelectorAll("img").length, titulo: h.querySelector(".navbar-brand").textContent };
    });
    expect(r.imgs).toBe(0);
    expect(r.titulo).toContain("<img");
    expect(await page.evaluate(() => window.__xss)).toBe(false);
  });

  test("o header com estatico não fixa no topo", async ({ page }) => {
    await expect(page.locator("main dsgovbr-header .sticky-top")).toHaveCount(0);
  });

  test("o <header> termina antes da barra da página (breadcrumb e título ficam fora dele)", async ({ page }) => {
    await page.goto(PAINEL);
    await expect(page.locator("header .breadcrumb")).toHaveCount(0);
    await expect(page.locator("header h1")).toHaveCount(0);
    const [cab, barra] = await page.evaluate(() => {
      const c = document.querySelector("dsgovbr-header header").getBoundingClientRect();
      const b = document.querySelector("dsgovbr-header h1").getBoundingClientRect();
      return [c.bottom, b.top];
    });
    expect(barra).toBeGreaterThanOrEqual(cab);
  });

  test("o rodapé do menu de exemplo e a pasta do catálogo funcionam", async ({ page }) => {
    await page.getByRole("button", { name: "Abrir o menu de exemplo" }).click();
    const menu = page.locator("#menu-demo");
    await expect(menu).toHaveClass(/show/);
    await expect(menu.getByRole("button", { name: "Cadastros" })).toHaveAttribute("aria-expanded", "true");
    await expect(menu.locator(".collapse.show a.active")).toHaveText("Usuários");
  });
});

test("script síncrono no <head> (antes do parser terminar) monta depois do DOMContentLoaded", async ({ page }) => {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Sync</title>
    <link rel="stylesheet" href="/assets/css/dsgovbr-bootstraped.css">
    <script src="/assets/js/dsgovbr-bootstraped-componentes.js"></script></head>
    <body><main id="c"><dsgovbr-breadcrumb><a href="#">A</a><span>B</span></dsgovbr-breadcrumb></main></body></html>`;
  await page.route("**/sincrono.html", (route) => route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("/sincrono.html");
  await expect(page.locator("dsgovbr-breadcrumb .breadcrumb-item")).toHaveCount(2);
  await expect(page.locator("dsgovbr-breadcrumb .breadcrumb-item.active")).toHaveText("B");
});
