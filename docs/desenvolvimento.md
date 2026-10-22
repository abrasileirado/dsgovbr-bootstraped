# Desenvolvimento — dsgovbr-bootstraped

> Guia de trabalho inicial. O projeto está em especificação; caminhos, scripts e comandos marcados como **propostos** deverão ser ajustados e testados quando a implementação existir.

## Objetivo técnico

Produzir uma integração SCSS/CSS que mantenha classes Bootstrap 5 nos componentes suportados e adote aspectos visuais rastreáveis do GOV.BR DS. A iniciativa é comunitária e não oficial; estilos e comportamento precisam ser verificados separadamente.

Leia primeiro [os requisitos](requisitos.md), sobretudo a matriz inicial, os critérios de aceite e as decisões pendentes.

## Roteiro do MVP

O MVP foi quebrado nas issues abaixo, cada uma associada a um marco concreto. A ordem reflete as
dependências entre elas (uma issue geralmente depende da anterior estar concluída):

| Issue | Marco | Estimativa |
|---|---|---|
| [#2](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/2) | Estrutura inicial: submodules (Bootstrap + govbr-ds-core) e scaffold do projeto | 6h |
| [#3](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/3) | Prova de conceito: tokens de fundação + adaptação de `.btn` | 8h |
| [#4](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/4) | Adaptação: campos de texto, checkbox e radio | 8h |
| [#5](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/5) | Adaptação: alert e card | 6h |
| [#6](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/6) | Matriz pública de suporte + página de showcase dos componentes | 10h |
| [#7](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/7) | Exemplo(s) de uso concreto | 6h |
| [#8](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/8) | Documentação: Getting Started e Setup | 4h |
| [#9](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/9) | README.md com screenshots | 3h |
| [#10](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/10) | Pipeline de CI/CD de release | 6h |

Cada issue detalha objetivo, escopo, critério de aceite e dependências no próprio GitHub. A página
de showcase (#6) é estática (HTML/CSS, sem framework), publicada em `docs/showcase/` via o GitHub
Pages já habilitado neste repositório.

## Organização proposta

```text
src/scss/
  index.scss                 # Entrada pública quando estabilizada
  _tokens.scss               # Mapeamento documentado de tokens
  _bootstrap-settings.scss   # Ajustes de variáveis Bootstrap
  components/               # Adaptadores específicos, um por componente
dist/                       # Artefatos gerados para publicação
vendor/                     # Submodules (Bootstrap, govbr-ds-core), fixados por tag
docs/
  componentes/               # Fixture de teste + catálogo demonstrativo, por componente
  *.md                        # Documentação e decisões
package.json
package-lock.json            # Ou lockfile do gerenciador escolhido
```

Essa árvore é uma proposta de arquitetura, **não** uma descrição dos arquivos já existentes. Não crie/importações rígidas para fontes upstream antes de verificar a estrutura da versão selecionada.

Cada página em `docs/componentes/` cumpre dupla função: é a fixture usada para
validar a adaptação de um componente (variantes, tamanhos, estados, diferenças
conhecidas) e, ao mesmo tempo, o catálogo demonstrativo (RF-11) publicado via
GitHub Pages — não há uma pasta `tests/fixtures/` separada.

`docs/componentes/*.html` é **gerado** por `npm run build` (script
`build:site`, issue #15) a partir de um template único em
`src/site/layout.html` e de fragmentos de conteúdo em
`src/site/componentes/*.html` — não edite os arquivos em `docs/componentes/`
diretamente, suas alterações seriam sobrescritas no próximo build (por isso
estão no `.gitignore`). Isso existe porque as 5 páginas chegaram a duplicar o
mesmo cabeçalho/navegação, e um caminho de CSS errado precisou ser corrigido
em cada uma separadamente — ver histórico das issues #6 e #15.

### Criando uma nova página de componente

1. Crie `src/site/componentes/<nome>.html` com, na primeira linha, um
   comentário `<!-- title: Componente: <Nome> — dsgovbr-bootstraped -->`
   (vira o `<title>` da página) seguido do conteúdo do `<body>` — sem
   repetir a navegação nem o `<link>` do CSS, que já vêm do template. Uma
   seção "Diferenças conhecidas em relação à referência GOV.BR DS" é
   esperada (ver convenção nas páginas existentes).
2. Rode `npm run build` (ou só `npm run build:site` se o CSS já estiver
   atualizado) — gera `docs/componentes/<nome>.html`.
3. Se for um componente novo (não apenas uma página adicional), adicione
   uma linha na tabela de `src/site/componentes/index.html` apontando para
   ele, com o status e o número da issue.
4. Abra a página gerada localmente (ver "Visualizar as páginas de
   componentes localmente" em [Setup](setup.md)) para conferir antes de
   commitar.

## Sequência recomendada

1. Registrar revisão e licença das fontes Bootstrap e GOV.BR DS; inventariar tokens, dependências, mixins e seletores.
2. Criar uma fixture Bootstrap pura para botões, incluindo estados aplicáveis; documentar diferenças em relação à referência GOV.BR DS.
3. Compilar um protótipo de tokens + botão sem importar indiscriminadamente o CSS integral dos dois projetos.
4. Decidir se CSS pré-compilado será autônomo ou exigirá Bootstrap separado; criar teste de integração compatível com a decisão.
5. Implementar componentes restantes do MVP com testes correspondentes.
6. Validar instalação de um tarball local antes de publicar.

## Comandos e testes

```bash
npm ci
npm run build      # CSS (dist/), cópia para docs/assets/ e páginas de docs/componentes/
npm test           # test:unit + test:package
npm pack --dry-run
```

`npm test` roda duas camadas (exige `npm run build` antes e os submodules
inicializados):

- `npm run test:unit` — `node:test`, sem dependências, em `tests/`:
  - `tokens.test.js`: **deriva de tokens** (RF-02). Cada valor de
    `src/scss/_tokens.scss` é conferido contra o arquivo de origem em
    `vendor/govbr-ds-core`; todo `$govbr-*` precisa ter origem registrada
    no teste. Para um token novo, acrescente a origem em `ORIGEM`.
  - `css.test.js`: asserções no CSS compilado — tokens no `:root`, botão,
    campo de texto, checkbox/radio, alerta e card, nenhuma classe `.br-*`
    (RF-03) e `btn-secondary` no cinza do Bootstrap (DP-06). Ao adaptar um
    componente novo, acrescente aqui o que o torna "GOV.BR DS".
- `npm run test:package` — consumidor limpo: `npm pack`, instala o tarball
  num projeto temporário e compila a entrada SCSS com e sem override (DP-04).

### Testes de navegador (Playwright)

`npm run test:browser` abre o site (`docs/` servido por `scripts/serve.js`, como
no Pages) num Chromium real, em `tests/browser/`:

- `pages.spec.js`: toda página HTML publicada carrega sem 404 e sem erro de
  console. Páginas novas entram sozinhas (a lista vem de `docs/`).
- `styles.spec.js`: estilos **computados** (cor, raio, alturas aproximadas de
  32/40/48px, 14px), foco por teclado, marcar checkbox com espaço, clique no
  rótulo, fechar alerta.
- `a11y.spec.js`: axe-core (WCAG 2 A/AA) nas páginas de componentes e no exemplo
  de login — RNF-02. Violação nova faz o teste falhar.
- `visual.spec.js`: captura de tela de cada página em desktop (1280px) e mobile
  (375px) comparada com a imagem de referência — RNF-09. Só roda com `VISUAL=1`
  no container oficial.

O `ci.yml` tem dois jobs: **Build e testes** (`npm test`) e **Testes de
navegador**, este dentro de `mcr.microsoft.com/playwright:v1.64.1-noble`, a mesma
imagem em que `npm run test:visual:update` gera as capturas — fontes e
renderização idênticas. A versão dessa imagem acompanha o `@playwright/test`
fixado no `package.json`: **atualize os dois juntos** (`ci.yml`,
`package.json` e o script `test:visual:update`) e regenere as capturas. O
`release.yml` roda `npm test` antes do publish.

Os testes de navegador já acharam problemas reais: assets referenciados fora de
`docs/` (404 no Pages), o JS do Bootstrap ausente nas páginas de componentes
(alerta não fechava) e o contraste de 1,5:1 do `btn-outline-warning`.

Antes da primeira publicação de um formato novo (ex.: outro entry point), testar o `.tgz` gerado por `npm pack` num projeto consumidor limpo; `test:package` já cobre o caminho atual (CSS pronto e SCSS).

## Verificações por componente

Uma contribuição de componente deve conter, no mínimo:

- Seletores Bootstrap aceitos e markup de fixture.
- Referência GOV.BR DS e revisão utilizada.
- Mapeamento semântico das variantes e diferenças deliberadas.
- Estados normal, `hover`, `focus-visible`, ativo, desabilitado e erro quando aplicáveis.
- Testes de teclado, associação de labels e contraste relevantes.
- Avaliação se o componente depende de JavaScript, ícones, fontes ou de markup não nativo Bootstrap.
- Atualização do status na matriz dos requisitos e documentação de limitações.

Não declare equivalência comportamental com GOV.BR DS apenas porque as capturas visuais se parecem. Componentes operados pelo JavaScript Bootstrap devem conservar seus testes comportamentais.

## Sass e dependências

Priorizar `@use`/`@forward` no código novo. Verificar antes se as dependências efetivamente consumidas ainda dependem de `@import` e isolar conflitos, avisos e ordem de carregamento. Fixar versões em lockfile e manter a matriz de compatibilidade atualizada.

A decisão de usar fontes upstream como dependência, copiar trechos ou reimplementar adaptadores é tomada por componente, com revisão de licença e manutenção; não há uma estratégia global presumida para todos os arquivos.

## Publicação planejada

1. Atualizar documentação e subir a versão em `package.json` (e `package-lock.json`).
2. Rodar `npm run build`, `npm test` (consumidor limpo: pack → instala → compila SCSS) e `npm pack --dry-run`; conferir o conteúdo do tarball.
3. Commitar na `main` e enviar a tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. O workflow `.github/workflows/release.yml` (disparado pela tag) confere que a
   tag bate com a versão do `package.json`, compila, publica no npm via trusted
   publishing/OIDC e cria a GitHub Release com os assets de `dist/`.

**Não** rode `gh release create` antes: o workflow cria a release já com os
assets (rascunho → publicada). Criar a release antes causa o erro
`Cannot upload asset to an immutable release`. Pré-requisito único: Trusted
Publisher com "Allow npm publish" configurado no npmjs.com (DP-07).

## Leituras úteis

- [Bootstrap — customização Sass](https://getbootstrap.com/docs/5.3/customize/sass/).
- [Sass — `@import` depreciado](https://sass-lang.com/documentation/at-rules/import/).
- [npm — publicação com escopo](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).
- [npm — trusted publishing](https://docs.npmjs.com/trusted-publishers/).
