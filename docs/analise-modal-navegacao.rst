Análise de modal e navegação — issue #38
========================================

Escopo e versões
----------------

Análise estática dos submodules fixados pelo projeto: Bootstrap **v5.3.8** e
``@govbr-ds/core`` **v3.7.0**. Nenhum componente foi alterado nesta análise. As
referências abaixo são os fontes dessas tags, não uma promessa de equivalência
visual ou funcional.

Resumo executivo
----------------

+---------------+--------------------------+--------------------------+
| Área          | Diferença principal      | Recomendação             |
+===============+==========================+==========================+
| Modal         | Bootstrap implementa o   | Manter **não suportado** |
|               | ciclo de vida completo   | até uma issue própria    |
|               | do diálogo; no GOV.BR DS | comparar e testar o      |
|               | o modal visual e a       | markup. Não substituir o |
|               | abertura pelo scrim são  | JavaScript Bootstrap.    |
|               | peças separadas, com     |                          |
|               | outro markup e outro     |                          |
|               | controlador.             |                          |
+---------------+--------------------------+--------------------------+
| Navbar e menu | Bootstrap oferece navbar | Manter Header/Menu       |
|               | responsiva, Collapse e   | complexos **não          |
|               | Dropdown independentes.  | suportados**. Avaliar    |
|               | O GOV.BR DS combina      | separadamente um         |
|               | Header, Menu             | subconjunto simples de   |
|               | lateral/contextual,      | ``.navbar`` e            |
|               | scrim e comportamentos   | ``.dropdown``,           |
|               | próprios.                | preservando os plugins   |
|               |                          | Bootstrap.               |
+---------------+--------------------------+--------------------------+

Uma camada CSS pode mudar aparência, mas não converte classes, estrutura,
semântica ARIA, ordem de foco ou comportamento. Para modal e navegação complexa,
“reutilizar o plugin Bootstrap” é a opção de menor risco; substituir o plugin
ou exigir markup ``.br-*`` mudaria o contrato deste pacote.

Modal
-----

Contratos comparados
~~~~~~~~~~~~~~~~~~~~

