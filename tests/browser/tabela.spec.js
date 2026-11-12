"use strict";

// <dsgovbr-tabela> (src/js/dsgovbr-bootstrapped-componentes.js), demonstrado em
// /componentes/tabela.html: tabela, busca, filtros, ferramentas (densidade), seleção
// com barra de itens selecionados e paginação, mais axe nos estados (claro e escuro).

const { test, expect } = require("./fixtures");
const AxeBuilder = require("@axe-core/playwright").default;

const PAGINA = "/componentes/tabela.html";

test.use({ viewport: { width: 1280, height: 1000 } });

test.beforeEach(async ({ page }) => {
  await page.goto(PAGINA);
  await expect(page.locator("#tabela-demo")).toHaveAttribute("data-dsgovbr-montado", "");
});

const demo = (page) => page.locator("#tabela-demo");

// Guarda os eventos da tabela para conferir depois.
async function ouvir(page) {
  await page.evaluate(() => {
    window.__eventos = [];
    ["busca", "filtro", "selecao", "acao", "densidade"].forEach((t) =>
      document.addEventListener("dsgovbr:tabela-" + t, (e) => window.__eventos.push([t, e.detail])));
    document.addEventListener("dsgovbr:pagina", (e) => window.__eventos.push(["pagina", e.detail]));
  });
}

const eventos = (page) => page.evaluate(() => window.__eventos);

test("tabela: título, ações da página, decorada com .table e dentro de .table-responsive", async ({ page }) => {
  await expect(demo(page).getByRole("heading", { name: "Selecione usuário para modificar" })).toBeVisible();
  await expect(demo(page).getByRole("button", { name: "Adicionar usuário" })).toBeVisible();
  await expect(demo(page).locator(".table-responsive > table.table.table-hover")).toHaveCount(1);
  await expect(demo(page).getByRole("table", { name: "Usuários" })).toBeVisible();
  await expect(demo(page).locator("dsgovbr-filtro, dsgovbr-lote-acao, dsgovbr-acoes, dsgovbr-opcao")).toHaveCount(0); // consumidos
});

test("busca: a lupa abre o campo, Pesquisar dispara o evento sem enviar (sem acao)", async ({ page }) => {
  await ouvir(page);
  const lupa = demo(page).getByRole("button", { name: "Buscar na listagem" });
  await expect(lupa).toHaveAttribute("aria-expanded", "false");
  await expect(demo(page).getByPlaceholder("Buscar nesta listagem")).toBeHidden();
  await lupa.click();
  await expect(lupa).toHaveAttribute("aria-expanded", "true");
  const campo = demo(page).getByPlaceholder("Buscar nesta listagem");
  await expect(campo).toBeVisible();
  await campo.fill("ana");
  await demo(page).getByRole("button", { name: "Pesquisar" }).click();
  expect(await eventos(page)).toEqual([["busca", { termo: "ana", filtros: {} }]]);
  await expect(page).toHaveURL(/tabela\.html$/); // não navegou
});

test("filtros: painel, dropdowns com checkboxes, chips, Filtrar e Limpar todos os filtros", async ({ page }) => {
  await ouvir(page);
  const funil = demo(page).getByRole("button", { name: "Filtrar a listagem" });
  await funil.click();
  await expect(demo(page).getByText("Filtros:")).toBeVisible();
  await demo(page).getByRole("button", { name: "Ativo", exact: true }).click();
  await demo(page).getByRole("checkbox", { name: "Sim" }).check();
  await demo(page).getByRole("button", { name: "Grupos" }).click(); // abre o outro (o primeiro fecha)
  await demo(page).getByRole("checkbox", { name: "Atendimento" }).check();
  await expect(demo(page).locator("[data-tabela-chips] .badge")).toHaveText(["Ativo: Sim", "Grupos: Atendimento"]);
  await demo(page).getByRole("button", { name: "Filtrar", exact: true }).click();
  expect((await eventos(page)).pop()).toEqual(["filtro", { termo: "", filtros: { ativo: ["1"], grupo: ["atendimento"] } }]);
  await demo(page).getByRole("button", { name: "Limpar todos os filtros" }).click();
  await expect(demo(page).locator("[data-tabela-chips] .badge")).toHaveCount(0);
  expect((await eventos(page)).pop()).toEqual(["filtro", { termo: "", filtros: {} }]);
});

