#!/usr/bin/env node
"use strict";

// Servidor estático sem dependências para visualizar e testar o site.
//   node scripts/serve.js [diretório=docs] [porta=4173]
// Serve só o diretório informado (por padrão docs/, a mesma raiz que o GitHub
// Pages publica): referência a arquivos fora dele dá 404, como no site.

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(process.argv[2] || path.join(__dirname, "..", "docs"));
const port = Number(process.argv[3] || process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath.split("?")[0]);
  let file = path.resolve(root, "." + rel);
  if (file !== root && !file.startsWith(root + path.sep)) {
    return null;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

const server = http.createServer((req, res) => {
  let file;
  try {
    file = resolveFile(req.url);
  } catch {
    file = null;
  }
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Servindo ${root} em http://127.0.0.1:${port}/`);
});
