# Análise de modal e navegação — issue #38

## Escopo e versões

Análise estática dos submodules fixados pelo projeto: Bootstrap **v5.3.8** e
`@govbr-ds/core` **v3.7.0**. Nenhum componente foi alterado nesta análise. As
referências abaixo são os fontes dessas tags, não uma promessa de equivalência
visual ou funcional.

## Resumo executivo

| Área | Diferença principal | Recomendação |
|---|---|---|
| Modal | Bootstrap implementa o ciclo de vida completo do diálogo; no GOV.BR DS o modal visual e a abertura pelo scrim são peças separadas, com outro markup e outro controlador. | Manter **não suportado** até uma issue própria comparar e testar o markup. Não substituir o JavaScript Bootstrap. |
| Navbar e menu | Bootstrap oferece navbar responsiva, Collapse e Dropdown independentes. O GOV.BR DS combina Header, Menu lateral/contextual, scrim e comportamentos próprios. | Manter Header/Menu complexos **não suportados**. Avaliar separadamente um subconjunto simples de `.navbar` e `.dropdown`, preservando os plugins Bootstrap. |

Uma camada CSS pode mudar aparência, mas não converte classes, estrutura,
semântica ARIA, ordem de foco ou comportamento. Para modal e navegação complexa,
“reutilizar o plugin Bootstrap” é a opção de menor risco; substituir o plugin
ou exigir markup `.br-*` mudaria o contrato deste pacote.

## Modal

### Contratos comparados

| Contrato | Bootstrap 5.3.8 | GOV.BR DS 3.7.0 | Consequência |
|---|---|---|---|
| Markup | `.modal` → `.modal-dialog` → `.modal-content` → `.modal-header`, `.modal-body`, `.modal-footer`. Acionadores usam `data-bs-toggle="modal"` e `data-bs-target`. | `.br-modal` com `.br-modal-header`, `.br-modal-body`, `.br-modal-footer`; o scrim/overlay é um contêiner separado `.br-scrim` ou `.br-scrim-util`. Acionadores usam os contratos próprios de scrim. | Regras de layout e seletores dos dois componentes não se aplicam intercambiavelmente. Traduzir a árvore Bootstrap em classes `.br-*` viola a API pública pretendida. |
| CSS | O overlay, posicionamento, responsividade, animação, overflow e z-index pertencem ao `.modal` Bootstrap e seus descendentes. | `.br-modal` é principalmente o painel flexível; tokens de tamanho `xsmall` a `large`, corpo com rolagem e scrim ficam em componentes/fontes distintos. | Um tema CSS-only pode adaptar o painel, mas não cria o wrapper/scrim exigido pelo GOV.BR DS. |
| JavaScript | `Modal` gerencia show/hide, backdrop, teclado Escape, foco, retorno de foco ao acionador, bloqueio/compensação da rolagem do body, transições e eventos públicos (`show`, `shown`, `hide`, `hidden`). O backdrop pode ser `true`, `false` ou `static`; `keyboard` e `focus` são configuráveis. | `BRModal` não implementa um plugin modal equivalente: percorre `.br-scrim` e conecta scrim. O `Scrim` utilitário tem opções de Escape e limite de Tab, mas esses controles não equivalem ao ciclo de vida do `Modal` Bootstrap; o componente `BRScrim` cobre outro contrato de abertura/fechamento. | A aparência pode ser separada do comportamento, mas não se deve afirmar compatibilidade sem validar cada comportamento Bootstrap e cada modo de scrim. |
| Acessibilidade | O Bootstrap aplica `role="dialog"` e `aria-modal` ao abrir, retém foco no diálogo, restaura foco ao acionador pela API de dados e trata Escape conforme configuração. O nome acessível continua responsabilidade do markup (`aria-labelledby`/`aria-label`). | Exemplos GOV.BR DS declaram `role="dialog"`, `aria-modal` e nome acessível no próprio markup. O scrim utilitário pode focar um elemento e, quando configurado, limitar Tab; o exemplo/código deve ser verificado por cenário, não inferido do papel ARIA. | Atributos ARIA semelhantes não provam paridade. Foco inicial, contenção de Tab, retorno de foco, fechamento e conteúdo de fundo precisam de testes com teclado e axe. |

