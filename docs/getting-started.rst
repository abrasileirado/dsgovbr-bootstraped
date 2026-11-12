Getting Started
===============

   Guia de instalação e uso. Leia primeiro :doc:`a documentação <index>` para o
   contexto do projeto e :doc:`os requisitos <requisitos>` para saber exatamente
   o que já é suportado.

Estado atual
------------

O pacote **ainda não foi publicado no npm** (ver DP-07 em
:doc:`requisitos`). Por enquanto, a única forma de usar o
dsgovbr-bootstrapped é clonando este repositório e compilando localmente.

Usando a partir deste repositório
---------------------------------

.. code:: bash

   git clone --recurse-submodules https://github.com/abrasileirado/dsgovbr-bootstrapped.git
   cd dsgovbr-bootstrapped
   npm install
   npm run build

O CSS pronto fica em ``dist/dsgovbr-bootstrapped.css`` (ou ``.min.css``,
minificado). Inclua no seu HTML:

.. code:: html

   <link rel="stylesheet" href="caminho/para/dsgovbr-bootstrapped.min.css">

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
  `THIRD_PARTY_NOTICES <https://github.com/abrasileirado/dsgovbr-bootstrapped/blob/main/THIRD_PARTY_NOTICES.md>`__.

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
o usuário alternar, carregue o JS opcional ``dist/dsgovbr-bootstrapped-modo.js``
(sem dependência) de forma **síncrona no ``<head>``**, depois do CSS, e marque o
botão com ``data-dsgovbr-modo``:

.. code:: html

   <link rel="stylesheet" href="dist/dsgovbr-bootstrapped.min.css">
   <script src="dist/dsgovbr-bootstrapped-modo.js"></script>
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

O JS opcional ``dist/dsgovbr-bootstrapped-componentes.js`` (sem dependência) define
quatro custom elements que encapsulam as composições do `painel administrativo
<exemplos/admin.html>`__: ``<dsgovbr-header>``, ``<dsgovbr-menu>``,
``<dsgovbr-footer>`` e ``<dsgovbr-breadcrumb>``. Eles geram as classes Bootstrap
em *light DOM* (sem Shadow DOM), então o CSS do tema vale sem ajuste. Carregue com
``defer`` e mantenha o ``bootstrap.bundle`` (que abre o menu, os dropdowns e a busca):

.. code:: html

   <script src="dist/dsgovbr-bootstrapped-modo.js"></script>
   <script src="dist/dsgovbr-bootstrapped-componentes.js" defer></script>
   <script src="bootstrap.bundle.min.js" defer></script>
   ...
   <dsgovbr-header logo="logo.svg" logo-alt="Página inicial" assinatura="Ministério Exemplo"
                   titulo="Sistema" menu="menu-principal" busca modo cookies usuario="Maria Silva"
                   pagina="Usuários">
     <dsgovbr-usuario-menu>
       <dsgovbr-item href="/perfil">Meu perfil</dsgovbr-item>
     </dsgovbr-usuario-menu>
     <dsgovbr-breadcrumb>
       <dsgovbr-item href="/">Início</dsgovbr-item>
       <dsgovbr-item>Usuários</dsgovbr-item>
     </dsgovbr-breadcrumb>
     <dsgovbr-acoes>
       <button type="button" class="btn btn-primary">Adicionar usuário</button>
     </dsgovbr-acoes>
   </dsgovbr-header>

   <dsgovbr-menu id="menu-principal" titulo="Sistema" logo="logo.svg">
     <dsgovbr-item href="/" icone="fas fa-home">Início</dsgovbr-item>
     <dsgovbr-pasta rotulo="Cadastros" icone="fas fa-users" aberta>
       <dsgovbr-item href="/usuarios" icone="fas fa-user" atual>Usuários</dsgovbr-item>
     </dsgovbr-pasta>
   </dsgovbr-menu>

   <dsgovbr-footer logo="logo-negativo.svg" logo-alt="Logo do sistema">
     <dsgovbr-coluna titulo="Sistema"><dsgovbr-item href="/sobre">Sobre</dsgovbr-item></dsgovbr-coluna>
     <dsgovbr-aviso>Texto legal.</dsgovbr-aviso>
   </dsgovbr-footer>

- Em aplicações renderizadas no servidor, ``busca-acao="/busca/"`` (e ``busca-nome``, ``busca-valor``,
  ``busca-id``) liga o formulário da busca; ``busca-autocomplete="/busca/sugestoes/"`` mostra sugestões
  (JSON, mesma origem) com teclado e ARIA ``combobox``.
