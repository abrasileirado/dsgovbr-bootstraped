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

As páginas carregam o CSS por caminho relativo (`../assets/css/...`), o que
não funciona abrindo o arquivo direto no navegador (`file://`). Depois de
`npm run build`:

```bash
npm run serve        # node scripts/serve.js — serve docs/ em http://127.0.0.1:4173/
```

Abra `http://127.0.0.1:4173/componentes/index.html`. O servidor serve **só**
`docs/`, a mesma raiz que o GitHub Pages publica: referenciar um arquivo fora
de `docs/` (ex.: `../../vendor/...`) dá 404 aqui e no site — foi um bug real,
agora coberto por teste. Se você usa o Claude Code neste projeto, o
`.claude/launch.json` já aponta para esse mesmo servidor.

## Testes de navegador (Playwright)

```bash
npx playwright install chromium   # uma vez, para rodar local
npm run test:browser              # estilos, teclado, acessibilidade, páginas sem 404
npm run test:visual:update        # regenera as capturas de referência (precisa de Docker)
```

Os testes **visuais** só rodam no container oficial do Playwright (Linux), com
`VISUAL=1`, porque a renderização muda com o sistema e as fontes; localmente
eles são ignorados. As capturas de referência ficam em
`tests/browser/visual.spec.js-snapshots/` e são geradas por
`npm run test:visual:update` — rode-o e revise as imagens no diff quando mudar
o visual de propósito. Detalhes em [Desenvolvimento](desenvolvimento.md).

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

3. `npm run build` e `npm test` precisam passar. O teste de deriva de tokens
   (`tests/tokens.test.js`) confere cada valor de `src/scss/_tokens.scss`
   contra o GOV.BR DS: se falhar, atualize o token (e a origem citada no
   comentário) ou registre por que o valor foi mantido.
4. Consumidor limpo (`test:package`) também roda dentro de `npm test`.
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
