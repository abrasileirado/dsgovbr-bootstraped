#!/usr/bin/env node
"use strict";

// Teste de consumidor limpo (DP-04 / critérios de aceite do MVP): empacota o
// projeto com `npm pack`, instala o tarball num projeto temporário sem acesso
// a este repositório e compila a entrada SCSS — com e sem override de variável.
// Pré-requisito: `npm run build` (gera dist/).

const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PKG = "@abrasileirado/dsgovbr-bootstraped";

function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg);
  }
  console.log(`ok - ${msg}`);
}

function compile(consumerDir, scssName, cssName) {
  run(
    `node node_modules/sass/sass.js --quiet --load-path=node_modules ${scssName} ${cssName}`,
    consumerDir
  );
  return fs.readFileSync(path.join(consumerDir, cssName), "utf8");
}

function main() {
  if (!fs.existsSync(path.join(ROOT, "dist", "dsgovbr-bootstraped.css"))) {
    throw new Error("dist/ não encontrado: rode `npm run build` antes de `npm test`");
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dsgovbr-consumer-"));
  try {
    const packOut = run(`npm pack --pack-destination "${tmp}" --silent`, ROOT).trim().split(/\r?\n/);
    const tarball = path.join(tmp, packOut[packOut.length - 1]);
    assert(fs.existsSync(tarball), "npm pack gerou o tarball");

    const consumer = path.join(tmp, "consumer");
    fs.mkdirSync(consumer);
    fs.writeFileSync(path.join(consumer, "package.json"), JSON.stringify({ private: true }));
    run(`npm install --no-audit --no-fund "${tarball}" sass`, consumer);

    const pkgDir = path.join(consumer, "node_modules", ...PKG.split("/"));
    for (const rel of [
      "dist/dsgovbr-bootstraped.min.css",
      "src/scss/index.scss",
      "vendor/bootstrap/scss/bootstrap.scss",
      "vendor/bootstrap/LICENSE",
      "THIRD_PARTY_NOTICES.md",
    ]) {
      assert(fs.existsSync(path.join(pkgDir, rel)), `pacote instalado contém ${rel}`);
    }

    const entry = `${PKG}/src/scss/index`;

    fs.writeFileSync(path.join(consumer, "padrao.scss"), `@import "${entry}";\n`);
    const padrao = compile(consumer, "padrao.scss", "padrao.css");
    assert(padrao.includes("--bs-primary: #1351b4"), "entrada SCSS compila com o token padrão do GOV.BR DS");

    fs.writeFileSync(path.join(consumer, "custom.scss"), `$primary: #ff0000;\n@import "${entry}";\n`);
    const custom = compile(consumer, "custom.scss", "custom.css");
    assert(custom.includes("--bs-primary: #ff0000"), "$primary do consumidor vence o token padrão");
    assert(!custom.includes("--bs-primary: #1351b4"), "token padrão não vaza quando há override");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

try {
  main();
  console.log("\nTodos os testes do pacote passaram.");
} catch (err) {
  console.error(`\nFALHOU: ${err.message}`);
  if (err.stderr) {
    console.error(String(err.stderr).trim());
  }
  process.exit(1);
}