- O header fica fixo no topo (``.sticky-top``) junto com o breadcrumb, o título da
  página e as ações; ``estatico`` desliga a fixação.
- Cada componente lê filhos e atributos uma vez, ao conectar, e troca o conteúdo
  pelo HTML final. Mudar um atributo depois remonta; valores viram texto, nunca HTML.
- O skip link e o ``<main id="conteudo">`` continuam no HTML da página.
- Enquanto não monta, o CSS esconde o componente (``visibility: hidden`` até o
  atributo ``data-dsgovbr-montado``); sem o JS ele permanece oculto.

Todos os atributos e elementos filhos (``<dsgovbr-item>``, ``<dsgovbr-pasta>``, ``<dsgovbr-coluna>``, ``<dsgovbr-rede>``...) estão em `Web components
<componentes/web-components.html>`__ (catálogo).

Paginação (opcional)
--------------------

O ``<dsgovbr-paginacao>``, no mesmo ``dist/dsgovbr-bootstrapped-componentes.js``, monta a
paginação (``.pagination``) com janela de páginas e reticências, seletor "Exibir", texto
"1-10 de 100 itens" e a variante ``compacta`` (rodapé de tabela). Só classes do Bootstrap:

.. code:: html

   <dsgovbr-paginacao total="100" por-pagina="10" pagina="1"
                      opcoes-por-pagina="10,25,50" informacao></dsgovbr-paginacao>

- Com ``href="?pagina={pagina}"`` os controles viram links reais (renderização no servidor).
- Toda troca dispara ``dsgovbr:pagina`` (``event.detail``: ``pagina``, ``porPagina``,
  ``total``, ``totalPaginas`` e ``origem``); ``pagina`` e ``por-pagina`` são atributos e
  propriedades mantidos em dia.

Todos os atributos em `Paginação <componentes/paginacao.html#web-component>`__ (catálogo).

Tabela (opcional)
-----------------

O ``<dsgovbr-tabela>``, no mesmo ``dist/dsgovbr-bootstrapped-componentes.js``, junta as partes do *Table*
do GOV.BR DS ao redor do seu ``<table>``: busca, filtros, menu de ferramentas (densidade), barra de
itens selecionados com ações em lote e paginação (``<dsgovbr-paginacao compacta>``). Só classes e
plugins do Bootstrap (exige o ``bootstrap.bundle``):

.. code:: html

   <dsgovbr-tabela titulo="Usuários" busca ferramentas selecionavel acao="/usuarios/"
                   total="42" por-pagina="10" opcoes-por-pagina="10,25,50">
     <table> … <tr data-valor="7"> … </table>
     <dsgovbr-filtro nome="ativo" rotulo="Ativo">
       <dsgovbr-opcao valor="1">Sim</dsgovbr-opcao>
     </dsgovbr-filtro>
     <dsgovbr-lote-acao acao="excluir" icone="fas fa-trash">Excluir</dsgovbr-lote-acao>
   </dsgovbr-tabela>

- Busca e filtros ficam num ``<form method="get">``: com ``acao`` o envio é nativo (servidor); sem
  ela, só os eventos ``dsgovbr:tabela-busca`` e ``dsgovbr:tabela-filtro``.
- Seleção: checkbox por linha (``name="selecionados"``, valor de ``data-valor``);
  ``dsgovbr:tabela-selecao`` e ``dsgovbr:tabela-acao`` (``detail.valores``).

Todos os atributos e eventos em `Tabela <componentes/tabela.html>`__ (catálogo); exemplo de listagem no
`painel administrativo <exemplos/admin.html>`__.

Campo de formulário (opcional)
------------------------------

O ``<dsgovbr-campo>``, no mesmo ``dist/dsgovbr-bootstrapped-componentes.js``, gera rótulo + **controle
nativo** + ajuda + feedback, com ``for``/``id``/``aria-describedby``/``aria-invalid`` ligados sozinhos, só
com classes do Bootstrap. O ``<input>``, ``<select>`` ou ``<textarea>`` é real e fica dentro do
``<form>``: o valor é enviado normalmente e a validação nativa funciona.

.. code:: html

   <form method="post">
     <dsgovbr-campo tipo="email" nome="email" rotulo="E-mail" obrigatorio
                    ajuda="Usamos só para avisos."></dsgovbr-campo>
     <dsgovbr-campo tipo="select" nome="uf" rotulo="Estado" valor="RN">
       <dsgovbr-opcao valor="RN">Rio Grande do Norte</dsgovbr-opcao>
       <dsgovbr-opcao valor="PB">Paraíba</dsgovbr-opcao>
     </dsgovbr-campo>
   </form>

