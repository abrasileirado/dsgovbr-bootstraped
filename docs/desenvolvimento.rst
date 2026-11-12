Desenvolvimento
===============

   Guia de trabalho inicial. O projeto está em especificação; caminhos, scripts e comandos marcados como **propostos** deverão ser ajustados e testados quando a implementação existir.

Objetivo técnico
----------------

Produzir uma integração SCSS/CSS que mantenha classes Bootstrap 5 nos componentes suportados e adote aspectos visuais rastreáveis do GOV.BR DS. A iniciativa é comunitária e não oficial; estilos e comportamento precisam ser verificados separadamente.

Leia primeiro :doc:`os requisitos <requisitos>`, sobretudo a matriz inicial, os critérios de aceite e as decisões pendentes.

Roteiro do MVP
--------------

O MVP foi quebrado nas issues abaixo, cada uma associada a um marco concreto. A ordem reflete as
dependências entre elas (uma issue geralmente depende da anterior estar concluída):

+--------------------------------------------------------------------------+----------------------------+------------+
| Issue                                                                    | Marco                      | Estimativa |
+==========================================================================+============================+============+
| `#2 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/2>`__   | Estrutura inicial:         | 6h         |
|                                                                          | submodules (Bootstrap +    |            |
|                                                                          | govbr-ds-core) e scaffold  |            |
|                                                                          | do projeto                 |            |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#3 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/3>`__   | Prova de conceito: tokens  | 8h         |
|                                                                          | de fundação + adaptação de |            |
|                                                                          | ``.btn``                   |            |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#4 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/4>`__   | Adaptação: campos de       | 8h         |
|                                                                          | texto, checkbox e radio    |            |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#5 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/5>`__   | Adaptação: alert e card    | 6h         |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#6 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/6>`__   | Matriz pública de suporte  | 10h        |
|                                                                          | + página de showcase dos   |            |
|                                                                          | componentes                |            |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#7 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/7>`__   | Exemplo(s) de uso concreto | 6h         |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#8 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/8>`__   | Documentação: Getting      | 4h         |
|                                                                          | Started e Setup            |            |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#9 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/9>`__   | README.md com screenshots  | 3h         |
+--------------------------------------------------------------------------+----------------------------+------------+
| `#10 <https://github.com/abrasileirado/dsgovbr-bootstraped/issues/10>`__ | Pipeline de CI/CD de       | 6h         |
|                                                                          | release                    |            |
+--------------------------------------------------------------------------+----------------------------+------------+

