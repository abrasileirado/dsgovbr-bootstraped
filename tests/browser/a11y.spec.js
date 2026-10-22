"use strict";

// Acessibilidade (RNF-02): axe-core com as regras WCAG 2.x A e AA nas páginas
// que exercitam o tema (contraste, rótulos, nomes acessíveis, semântica).

const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { themedPages } = require("./pages");

for (const url of themedPages) {
  test(`${url}: sem violações WCAG 2 A/AA (axe-core)`, async ({ page }) => {
    await page.goto(url);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const resumo = violations.map((v) => ({
      regra: v.id,
      impacto: v.impact,
      elementos: v.nodes.slice(0, 5).map((n) => `${n.target.join(" ")} :: ${n.failureSummary.split("\n")[1] || ""}`),
    }));
    expect(resumo).toEqual([]);
  });
}
