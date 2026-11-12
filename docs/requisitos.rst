Requisitos de software
======================

- **Versão do documento:** 0.2 (decisões atualizadas após inspeção do código-fonte upstream).
- **Estado:** especificação; não descreve funcionalidades já implementadas.
- **Projeto:** integração comunitária e não oficial da API de classes Bootstrap 5 com aspectos visuais do GOV.BR DS.
- **Repositório:** https://github.com/abrasileirado/dsgovbr-bootstrapped.

1. Contexto e problema
----------------------

Aplicações existentes com Bootstrap 5 usam classes, estrutura HTML e, por vezes, plugins JavaScript próprios. Migrá-las para o GOV.BR DS exige frequentemente alterar templates para classes e anatomias de componentes diferentes. Este projeto busca oferecer uma opção gradual: manter a API Bootstrap para componentes declarados como suportados, produzindo uma aparência baseada na referência GOV.BR DS.

A composição SCSS dos projetos é uma oportunidade de reaproveitamento, **não uma garantia de equivalência**. Regras que dependem de ``.br-*``, filhos específicos, JavaScript próprio, fontes ou ícones exigirão mapeamento, adaptação ou exclusão documentada.

2. Objetivos
------------

- O-01 — Distribuir um pacote reutilizável para projetos Bootstrap 5, sem exigir troca generalizada de classes HTML.
- O-02 — Reaproveitar tokens e, quando tecnicamente viável, fontes SCSS do GOV.BR DS de modo rastreável.
- O-03 — Disponibilizar CSS compilado e fontes SCSS, respeitando contratos de instalação e entrada documentados.
- O-04 — Definir níveis verificáveis de fidelidade, incluindo limitações de markup, comportamento e acessibilidade.
- O-05 — Permitir evolução componente a componente sem afirmar certificação, homologação ou endosso oficial.

3. Não objetivos do MVP
-----------------------

- Reproduzir todos os componentes ou padrões do GOV.BR DS.
- Garantir equivalência pixel a pixel em todas as combinações de navegador e dispositivo.
- Substituir o JavaScript do Bootstrap pelo JavaScript do GOV.BR DS.
- Introduzir silenciosamente classes ``.br-*`` como requisito de uso dos componentes anunciados como Bootstrap compatíveis.
- Implementar, no MVP, header institucional, navegação complexa, modal ou menu com comportamento próprio.
- Publicar fontes, ícones, imagens ou outros ativos de terceiros sem revisão de origem, licença e necessidade.
- Alegar conformidade institucional automática pelo simples uso do pacote.

4. Usuários e casos de uso
--------------------------

+----------------------------------+----------------------------------+
| Perfil                           | Necessidade                      |
+==================================+==================================+
| Desenvolvedor de aplicação       | Aplicar um tema visual GOV.BR DS |
| Bootstrap                        | sem reescrever todos os          |
|                                  | templates.                       |
+----------------------------------+----------------------------------+
| Equipe com pipeline Sass         | Importar fontes para configurar  |
|                                  | e compilar estilos da aplicação. |
+----------------------------------+----------------------------------+
| Equipe sem pipeline Sass         | Consumir CSS previamente         |
|                                  | compilado com contrato de        |
|                                  | dependências documentado.        |
+----------------------------------+----------------------------------+
| Mantenedor                       | Verificar componentes, versões,  |
|                                  | origem de tokens e regressões    |
|                                  | antes da publicação.             |
+----------------------------------+----------------------------------+

5. Premissas e restrições
-------------------------

- A compatibilidade é fixada em **Bootstrap v5.3.8** e **@govbr-ds/core v3.7.0**, ambos incluídos como git submodules apontando para os repositórios oficiais upstream (não forks) e fixados por tag (ver DP-01/DP-03).
- A versão ou revisão de GOV.BR DS usada como referência deve ser explicitamente fixada antes da implementação. Não se deve depender de ``latest`` na geração de releases.
- O pacote npm ``@abrasileirado/dsgovbr-bootstrapped`` já está publicado (ver DP-07).
- A versão do pacote acompanha o GOV.BR DS de referência: ``major.minor`` é a do ``@govbr-ds/core`` (hoje 3.7) e o ``patch`` conta as revisões do projeto. O npm exige semver de 3 partes, por isso não há quarta posição.
- O projeto distingue contrato **visual**, contrato de **markup** e contrato de **comportamento**. A aprovação em um contrato não implica aprovação nos outros.
- Qualquer versão que contenha CSS pronto deverá informar se ele é **autônomo** (inclui Bootstrap) ou **camada adicional** (exige Bootstrap carregado separadamente), com ordem de carregamento e cobertura demonstradas.
- Cores, medidas e nomes de tokens nos artefatos finais devem vir das fontes versionadas escolhidas; não são definidos por suposição neste documento.

6. Matriz de compatibilidade atual (v0.5.1)
-------------------------------------------

Legenda de esforço: **A** = adaptação principalmente por tokens/SCSS; **B** = exige convenção de markup e validação por componente; **C** = adaptação estrutural e/ou comportamental relevante; **D** = fora do escopo atual. O status descreve o que foi implementado e verificado neste projeto; não implica equivalência integral com GOV.BR DS. Referências upstream consideradas: Bootstrap v5.3.8 e ``@govbr-ds/core`` v3.7.0.