Cada issue detalha objetivo, escopo, critério de aceite e dependências no próprio GitHub. A página
de showcase (#6) é estática (HTML/CSS, sem framework), publicada em ``docs/showcase/`` via o GitHub
Pages já habilitado neste repositório.

Organização proposta
--------------------

.. code:: text

   src/scss/
     index.scss                 # Entrada pública quando estabilizada
     _tokens.scss               # Mapeamento documentado de tokens
     _bootstrap-settings.scss   # Ajustes de variáveis Bootstrap
     components/               # Adaptadores específicos, um por componente
   src/js/                      # JS opcional (modo claro/escuro e web components), copiado para dist/
   dist/                       # Artefatos gerados para publicação
   vendor/                     # Submodules (Bootstrap, govbr-ds-core), fixados por tag
   docs/
     componentes/               # Fixture de teste + catálogo demonstrativo, por componente
     *.rst                       # Documentação (Sphinx) e decisões
   package.json
   package-lock.json            # Ou lockfile do gerenciador escolhido

Essa árvore é uma proposta de arquitetura, **não** uma descrição dos arquivos já existentes. Não crie/importações rígidas para fontes upstream antes de verificar a estrutura da versão selecionada.

Cada página em ``docs/componentes/`` cumpre dupla função: é a fixture usada para
validar a adaptação de um componente (variantes, tamanhos, estados, diferenças
conhecidas) e, ao mesmo tempo, o catálogo demonstrativo (RF-11) publicado via
GitHub Pages — não há uma pasta ``tests/fixtures/`` separada.

``docs/componentes/*.html`` é **gerado** por ``npm run build`` (script
``build:site``, issue #15) a partir de um template único em
``src/site/layout.html`` e de fragmentos de conteúdo em
``src/site/componentes/*.html`` — não edite os arquivos em ``docs/componentes/``
diretamente, suas alterações seriam sobrescritas no próximo build (por isso
estão no ``.gitignore``). Isso existe porque as 5 páginas chegaram a duplicar o
mesmo cabeçalho/navegação, e um caminho de CSS errado precisou ser corrigido
em cada uma separadamente — ver histórico das issues #6 e #15.

Criando uma nova página de componente
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Crie ``src/site/componentes/<nome>.html`` começando por este cabeçalho
   de comentários, um por linha:

   .. code:: html

      <!-- title: Componente: <Nome> — dsgovbr-bootstraped -->
      <!-- status: Não suportado -->
      <!-- bootstrap: <slug> -->

   ``title`` (obrigatório) vira o ``<title>`` da página. ``status`` é o status
   na matriz (``Planejado``, ``Experimental``, ``Limitado``, ``Estável`` ou
   ``Não suportado``). ``bootstrap`` é o nome da página do componente em
   https://getbootstrap.com/docs/5.3/components/ (ex.: ``list-group``).
   Os dois geram a faixa de status no topo da página. Depois do cabeçalho
   vem o conteúdo do ``<main>`` — sem repetir a navegação, a chave de tema
   nem o ``<link>`` do CSS, que já vêm do template. Uma seção "Diferenças
   conhecidas em relação à referência GOV.BR DS" é obrigatória
   (``tests/site.test.js`` confere).

2. Rode ``npm run build`` (ou só ``npm run build:site`` se o CSS já estiver
   atualizado) — gera ``docs/componentes/<nome>.html``.

3. Se for um componente novo (não apenas uma página adicional), adicione
   uma linha na tabela de ``src/site/componentes/index.html`` apontando para
   ele, com o status e o número da issue.

4. Para adaptar um componente: prefira as variáveis Sass do Bootstrap em
   ``src/scss/_bootstrap-settings.scss`` (com tokens ``$govbr-*`` de
   ``_tokens.scss``, cada um com origem em ``tests/tokens.test.js``) e só então
   CSS em ``src/scss/components/_<componente>.scss``. Hover e foco do GOV.BR DS
   estão em ``src/scss/_mixins.scss`` (``govbr-hover``, ``govbr-focus``); o foco
   tracejado dourado de todo elemento focável fica em
   ``components/_focus.scss``.

5. Ao adaptar um componente antes "Não suportado", atualize o ``status``
   no cabeçalho, a linha do índice e a matriz em
   :ref:`Requisitos <requisitos:6. Matriz de compatibilidade atual (v0.5.1)>`.

6. Abra a página gerada localmente (ver "Visualizar as páginas de
   componentes localmente" em :doc:`Setup <setup>`) para conferir antes de
   commitar.

Sequência recomendada
---------------------

1. Registrar revisão e licença das fontes Bootstrap e GOV.BR DS; inventariar tokens, dependências, mixins e seletores.
2. Criar uma fixture Bootstrap pura para botões, incluindo estados aplicáveis; documentar diferenças em relação à referência GOV.BR DS.
3. Compilar um protótipo de tokens + botão sem importar indiscriminadamente o CSS integral dos dois projetos.
4. Decidir se CSS pré-compilado será autônomo ou exigirá Bootstrap separado; criar teste de integração compatível com a decisão.
5. Implementar componentes restantes do MVP com testes correspondentes.
6. Validar instalação de um tarball local antes de publicar.

Comandos e testes
-----------------

.. code:: bash

   npm ci
   npm run build      # CSS (dist/), cópia para docs/assets/ e páginas de docs/componentes/
   npm test           # test:unit + test:package
   npm pack --dry-run

``npm test`` roda duas camadas (exige ``npm run build`` antes e os submodules
inicializados):

- ``npm run test:unit`` — ``node:test``, sem dependências, em ``tests/``:

  - ``tokens.test.js``: **deriva de tokens** (RF-02). Cada valor de
    ``src/scss/_tokens.scss`` é conferido contra o arquivo de origem em
    ``vendor/govbr-ds-core``; todo ``$govbr-*`` precisa ter origem registrada
    no teste. Para um token novo, acrescente a origem em ``ORIGEM``.
  - ``css.test.js``: asserções no CSS compilado — tokens no ``:root``, botão,
    campo de texto, checkbox/radio, alerta e card, nenhuma classe ``.br-*``
    (RF-03) e ``btn-secondary`` no cinza do Bootstrap (DP-06). Ao adaptar um
    componente novo, acrescente aqui o que o torna "GOV.BR DS".
  - ``componentes-js.test.js``: o JS dos web components tem sintaxe válida,
    define os quatro elementos sem Shadow DOM nem ``innerHTML`` e entra em
    ``build-js``, ``build-docs-assets``, no teste do pacote e na release.
  - ``paginacao-js.test.js``: a função ``dsgovbrPaginacao.janela`` (janela de páginas)
    rodando num contexto isolado (``vm``), sem DOM.
  - ``cookies-js.test.js``: a API de ``dsgovbrCookies`` rodando num contexto isolado
    (``vm``) com ``localStorage`` de mentira (gravar, normalizar, evento, JSON
    inválido, armazenamento bloqueado) e o empacotamento do arquivo.
  - ``site.test.js``: o catálogo cobre **todo** componente de
    ``vendor/bootstrap/site/src/content/docs/components/`` (uma página por
    ``<!-- bootstrap: <slug> -->``), o índice aponta para todas as páginas e
    cada página declara status e diferenças conhecidas. Um componente novo
    numa versão futura do Bootstrap faz este teste falhar até ganhar página.

- ``npm run test:package`` — consumidor limpo: ``npm pack``, instala o tarball
  num projeto temporário e compila a entrada SCSS com e sem override (DP-04).

Documentação (Sphinx)
~~~~~~~~~~~~~~~~~~~~~

As páginas de texto (``docs/*.rst``) são geradas com o Sphinx e o tema
`dsgovbr-sphinx-theme <https://github.com/abrasileirado/dsgovbr-sphinx-theme>`__.
O catálogo (``docs/componentes/``), os exemplos e ``docs/assets/`` continuam como
HTML estático e são copiados sem alteração para a saída (ver ``docs/conf.py``).
Rode ``npm run build`` antes, para gerar esses arquivos:

.. code-block:: bash

   python -m venv .venv
   .venv/bin/pip install -r docs/requirements.txt   # Windows: .venv\Scripts\pip
   npm run build
   npm run docs     # sphinx-build -W -> docs/_build/html

Avisos do Sphinx viram erro (``-W``), como no workflow ``pages.yml``. As páginas
reST podem usar as diretivas ``br-*`` do tema (ex.: ``.. br-alerta:: warning``),
que aplicam o CSS deste repositório recém-compilado (``dist/``).

Testes de navegador (Playwright)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``npm run test:browser`` abre o site (``docs/`` servido por ``scripts/serve.js``, como
no Pages) num Chromium real, em ``tests/browser/``:

- ``pages.spec.js``: toda página HTML publicada carrega sem 404 e sem erro de
  console. Páginas novas entram sozinhas (a lista vem de ``docs/``).
- ``styles.spec.js``: estilos **computados** (cor, raio, alturas aproximadas de
  32/40/48px, 14px), foco por teclado, marcar checkbox com espaço, clique no
  rótulo, fechar alerta.
- ``styles.spec.js`` também cobre os componentes adaptados na issue #43
  (accordion, abas, list group, breadcrumb, botão de fechar, tooltip,
  spinner, modal) e o foco tracejado dourado global.
- ``tema.spec.js``: a chave *Aplicar GOV.BR DS* (padrão ligado, ``?tema=``,
  persistência entre páginas, valor inválido) e os plugins que o catálogo
  inicia (tooltip, popover, toast) e o modal.
- ``componentes.spec.js``: web components (``src/js/dsgovbr-bootstraped-componentes.js``)
  no painel e em ``/componentes/web-components.html``: montagem, landmarks, menu
  (offcanvas, pasta, item atual), header, footer, ``aria-pressed`` do modo escuro,
  remontagem por atributo, atributos sem HTML (XSS) e carga síncrona no ``<head>``.
- ``paginacao.spec.js``: ``<dsgovbr-paginacao>``: janela e reticências, atual, Anterior/Próxima,
  evento ``dsgovbr:pagina``, foco depois de remontar, itens por página, variante compacta,
  ``href``, limites e axe (claro e escuro).
- ``cookiebar.spec.js``: ``<dsgovbr-cookiebar>`` e ``dsgovbrCookies``
  (``src/js/dsgovbr-bootstraped-cookies.js``): barra, modal de configurações, botão
  flutuante, evento, ``localStorage`` e axe (claro e escuro, modal aberto).
- ``modo.spec.js``: seletor de modo claro/escuro.
- ``a11y.spec.js``: axe-core (WCAG 2 A/AA) nas páginas de componentes e no exemplo
  de login — RNF-02. Violação nova faz o teste falhar.
- ``visual.spec.js``: captura de tela de cada página em desktop (1280px) e mobile
  (375px) comparada com a imagem de referência — RNF-09. Só roda com ``VISUAL=1``
  no container oficial.

O ``ci.yml`` tem dois jobs: **Build e testes** (``npm test``) e **Testes de
navegador**, este dentro de ``mcr.microsoft.com/playwright:v1.64.1-noble``, a mesma
imagem em que ``npm run test:visual:update`` gera as capturas — fontes e
renderização idênticas. A versão dessa imagem acompanha o ``@playwright/test``
fixado no ``package.json``: **atualize os dois juntos** (``ci.yml``,
``package.json`` e o script ``test:visual:update``) e regenere as capturas. O
``release.yml`` roda ``npm test`` antes do publish.

Os testes de navegador já acharam problemas reais: assets referenciados fora de
``docs/`` (404 no Pages), o JS do Bootstrap ausente nas páginas de componentes
(alerta não fechava) e o contraste de 1,5:1 do ``btn-outline-warning``.

**Fonte Rawline nas páginas de docs.** As páginas (layout de componentes e
exemplos, exceto ``comparacao-padrao.html``, que mostra o Bootstrap puro) linkam
``../assets/fonts/rawline/rawline.css``, cópia hospedada no site (issue #45): o CDN
do SERPRO não envia CORS, então não aceita ``integrity``. A cópia fica em
``src/site/fonts/rawline/`` (woff2 sem modificação e ``OFL.txt``) e o
``build:docs-assets`` a copia para ``docs/``. Os testes de navegador interceptam essa
requisição com CSS vazio (``tests/browser/fixtures.js``):
rodam offline e as capturas visuais ficam determinísticas (caem no fallback).
Com a chave *Aplicar GOV.BR DS* desligada (``src/site/catalogo.js``), a página
troca o CSS pelo ``bootstrap.min.css`` puro e desliga o ``<link>`` da Rawline.
``pages.spec.js`` garante o ``<link>`` local em cada página e que nenhuma página
linka o CDN. O ``upstream-check.yml`` semanal ainda verifica que a URL do CDN
continua respondendo, porque é ela que o :doc:`getting-started` indica ao
consumidor do pacote.

Análise estática (Semgrep)
~~~~~~~~~~~~~~~~~~~~~~~~~~

``.github/workflows/semgrep.yml`` roda ``semgrep scan --config auto`` (container
oficial, regras públicas, sem conta no semgrep.dev) em push, PR e toda segunda,
e envia o SARIF ao code scanning. Os achados são informativos. Para reproduzir
local:

.. code:: bash

   docker run --rm -v "$PWD:/src" -w /src semgrep/semgrep semgrep scan --config auto   --exclude vendor --exclude node_modules --exclude dist --exclude docs/assets   --exclude-rule yaml.github-actions.security.github-actions-mutable-action-tag.github-actions-mutable-action-tag

Política (issue #28): o objetivo é **zero achados ativos**.

- **Actions por major, não por SHA.** A regra ``github-actions-mutable-action-tag``
  fica excluída de propósito: fixamos actions oficiais do GitHub pela major
  (``@v7``) e deixamos o Dependabot (grupo ``github-actions``) mantê-las. Fixar por
  SHA é mais forte contra a troca de uma tag, mas custa legibilidade e PRs de
  atualização; se a política mudar, remova a exclusão e fixe os SHAs.
- **Dependabot com ``cooldown`` de 7 dias** (``npm`` e ``github-actions``): não propõe
  versão recém-publicada. Alertas de segurança ignoram o cooldown.
- **Supressão só com motivo.** ``// nosemgrep: <regra>`` precisa de um comentário
  na linha de cima explicando por que o achado é falso positivo (ex.: o caminho
  já é validado por guarda). Os casos atuais: ``scripts/serve.js`` (servidor só em
  ``127.0.0.1``, sem TLS) e ``scripts/test-package.js`` (nome do tarball vindo do
  nosso ``npm pack``). O servidor não usa guarda de caminho: a URL nunca vira
  caminho de arquivo, só é buscada num índice dos arquivos existentes sob ``docs/``
  (``tests/serve.test.js`` tenta ``../``, ``%2e%2e``, ``%5c`` etc.). Isso fechou os
  alertas ``js/path-injection`` do CodeQL, que não reconheciam o guarda com
  ``startsWith``.
- Scripts do projeto usam ``execFileSync`` com argumentos, nunca ``execSync`` com
  string (que passa por shell).

Antes da primeira publicação de um formato novo (ex.: outro entry point), testar o ``.tgz`` gerado por ``npm pack`` num projeto consumidor limpo; ``test:package`` já cobre o caminho atual (CSS pronto e SCSS).

Verificações por componente
---------------------------

Uma contribuição de componente deve conter, no mínimo:

- Seletores Bootstrap aceitos e markup de fixture.
- Referência GOV.BR DS e revisão utilizada.
- Mapeamento semântico das variantes e diferenças deliberadas.
- Estados normal, ``hover``, ``focus-visible``, ativo, desabilitado e erro quando aplicáveis.
- Testes de teclado, associação de labels e contraste relevantes.
- Avaliação se o componente depende de JavaScript, ícones, fontes ou de markup não nativo Bootstrap.
- Atualização do status na matriz dos requisitos e documentação de limitações.

Não declare equivalência comportamental com GOV.BR DS apenas porque as capturas visuais se parecem. Componentes operados pelo JavaScript Bootstrap devem conservar seus testes comportamentais.

Sass e dependências
-------------------

Priorizar ``@use``/``@forward`` no código novo. Verificar antes se as dependências efetivamente consumidas ainda dependem de ``@import`` e isolar conflitos, avisos e ordem de carregamento. Fixar versões em lockfile e manter a matriz de compatibilidade atualizada.

A decisão de usar fontes upstream como dependência, copiar trechos ou reimplementar adaptadores é tomada por componente, com revisão de licença e manutenção; não há uma estratégia global presumida para todos os arquivos.

Publicação planejada
--------------------

1. Atualizar documentação e subir a versão em ``package.json`` (e ``package-lock.json``).
2. Rodar ``npm run build``, ``npm test`` (consumidor limpo: pack → instala → compila SCSS) e ``npm pack --dry-run``; conferir o conteúdo do tarball.
3. Commitar na ``main`` e enviar a tag: ``git tag vX.Y.Z && git push origin vX.Y.Z``.
4. O workflow ``.github/workflows/release.yml`` (disparado pela tag) confere que a
   tag bate com a versão do ``package.json``, compila, publica no npm via trusted
   publishing/OIDC e cria a GitHub Release com os assets de ``dist/``.

**Não** rode ``gh release create`` antes: o workflow cria a release já com os
assets (rascunho → publicada). Criar a release antes causa o erro
``Cannot upload asset to an immutable release``. Pré-requisito único: Trusted
Publisher com "Allow npm publish" configurado no npmjs.com (DP-07).

Leituras úteis
--------------

- `Bootstrap — customização Sass <https://getbootstrap.com/docs/5.3/customize/sass/>`__.
- `Sass — ``@import`` depreciado <https://sass-lang.com/documentation/at-rules/import/>`__.
- `npm — publicação com escopo <https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>`__.
- `npm — trusted publishing <https://docs.npmjs.com/trusted-publishers/>`__.
