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

// Cria <dsgovbr-menu id="m-teste"> com o HTML dos filhos e o monta.
async function montarMenu(page, filhos, atributos = {}) {
  await page.evaluate(
    ({ filhos, atributos }) => {
      const m = document.createElement("dsgovbr-menu");
      m.id = "m-teste";
      m.setAttribute("titulo", "Menu de teste");
      for (const [nome, valor] of Object.entries(atributos)) m.setAttribute(nome, valor === true ? "" : valor);
      m.innerHTML = filhos;
      document.body.append(m);
    },
    { filhos, atributos }
  );
  await expect(page.locator("#m-teste")).toHaveAttribute("data-dsgovbr-montado", "");
}

test.describe("#77 item com POST", () => {
  const SAIR = '<dsgovbr-item href="/sair/" metodo="post"><dsgovbr-campo-oculto nome="csrfmiddlewaretoken" valor="abc123"></dsgovbr-campo-oculto><dsgovbr-campo-oculto nome="next" valor="/inicio/?a=1&amp;b=2"></dsgovbr-campo-oculto>Sair</dsgovbr-item>';

  test("no menu do usuário vira form POST com os campos ocultos e envia", async ({ page }) => {
    await page.route("**/sair/", (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>saiu</title>" })
    );
    await montarHeader(page, { usuario: "Maria" }, `<dsgovbr-usuario-menu><dsgovbr-item href="/perfil/">Perfil</dsgovbr-item><dsgovbr-divisor></dsgovbr-divisor>${SAIR}</dsgovbr-usuario-menu>`);
    const form = page.locator("#h-teste form.dsgovbr-form-item");
    await expect(form).toHaveAttribute("method", "post");
    await expect(form).toHaveAttribute("action", "/sair/");
    await expect(form.locator("input[type=hidden]")).toHaveCount(2);
    await expect(form.locator('input[name="csrfmiddlewaretoken"]')).toHaveValue("abc123");
    await expect(form.locator('input[name="next"]')).toHaveValue("/inicio/?a=1&b=2");
    await expect(form.locator("button")).toHaveClass(/dropdown-item/);
    // o item sem metodo continua sendo link
    await expect(page.locator("#h-teste a.dropdown-item", { hasText: "Perfil" })).toHaveAttribute("href", "/perfil/");

    // o header fixo do catálogo cobre o dropdown nesta página: dispara o clique direto
    const [pedido] = await Promise.all([
      page.waitForRequest("**/sair/"),
      form.locator("button").dispatchEvent("click"),
    ]);
    expect(pedido.method()).toBe("POST");
    expect(pedido.postData()).toContain("csrfmiddlewaretoken=abc123");
    expect(pedido.postData()).toContain("next=%2Finicio%2F%3Fa%3D1%26b%3D2");
  });

  test("funciona no menu, no rodapé do menu, no acesso rápido, nas funcionalidades e no footer", async ({ page }) => {
    await montarMenu(
      page,
      `<dsgovbr-item href="/a/" metodo="post">Ação do menu</dsgovbr-item>
       <dsgovbr-pasta rotulo="Pasta"><dsgovbr-item href="/b/" metodo="post">Ação da pasta</dsgovbr-item></dsgovbr-pasta>
       <dsgovbr-menu-rodape><dsgovbr-item href="/c/" metodo="post" externo>Ação do rodapé</dsgovbr-item></dsgovbr-menu-rodape>`
    );
    await expect(page.locator("#m-teste form.dsgovbr-form-item")).toHaveCount(3);
    await expect(page.locator("#m-teste form button.list-group-item")).toHaveCount(2);
    await expect(page.locator("#m-teste form button.d-block")).toHaveCount(1);

    await montarHeader(
      page,
      {},
      `<dsgovbr-acesso-rapido><dsgovbr-item href="/r/" metodo="post">Rápido</dsgovbr-item></dsgovbr-acesso-rapido>
       <dsgovbr-funcionalidades><dsgovbr-item href="/f/" metodo="post" icone="fas fa-bell">Aviso</dsgovbr-item></dsgovbr-funcionalidades>`
    );
    await expect(page.locator('#h-teste form[action="/r/"] button.nav-link')).toHaveCount(1);
    await expect(page.locator('#h-teste form[action="/r/"] button.dropdown-item')).toHaveCount(1);
    await expect(page.locator('#h-teste form[action="/f/"] button[aria-label="Aviso"]')).toHaveCount(1);

    await page.evaluate(() => {
      const f = document.createElement("dsgovbr-footer");
      f.id = "f-teste";
      f.innerHTML = '<dsgovbr-coluna titulo="Conta"><dsgovbr-item href="/g/" metodo="post">Sair do rodapé</dsgovbr-item></dsgovbr-coluna>';
      document.body.append(f);
    });
    await expect(page.locator('#f-teste form[action="/g/"] button.nav-link')).toHaveText("Sair do rodapé");
  });

  test("o form não cria caixa (display: contents) e sem metodo o item segue como link", async ({ page }) => {
    await montarMenu(page, '<dsgovbr-item href="/x/" metodo="post">Com post</dsgovbr-item><dsgovbr-item href="/y/">Link</dsgovbr-item><dsgovbr-item href="/z/" metodo="get">Get</dsgovbr-item>');
    expect(await page.locator("#m-teste form.dsgovbr-form-item").evaluate((el) => getComputedStyle(el).display)).toBe("contents");
    await expect(page.locator("#m-teste a.list-group-item")).toHaveCount(2); // só metodo="post" muda
    await expect(page.locator("#m-teste form")).toHaveCount(1);
  });

  test("campos ocultos viram atributos, nunca HTML", async ({ page }) => {
    await montarMenu(page, '<dsgovbr-item href="/x/" metodo="post"><dsgovbr-campo-oculto nome="a" valor=\'"><img src=x onerror="window.__xss=true">\'></dsgovbr-campo-oculto>X</dsgovbr-item>');
    await expect(page.locator('#m-teste input[name="a"]')).toHaveValue('"><img src=x onerror="window.__xss=true">');
    expect(await page.locator("#m-teste img").count()).toBe(0);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });
});

// Cria <dsgovbr-tabela id="t-teste"> com 3 linhas; atributos e filhos extras por parâmetro.
async function montarTabela(page, atributos = {}, extras = "") {
  await page.evaluate(
    ({ atributos, extras }) => {
      const t = document.createElement("dsgovbr-tabela");
      t.id = "t-teste";
      t.setAttribute("titulo", "Registros");
      for (const [nome, valor] of Object.entries(atributos)) t.setAttribute(nome, valor === true ? "" : valor);
      t.innerHTML = `<table><thead><tr><th scope="col">Nome</th></tr></thead><tbody>
        <tr data-valor="1"><td>Ana</td></tr><tr data-valor="2"><td>João</td></tr><tr data-valor="3"><td>Carla</td></tr></tbody></table>${extras}`;
      document.body.append(t);
    },
    { atributos, extras }
  );
  await expect(page.locator("#t-teste")).toHaveAttribute("data-dsgovbr-montado", "");
}

test.describe("#78 ações em lote da tabela", () => {
  const LOTE = '<dsgovbr-lote-acao acao="excluir" icone="fas fa-trash">Excluir</dsgovbr-lote-acao>'
    + '<dsgovbr-campo-oculto nome="csrfmiddlewaretoken" valor="tok"></dsgovbr-campo-oculto>'
    + '<dsgovbr-campo-oculto nome="index" valor="0" para="lote"></dsgovbr-campo-oculto>'
    + '<dsgovbr-campo-oculto nome="ordem" valor="2" para="consulta"></dsgovbr-campo-oculto>';
  const ATRIBUTOS = { selecionavel: true, "selecao-nome": "_selected_action", "lote-metodo": "post", "lote-acao-url": "/lote/?filtro=x", "lote-campo": "action" };

  test("envia ação, selecionados e campos ocultos por POST para lote-acao-url", async ({ page }) => {
    await page.route("**/lote/**", (route) => route.fulfill({ contentType: "text/html", body: "<title>feito</title>" }));
    await montarTabela(page, ATRIBUTOS, LOTE);
    await page.locator('#t-teste input[data-tabela-linha][value="1"]').check();
    await page.locator('#t-teste input[data-tabela-linha][value="3"]').check();
    const [pedido] = await Promise.all([
      page.waitForRequest("**/lote/**"),
      page.locator("#t-teste [data-tabela-acao=excluir]").dispatchEvent("click"),
    ]);
    expect(pedido.method()).toBe("POST");
    expect(pedido.url()).toMatch(/\/lote\/\?filtro=x$/);
    const corpo = new URLSearchParams(pedido.postData());
    expect(corpo.get("action")).toBe("excluir");
    expect(corpo.getAll("_selected_action")).toEqual(["1", "3"]);
    expect(corpo.get("csrfmiddlewaretoken")).toBe("tok");
    expect(corpo.get("index")).toBe("0");
    expect(corpo.has("ordem")).toBe(false); // para="consulta" não vai no lote
  });

  test("sem lote-acao-url envia para a página atual e o form temporário some", async ({ page }) => {
    await page.route("**/web-components.html**", (route) => route.fulfill({ contentType: "text/html", body: "<title>mesma</title>" }));
    await montarTabela(page, { selecionavel: true, "lote-metodo": "post" }, LOTE);
    await page.locator('#t-teste input[data-tabela-linha][value="2"]').check();
    const [pedido] = await Promise.all([
      page.waitForRequest((r) => r.method() === "POST" && r.url().includes("web-components.html")),
      page.locator("#t-teste [data-tabela-acao=excluir]").dispatchEvent("click"),
    ]);
    const corpo = new URLSearchParams(pedido.postData());
    expect(corpo.get("acao")).toBe("excluir"); // lote-campo padrão
    expect(corpo.getAll("selecionados")).toEqual(["2"]); // selecao-nome padrão
  });

  test("evento cancelado não envia e sem lote-metodo só há o evento", async ({ page }) => {
    let enviou = 0;
    await page.route("**/lote/**", (route) => { enviou += 1; route.fulfill({ contentType: "text/html", body: "x" }); });
    await montarTabela(page, ATRIBUTOS, LOTE);
    await page.evaluate(() => document.querySelector("#t-teste").addEventListener("dsgovbr:tabela-acao", (e) => e.preventDefault()));
    await page.locator('#t-teste input[data-tabela-linha][value="1"]').check();
    await page.locator("#t-teste [data-tabela-acao=excluir]").dispatchEvent("click");
    await page.waitForTimeout(400);
    expect(enviou).toBe(0);

    await page.evaluate(() => document.querySelector("#t-teste").remove());
    await montarTabela(page, { selecionavel: true }, LOTE);
    const eventos = await page.evaluate(() => {
      const t = document.querySelector("#t-teste");
      const lista = [];
      t.addEventListener("dsgovbr:tabela-acao", (e) => lista.push(e.detail));
      t.querySelector('input[data-tabela-linha][value="1"]').click();
      t.querySelector("[data-tabela-acao=excluir]").click();
      return lista;
    });
    expect(eventos).toEqual([{ acao: "excluir", valores: ["1"] }]);
    expect(page.url()).toContain("web-components.html"); // continua na página
  });
});
