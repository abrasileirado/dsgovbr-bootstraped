#!/usr/bin/env node
"use strict";

// Servidor estático sem dependências para visualizar e testar o site.
//   node scripts/serve.js [diretório=docs] [porta=4173]
// Serve só o diretório informado (por padrão docs/, a mesma raiz que o GitHub
// Pages publica): referência a arquivo fora dele dá 404, como no site.
//
// Segurança: a URL nunca vira caminho de arquivo. A cada requisição o servidor
// lista os arquivos existentes sob a raiz e só serve quem estiver nessa lista
// (URL -> arquivo). Não há path.join/resolve com texto vindo da requisição,
// então "../" e variações simplesmente não casam com nenhuma entrada.

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

// "/componentes/botao.html" -> caminho absoluto, para todo arquivo sob root.
// Os nomes vêm do readdir (sistema de arquivos), não da requisição.
function listFiles(dir, prefix, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const url = `${prefix}/${entry.name}`;
    const full = `${dir}${path.sep}${entry.name}`;
    if (entry.isDirectory()) {
      listFiles(full, url, out);
    } else if (entry.isFile()) {
      out.set(url, full);
    }
  }
  return out;
}

function lookup(urlPath) {
  let key = decodeURIComponent(urlPath.split("?")[0]);
  if (key.endsWith("/")) {
    key += "index.html";
  }
  return listFiles(root, "", new Map()).get(key) || null;
}

// Servidor local de desenvolvimento/teste: escuta só em 127.0.0.1 (ver listen
// abaixo), então TLS não se aplica.
// nosemgrep: problem-based-packs.insecure-transport.js-node.using-http-server.using-http-server
const server = http.createServer((req, res) => {
  let file;
  try {
    file = lookup(req.url);
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
