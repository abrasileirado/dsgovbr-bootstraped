"use strict";

// <dsgovbr-campo> (src/js/dsgovbr-bootstraped-componentes.js), demonstrado em
// /componentes/formularios.html#web-component. O controle é nativo e fica dentro do
// <form>: aqui, ligação de rótulo/ajuda/erro, valor enviado ao form, remontagem sem
// perder o digitado, validação nativa e axe (claro e escuro).

const { test, expect } = require("./fixtures");
const AxeBuilder = require("@axe-core/playwright").default;

const PAGINA = "/componentes/formularios.html";

test.use({ viewport: { width: 1280, height: 900 } });

test.beforeEach(async ({ page }) => {
  await page.goto(PAGINA);
  await expect(page.locator("#campos-wc dsgovbr-campo").first()).toHaveAttribute("data-dsgovbr-montado", "");
});

const form = (page) => page.locator("#campos-wc");

test("texto: rótulo ligado ao controle, obrigatório, ajuda e aria-describedby", async ({ page }) => {
  const campo = form(page).getByRole("textbox", { name: "E-mail" });
  await expect(campo).toHaveAttribute("type", "email");
  await expect(campo).toHaveAttribute("name", "email");
  await expect(campo).toHaveAttribute("required", "");
  await expect(campo).toHaveClass(/form-control/);
  await expect(campo).toHaveAccessibleDescription("Usamos só para avisos do sistema.");
  await expect(form(page).locator("label.form-label").first()).toContainText("E-mail");
  await expect(form(page).locator("label.form-label").first().locator("span[aria-hidden=true]")).toHaveText("*");
});

test("erro: .is-invalid, mensagem, aria-invalid e descrição; sucesso: .is-valid", async ({ page }) => {
  const cpf = form(page).getByLabel("CPF");
  await expect(cpf).toHaveClass(/is-invalid/);
  await expect(cpf).toHaveAttribute("aria-invalid", "true");
  await expect(cpf).toHaveAccessibleDescription("Informe um CPF válido.");
  await expect(form(page).getByText("Informe um CPF válido.")).toBeVisible();
  await expect(form(page).getByLabel("Site")).toHaveClass(/is-valid/);
  await expect(form(page).getByText("Endereço disponível.")).toBeVisible();
  await expect(form(page).getByLabel("Site")).not.toHaveAttribute("aria-invalid", "true");
});

test("prefixo e sufixo usam .input-group", async ({ page }) => {
  const grupo = form(page).locator(".input-group");
  await expect(grupo.locator(".input-group-text")).toHaveText(["https://", ".gov.br"]);
  await expect(grupo.getByLabel("Site")).toBeVisible();
});

test("select: opções dos filhos, valor inicial e ajuda por filho", async ({ page }) => {
  const uf = form(page).getByLabel("Estado");
  await expect(uf).toHaveClass(/form-select/);
  await expect(uf).toHaveValue("RN");
  await expect(uf.locator("option")).toHaveText(["Selecione", "Rio Grande do Norte", "Paraíba"]);
  await expect(uf).toHaveAccessibleDescription("Escolha o estado de residência.");
});

test("radio: fieldset com legenda, opção selecionada e desabilitada", async ({ page }) => {
  const grupo = form(page).getByRole("group", { name: /Preferência de contato/ });
  await expect(grupo.getByRole("radio", { name: "E-mail" })).toBeChecked();
  await expect(grupo.getByRole("radio", { name: "Telefone" })).not.toBeChecked();
  await expect(grupo.getByRole("radio", { name: /Nenhum/ })).toBeDisabled();
  await grupo.getByRole("radio", { name: "Telefone" }).check();
  await expect(grupo.getByRole("radio", { name: "E-mail" })).not.toBeChecked();
});

test("checkbox, switch e textarea", async ({ page }) => {
  await expect(form(page).getByRole("checkbox", { name: "Li e aceito os termos" })).toBeChecked();
  const sw = form(page).getByRole("switch", { name: "Receber avisos por e-mail" });
  await expect(sw).not.toBeChecked();
  await sw.check();
  await expect(sw).toBeChecked();
  await expect(form(page).locator(".form-check.form-switch")).toHaveCount(1);
  await expect(form(page).getByLabel("Observações")).toHaveAttribute("rows", "3");
  await expect(form(page).getByLabel("Campo desabilitado")).toBeDisabled();
});

