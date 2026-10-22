"use strict";

// scripts/serve.js serve só o que existe sob a raiz e nunca arquivos fora dela,
// por mais que a URL tente subir de diretório (path traversal).

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");

const ROOT = path.join(__dirname, "..");

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

// Requisição crua (o cliente http do Node não normaliza o caminho).
function get(port, rawPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, path: rawPath, method: "GET" }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, type: res.headers["content-type"], body }));
    });
    req.on("error", reject);
    req.end();
  });
}

let server;
let port;

test.before(async () => {
  port = await freePort();
  server = spawn(process.execPath, [path.join(ROOT, "scripts", "serve.js"), path.join(ROOT, "docs"), String(port)], {
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((resolve, reject) => {
    server.stdout.once("data", resolve);
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error(`servidor saiu com código ${code}`)));
  });
});

test.after(() => server.kill());

test("serve um arquivo de docs/ com o tipo certo", async () => {
  const r = await get(port, "/componentes/botao.html");
  assert.equal(r.status, 200);
  assert.match(r.type, /text\/html/);
  assert.match(r.body, /Botão/);
});

test("pasta sem index.html e arquivo inexistente dão 404", async () => {
  assert.equal((await get(port, "/componentes/")).status, 200); // tem index.html
  assert.equal((await get(port, "/nao-existe.html")).status, 404);
});

for (const tentativa of [
  "/../package.json",
  "/%2e%2e/package.json",
  "/%2e%2e%2f%2e%2e%2fpackage.json",
  "/componentes/../../package.json",
  "/..%5c..%5cpackage.json",
  "/..%2f..%2f.git/config",
  "//etc/passwd",
]) {
  test(`traversal ${tentativa} não vaza arquivo de fora de docs/`, async () => {
    const r = await get(port, tentativa);
    assert.equal(r.status, 404);
    assert.doesNotMatch(r.body, /"name":\s*"@abrasileirado/);
  });
}
