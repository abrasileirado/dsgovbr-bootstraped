dsgovbr-bootstrapped — Documentação
===================================

.. br-alerta:: warning
   :titulo: Projeto não oficial

   Projeto comunitário e independente. Não representa nem implica homologação ou endosso pelo GOV.BR DS, pelo Governo Federal ou pelo projeto Bootstrap.

Propósito
---------

O **dsgovbr-bootstrapped** fornece uma camada de integração visual entre o Bootstrap 5 e o Padrão Digital de Governo (GOV.BR DS). Aplicações continuam usando a API de classes do Bootstrap, como ``.btn``, ``.form-control`` e ``.alert``, enquanto adotam, nos subconjuntos explicitamente suportados, tokens e características visuais derivados do GOV.BR DS.

O projeto **não** pressupõe que juntar os arquivos SCSS dos dois projetos produza componentes equivalentes. Estilos, estrutura HTML e comportamento JavaScript são contratos diferentes; a compatibilidade será analisada e documentada por componente.

Estado do projeto
-----------------

Em desenvolvimento ativo (MVP). O repositório contém fontes SCSS, CSS compilado, documentação demonstrativa, testes automatizados e automação de publicação. A compatibilidade é parcial e limitada aos componentes e variantes identificados como suportados na matriz; não implica equivalência geral nem homologação oficial.

Documentos
----------

- :doc:`Getting Started <getting-started>`: como instalar e usar o pacote (ou, por enquanto, como compilá-lo a partir do repositório).
- :doc:`Setup de desenvolvimento <setup>`: como clonar, compilar e visualizar localmente para contribuir com código.
- :doc:`Requisitos de software <requisitos>`: escopo, decisões registradas, requisitos verificáveis e matriz atual de compatibilidade.
- :doc:`Desenvolvimento <desenvolvimento>`: estrutura, comandos, testes e fluxo de validação do projeto.
- :doc:`Como contribuir <contribua>`: diretrizes iniciais para discussões, propostas, testes e pull requests.
- :doc:`Análise de modal e navegação <analise-modal-navegacao>`: diferenças de estrutura, comportamento e acessibilidade em relação ao Bootstrap; os componentes seguem não suportados até validação própria.
- `Componentes <componentes/index.html>`__: catálogo demonstrativo com todos os componentes do Bootstrap 5.3 (variantes, tamanhos, estados e diferenças conhecidas em relação ao GOV.BR DS), com a chave *Aplicar GOV.BR DS* para comparar com o Bootstrap puro; cada página também serve como fixture de teste.
- `Exemplos <exemplos/index.html>`__: telas completas montadas só com classes Bootstrap, para ver os componentes compostos num caso de uso real.
- `Comparação lado a lado <exemplos/comparacao-tema.html>`__: o mesmo HTML renderizado com o `Bootstrap padrão <exemplos/comparacao-padrao.html>`__ e com o dsgovbr-bootstrapped.

Público-alvo
------------

- Equipes com aplicações existentes baseadas em Bootstrap 5, inclusive projetos que geram HTML com templates no servidor.
- Desenvolvedores que queiram usar CSS pré-compilado ou compilar SCSS no próprio projeto.
- Mantenedores que necessitem de um inventário explícito das diferenças entre a API Bootstrap e a referência GOV.BR DS.

Princípios
----------

1. **API pública Bootstrap:** priorizar seletores e markup Bootstrap nos componentes suportados; não exigir classes ``.br-*`` de forma oculta.
2. **Compatibilidade declarada:** publicar o que foi testado, o que é apenas aproximado e o que não é suportado.
3. **Comportamento explícito:** não substituir silenciosamente plugins JavaScript Bootstrap nem prometer compatibilidade de JavaScript baseada apenas em SCSS.
4. **Dependências rastreáveis:** fixar e documentar versões utilizadas na geração dos artefatos.
5. **Acessibilidade verificável:** testar estados, teclado e contraste além de comparar capturas visuais.
6. **Distribuição previsível:** planejar pacote npm público com SCSS fonte e CSS compilado, com documentação de como cada formato é consumido.

Direção de distribuição
-----------------------

A proposta é publicar no npm, preferencialmente sob o escopo ``@abrasileirado``, após confirmar a disponibilidade do nome e a titularidade do escopo. O repositório GitHub hospedará código, documentação e releases. Um CDN que distribua pacotes npm poderá servir o CSS pronto, desde que as URLs de produção apontem para uma versão fixa.

O formato exato dos entry points SCSS/CSS, a política de incluir ou não o CSS completo do Bootstrap no arquivo distribuído e a forma de consumir os artefatos do GOV.BR DS são **decisões pendentes**, registradas em :ref:`Requisitos de software <requisitos:12. Decisões pendentes>`. Nenhum exemplo deste documento deve ser interpretado como garantia de API publicada.

Referências de trabalho
-----------------------

- `Repositório do projeto <https://github.com/abrasileirado/dsgovbr-bootstrapped>`__.
- `Padrão Digital de Governo <https://www.gov.br/ds>`__.
- `Bootstrap 5 — personalização com Sass <https://getbootstrap.com/docs/5.3/customize/sass/>`__.
- `npm — publicação de pacotes públicos com escopo <https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>`__.

A licença aplicável a cada dependência e artefato incorporado deverá ser conferida nas versões efetivamente utilizadas. O projeto deverá indicar expressamente sua condição de integração não oficial.

.. toctree::
   :hidden:
   :caption: Documentação

   getting-started
   setup
   requisitos
   desenvolvimento
   contribua
   analise-modal-navegacao

.. toctree::
   :hidden:
   :caption: Demonstrações

   Componentes <https://abrasileirado.github.io/dsgovbr-bootstrapped/componentes/index.html>
   Exemplos <https://abrasileirado.github.io/dsgovbr-bootstrapped/exemplos/index.html>
