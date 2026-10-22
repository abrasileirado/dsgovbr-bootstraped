#!/usr/bin/env node
"use strict";

// Regenera as capturas de referência (tests/browser/visual.spec.js-snapshots)
// no container oficial do Playwright — a mesma imagem do CI, para que fontes e
// renderização batam. A versão da imagem vem do @playwright/test instalado.
// Pré-requisitos: Docker e `npm run build`.

const { execFileSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const version = require("@playwright/test/package.json").version;
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

const args = [
  "run", "--rm", "--ipc=host",
  "-v", `${root}:/work`, "-w", "/work",
  "-e", "CI=1", "-e", "VISUAL=1",
  image,
  "npx", "playwright", "test", "visual", "--update-snapshots",
];

console.log(`docker ${args.join(" ")}`);
try {
  execFileSync("docker", args, { stdio: "inherit", env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
} catch (err) {
  console.error(`\nFALHOU: ${err.message}`);
  process.exit(1);
}
