# Setup de desenvolvimento

> Para quem vai contribuir com código, não apenas consumir o pacote — para
> isso, veja [Getting Started](getting-started.md). Leia também
> [Como contribuir](contribua.md) antes de abrir um PR.

## Clonar com os submodules

O Bootstrap e o `@govbr-ds/core` são git submodules em `vendor/`, fixados
por tag (DP-01/DP-03 em [requisitos.md](requisitos.md)):

```bash
git clone --recurse-submodules https://github.com/abrasileirado/dsgovbr-bootstraped.git
```

Se já clonou sem `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

## Instalar e compilar

```bash
npm install
npm run build
```

Gera:

- `dist/dsgovbr-bootstraped.css`, `.min.css` e `.css.map` — artefatos do
  pacote.
- `docs/assets/css/dsgovbr-bootstraped.css` — cópia usada pelas páginas de
  documentação (`docs/componentes/`, `docs/exemplos/`); é gerada a cada
  build e não é versionada (`.gitignore`).

## Visualizar as páginas de componentes localmente

As páginas em `docs/componentes/` e `docs/exemplos/` carregam o CSS por
caminho relativo (`../assets/css/...`), o que não funciona abrindo o
arquivo direto no navegador (`file://`) — é preciso um servidor HTTP
simples:

```bash
python -m http.server 4173
# ou, sem Python:
npx http-server -p 4173
```

Depois abra `http://localhost:4173/docs/componentes/index.html`. Se você
usa o Claude Code neste projeto, já existe `.claude/launch.json`
configurado com esse mesmo servidor.

## Atualizando os submodules (Bootstrap / GOV.BR DS)

Os submodules são fixados por tag deliberadamente — **nunca** aponte para
a branch padrão ou para "latest". O Dependabot não monitora os submodules
(`.github/dependabot.yml` só cobre `npm`); isso já causou um bump indevido
no passado (revertido — ver histórico do repositório) e por isso avançar a
tag é sempre uma decisão manual, feita numa issue dedicada:

```bash
cd vendor/bootstrap  # ou vendor/govbr-ds-core
git fetch --tags
git checkout vX.Y.Z
cd ../..
git add vendor/bootstrap  # ou vendor/govbr-ds-core
git commit -m "build(deps): [UPG] Atualiza vendor/bootstrap para vX.Y.Z"
```

Depois rode `npm run build` e revalide visualmente as páginas em
`docs/componentes/` antes de commitar.

## Contribuindo com um componente

Ver a lista de verificações por componente em
[Desenvolvimento](desenvolvimento.md) e as diretrizes de PR em
[Como contribuir](contribua.md).
