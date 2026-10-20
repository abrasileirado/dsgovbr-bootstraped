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
- `docs/componentes/*.html` — gerado a partir do template em
  `src/site/layout.html` e dos fragmentos em `src/site/componentes/`
  (issue #15); também não é versionado. Para criar uma página nova, edite
  os fragmentos em `src/site/componentes/`, não os arquivos gerados — ver
  [Desenvolvimento](desenvolvimento.md#criando-uma-nova-página-de-componente).

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

Os submodules são fixados por **tag estável** (`vX.Y.Z`) deliberadamente —
**nunca** aponte para a branch padrão ou para um commit solto. O Dependabot
não cobre submodules por tag (isso já causou um bump indevido, revertido),
então a detecção é do workflow `.github/workflows/upstream-check.yml`: toda
segunda ele roda `scripts/check-upstream.js` e abre a issue "Atualizar
vendor/<nome> para vX.Y.Z" quando há tag estável mais nova. Para conferir na
hora: `node scripts/check-upstream.js`. Política completa: DP-09 em
[requisitos](requisitos.md).

### Checklist de atualização (a partir da issue aberta)

1. Mudança de **major**? Trate como decisão nova (revisar tokens, SCSS, markup)
   antes de seguir.
2. Avançar a tag:

   ```bash
   cd vendor/bootstrap  # ou vendor/govbr-ds-core
   git fetch --tags
   git checkout vX.Y.Z
   cd ../..
   git add vendor/bootstrap  # ou vendor/govbr-ds-core
   ```

3. GOV.BR DS: reconferir cada valor de `src/scss/_tokens.scss` contra o
   arquivo de origem citado no comentário (os valores são cópias, não imports).
4. `npm run build` e `npm test` (consumidor limpo) precisam passar.
5. Revalidar visualmente as páginas de `docs/componentes/`.
6. Atualizar a versão citada em `docs/requisitos.md` (DP-01/DP-03),
   `THIRD_PARTY_NOTICES.md` e, se for o Bootstrap, nos comentários de
   `src/scss/index.scss`.
7. Subir a versão do pacote e publicar (ver "Publicação planejada" em
   [desenvolvimento](desenvolvimento.md)).
8. Se algo quebrar, mantenha a tag atual e registre o motivo na issue.

## Contribuindo com um componente

Ver a lista de verificações por componente em
[Desenvolvimento](desenvolvimento.md) e as diretrizes de PR em
[Como contribuir](contribua.md).
