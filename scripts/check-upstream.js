#!/usr/bin/env node
"use strict";

// Compara a tag fixada de cada submodule em vendor/ com a última tag estável
// do repositório upstream (DP-09). O Dependabot não cobre submodules por tag,
// então este script é o alerta de que há versão nova.
//
//   node scripts/check-upstream.js                 # só relata
//   node scripts/check-upstream.js --open-issues   # abre issue por versão nova
//
// Sai com código 1 se algum submodule não estiver fixado numa tag estável.

const { execFileSync } = require("child_process");

const SUBMODULES = ["vendor/bootstrap", "vendor/govbr-ds-core"];
const STABLE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

function run(cmd, args) {
  return execFileSync(cmd, args, { encoding: "utf8" }).trim();
}

function parse(tag) {
  const m = STABLE_TAG.exec(tag);
  return m ? m.slice(1).map(Number) : null;
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }
  return 0;
}

// tag -> sha do commit (tags anotadas: usa a linha "^{}", que é o commit).
function remoteTags(url) {
  const tags = new Map();
  for (const line of run("git", ["ls-remote", "--tags", url]).split("\n")) {
    const [sha, ref] = line.split(/\s+/);
    if (!ref) {
      continue;
    }
    const peeled = ref.endsWith("^{}");
    const tag = ref.replace("refs/tags/", "").replace(/\^\{\}$/, "");
    if (peeled || !tags.has(tag)) {
      tags.set(tag, sha);
    }
  }
  return tags;
}

function inspect(path) {
  const url = run("git", ["config", "-f", ".gitmodules", `submodule.${path}.url`]);
  const pinnedSha = run("git", ["ls-tree", "HEAD", path]).split(/\s+/)[2];
  const stable = [...remoteTags(url)].filter(([tag]) => parse(tag));
  const pinned = stable
    .filter(([, sha]) => sha === pinnedSha)
    .map(([tag]) => tag)
    .sort((a, b) => compare(parse(b), parse(a)))[0];
  const latest = stable.map(([tag]) => tag).sort((a, b) => compare(parse(b), parse(a)))[0];
  const outdated = Boolean(pinned && latest && compare(parse(latest), parse(pinned)) > 0);
  const majorChange = outdated && parse(latest)[0] !== parse(pinned)[0];
  return { path, url, pinnedSha, pinned, latest, outdated, majorChange };
}

function issueExists(title) {
  const found = JSON.parse(
    run("gh", ["issue", "list", "--state", "all", "--search", `"${title}" in:title`, "--json", "title"])
  );
  return found.some((i) => i.title === title);
}

function openIssue(r) {
  const title = `Atualizar ${r.path} para ${r.latest}`;
  if (issueExists(title)) {
    console.log(`  issue já existe: ${title}`);
    return;
  }
  const major = r.majorChange
    ? "\n\n**Atenção: mudança de versão major.** Pode quebrar tokens, SCSS ou markup; trate como decisão nova (não é só um bump)."
    : "";
  const body = [
    `Há tag estável nova em \`${r.path}\`: fixada em **${r.pinned}**, última **${r.latest}** (${r.url}).${major}`,
    "",
    "Siga o checklist de \"Atualizando os submodules\" em `docs/setup.md` e a política DP-09 em `docs/requisitos.md`.",
    "Se a atualização for adiada ou recusada, feche esta issue com o motivo (o alerta não reabre para a mesma versão).",
    "",
    "_Aberta automaticamente por `scripts/check-upstream.js`._",
  ].join("\n");
  const url = run("gh", ["issue", "create", "--title", title, "--body", body, "--assignee", "kelsoncm"]);
  console.log(`  issue aberta: ${url}`);
}

const openIssues = process.argv.includes("--open-issues");
let failed = false;

for (const path of SUBMODULES) {
  const r = inspect(path);
  if (!r.pinned) {
    failed = true;
    console.error(`ERRO ${path}: commit ${r.pinnedSha} não é uma tag estável (vX.Y.Z) de ${r.url}`);
    console.error(`::error::${path} não está fixado numa tag estável (DP-01/DP-03)`);
    continue;
  }
  const status = r.outdated ? `NOVA VERSÃO ${r.latest}${r.majorChange ? " (major)" : ""}` : "em dia";
  console.log(`${path}: fixado em ${r.pinned}, última ${r.latest} -> ${status}`);
  if (r.outdated && openIssues) {
    openIssue(r);
  }
}

process.exit(failed ? 1 : 0);