- Tipos: texto e variações de ``type``, ``textarea``, ``select``, ``checkbox``, ``switch`` e ``radio``.
- ``erro``/``sucesso`` (atributos ou ``<dsgovbr-erro>``/``<dsgovbr-sucesso>``) marcam o campo; um
  atributo vazio limpa. Mudar um atributo remonta **sem perder** o digitado nem o foco.
- Propriedades ``controle`` e ``valor`` e o método ``validar()``.

Detalhes em `Formulários <componentes/formularios.html#web-component>`__ (catálogo).

Modal (opcional)
----------------

O ``<dsgovbr-modal>``, no mesmo ``dist/dsgovbr-bootstrapped-componentes.js``, monta o markup do
modal só com classes do Bootstrap e reusa o plugin ``Modal`` (exige o ``bootstrap.bundle``). O
próprio elemento é o ``.modal``; o conteúdo livre vira o corpo e ``<dsgovbr-acoes>`` o rodapé:

.. code:: html

   <button data-dsgovbr-modal-abrir="#confirmar">Abrir</button>

   <dsgovbr-modal id="confirmar" titulo="Confirmar envio" centralizado>
     Depois de enviada, a solicitação não poderá ser alterada.
     <dsgovbr-acoes>
       <button class="btn btn-outline-primary" data-bs-dismiss="modal">Cancelar</button>
       <button class="btn btn-primary" data-bs-dismiss="modal">Enviar</button>
     </dsgovbr-acoes>
   </dsgovbr-modal>

- Atributos: ``titulo``, ``tamanho`` (``sm``, ``lg``, ``xl``, ``tela-cheia``), ``rolagem``,
  ``centralizado`` e ``estatico`` (sem Escape nem clique fora).
- API: ``abrir()``, ``fechar()``, ``alternar()`` e ``aberto``; evento ``dsgovbr:modal``
  (``event.detail.aberto``); ``data-bs-toggle="modal"`` também funciona.

Detalhes em `Modal <componentes/modal.html#web-component>`__ (catálogo).

Consentimento de cookies (opcional)
-----------------------------------

O JS opcional ``dist/dsgovbr-bootstrapped-cookies.js`` (sem dependência) traz o
``<dsgovbr-cookiebar>`` (barra de consentimento, configurações por grupo num modal e
botão flutuante que as reabre) e a API ``window.dsgovbrCookies``. Carregue de forma
**síncrona no ``<head>``**, para a API estar pronta cedo, e mantenha o
``bootstrap.bundle`` (abre o modal):

.. code:: html

   <script src="dist/dsgovbr-bootstrapped-cookies.js"></script>
   ...
   <dsgovbr-cookiebar declaracao="/cookies">
     <dsgovbr-cookies-texto>Usamos cookies para melhorar sua experiência. Veja a nossa</dsgovbr-cookies-texto>
     <dsgovbr-cookies-grupo nome="desempenho" rotulo="Desempenho">Medem o uso do site.</dsgovbr-cookies-grupo>
     <dsgovbr-cookies-grupo nome="funcionais" rotulo="Funcionais">Lembram suas preferências.</dsgovbr-cookies-grupo>
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

   npm install @abrasileirado/dsgovbr-bootstrapped

.. code:: html

   <link rel="stylesheet" href="node_modules/@abrasileirado/dsgovbr-bootstrapped/dist/dsgovbr-bootstrapped.min.css">

Compilando a partir do SCSS
~~~~~~~~~~~~~~~~~~~~~~~~~~~

O pacote inclui o SCSS do projeto **e** o do Bootstrap (``vendor/bootstrap/scss``),
então dá para compilar no seu projeto e sobrescrever os tokens do GOV.BR DS.
Defina as variáveis **antes** de importar a entrada (todas são ``!default``):

.. code:: scss

   // seu-estilo.scss
   $primary: #0b5cad; // sobrescreve o azul do GOV.BR DS
   @import "@abrasileirado/dsgovbr-bootstrapped/src/scss/index";

Compile com Dart Sass apontando o ``node_modules`` como load path
(``sass --load-path=node_modules seu-estilo.scss saida.css``) ou use o
resolvedor do seu bundler. O pacote usa ``@import`` (o Bootstrap 5.3 ainda não
usa ``@use``/``@forward``), então o Dart Sass emite avisos de depreciação
``import``/``color-functions`` vindos do próprio Bootstrap; ``--quiet`` os silencia.
