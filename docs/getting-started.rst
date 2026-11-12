Getting Started
===============

   Guia de instalação e uso. Leia primeiro :doc:`a documentação <index>` para o
   contexto do projeto e :doc:`os requisitos <requisitos>` para saber exatamente
   o que já é suportado.

Estado atual
------------

O pacote **ainda não foi publicado no npm** (ver DP-07 em
:doc:`requisitos`). Por enquanto, a única forma de usar o
dsgovbr-bootstraped é clonando este repositório e compilando localmente.

Usando a partir deste repositório
---------------------------------

.. code:: bash

   git clone --recurse-submodules https://github.com/abrasileirado/dsgovbr-bootstraped.git
   cd dsgovbr-bootstraped
   npm install
   npm run build

O CSS pronto fica em ``dist/dsgovbr-bootstraped.css`` (ou ``.min.css``,
minificado). Inclua no seu HTML:

.. code:: html

   <link rel="stylesheet" href="caminho/para/dsgovbr-bootstraped.min.css">

Nenhum outro CSS do Bootstrap precisa ser carregado: a build é **autônoma**
(DP-02 em :doc:`requisitos`) — o arquivo já inclui o Bootstrap inteiro
recompilado com os tokens do GOV.BR DS.

Pré-requisitos externos
-----------------------

- **Fonte "Rawline"** (fallback: Raleway, sans-serif): não é incluída no
  pacote (DP-05). Sem ela o navegador usa o fallback. O GOV.BR DS a publica
  num CDN do SERPRO:

  .. code:: html

     <link rel="stylesheet" href="https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css">

  A Rawline é SIL OFL 1.1 (conforme as próprias fontes). O CDN não envia CORS,
  então não aceita ``integrity``; para usar SRI, hospede a fonte você mesmo — ver
  `THIRD_PARTY_NOTICES <https://github.com/abrasileirado/dsgovbr-bootstraped/blob/main/THIRD_PARTY_NOTICES.md>`__.

- **Ícones Font Awesome 5**: não incluídos. Só são necessários se você for
  replicar manualmente ícones do GOV.BR DS (nenhum componente do MVP atual
  exige ícones). Versão usada na documentação do GOV.BR DS:

  .. code:: html

     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css">

O que já está suportado
-----------------------

Ver o `catálogo de componentes <componentes/index.html>`__ para a lista
completa, com exemplos de markup, variantes, tamanhos e estados — e
`exemplos de uso concreto <exemplos/login.html>`__ para ver os componentes
compostos numa tela real.

Modo claro/escuro (opcional)
----------------------------

O CSS já pinta o modo escuro pelo ``data-bs-theme="dark"`` do Bootstrap 5.3. Para
o usuário alternar, carregue o JS opcional ``dist/dsgovbr-bootstraped-modo.js``
(sem dependência) de forma **síncrona no ``<head>``**, depois do CSS, e marque o
botão com ``data-dsgovbr-modo``:

.. code:: html

   <link rel="stylesheet" href="dist/dsgovbr-bootstraped.min.css">
   <script src="dist/dsgovbr-bootstraped-modo.js"></script>
   ...
   <button class="btn btn-link btn-sm rounded-circle" type="button"
           data-dsgovbr-modo aria-pressed="false" aria-label="Modo escuro" title="Modo escuro">
     <i class="fas fa-adjust" aria-hidden="true"></i>
   </button>

- Sem escolha salva, segue o sistema (``prefers-color-scheme``), inclusive quando ele muda.
- O clique alterna claro/escuro, grava a escolha no ``localStorage`` e mantém o
  ``aria-pressed`` ("true" no escuro). ``data-dsgovbr-modo="light"`` ou ``"dark"`` fixa um modo.
- API: ``window.dsgovbrModo.atual()``, ``.aplicar("light" | "dark")`` e ``.alternar()``.
  Toda troca dispara ``dsgovbr:modo`` no ``<html>`` (``event.detail.modo``).

Exemplo no header do `painel administrativo <exemplos/admin.html>`__.

Web components de header, menu, footer e breadcrumb (opcional)
---------------------------------------------------------------

O JS opcional ``dist/dsgovbr-bootstraped-componentes.js`` (sem dependência) define
quatro custom elements que encapsulam as composições do `painel administrativo
<exemplos/admin.html>`__: ``<dsgovbr-header>``, ``<dsgovbr-menu>``,
``<dsgovbr-footer>`` e ``<dsgovbr-breadcrumb>``. Eles geram as classes Bootstrap
em *light DOM* (sem Shadow DOM), então o CSS do tema vale sem ajuste. Carregue com
``defer`` e mantenha o ``bootstrap.bundle`` (que abre o menu, os dropdowns e a busca):