### Decisão

**Não suportar modal nesta versão.** Preservar o plugin Bootstrap é tecnicamente
possível e é a recomendação para aplicações existentes, mas ainda não há fixture
que prove que o CSS adaptado cobre os estados do Bootstrap sem quebrar overlay,
rolagem, foco, transições e conteúdo longo. Não implementar conversão automática
para `.br-modal`/`.br-scrim`, nem substituir o plugin por `BRModal`/`Scrim`.

### Critérios para uma futura issue de implementação

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
   plugin Bootstrap documentados. Se for necessário markup `.br-*` ou JavaScript
   novo, tratar como integração diferente, não como adaptação compatível.

**Custo/risco:** alto. São muitos estados globais e caminhos assíncronos, e uma
diferença de foco ou rolagem pode tornar o diálogo inacessível mesmo quando a
captura está visualmente correta. Requer suíte de navegador estável antes de
qualquer anúncio de suporte.

## Navbar, dropdown, header e menu

“Navegação” não é um único componente equivalente. A comparação abaixo separa
navbar/collapse, dropdown simples e menu institucional/complexo.

| Contrato | Bootstrap 5.3.8 | GOV.BR DS 3.7.0 | Consequência |
|---|---|---|---|
| Navbar responsiva | `.navbar`, `.navbar-expand-*`, `.navbar-nav`, `.navbar-toggler` e `.navbar-collapse`. O breakpoint e a apresentação vêm das classes Bootstrap. | `.br-header` reúne identidade, busca, acesso rápido e acionador; `.br-menu` é painel lateral ou contextual. Há breakpoints e modos `push` próprios. | `.navbar` não é substituta de `.br-header`; layouts e controles são diferentes. Não prometer cabeçalho institucional por troca de cores. |
| Collapse | Plugin `Collapse` abre/fecha alvos via `data-bs-toggle="collapse"`, atualiza `aria-expanded` no acionador e emite eventos. O plugin não é um gerenciador geral de foco/roving tabindex da navegação. | Menu lateral/contextual controla scrim, classes ativas, foco inicial, fechamento por Escape, navegação por setas e submenus. | Manter Collapse é viável para um navbar Bootstrap, mas não implementa o contrato do menu GOV.BR DS. |
| Dropdown | Plugin `Dropdown` posiciona com Popper, atualiza estado, trata Escape e setas para percorrer itens. O markup usa `.dropdown`, `.dropdown-toggle`, `.dropdown-menu` e `data-bs-toggle="dropdown"`. | Dropdown simples no Header tem acionadores e listeners próprios; pastas e side menus do `BRMenu` usam `.menu-folder`, `.menu-item`, `.side-menu` e `aria-expanded`. | Uma adaptação visual de dropdown simples pode preservar o plugin Bootstrap, mas não deve ser anunciada como compatibilidade com menus hierárquicos GOV.BR DS. |
| Semântica/teclado | Usa elementos e relações Bootstrap, `aria-expanded`, links/botões e a interação de teclado do plugin Dropdown. Navbar permite Tab nativo; Collapse não cria padrão de `tree`. | `BRMenu` injeta ícones e atributos ARIA, adiciona navegação por setas e Escape e alterna itens. O código configura `tree`/`treeitem` em vários elementos e `menubar` no modo contextual. | Mudar roles ou teclado tem risco alto: roles `tree`/`menubar` impõem expectativas de teclado próprias. Preservar DOM Bootstrap e seus roles é condição de qualquer adaptação CSS-only. |
| Comportamentos do Header | Sem equivalente nativo em Navbar: busca que abre/foca e fecha, sticky/compact, login/logout e dropdown contextual são específicos. | `BRHeader` conecta busca, Escape, dropdown, sticky e algumas ações de login/logout. `BRMenu` é inicializado à parte. | O componente deve ser avaliado por função. Não copiar só o visual do Header e declarar equivalência. |

### Decisão por subconjunto