test("busca e filtros: um painel aberto por vez", async ({ page }) => {
  await demo(page).getByRole("button", { name: "Buscar na listagem" }).click();
  await expect(demo(page).getByPlaceholder("Buscar nesta listagem")).toBeVisible();
  await expect(demo(page).locator(".collapse.show:not(.collapsing)")).toHaveCount(1); // fim da transição: o plugin ignora cliques durante ela
  await demo(page).getByRole("button", { name: "Filtrar a listagem" }).click();
  await expect(demo(page).getByText("Filtros:")).toBeVisible();
  await expect(demo(page).getByPlaceholder("Buscar nesta listagem")).toBeHidden();
  await expect(demo(page).getByRole("button", { name: "Buscar na listagem" })).toHaveAttribute("aria-expanded", "false");
});

test("ferramentas: densidade Alta/Média/Baixa muda o espaçamento e avisa", async ({ page }) => {
  await ouvir(page);
  const celula = demo(page).locator("tbody td").nth(1);
  const altura = async () => (await demo(page).locator("tbody tr").first().boundingBox()).height;
  const media = await altura();
  await demo(page).getByRole("button", { name: "Ferramentas da tabela" }).click();
  await expect(demo(page).getByText("Densidade", { exact: true })).toBeVisible();
  await expect(demo(page).getByRole("radio", { name: "Média" })).toBeChecked();
  await demo(page).getByText("Alta", { exact: true }).click();
  await expect(demo(page).locator("table")).toHaveClass(/table-sm/);
  expect(await altura()).toBeLessThan(media);
  await demo(page).getByText("Baixa", { exact: true }).click();
  await expect(demo(page).locator("table")).not.toHaveClass(/table-sm/);
  expect(await altura()).toBeGreaterThan(media);
  await expect(demo(page)).toHaveAttribute("densidade", "baixa");
  expect((await eventos(page)).map((e) => e[1].densidade)).toEqual(["alta", "baixa"]);
  await expect(celula).toBeVisible();
});

test("seleção: checkbox por linha, barra azul com contador e ações em lote", async ({ page }) => {
  await ouvir(page);
  const barra = demo(page).locator("[data-tabela-barra]");
  await expect(barra).toBeHidden();
  await demo(page).getByRole("checkbox", { name: "Selecionar Ana Pereira" }).check();
  await expect(barra).toBeVisible();
  await expect(barra.getByText("1 item selecionado")).toBeVisible();
  await expect(demo(page).locator("tbody tr").first()).toHaveClass(/table-active/);
  await demo(page).getByRole("checkbox", { name: "Selecionar Carla Lima" }).check();
  await expect(barra.getByText("2 itens selecionados")).toBeVisible();
  await expect(demo(page).getByRole("checkbox", { name: "Selecionar todas as linhas" })).toHaveJSProperty("indeterminate", true);
  await barra.getByRole("button", { name: "Excluir" }).click();
  const ev = await eventos(page);
  expect(ev.filter((e) => e[0] === "selecao").map((e) => e[1].quantidade)).toEqual([1, 2]);
  expect(ev.pop()).toEqual(["acao", { acao: "excluir", valores: ["1", "3"] }]);
  await expect(barra.getByRole("button", { name: "Download" })).toBeVisible();
});

test("selecionar todas marca e desmarca todas as linhas; sem seleção a barra some", async ({ page }) => {
  const todas = demo(page).getByRole("checkbox", { name: "Selecionar todas as linhas" });
  await todas.check();
  await expect(demo(page).locator("tbody tr.table-active")).toHaveCount(3);
  await expect(demo(page).locator("[data-tabela-contador]")).toHaveText("3 itens selecionados");
  await todas.uncheck();
  await expect(demo(page).locator("tbody tr.table-active")).toHaveCount(0);
  await expect(demo(page).locator("[data-tabela-barra]")).toBeHidden();
  await page.mouse.move(5, 5); // o hover da linha trocaria a cor medida
  const cor = await demo(page).locator("tbody tr").first().evaluate((el) => { el.classList.add("table-active"); const cs = getComputedStyle(el.firstElementChild.nextElementSibling); return { sombra: cs.boxShadow, texto: cs.color }; });
  expect(cor.sombra).toContain("rgb(38, 112, 232)"); // --selected do GOV.BR DS (o .table pinta a célula com box-shadow inset)
  expect(cor.texto).toBe("rgb(255, 255, 255)");
});

test("os checkboxes têm name e value (data-valor) para enviar a seleção", async ({ page }) => {
  const r = await page.evaluate(() => [...document.querySelectorAll("#tabela-demo input[data-tabela-linha]")].map((c) => [c.name, c.value]));
  expect(r).toEqual([["selecionados", "1"], ["selecionados", "2"], ["selecionados", "3"]]);
});

