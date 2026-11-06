"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const docsDirectory = path.join(__dirname, "..", "docs");

test("documentação está em reStructuredText (Sphinx), sem Markdown remanescente", () => {
  const markdown = fs.readdirSync(docsDirectory).filter((file) => file.endsWith(".md"));
  assert.deepEqual(markdown, [], `converta para .rst: ${markdown.join(", ")}`);
  assert.ok(fs.existsSync(path.join(docsDirectory, "conf.py")), "docs/conf.py ausente");
});

test("o toctree do índice lista todos os documentos reST de primeiro nível", () => {
  const index = fs.readFileSync(path.join(docsDirectory, "index.rst"), "utf8");
  const documents = fs.readdirSync(docsDirectory)
    .filter((file) => file.endsWith(".rst") && file !== "index.rst")
    .map((file) => file.replace(/\.rst$/, ""));

  for (const document of documents) {
    assert.match(index, new RegExp(`^   ${document}$`, "m"), `${document} não está no toctree de docs/index.rst`);
  }
});