+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Área        | API Bootstrap pretendida        | Referência  | Esforço | Status     | Limite / condição para ampliar suporte                                    |
|             |                                 | GOV.BR DS   |         | atual      |                                                                           |
+=============+=================================+=============+=========+============+===========================================================================+
| Fundamentos | Tokens e variáveis Bootstrap    | Fundamentos | A       | Limitado   | Mapeamento versionado, origem registrada e testes de compilação; não      |
|             |                                 | visuais /   |         |            | cobre todos os tokens do GOV.BR DS.                                       |
|             |                                 | tokens      |         |            |                                                                           |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Layout      | ``.container``, ``.row``,       | Grid e      | A       | Não        | Preservam-se as classes Bootstrap, mas não se promete paridade visual:    |
|             | ``.col-*``                      | layout      |         | suportado  | breakpoints GOV.BR DS (xs:0, sm:576, md:992, lg:1280, xl:1600) diferem    |
|             |                                 |             |         | (Bootstrap | dos Bootstrap (sm:576, md:768, lg:992, xl:1200, xxl:1400).                |
|             |                                 |             |         | sem        |                                                                           |
|             |                                 |             |         | adaptação) |                                                                           |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Botões      | ``.btn`` e variantes            | Button      | B       | Limitado   | Apenas variantes e estados documentados e testados; ``btn-secondary``     |
|             | selecionadas                    |             |         |            | mantém o padrão Bootstrap.                                                |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Texto e     | ``.form-control``,              | Input       | B       | Limitado   | Estados, labels, ajuda e erro testados sem exigir ``.br-input``;          |
| formulários | ``.form-label``                 |             |         |            | diferenças visuais conhecidas permanecem documentadas.                    |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Auxiliares  | ``.visually-hidden-focusable``, | Skiplink,   | B       | Limitado   | Issue #47: composições com classes e utilitários Bootstrap;               |
|             | ``.rounded-circle``,            | Avatar,     |         |            | ``.btn-light`` vira o Sign-in em todo o tema; sem divider tracejado e     |
|             | ``.btn-light``, ``hr``/``.vr``, | Sign-in,    |         |            | sem a lógica do ``BRCookiebar``.                                          |
|             | ``.offcanvas-bottom``           | Divider,    |         |            |                                                                           |
|             |                                 | Cookiebar   |         |            |                                                                           |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Select e    | ``.form-select``,               | Select,     | B       | Limitado   | Issue #46: select nativo com a superfície do Input e seta na cor          |
| switch      | ``.form-switch``                | Switch      |         |            | interativa (sem busca nem multisseleção do DS); switch no tamanho médio   |
|             |                                 |             |         |            | do DS, rótulo à esquerda com ``.form-check-reverse``.                     |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Seleção     | ``.form-check``,                | Checkbox e  | B       | Limitado   | Conjunto atual verificado para foco, marcação, desabilitado, teclado e    |
|             | ``.form-check-input``           | Radio       |         |            | alinhamento; sem equivalência geral de markup.                            |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Feedback    | ``.alert`` e variantes          | Message     | B       | Limitado   | Severidades e ícones adaptados; fechamento requer o JavaScript            |
|             | selecionadas                    |             |         |            | Bootstrap e segue seu comportamento.                                      |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Conteúdo    | ``.card`` e partes selecionadas | Card        | B       | Limitado   | Apenas anatomia e variações demonstradas na documentação.                 |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Badge/tag   | ``.badge`` Bootstrap            | Tag         | B/C     | Limitado   | Badge estático: fundo padrão, variantes ``.text-bg-*`` e contador; sem    |
|             |                                 |             |         |            | interação. Tag selecionável, removível ou interativa exige markup,        |
|             |                                 |             |         |            | semântica e comportamento próprios; não converter automaticamente para    |
|             |                                 |             |         |            | ``.br-tag``.                                                              |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Paginação   | ``.pagination``,                | Pagination  | B/C     | Limitado   | Estados ativo, desabilitado, foco e hover adaptados para paginação        |
|             | ``.page-item``, ``.page-link``  |             |         |            | estática. Sem seletor de itens por página, dropdowns de reticências ou    |
|             |                                 |             |         |            | lógica de navegação do DS; variantes pequenas/grandes preservam os        |
|             |                                 |             |         |            | paddings Bootstrap.                                                       |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Modal       | ``.modal``, ``.offcanvas`` e    | Modal +     | C       | Limitado   | Issue #43: visual por tokens e CSS (sem raio nem borda, sombra, 500px,    |
|             | plugins Bootstrap               | Scrim       |         |            | título 16,8px negrito, rodapé sem divisor, fundo preto a 45% como o       |
|             |                                 |             |         |            | Scrim), mantendo o plugin Bootstrap (análise #38). O backdrop não é o     |
|             |                                 |             |         |            | componente Scrim. Não converter para ``.br-modal``/``.br-scrim``. Ver     |
|             |                                 |             |         |            | :ref:`análise <analise-modal-navegacao:Modal>`.                           |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Demais      | Accordion, breadcrumb, close    | Accordion,  | B       | Limitado   | Issue #43: tokens e CSS por componente e foco tracejado dourado global;   |
| componentes | button, carousel, list group,   | Breadcrumb, |         |            | as diferenças que restam estão em cada página do catálogo (issue #41).    |
|             | navs & tabs, popovers,          | Button      |         |            |                                                                           |
|             | progress, spinners, toasts,     | circular,   |         |            |                                                                           |
|             | tooltips, ``.dropdown``         | Carousel,   |         |            |                                                                           |
|             |                                 | List/Item,  |         |            |                                                                           |
|             |                                 | Tab,        |         |            |                                                                           |
|             |                                 | Tooltip,    |         |            |                                                                           |
|             |                                 | Loading,    |         |            |                                                                           |
|             |                                 | Message     |         |            |                                                                           |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Sem         | Button group, collapse,         | —           | A       | Não        | Têm página no catálogo; recebem os tokens globais e o foco tracejado      |
| equivalente | placeholders, scrollspy         |             |         | suportado  | dourado.                                                                  |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+
| Navegação   | ``.navbar``, ``.offcanvas-lg``  | Header,     | C/D     | Limitado   | Issue #45: navbar com aparência do Header (sombra, título responsivo,     |
|             | como menu lateral, rodapé em    | Menu e      |         |            | links interativos, acionador circular, modo escuro em                     |
|             | ``data-bs-theme="dark"`` +      | Footer      |         |            | ``--background-dark``); menu lateral por offcanvas com list group;        |
|             | ``.bg-body``                    |             |         |            | footer pelo modo escuro do GOV.BR DS (fundo, texto, links e foco). Fora   |
|             |                                 |             |         |            | do suporte: anatomia completa do ``.br-header`` (assinatura, busca        |
|             |                                 |             |         |            | expansível, compacto/sticky), ``.br-menu`` hierárquico                    |
|             |                                 |             |         |            | (``tree``/``menubar``) e push. Composição em                              |
|             |                                 |             |         |            | `exemplos/admin.html <exemplos/admin.html>`__; análise #38 em             |
|             |                                 |             |         |            | :ref:`análise <analise-modal-navegacao:Navbar, dropdown, header e menu>`. |
+-------------+---------------------------------+-------------+---------+------------+---------------------------------------------------------------------------+

O suporte é por subconjunto e versão: **planejado** significa ainda sem adaptação; **experimental**, implementado sem cobertura suficiente; **limitado**, apenas variantes/estados enumerados e verificados; **estável**, critérios completos atendidos; **não suportado**, sem adaptação GOV.BR DS. Apenas componentes com critérios atendidos poderão ser anunciados como estáveis. Paginação cobre somente estados estáticos e não implementa interações específicas do GOV.BR DS. A análise de modal e navegação está em :doc:`analise-modal-navegacao`; as possibilidades propostas ali não alteram o status da matriz.

7. Requisitos funcionais
------------------------

+-------+-------------+-----------------------+------------------------+
| ID    | Prioridade  | Requisito             | Critério de aceite     |
+=======+=============+=======================+========================+
| RF-01 | Obrigatório | Gerar CSS a partir    | Comando de build       |
|       |             | dos fontes SCSS com   | reproduzível gera CSS  |
|       |             | build documentado.    | normal e minificado,   |
|       |             |                       | sem erros, nas versões |
|       |             |                       | de dependências        |
|       |             |                       | fixadas.               |
+-------+-------------+-----------------------+------------------------+
| RF-02 | Obrigatório | Manter mapa           | Cada token utilizado   |
|       |             | rastreável de tokens  | registra origem,       |
|       |             | GOV.BR DS →           | propósito e destino;   |
|       |             | variáveis/componentes | valores inexistentes   |
|       |             | Bootstrap.            | são tratados como      |
|       |             |                       | escolha local e        |
|       |             |                       | identificados como     |
|       |             |                       | tal.                   |
+-------+-------------+-----------------------+------------------------+
| RF-03 | Obrigatório | Preservar as classes  | Fixtures de teste usam |
|       |             | públicas Bootstrap    | classes Bootstrap sem  |
|       |             | para os componentes   | classes ``.br-*``      |
|       |             | anunciados como       | obrigatórias.          |
|       |             | suportados.           |                        |
+-------+-------------+-----------------------+------------------------+
| RF-04 | Obrigatório | Disponibilizar        | Página de teste        |
|       |             | adaptação de botões   | demonstra tamanhos e   |
|       |             | para variantes        | estados definidos na   |
|       |             | selecionadas.         | matriz de variantes;   |
|       |             |                       | diferenças conhecidas  |
|       |             |                       | são documentadas.      |
+-------+-------------+-----------------------+------------------------+
| RF-05 | Obrigatório | Disponibilizar        | Fixtures incluem label |
|       |             | adaptação básica de   | associado, ajuda,      |
|       |             | campos de texto,      | erro, foco,            |
|       |             | checkbox e radio.     | desabilitado e         |
|       |             |                       | operação por teclado.  |
+-------+-------------+-----------------------+------------------------+
| RF-06 | Obrigatório | Disponibilizar        | Cada variação          |
|       |             | adaptações básicas de | suportada tem fixture, |
|       |             | alertas e cards.      | regra documentada de   |
|       |             |                       | uso e teste visual.    |
+-------+-------------+-----------------------+------------------------+
| RF-07 | Obrigatório | Fornecer uma matriz   | Matriz registra        |
|       |             | pública de suporte.   | status, seletores      |
|       |             |                       | Bootstrap aceitos,     |
|       |             |                       | diferenças e versão de |
|       |             |                       | introdução por         |
|       |             |                       | componente.            |
+-------+-------------+-----------------------+------------------------+
| RF-08 | Obrigatório | Publicar artefatos    | ``npm pack --dry-run`` |
|       |             | CSS e SCSS em pacote  | lista os arquivos      |
|       |             | npm público.          | esperados; instalação  |
|       |             |                       | local do tarball e     |
|       |             |                       | exemplos CSS/SCSS      |
|       |             |                       | passam em build de     |
|       |             |                       | consumidor.            |
+-------+-------------+-----------------------+------------------------+
| RF-09 | Obrigatório | Declarar a relação    | README informa se      |
|       |             | entre Bootstrap e CSS | Bootstrap precisa ser  |
|       |             | distribuído.          | importado antes; teste |
|       |             |                       | de integração detecta  |
|       |             |                       | ordem incorreta ou     |
|       |             |                       | ausência da            |
|       |             |                       | dependência.           |
+-------+-------------+-----------------------+------------------------+
| RF-10 | Desejável   | Permitir entrada SCSS | Pelo menos uma entrada |
|       |             | específica para       | documentada compila    |
|       |             | customização ou       | num projeto            |
|       |             | consumo parcial.      | consumidor;            |
|       |             |                       | parcialização é        |
|       |             |                       | entregue apenas se     |
|       |             |                       | comprovadamente        |
|       |             |                       | estável.               |
+-------+-------------+-----------------------+------------------------+
| RF-11 | Desejável   | Disponibilizar        | Exemplos exibem        |
|       |             | catálogo              | markup, variante,      |
|       |             | demonstrativo.        | estados e limitação    |
|       |             |                       | por componente.        |
+-------+-------------+-----------------------+------------------------+
| RF-12 | Desejável   | Publicar source map   | Arquivo de mapa        |
|       |             | para CSS não          | referencia os fontes   |
|       |             | minificado.           | distribuídos e não     |
|       |             |                       | contém caminhos locais |
|       |             |                       | indevidos.             |
+-------+-------------+-----------------------+------------------------+

8. Requisitos não funcionais
----------------------------

+--------+-------------+-----------------------+-----------------------+
| ID     | Prioridade  | Requisito             | Critério de aceite    |
+========+=============+=======================+=======================+
| RNF-01 | Obrigatório | Compatibilidade de    | ``package.json`` e    |
|        |             | versões explícita.    | documentação          |
|        |             |                       | registram faixa       |
|        |             |                       | Bootstrap testada e   |
|        |             |                       | revisão/versão dos    |
|        |             |                       | artefatos GOV.BR DS.  |
+--------+-------------+-----------------------+-----------------------+
| RNF-02 | Obrigatório | Acessibilidade básica | Inspeção manual por   |
|        |             | verificável.          | teclado e testes      |
|        |             |                       | automatizados         |
|        |             |                       | aplicáveis cobrem     |
|        |             |                       | foco, semântica e     |
|        |             |                       | contraste dos         |
|        |             |                       | componentes do MVP;   |
|        |             |                       | problemas são         |
|        |             |                       | registrados.          |
+--------+-------------+-----------------------+-----------------------+
| RNF-03 | Obrigatório | Build determinístico. | CI instala a partir   |
|        |             |                       | de lockfile e         |
|        |             |                       | recompila os          |
|        |             |                       | artefatos sem         |
|        |             |                       | diferenças            |
|        |             |                       | inesperadas.          |
+--------+-------------+-----------------------+-----------------------+
| RNF-04 | Obrigatório | Isolamento de         | Testes de regressão   |
|        |             | seletores.            | procuram conflitos    |
|        |             |                       | relevantes com        |
|        |             |                       | Bootstrap e estilos   |
|        |             |                       | globais GOV.BR DS;    |
|        |             |                       | não se importa        |
|        |             |                       | indiscriminadamente o |
|        |             |                       | CSS completo de ambas |
|        |             |                       | as bibliotecas.       |
+--------+-------------+-----------------------+-----------------------+
| RNF-05 | Obrigatório | Verificação de        | Dependências e ativos |
|        |             | licenças e            | redistribuídos têm    |
|        |             | atribuições.          | licença verificada;   |
|        |             |                       | avisos MIT aplicáveis |
|        |             |                       | são preservados.      |
+--------+-------------+-----------------------+-----------------------+
| RNF-06 | Obrigatório | Segurança de          | CI testa o tarball    |
|        |             | publicação.           | antes de publicar;    |
|        |             |                       | fluxo automatizado    |
|        |             |                       | deve priorizar npm    |
|        |             |                       | trusted               |
|        |             |                       | publishing/OIDC e     |
|        |             |                       | proveniência, sujeito |
|        |             |                       | à configuração do     |
|        |             |                       | pacote.               |
+--------+-------------+-----------------------+-----------------------+
| RNF-07 | Obrigatório | Versionamento e       | Toda release tem tag, |
|        |             | rastreabilidade.      | changelog, matriz     |
|        |             |                       | atualizada e          |
|        |             |                       | referência às versões |
|        |             |                       | upstream.             |
+--------+-------------+-----------------------+-----------------------+
| RNF-08 | Obrigatório | Comunicação de        | README, documentação  |
|        |             | caráter não oficial.  | e metadata não alegam |
|        |             |                       | endosso ou            |
|        |             |                       | homologação.          |
+--------+-------------+-----------------------+-----------------------+
| RNF-09 | Desejável   | Cobertura visual      | Fixtures do MVP têm   |
|        |             | automatizada.         | capturas de           |
|        |             |                       | referência em ao      |
|        |             |                       | menos dois tamanhos   |
|        |             |                       | de tela e testes de   |
|        |             |                       | estados interativos   |
|        |             |                       | relevantes.           |
+--------+-------------+-----------------------+-----------------------+

9. Contrato de distribuição
---------------------------

A proposta de publicação é um pacote npm contendo ``dist/`` com CSS compilado e ``src/scss/`` com SCSS importável. As superfícies exatas deverão ser congeladas antes da versão 1.0:

- Arquivos CSS normal e minificado em caminhos documentados; consumidor sem Sass deve conseguir usar o CSS em uma aplicação de teste.
- Uma entrada SCSS documentada; consumidor com Sass deve conseguir compilar no próprio projeto.
- Campos ``files``, ``exports`` e, se necessários, ``style``/``sass`` no ``package.json``, testados nos ambientes de consumo que o projeto decidir suportar.
- Declaração da dependência Bootstrap coerente com a estratégia escolhida para o CSS pronto. Se houver um build autônomo e outro de camada adicional, nomes e instruções devem distingui-los sem ambiguidade.
- Dependências de compilação e fontes GOV.BR DS não podem depender implicitamente de arquivos que não constem do pacote ou das dependências declaradas.
- GitHub Releases e, opcionalmente, documentação online complementam o npm; não substituem o registro primário.

A criação de uma nova Release no GitHub aciona a pipeline de publicação (CI/CD): (1) publica o pacote no npm, preferencialmente via trusted publishing/OIDC (RNF-06); (2) publica o site de documentação/catálogo via GitHub Pages, a partir da pasta ``docs/`` deste mesmo repositório (já habilitado); (3) anexa os artefatos compilados de ``dist/`` (CSS, minificado, source maps) como assets da própria Release.

Um trecho de instalação só poderá ser publicado como instrução oficial após o primeiro tarball ser validado num projeto consumidor limpo.

10. Estratégia de implementação
-------------------------------

1. Inspecionar as versões upstream selecionadas: árvore SCSS, tokens, dependências, JavaScript e licenças.
2. Produzir uma prova de conceito para tokens e ``.btn``, confrontando estados e estrutura com as referências.
3. Decidir entre reaproveitar mixins upstream ou implementar adaptadores próprios por componente, registrando o custo de manutenção.
4. Adicionar formulários, alertas e cards, sempre acompanhados de fixtures e matriz de suporte.
5. Fechar contrato CSS/SCSS do pacote com testes de instalação local.
6. Publicar versão pré-1.0 com limites claros; só ampliar suporte após regressão visual, de acessibilidade e de comportamento.

Preferir código novo em ``@use``/``@forward`` quando possível. Se uma dependência exigir ``@import``, isolar o uso, registrar avisos de depreciação e planejar migração; não presumir que é possível converter fontes de terceiros sem impacto.

   Nota: o passo 1 (inspeção das versões upstream) foi concluído; os achados e decisões resultantes estão registrados em §12.1.

11. Critérios de aceite do MVP
------------------------------

- ☐ Revisões exatas de Bootstrap e GOV.BR DS selecionadas e registradas.
- ☐ Tokens e fontes incorporados têm origem e licença verificadas.
- ☐ ``npm run build`` e ``npm test`` ou equivalentes estão documentados e passam no CI.
- ☐ Botão, input, checkbox/radio, alerta e card têm demonstrações para os subconjuntos efetivamente suportados.
- ☐ Fixtures não exigem classes ``.br-*`` ocultas nos componentes declarados como Bootstrap compatíveis.
- ☐ Os estados de foco, desabilitado e erro aplicáveis foram avaliados com teclado e testes automatizados pertinentes.
- ☐ Um projeto consumidor limpo instala o tarball e usa CSS pré-compilado.
- ☐ Um projeto consumidor limpo instala o tarball e compila a entrada SCSS documentada.
- ☐ A matriz de compatibilidade informa diferenças, restrições e itens ainda não suportados.
- ☐ O pacote inclui licença, avisos de terceiros quando necessários, README, changelog e versão correta.
- ☐ ``npm pack --dry-run`` e validação do conteúdo publicado passam antes da release.

12. Decisões pendentes
----------------------

12.1 Decisões já registradas
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Resultado da inspeção direta do código-fonte upstream (Bootstrap 5.3.8 e ``@govbr-ds/core`` 3.7.0) e
de decisões tomadas com o mantenedor após essa inspeção.

+--------------+---------------------------+--------------------------------------------------------+
| ID           | Decisão                   | Registro                                               |
+==============+===========================+========================================================+
| DP-01        | Referência GOV.BR DS      | Fixado ``@govbr-ds/core`` **v3.7.0**, incluído como    |
|              |                           | git submodule apontando para o repositório oficial     |
|              |                           | (GitLab) na tag correspondente. Confirmado por         |
|              |                           | inspeção: é uma biblioteca completa de ~34 componentes |
|              |                           | (não apenas tokens), com classes CSS + JS "vanilla"    |
|              |                           | (não Web Components, apesar do próprio README do       |
|              |                           | projeto usar esse termo — o wrapper real de Custom     |
|              |                           | Elements é o projeto separado ``govbr-ds-wbc``),       |
|              |                           | estrutura semelhante ao padrão de plugin JS do         |
|              |                           | Bootstrap.                                             |
+--------------+---------------------------+--------------------------------------------------------+
| DP-02        | Formato de CSS pronto     | **Build autônoma**: o Bootstrap é recompilado por      |
|              |                           | completo a partir do submódulo oficial, com variáveis  |
|              |                           | Sass (``$primary``, ``$font-family-base``,             |
|              |                           | ``$border-radius`` etc., todas ``!default`` em         |
|              |                           | ``_variables.scss``) sobrescritas pelos tokens do      |
|              |                           | GOV.BR DS antes do                                     |
|              |                           | ``@import "bootstrap/scss/bootstrap"`` — caminho de    |
|              |                           | customização já documentado oficialmente pelo          |
|              |                           | Bootstrap. O CSS final publicado inclui o Bootstrap    |
|              |                           | inteiro + tema; não é uma camada leve de custom        |
|              |                           | properties ``--bs-*`` sobre um Bootstrap externo ao    |
|              |                           | pacote.                                                |
+--------------+---------------------------+--------------------------------------------------------+
| DP-03        | Política de dependências  | Bootstrap (``twbs/bootstrap``, tag **v5.3.8**) e       |
|              |                           | ``@govbr-ds/core`` (repositório oficial, tag           |
|              |                           | **v3.7.0**) são incluídos como **git submodules**      |
|              |                           | deste repositório, sempre apontando para os            |
|              |                           | repositórios oficiais upstream (nunca forks) e fixados |
|              |                           | por tag. Não são dependências resolvidas em tempo de   |
|              |                           | instalação pelo consumidor final — o CSS distribuído   |
|              |                           | já é autônomo (ver DP-02).                             |
+--------------+---------------------------+--------------------------------------------------------+
| DP-04        | Contrato de Sass          | **Empacotar o SCSS junto com o Bootstrap** (issue      |
|              |                           | #20). O pacote inclui ``src/scss/``,                   |
|              |                           | ``vendor/bootstrap/scss/`` e                           |
|              |                           | ``vendor/bootstrap/LICENSE``, então                    |
|              |                           | ``src/scss/index.scss`` resolve o Bootstrap por        |
|              |                           | caminho relativo dentro do próprio pacote. Todas as    |
|              |                           | variáveis de ``_tokens.scss`` e                        |
|              |                           | ``_bootstrap-settings.scss`` são ``!default``: o       |
|              |                           | consumidor sobrescreve tokens (ex.: ``$primary``)      |
|              |                           | definindo-os **antes** de importar:                    |
|              |                           | ``@abrasileirado/dsgovbr-bootstrapped/src/scss/index`` |
|              |                           | Mantido ``@import`` (o Bootstrap 5.3.8 ainda não usa   |
|              |                           | ``@use``/``@forward`` internamente); sem campo         |
|              |                           | ``exports``, para não restringir caminhos profundos.   |
|              |                           | Verificado por ``npm test`` (consumidor limpo:         |
|              |                           | ``npm pack`` → instala o tarball → compila com e sem   |
|              |                           | override), que também roda no ``release.yml`` antes do |
|              |                           | publish.                                               |
+--------------+---------------------------+--------------------------------------------------------+
| DP-05        | Fonte e ícones            | A fonte "Rawline" e os ícones Font Awesome 5 continuam |
|              |                           | **externos, via CDN**, documentados como pré-requisito |
|              |                           | de instalação — mesma abordagem que o próprio GOV.BR   |
|              |                           | DS já adota hoje (confirmado por inspeção: nenhum dos  |
|              |                           | dois é embutido no pacote ``@govbr-ds/core``). Não     |
|              |                           | serão empacotados nem redistribuídos no pacote.        |
|              |                           | **Exceção (issue #45):** o site de documentação        |
|              |                           | hospeda uma cópia da Rawline (SIL OFL 1.1, conforme as |
|              |                           | próprias fontes), porque o CDN do SERPRO não envia     |
|              |                           | CORS e por isso não aceita ``integrity`` (SRI).        |
+--------------+---------------------------+--------------------------------------------------------+
| DP-06        | Variantes Bootstrap       | Classificação por **papel**, não por nome, porque      |
|              |                           | ``primary``/``secondary`` são níveis de ênfase no      |
|              |                           | GOV.BR DS (preenchido / só borda; sem classe = só      |
|              |                           | texto) e cores de tema no Bootstrap. **Botões:**       |
|              |                           | equivalentes — ``btn-primary`` (ênfase alta) e         |
|              |                           | ``btn-success/danger/warning/info``; aproximados —     |
|              |                           | ``btn-outline-primary`` (≈ ``secondary`` do GOV.BR DS: |
|              |                           | lá fundo claro, aqui transparente) e ``btn-link`` (≈   |
|              |                           | ênfase baixa: o Bootstrap sublinha); extensões sem     |
|              |                           | equivalente — ``btn-secondary``, ``btn-light``,        |
|              |                           | ``btn-dark`` e ``btn-outline-*`` das demais cores.     |
|              |                           | **Alertas:** equivalentes                              |
|              |                           | ``alert-success/danger/warning/info`` (as quatro       |
|              |                           | severidades do Message); extensões                     |
|              |                           | ``alert-primary/secondary/light/dark``. **Decisão do   |
|              |                           | mantenedor (issue #26):** ``btn-secondary`` permanece  |
|              |                           | o cinza do Bootstrap, sem ser redefinido como o botão  |
|              |                           | de borda do GOV.BR DS — evita mudar o significado de   |
|              |                           | uma classe que quem usa Bootstrap já conhece (travado  |
|              |                           | por teste em ``tests/css.test.js``). "Extensão"        |
|              |                           | funciona e recebe os tokens (fonte, raio, altura), mas |
|              |                           | não se afirma equivalência. Tabelas por componente em  |
|              |                           | ``docs/componentes/botao.html`` e ``alertas.html``.    |
+--------------+---------------------------+--------------------------------------------------------+
| DP-07        | Nome do pacote            | Escopo ``@abrasileirado/dsgovbr-bootstrapped`` **em    |
|              |                           | uso**: publicado no npm (0.1.1 em diante; a 0.1.0 foi  |
|              |                           | uma publicação manual com metadados incorretos e       |
|              |                           | permanece no registro). Publicação automatizada por    |
|              |                           | tag via trusted publishing/OIDC (``release.yml``,      |
|              |                           | issues #10 e #17); o Trusted Publisher precisa estar   |
|              |                           | com "Allow npm publish" (configurações novas do npm    |
|              |                           | vêm "stage-only"). O projeto continua indicando        |
|              |                           | explicitamente que não é oficial.                      |
+--------------+---------------------------+--------------------------------------------------------+
| DP-08        | Política de licenciamento | Bootstrap e ``@govbr-ds/core`` são **MIT** (o segundo  |
|              |                           | com copyright SERPRO, 2022), compatíveis entre si e    |
|              |                           | com a MIT deste projeto. ``THIRD_PARTY_NOTICES.md``    |
|              |                           | acompanha o pacote com o aviso do Bootstrap (cujo SCSS |
|              |                           | é redistribuído, issue #20) e a nota do GOV.BR DS (só  |
|              |                           | valores de tokens copiados). **Ativos externos (issue  |
|              |                           | #24):** Rawline e Font Awesome 5 não são               |
|              |                           | redistribuídos (DP-05), logo não geram obrigação de    |
|              |                           | licença para o pacote; licenças registradas em         |
|              |                           | ``THIRD_PARTY_NOTICES.md`` — Font Awesome Free: ícones |
|              |                           | CC BY 4.0, fontes OFL 1.1, código MIT; Rawline: **SIL  |
|              |                           | OFL 1.1** pela tabela ``name`` das fontes (não há      |
|              |                           | texto de licença publicado pelo SERPRO/gov.br);        |
|              |                           | hospedada só no site, com ``OFL.txt`` ao lado (issue   |
|              |                           | #45). **Procedimento:** qualquer arquivo de terceiros  |
|              |                           | que passe a ser redistribuído exige antes uma entrada  |
|              |                           | em ``THIRD_PARTY_NOTICES.md`` (origem, versão,         |
|              |                           | licença) e inclusão em ``files``.                      |
+--------------+---------------------------+--------------------------------------------------------+
| DP-09        | Versões e suporte         | **Navegadores:** segue a política do Bootstrap 5 (sem  |
|              |                           | Internet Explorer), mesmo o GOV.BR DS declarando hoje  |
|              |                           | suporte a IE 9–11 em seu ``.browserslistrc``.          |
|              |                           | **Atualização dos submodules (issue #23):** fixados    |
|              |                           | sempre em tag estável ``vX.Y.Z``, nunca em branch ou   |
|              |                           | commit solto; avançar a tag é decisão manual, por      |
|              |                           | issue. Detecção:                                       |
|              |                           | ``.github/workflows/upstream-check.yml`` roda toda     |
|              |                           | segunda (e sob demanda), roda                          |
|              |                           | ``scripts/check-upstream.js`` e abre uma issue         |
|              |                           | "Atualizar vendor/ para vX.Y.Z" quando há tag estável  |
|              |                           | mais nova (sem duplicar, mesmo para versões já         |
|              |                           | fechadas); o job falha se um submodule estiver fixado  |
|              |                           | fora de uma tag estável. **Critérios:** patch/minor do |
|              |                           | Bootstrap 5.x e patch/minor do GOV.BR DS — avaliar em  |
|              |                           | até 2 semanas, ou de imediato se houver correção de    |
|              |                           | segurança; **major** (Bootstrap 6, GOV.BR DS 4) —      |
|              |                           | decisão nova, com revisão de tokens, SCSS e markup,    |
|              |                           | não um bump. Como ``_tokens.scss`` copia valores do    |
|              |                           | GOV.BR DS, todo bump dele exige reconferir cada valor  |
|              |                           | contra a origem citada nos comentários (RF-02). **Se   |
|              |                           | quebrar:** build ou ``npm test`` falhando, ou          |
|              |                           | regressão visual nas páginas de ``docs/componentes/``, |
|              |                           | mantém a tag atual e registra o motivo na issue.       |
|              |                           | Checklist completo em ``docs/setup.rst``.              |
+--------------+---------------------------+--------------------------------------------------------+
| DP-10 (novo) | Tamanho de fonte base     | O ``font-size`` base segue o valor do GOV.BR DS        |
|              |                           | (**14px**), implementado via                           |
|              |                           | ``$font-size-base: 0.875rem`` (issue #3). **Correção   |
|              |                           | após implementação:** o Bootstrap distingue            |
|              |                           | ``$font-size-root`` (afeta o valor de todo ``rem``,    |
|              |                           | logo espaçamento/padding/margem) de                    |
|              |                           | ``$font-size-base`` (afeta só a tipografia — corpo de  |
|              |                           | texto, headings, lead, tamanho de fonte de             |
|              |                           | inputs/botões). Usamos apenas ``$font-size-base``,     |
|              |                           | replicando a própria arquitetura do GOV.BR DS, cujo    |
|              |                           | ``$spacer`` (8px) é independente do tamanho de fonte.  |
|              |                           | Ou seja, o impacto real é **restrito à tipografia**,   |
|              |                           | não a todo o layout como uma análise anterior          |
|              |                           | (pré-implementação) presumia.                          |
+--------------+---------------------------+--------------------------------------------------------+

12.2 Decisões ainda pendentes
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Nenhuma no momento. Novas decisões entram aqui como ``DP-xx`` e migram para 12.1 quando fechadas.

13. Riscos iniciais
-------------------

+----------------------+----------------------+----------------------+
| Risco                | Impacto              | Mitigação            |
+======================+======================+======================+
| Dependência de       | Adaptação não viável | Prova de conceito    |
| seletores e markup   | por mera composição  | pequena; usar        |
| ``.br-*`` nos SCSS   | Sass                 | adaptador próprio ou |
| upstream             |                      | declarar componente  |
|                      |                      | não suportado.       |
+----------------------+----------------------+----------------------+
| Colisão de reset,    | Regressões visuais   | Importação seletiva; |
| utilitários e        | fora dos componentes | isolamento; testes   |
| estilos globais      | alvo                 | em aplicação         |
|                      |                      | Bootstrap existente. |
+----------------------+----------------------+----------------------+
| Divergência de       | Interface            | Preservar o motor    |
| comportamentos       | visualmente correta, | Bootstrap no MVP e   |
| JavaScript           | mas interação        | testar suas          |
|                      | incorreta            | interações           |
|                      |                      | separadamente.       |
+----------------------+----------------------+----------------------+
| Atualizações         | Build ou aparência   | Fixar versões, rodar |
| upstream quebrarem   | instáveis            | CI de                |
| tokens/imports       |                      | compatibilidade e    |
|                      |                      | versionar            |
|                      |                      | alterações.          |
+----------------------+----------------------+----------------------+
| Publicar CSS com     | Estilos incompletos  | Nomear builds        |
| expectativa errada   | ou duplicados no     | claramente,          |
| de dependência       | consumidor           | documentar ordem e   |
| Bootstrap            |                      | testar as duas       |
|                      |                      | formas de consumo.   |
+----------------------+----------------------+----------------------+
| Distribuição         | Risco jurídico e     | Inventário de        |
| inadvertida de       | aumento do pacote    | terceiros, ``files`` |
| fontes/ícones sem    |                      | restritivo e revisão |
| revisão              |                      | do tarball.          |
+----------------------+----------------------+----------------------+

14. Referências
---------------

- `Bootstrap 5.3 — Sass <https://getbootstrap.com/docs/5.3/customize/sass/>`__.
- `Bootstrap 5.3 — licença <https://getbootstrap.com/docs/5.3/about/license/>`__.
- `Padrão Digital de Governo <https://www.gov.br/ds>`__.
- `GOVBR-DS Wiki — licenças <https://govbr-ds.gitlab.io/tools/govbr-ds-wiki/git-gitlab/guias/licencas/>`__.
- `Sass — depreciação de ``@import`` <https://sass-lang.com/documentation/at-rules/import/>`__.
- `npm — pacotes públicos com escopo <https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>`__.
- `npm — trusted publishing <https://docs.npmjs.com/trusted-publishers/>`__.
