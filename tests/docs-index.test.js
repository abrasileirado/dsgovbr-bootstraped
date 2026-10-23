"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("índice da documentação lista todos os documentos Markdown de primeiro nível", () => {
  const docsDirectory = path.join(__dirname, "..", "docs");
  const index = fs.readFileSync(path.join(docsDirectory, "index.md"), "utf8");
  const documents = fs.readdirSync(docsDirectory)
    .filter((file) => file.endsWith(".md") && file !== "index.md");

  for (const document of documents) {
    assert.ok(index.includes(`](${document})`), `${document} não está listado em docs/index.md`);
  }
});