test("paginação compacta no rodapé; o evento sobe até a tabela", async ({ page }) => {
  await ouvir(page);
  const pag = demo(page).locator("dsgovbr-paginacao");
  await expect(pag.getByText("1-10 de 42 itens")).toBeVisible();
  await expect(pag.getByLabel("Exibir")).toHaveValue("10");
  await pag.getByRole("button", { name: "Próxima página" }).click();
  await expect(pag.getByText("11-20 de 42 itens")).toBeVisible();
  expect((await eventos(page)).pop()).toEqual(["pagina", { pagina: 2, porPagina: 10, total: 42, totalPaginas: 5, origem: "pagina" }]);
});

test("com acao, busca e filtros enviam o form GET nativo e o evento pode cancelar", async ({ page }) => {
  const r = await page.evaluate(() => {
    const t = document.createElement("dsgovbr-tabela");
    t.setAttribute("busca", "");
    t.setAttribute("acao", "/usuarios/");
    t.setAttribute("busca-nome", "termo");
    t.innerHTML = "<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>x</td></tr></tbody></table>";
    document.body.append(t);
    const form = t.querySelector("form");
    return { metodo: form.method, acao: form.getAttribute("action"), nome: form.querySelector("input[type=search]").name, papel: form.getAttribute("role") };
  });
  expect(r).toEqual({ metodo: "get", acao: "/usuarios/", nome: "termo", papel: "search" });
  const cancelado = await page.evaluate(() => {
    const t = [...document.querySelectorAll("dsgovbr-tabela")].pop();
    let ouviu = false;
    t.addEventListener("dsgovbr:tabela-busca", (e) => { ouviu = true; e.preventDefault(); });
    const f = t.querySelector("form");
    const ev = new Event("submit", { cancelable: true, bubbles: true });
    Object.defineProperty(ev, "submitter", { value: f.querySelector("[data-acao=busca]") });
    f.dispatchEvent(ev);
    return { ouviu, prevenido: ev.defaultPrevented };
  });
  expect(cancelado).toEqual({ ouviu: true, prevenido: true });
});

test("estados vazio e carregando", async ({ page }) => {
  await expect(page.locator("#tabela-vazia").getByText("Nenhum usuário encontrado.")).toBeVisible();
  await expect(page.locator("#tabela-carregando [role=status]")).toContainText("Carregando");
  await expect(page.locator("#tabela-carregando [data-tabela-raiz]")).toHaveAttribute("aria-busy", "true");
});

test("remontar (mudar um atributo) mantém seleção, busca digitada e filtros marcados", async ({ page }) => {
  await demo(page).getByRole("checkbox", { name: "Selecionar João Souza" }).check();
  await demo(page).getByRole("button", { name: "Buscar na listagem" }).click();
  await demo(page).getByPlaceholder("Buscar nesta listagem").fill("joao");
  await page.evaluate(() => document.querySelector("#tabela-demo").setAttribute("titulo", "Novo título"));
  await expect(demo(page).getByRole("heading", { name: "Novo título" })).toBeVisible();
  await expect(demo(page).getByRole("checkbox", { name: "Selecionar João Souza" })).toBeChecked();
  await expect(demo(page).locator("[data-tabela-contador]")).toHaveText("1 item selecionado");
  await demo(page).getByRole("button", { name: "Buscar na listagem" }).click();
  await expect(demo(page).getByPlaceholder("Buscar nesta listagem")).toHaveValue("joao");
  expect(await page.evaluate(() => document.querySelectorAll("#tabela-demo input[data-tabela-linha]").length)).toBe(3); // sem checkbox duplicado
});

test("axe: tabela com painéis abertos e itens selecionados, no claro e no escuro", async ({ page }) => {
  for (const modo of ["light", "dark"]) {
    await page.evaluate((m) => document.documentElement.setAttribute("data-bs-theme", m), modo);
    await page.waitForTimeout(300); // as cores dos botões têm transição (.15s)
    await demo(page).getByRole("checkbox", { name: "Selecionar Ana Pereira" }).check();
    await demo(page).getByRole("button", { name: "Filtrar a listagem" }).click();
    await expect(demo(page).getByText("Filtros:")).toBeVisible();
    await page.waitForTimeout(400); // fim da transição do collapse
    const { violations } = await new AxeBuilder({ page }).include("#tabela-demo").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(violations.map((v) => ({ regra: v.id, alvos: v.nodes.slice(0, 4).map((n) => n.target.join(" ")) })), modo).toEqual([]);
    await demo(page).getByRole("checkbox", { name: "Selecionar Ana Pereira" }).uncheck();
    await demo(page).getByRole("button", { name: "Filtrar a listagem" }).click();
    await page.waitForTimeout(400);
  }
});