test("o valor chega ao <form>: FormData tem os controles nativos", async ({ page }) => {
  await form(page).getByRole("textbox", { name: "E-mail" }).fill("maria@orgao.gov.br");
  await form(page).getByLabel("Estado").selectOption("PB");
  await form(page).getByLabel("Observações").fill("Olá");
  await form(page).getByRole("radio", { name: "Telefone" }).check();
  await form(page).getByRole("switch", { name: "Receber avisos por e-mail" }).check();
  const dados = await page.evaluate(() => Object.fromEntries(new FormData(document.querySelector("#campos-wc"))));
  expect(dados).toMatchObject({ email: "maria@orgao.gov.br", uf: "PB", obs: "Olá", contato: "tel", termos: "on", avisos: "on", cpf: "123" });
  expect(dados.bloqueado).toBeUndefined(); // desabilitado não é enviado
});

test("mudar o erro remonta sem perder o digitado nem o foco", async ({ page }) => {
  const email = form(page).getByRole("textbox", { name: "E-mail" });
  await email.fill("maria@");
  await email.focus();
  await page.evaluate(() => document.querySelector("#campos-wc dsgovbr-campo").setAttribute("erro", "E-mail incompleto"));
  await expect(form(page).getByRole("textbox", { name: "E-mail" })).toHaveValue("maria@");
  await expect(form(page).getByRole("textbox", { name: "E-mail" })).toBeFocused();
  await expect(form(page).getByRole("textbox", { name: "E-mail" })).toHaveClass(/is-invalid/);
  await expect(form(page).getByRole("textbox", { name: "E-mail" })).toHaveAccessibleDescription(/E-mail incompleto/);
  await page.evaluate(() => document.querySelector("#campos-wc dsgovbr-campo").setAttribute("erro", ""));
  await expect(form(page).getByRole("textbox", { name: "E-mail" })).not.toHaveClass(/is-invalid/);
  await expect(form(page).getByRole("textbox", { name: "E-mail" })).toHaveValue("maria@");
});

test("validar() usa a validação nativa e mostra a mensagem do navegador", async ({ page }) => {
  const r = await page.evaluate(() => {
    const c = document.querySelector("#campos-wc dsgovbr-campo");
    const vazio = c.validar(); // obrigatório e vazio
    const msg = c.querySelector(".invalid-feedback").textContent;
    c.valor = "maria@orgao.gov.br";
    const ok = c.validar();
    return { vazio, msg: msg.length > 0, ok, erroSumiu: c.querySelector(".invalid-feedback") === null, valor: c.valor, mesmo: c.controle === c.querySelector("input") };
  });
  expect(r).toEqual({ vazio: false, msg: true, ok: true, erroSumiu: true, valor: "maria@orgao.gov.br", mesmo: true });
});

test("atributo valor novo vence o digitado; tipo desconhecido vira text; texto nunca vira HTML", async ({ page }) => {
  const r = await page.evaluate(() => {
    window.__xss = false;
    const c = document.createElement("dsgovbr-campo");
    c.setAttribute("rotulo", '<img src=x onerror="window.__xss=true">');
    c.setAttribute("tipo", "inexistente");
    c.setAttribute("valor", "um");
    document.querySelector("#campos-wc").append(c);
    c.controle.value = "digitado";
    c.setAttribute("valor", "dois");
    return { tipo: c.controle.type, valor: c.valor, imgs: c.querySelectorAll("img").length, rotulo: c.querySelector("label").textContent, xss: window.__xss };
  });
  expect(r).toEqual({ tipo: "text", valor: "dois", imgs: 0, rotulo: '<img src=x onerror="window.__xss=true">', xss: false });
});

test("filhos-dado são consumidos e o campo tem ids únicos", async ({ page }) => {
  const r = await page.evaluate(() => ({
    sobras: ["dsgovbr-ajuda", "dsgovbr-erro", "dsgovbr-sucesso", "dsgovbr-opcao"].filter((t) => document.querySelector(`#campos-wc ${t}`)),
    ids: (() => { const ids = [...document.querySelectorAll("#campos-wc [id]")].map((e) => e.id); return ids.length === new Set(ids).size; })(),
  }));
  expect(r).toEqual({ sobras: [], ids: true });
});

test("axe: todos os campos, com erro e sucesso, no claro e no escuro", async ({ page }) => {
  for (const modo of ["light", "dark"]) {
    await page.evaluate((m) => document.documentElement.setAttribute("data-bs-theme", m), modo);
    const { violations } = await new AxeBuilder({ page }).include("#campos-wc").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(violations.map((v) => ({ regra: v.id, alvos: v.nodes.slice(0, 4).map((n) => n.target.join(" ")) })), modo).toEqual([]);
  }
});