+----------------+---------------------------------------+-----------------------+----------------------+
| Contrato       | Bootstrap 5.3.8                       | GOV.BR DS 3.7.0       | Consequência         |
+================+=======================================+=======================+======================+
| Markup         | ``.modal`` → ``.modal-dialog`` →      | ``.br-modal`` com     | Regras de layout e   |
|                | ``.modal-content`` →                  | ``.br-modal-header``, | seletores dos dois   |
|                | ``.modal-header``, ``.modal-body``,   | ``.br-modal-body``,   | componentes não se   |
|                | ``.modal-footer``. Acionadores usam   | ``.br-modal-footer``; | aplicam              |
|                | ``data-bs-toggle="modal"`` e          | o scrim/overlay é um  | intercambiavelmente. |
|                | ``data-bs-target``.                   | contêiner separado    | Traduzir a árvore    |
|                |                                       | ``.br-scrim`` ou      | Bootstrap em classes |
|                |                                       | ``.br-scrim-util``.   | ``.br-*`` viola a    |
|                |                                       | Acionadores usam os   | API pública          |
|                |                                       | contratos próprios de | pretendida.          |
|                |                                       | scrim.                |                      |
+----------------+---------------------------------------+-----------------------+----------------------+
| CSS            | O overlay, posicionamento,            | ``.br-modal`` é       | Um tema CSS-only     |
|                | responsividade, animação, overflow e  | principalmente o      | pode adaptar o       |
|                | z-index pertencem ao ``.modal``       | painel flexível;      | painel, mas não cria |
|                | Bootstrap e seus descendentes.        | tokens de tamanho     | o wrapper/scrim      |
|                |                                       | ``xsmall`` a          | exigido pelo GOV.BR  |
|                |                                       | ``large``, corpo com  | DS.                  |
|                |                                       | rolagem e scrim ficam |                      |
|                |                                       | em componentes/fontes |                      |
|                |                                       | distintos.            |                      |
+----------------+---------------------------------------+-----------------------+----------------------+
| JavaScript     | ``Modal`` gerencia show/hide,         | ``BRModal`` não       | A aparência pode ser |
|                | backdrop, teclado Escape, foco,       | implementa um plugin  | separada do          |
|                | retorno de foco ao acionador,         | modal equivalente:    | comportamento, mas   |
|                | bloqueio/compensação da rolagem do    | percorre              | não se deve afirmar  |
|                | body, transições e eventos públicos   | ``.br-scrim`` e       | compatibilidade sem  |
|                | (``show``, ``shown``, ``hide``,       | conecta scrim. O      | validar cada         |
|                | ``hidden``). O backdrop pode ser      | ``Scrim`` utilitário  | comportamento        |
|                | ``true``, ``false`` ou ``static``;    | tem opções de Escape  | Bootstrap e cada     |
|                | ``keyboard`` e ``focus`` são          | e limite de Tab, mas  | modo de scrim.       |
|                | configuráveis.                        | esses controles não   |                      |
|                |                                       | equivalem ao ciclo de |                      |
|                |                                       | vida do ``Modal``     |                      |
|                |                                       | Bootstrap; o          |                      |
|                |                                       | componente            |                      |
|                |                                       | ``BRScrim`` cobre     |                      |
|                |                                       | outro contrato de     |                      |
|                |                                       | abertura/fechamento.  |                      |
+----------------+---------------------------------------+-----------------------+----------------------+
| Acessibilidade | O Bootstrap aplica ``role="dialog"``  | Exemplos GOV.BR DS    | Atributos ARIA       |
|                | e ``aria-modal`` ao abrir, retém foco | declaram              | semelhantes não      |
|                | no diálogo, restaura foco ao          | ``role="dialog"``,    | provam paridade.     |
|                | acionador pela API de dados e trata   | ``aria-modal`` e nome | Foco inicial,        |
|                | Escape conforme configuração. O nome  | acessível no próprio  | contenção de Tab,    |
|                | acessível continua responsabilidade   | markup. O scrim       | retorno de foco,     |
|                | do markup                             | utilitário pode focar | fechamento e         |
|                | (``aria-labelledby``/``aria-label``). | um elemento e, quando | conteúdo de fundo    |
|                |                                       | configurado, limitar  | precisam de testes   |
|                |                                       | Tab; o exemplo/código | com teclado e axe.   |
|                |                                       | deve ser verificado   |                      |
|                |                                       | por cenário, não      |                      |
|                |                                       | inferido do papel     |                      |
|                |                                       | ARIA.                 |                      |
+----------------+---------------------------------------+-----------------------+----------------------+

Decisão
~~~~~~~

**Não suportar modal nesta versão.** Preservar o plugin Bootstrap é tecnicamente
possível e é a recomendação para aplicações existentes, mas ainda não há fixture
que prove que o CSS adaptado cobre os estados do Bootstrap sem quebrar overlay,
rolagem, foco, transições e conteúdo longo. Não implementar conversão automática
para ``.br-modal``/``.br-scrim``, nem substituir o plugin por ``BRModal``/``Scrim``.

Critérios para uma futura issue de implementação
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Fixture com markup Bootstrap puro, nome acessível, título, descrição, botão de
   fechar, conteúdo longo, dois diálogos sequenciais e acionador externo.
2. Cobrir modal padrão e backdrop estático; abrir/fechar por API e acionador;
   Escape configurado; clique no backdrop; eventos do ciclo de vida; rolagem;
   foco inicial, contenção por Tab/Shift+Tab e retorno ao acionador.
3. Axe-core com modal fechado e aberto; validar nome do diálogo, foco visível,
   conteúdo de fundo e operação integral sem mouse.
4. Capturas desktop/mobile para tamanhos e conteúdo com rolagem; validar também
   redução de movimento e ausência de regressão nas animações Bootstrap.
5. Limitar o suporte às opções testadas; manter as opções e eventos públicos do
   plugin Bootstrap documentados. Se for necessário markup ``.br-*`` ou JavaScript
   novo, tratar como integração diferente, não como adaptação compatível.

**Custo/risco:** alto. São muitos estados globais e caminhos assíncronos, e uma
diferença de foco ou rolagem pode tornar o diálogo inacessível mesmo quando a
captura está visualmente correta. Requer suíte de navegador estável antes de
qualquer anúncio de suporte.

Navbar, dropdown, header e menu
-------------------------------

“Navegação” não é um único componente equivalente. A comparação abaixo separa
navbar/collapse, dropdown simples e menu institucional/complexo.