.. code:: html

   <script src="dist/dsgovbr-bootstraped-modo.js"></script>
   <script src="dist/dsgovbr-bootstraped-componentes.js" defer></script>
   <script src="bootstrap.bundle.min.js" defer></script>
   ...
   <dsgovbr-header logo="logo.svg" logo-alt="Página inicial" assinatura="Ministério Exemplo"
                   titulo="Sistema" menu="menu-principal" busca modo cookies usuario="Maria Silva"
                   pagina="Usuários">
     <a slot="usuario" href="/perfil">Meu perfil</a>
     <dsgovbr-breadcrumb slot="breadcrumb">
       <a href="/">Início</a>
       <span>Usuários</span>
     </dsgovbr-breadcrumb>
     <button slot="acoes" type="button" class="btn btn-primary">Adicionar usuário</button>
   </dsgovbr-header>

   <dsgovbr-menu id="menu-principal" titulo="Sistema" logo="logo.svg">
     <a href="/" icone="fas fa-home">Início</a>
     <details open icone="fas fa-users">
       <summary>Cadastros</summary>
       <a href="/usuarios" icone="fas fa-user" atual>Usuários</a>
     </details>
   </dsgovbr-menu>

   <dsgovbr-footer logo="logo-negativo.svg" logo-alt="Logo do sistema">
     <nav slot="coluna" titulo="Sistema"><a href="/sobre">Sobre</a></nav>
     <p slot="aviso">Texto legal.</p>
   </dsgovbr-footer>

- O header fica fixo no topo (``.sticky-top``) junto com o breadcrumb, o título da
  página e as ações; ``estatico`` desliga a fixação.
- Cada componente lê filhos e atributos uma vez, ao conectar, e troca o conteúdo
  pelo HTML final. Mudar um atributo depois remonta; valores viram texto, nunca HTML.
- O skip link e o ``<main id="conteudo">`` continuam no HTML da página.
- Enquanto não monta, o CSS esconde o componente (``visibility: hidden`` até o
  atributo ``data-dsgovbr-montado``); sem o JS ele permanece oculto.

Todos os atributos e slots estão em `Web components
<componentes/web-components.html>`__ (catálogo).

Consentimento de cookies (opcional)
-----------------------------------

O JS opcional ``dist/dsgovbr-bootstraped-cookies.js`` (sem dependência) traz o
``<dsgovbr-cookiebar>`` (barra de consentimento, configurações por grupo num modal e
botão flutuante que as reabre) e a API ``window.dsgovbrCookies``. Carregue de forma
**síncrona no ``<head>``**, para a API estar pronta cedo, e mantenha o
``bootstrap.bundle`` (abre o modal):

.. code:: html

   <script src="dist/dsgovbr-bootstraped-cookies.js"></script>
   ...
   <dsgovbr-cookiebar declaracao="/cookies">
     <p slot="texto">Usamos cookies para melhorar sua experiência. Veja a nossa</p>
     <div slot="grupo" nome="desempenho" rotulo="Desempenho">Medem o uso do site.</div>
     <div slot="grupo" nome="funcionais" rotulo="Funcionais">Lembram suas preferências.</div>
   </dsgovbr-cookiebar>

- O grupo "estritamente necessários" é criado sozinho (sempre ativo e bloqueado). A
  barra só aparece sem escolha salva (``localStorage``); depois dela fica só o botão
  flutuante (``sem-botao`` o desliga). Qualquer elemento com
  ``data-dsgovbr-cookies-abrir`` abre as configurações; ``<dsgovbr-header cookies>``
  já traz um botão de ação rápida assim.
- API: ``dsgovbrCookies.escolha()``, ``.permitido("grupo")``, ``.definir({grupo: true})``,
  ``.limpar()`` e ``.abrir()``. Toda mudança dispara ``dsgovbr:cookies`` no ``<html>``
  (``event.detail.grupos`` e ``event.detail.origem``).

Detalhes em `Cookiebar <componentes/cookiebar.html>`__ (catálogo); exemplo no
`painel administrativo <exemplos/admin.html>`__.

Quando o pacote for publicado no npm (planejado)
------------------------------------------------

.. code:: bash

   npm install @abrasileirado/dsgovbr-bootstraped

.. code:: html

   <link rel="stylesheet" href="node_modules/@abrasileirado/dsgovbr-bootstraped/dist/dsgovbr-bootstraped.min.css">

Compilando a partir do SCSS
~~~~~~~~~~~~~~~~~~~~~~~~~~~

O pacote inclui o SCSS do projeto **e** o do Bootstrap (``vendor/bootstrap/scss``),
então dá para compilar no seu projeto e sobrescrever os tokens do GOV.BR DS.
Defina as variáveis **antes** de importar a entrada (todas são ``!default``):

.. code:: scss

   // seu-estilo.scss
   $primary: #0b5cad; // sobrescreve o azul do GOV.BR DS
   @import "@abrasileirado/dsgovbr-bootstraped/src/scss/index";

Compile com Dart Sass apontando o ``node_modules`` como load path
(``sass --load-path=node_modules seu-estilo.scss saida.css``) ou use o
resolvedor do seu bundler. O pacote usa ``@import`` (o Bootstrap 5.3 ainda não
usa ``@use``/``@forward``), então o Dart Sass emite avisos de depreciação
``import``/``color-functions`` vindos do próprio Bootstrap; ``--quiet`` os silencia.