- **`.navbar` simples:** candidato a adaptação visual limitada em issue própria,
  com a estrutura oficial Bootstrap mantida e os plugins Bootstrap carregados.
  Excluir busca, identidade institucional, menu push, scrim e qualquer promessa
  de equivalência com `.br-header`/`.br-menu`.
- **`.dropdown` simples:** candidato independente, limitado a um acionador e uma
  lista plana, com Popper e plugin Bootstrap preservados. Excluir pastas
  hierárquicas, side-menu, menu contextual, cabeçalho de funcionalidades e
  comportamento do Header GOV.BR DS.
- **`.br-header` e `.br-menu`/navegação hierárquica:** não suportar como adaptação
  Bootstrap neste momento. Exigem estrutura, controle de foco, semântica e
  interações específicas; integração futura teria que ser explicitamente outro
  contrato ou componente.

### Critérios para issues futuras

Para navbar simples, testar breakpoints Bootstrap existentes, estado expandido,
atributos ARIA, Tab/Shift+Tab, links ativos/desabilitados e axe-core em desktop e
mobile. Para dropdown simples, testar click/Enter/Space, setas, Escape, foco após
fechar, menu perto das bordas/scroll/RTL e axe-core. Capturas visuais não
substituem essas verificações. Não introduzir roles `menu`, `menubar` ou `tree`
sem implementar e testar integralmente o modelo de teclado correspondente.

**Custo/risco:** médio para navbar estática; médio para dropdown plano; alto para
header/menu GOV.BR DS ou hierarquia. Popper, breakpoints, foco, RTL e papéis ARIA
ampliam a matriz de regressão. Manter cada contrato em issue separada reduz
risco e permite rejeitar subcomponentes sem bloquear outros.

## Referências upstream fixadas

### Bootstrap v5.3.8

- [modal.js](https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/modal.js) —
  ciclo de vida, foco, backdrop, acionadores, retorno de foco e Escape.
- [focustrap.js](https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/util/focustrap.js)
  — contenção de foco.
- [_modal.scss](https://github.com/twbs/bootstrap/blob/v5.3.8/scss/_modal.scss)
  — estrutura visual e estados.
- [collapse.js](https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/collapse.js)
  — acionadores, `aria-expanded` e transições de Collapse.
- [dropdown.js](https://github.com/twbs/bootstrap/blob/v5.3.8/js/src/dropdown.js)
  — Popper, estados e teclado.
- [_navbar.scss](https://github.com/twbs/bootstrap/blob/v5.3.8/scss/_navbar.scss)
  e [_dropdown.scss](https://github.com/twbs/bootstrap/blob/v5.3.8/scss/_dropdown.scss)
  — estruturas, breakpoints e estados visuais.

### GOV.BR DS `@govbr-ds/core` v3.7.0

- [`modal.pug`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/modal/modal.pug)
  e [`modal.js`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/modal/modal.js)
  — anatomia visual e inicialização do scrim pelo componente Modal.
- [`_mixins.scss`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/modal/_mixins.scss)
  — tamanhos, cabeçalho, corpo, rodapé e scroll.
- [`scrim.js`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/scrim/scrim.js)
  e [`behavior/scrim.js`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/partial/js/behavior/scrim.js)
  — duas APIs de scrim e seus limites de foco/fechamento.
- [`menu.pug`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/menu/menu.pug),
  [`menu.js`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/menu/menu.js)
  e [`menu/_mixins.scss`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/menu/_mixins.scss)
  — painel, submenus, roles ARIA e navegação por teclado.
- [`header.pug`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/header/header.pug)
  e [`header.js`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/components/header/header.js)
  — busca, dropdowns, sticky e acionador de menu.
- [`utilities/_dropdown.scss`](https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core/-/blob/v3.7.0/src/partial/scss/utilities/_dropdown.scss)
  — regras utilitárias do dropdown GOV.BR DS.

## Estado da matriz

A matriz em [`requisitos.md` §6](requisitos.md#6-matriz-de-compatibilidade-atual-v051)
permanece conservadora: modal, Header/Menu complexo e navegação hierárquica
continuam **não suportados**. Navbar simples e dropdown plano são possibilidades
de avaliação independente, não itens suportados nem compromisso de implementação.