+-------------------+--------------------------------+-----------------------+----------------------+
| Contrato          | Bootstrap 5.3.8                | GOV.BR DS 3.7.0       | Consequência         |
+===================+================================+=======================+======================+
| Navbar responsiva | ``.navbar``,                   | ``.br-header`` reúne  | ``.navbar`` não é    |
|                   | ``.navbar-expand-*``,          | identidade, busca,    | substituta de        |
|                   | ``.navbar-nav``,               | acesso rápido e       | ``.br-header``;      |
|                   | ``.navbar-toggler`` e          | acionador;            | layouts e controles  |
|                   | ``.navbar-collapse``. O        | ``.br-menu`` é painel | são diferentes. Não  |
|                   | breakpoint e a apresentação    | lateral ou            | prometer cabeçalho   |
|                   | vêm das classes Bootstrap.     | contextual. Há        | institucional por    |
|                   |                                | breakpoints e modos   | troca de cores.      |
|                   |                                | ``push`` próprios.    |                      |
+-------------------+--------------------------------+-----------------------+----------------------+
| Collapse          | Plugin ``Collapse`` abre/fecha | Menu                  | Manter Collapse é    |
|                   | alvos via                      | lateral/contextual    | viável para um       |
|                   | ``data-bs-toggle="collapse"``, | controla scrim,       | navbar Bootstrap,    |
|                   | atualiza ``aria-expanded`` no  | classes ativas, foco  | mas não implementa o |
|                   | acionador e emite eventos. O   | inicial, fechamento   | contrato do menu     |
|                   | plugin não é um gerenciador    | por Escape, navegação | GOV.BR DS.           |
|                   | geral de foco/roving tabindex  | por setas e submenus. |                      |
|                   | da navegação.                  |                       |                      |
+-------------------+--------------------------------+-----------------------+----------------------+
| Dropdown          | Plugin ``Dropdown`` posiciona  | Dropdown simples no   | Uma adaptação visual |
|                   | com Popper, atualiza estado,   | Header tem            | de dropdown simples  |
|                   | trata Escape e setas para      | acionadores e         | pode preservar o     |
|                   | percorrer itens. O markup usa  | listeners próprios;   | plugin Bootstrap,    |
|                   | ``.dropdown``,                 | pastas e side menus   | mas não deve ser     |
|                   | ``.dropdown-toggle``,          | do ``BRMenu`` usam    | anunciada como       |
|                   | ``.dropdown-menu`` e           | ``.menu-folder``,     | compatibilidade com  |
|                   | ``data-bs-toggle="dropdown"``. | ``.menu-item``,       | menus hierárquicos   |
|                   |                                | ``.side-menu`` e      | GOV.BR DS.           |
|                   |                                | ``aria-expanded``.    |                      |
+-------------------+--------------------------------+-----------------------+----------------------+
| Semântica/teclado | Usa elementos e relações       | ``BRMenu`` injeta     | Mudar roles ou       |
|                   | Bootstrap, ``aria-expanded``,  | ícones e atributos    | teclado tem risco    |
|                   | links/botões e a interação de  | ARIA, adiciona        | alto: roles          |
|                   | teclado do plugin Dropdown.    | navegação por setas e | ``tree``/``menubar`` |
|                   | Navbar permite Tab nativo;     | Escape e alterna      | impõem expectativas  |
|                   | Collapse não cria padrão de    | itens. O código       | de teclado próprias. |
|                   | ``tree``.                      | configura             | Preservar DOM        |
|                   |                                | ``tree``/``treeitem`` | Bootstrap e seus     |
|                   |                                | em vários elementos e | roles é condição de  |
|                   |                                | ``menubar`` no modo   | qualquer adaptação   |
|                   |                                | contextual.           | CSS-only.            |
+-------------------+--------------------------------+-----------------------+----------------------+
| Comportamentos do | Sem equivalente nativo em      | ``BRHeader`` conecta  | O componente deve    |
| Header            | Navbar: busca que abre/foca e  | busca, Escape,        | ser avaliado por     |
|                   | fecha, sticky/compact,         | dropdown, sticky e    | função. Não copiar   |
|                   | login/logout e dropdown        | algumas ações de      | só o visual do       |
|                   | contextual são específicos.    | login/logout.         | Header e declarar    |
|                   |                                | ``BRMenu`` é          | equivalência.        |
|                   |                                | inicializado à parte. |                      |
+-------------------+--------------------------------+-----------------------+----------------------+

