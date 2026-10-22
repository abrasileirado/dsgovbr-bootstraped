"use strict";

const { defineConfig, devices } = require("@playwright/test");

const CI = Boolean(process.env.CI);

// Testes de navegador (RNF-02, RNF-09). Servem docs/ como raiz, igual ao
// GitHub Pages. Os visuais (tests/browser/visual.spec.js) só rodam com
// VISUAL=1, dentro do container oficial do Playwright (ver ci.yml e
// docs/desenvolvimento.md): a renderização muda com o sistema e as fontes.
module.exports = defineConfig({
  testDir: "tests/browser",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  forbidOnly: CI,
  retries: 0,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://127.0.0.1:4173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/serve.js docs 4173",
    url: "http://127.0.0.1:4173/componentes/index.html",
    reuseExistingServer: !CI,
  },
  expect: { toHaveScreenshot: { threshold: 0.02, maxDiffPixels: 30 } },
});