Decisão por subconjunto
~~~~~~~~~~~~~~~~~~~~~~~

- **``.navbar`` simples:** candidato a adaptação visual limitada em issue própria,
  com a estrutura oficial Bootstrap mantida e os plugins Bootstrap carregados.
  Excluir busca, identidade institucional, menu push, scrim e qualquer promessa
  de equivalência com ``.br-header``/``.br-menu``.
- **``.dropdown`` simples:** candidato independente, limitado a um acionador e uma
  lista plana, com Popper e plugin Bootstrap preservados. Excluir pastas
  hierárquicas, side-menu, menu contextual, cabeçalho de funcionalidades e
  comportamento do Header GOV.BR DS.
- **``.br-header`` e ``.br-menu``/navegação hierárquica:** não suportar como adaptação
  Bootstrap neste momento. Exigem estrutura, controle de foco, semântica e
  interações específicas; integração futura teria que ser explicitamente outro
  contrato ou componente.

Critérios para issues futuras
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Para navbar simples, testar breakpoints Bootstrap existentes, estado expandido,
atributos ARIA, Tab/Shift+Tab, links ativos/desabilitados e axe-core em desktop e
mobile. Para dropdown simples, testar click/Enter/Space, setas, Escape, foco após
fechar, menu perto das bordas/scroll/RTL e axe-core. Capturas visuais não
substituem essas verificações. Não introduzir roles ``menu``, ``menubar`` ou ``tree``
sem implementar e testar integralmente o modelo de teclado correspondente.

**Custo/risco:** médio para navbar estática; médio para dropdown plano; alto para
header/menu GOV.BR DS ou hierarquia. Popper, breakpoints, foco, RTL e papéis ARIA
ampliam a matriz de regressão. Manter cada contrato em issue separada reduz
risco e permite rejeitar subcomponentes sem bloquear outros.

Referências upstream fixadas
----------------------------

Bootstrap v5.3.8
~~~~~~~~~~~~~~~~

- `modal.js <https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/modal.js>`__ —
  ciclo de vida, foco, backdrop, acionadores, retorno de foco e Escape.
- `focustrap.js <https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/util/focustrap.js>`__
  — contenção de foco.
- `\_modal.scss <https://github.com/twbs/bootstrap/blob/v5.3.8/scss/_modal.scss>`__
  — estrutura visual e estados.
- `collapse.js <https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/collapse.js>`__
  — acionadores, ``aria-expanded`` e transições de Collapse.
- `dropdown.js <https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/dropdown.js>`__
  — Popper, estados e teclado.
- `\_navbar.scss <https://github.com/twbs/bootstrap/blob/v5.3.8/scss/_navbar.scss>`__
  e `\_dropdown.scss <https://github.com/twbs/bootstrap/blob/v5.3.8/scss/_dropdown.scss>`__
  — estruturas, breakpoints e estados visuais.

GOV.BR DS ``@govbr-ds/core`` v3.7.0
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- ```modal.pug`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/modal/modal.pug>`__
  e ```modal.js`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/modal/modal.js>`__
  — anatomia visual e inicialização do scrim pelo componente Modal.
- ```_mixins.scss`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/modal/_mixins.scss>`__
  — tamanhos, cabeçalho, corpo, rodapé e scroll.
- ```scrim.js`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/scrim/scrim.js>`__
  e ```behavior/scrim.js`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/partial/js/behavior/scrim.js>`__
  — duas APIs de scrim e seus limites de foco/fechamento.
- ```menu.pug`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/menu/menu.pug>`__,
  ```menu.js`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/menu/menu.js>`__
  e ```menu/_mixins.scss`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/menu/_mixins.scss>`__
  — painel, submenus, roles ARIA e navegação por teclado.
- ```header.pug`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/header/header.pug>`__
  e ```header.js`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/header/header.js>`__
  — busca, dropdowns, sticky e acionador de menu.
- ```utilities/_dropdown.scss`` <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/partial/scss/utilities/_dropdown.scss>`__
  — regras utilitárias do dropdown GOV.BR DS.

Estado da matriz
----------------

A matriz em :ref:`Requisitos §6 <requisitos:6. Matriz de compatibilidade atual (v0.5.1)>`
permanece conservadora: modal, Header/Menu complexo e navegação hierárquica
continuam **não suportados**. Navbar simples e dropdown plano são possibilidades
de avaliação independente, não itens suportados nem compromisso de implementação.
