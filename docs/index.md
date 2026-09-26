# dsgovbr-bootstraped — Documentação

> Projeto comunitário, independente e não oficial. Não representa nem implica homologação ou endosso pelo GOV.BR DS, pelo Governo Federal ou pelo projeto Bootstrap.

## Propósito

O **dsgovbr-bootstraped** pretende fornecer uma camada de integração entre o Bootstrap 5 e a linguagem visual do Padrão Digital de Governo (GOV.BR DS). O objetivo é permitir que aplicações continuem usando a API de classes do Bootstrap, como `.btn`, `.form-control` e `.alert`, enquanto adotam, nos componentes explicitamente suportados, tokens e características visuais derivados do GOV.BR DS.

O projeto **não** pressupõe que juntar os arquivos SCSS dos dois projetos produza componentes equivalentes. Estilos, estrutura HTML e comportamento JavaScript são contratos diferentes; a compatibilidade será analisada e documentada por componente.

## Estado do projeto

Em especificação. A existência deste documento não indica que o pacote npm, os arquivos CSS/SCSS, a documentação de componentes ou a automação de publicação já estejam disponíveis.

## Documentos

- [Requisitos de software](requisitos.md): escopo, decisões em aberto, requisitos verificáveis, matriz inicial de componentes e critérios para o MVP.
- [Desenvolvimento](desenvolvimento.md): proposta inicial de organização, comandos planejados e fluxo de validação; não é ainda um manual de instalação de uma implementação pronta.
- [Como contribuir](contribua.md): diretrizes iniciais para discussões, propostas, testes e pull requests.

## Público-alvo

- Equipes com aplicações existentes baseadas em Bootstrap 5, inclusive projetos que geram HTML com templates no servidor.
- Desenvolvedores que queiram usar CSS pré-compilado ou compilar SCSS no próprio projeto.
- Mantenedores que necessitem de um inventário explícito das diferenças entre a API Bootstrap e a referência GOV.BR DS.

## Princípios

1. **API pública Bootstrap:** priorizar seletores e markup Bootstrap nos componentes suportados; não exigir classes `.br-*` de forma oculta.
2. **Compatibilidade declarada:** publicar o que foi testado, o que é apenas aproximado e o que não é suportado.
3. **Comportamento explícito:** não substituir silenciosamente plugins JavaScript Bootstrap nem prometer compatibilidade de JavaScript baseada apenas em SCSS.
4. **Dependências rastreáveis:** fixar e documentar versões utilizadas na geração dos artefatos.
5. **Acessibilidade verificável:** testar estados, teclado e contraste além de comparar capturas visuais.
6. **Distribuição previsível:** planejar pacote npm público com SCSS fonte e CSS compilado, com documentação de como cada formato é consumido.

## Direção de distribuição

A proposta é publicar no npm, preferencialmente sob o escopo `@abrasileirado`, após confirmar a disponibilidade do nome e a titularidade do escopo. O repositório GitHub hospedará código, documentação e releases. Um CDN que distribua pacotes npm poderá servir o CSS pronto, desde que as URLs de produção apontem para uma versão fixa.

O formato exato dos entry points SCSS/CSS, a política de incluir ou não o CSS completo do Bootstrap no arquivo distribuído e a forma de consumir os artefatos do GOV.BR DS são **decisões pendentes**, registradas em [Requisitos de software](requisitos.md#decisões-pendentes). Nenhum exemplo deste documento deve ser interpretado como garantia de API publicada.

## Referências de trabalho

- [Repositório do projeto](https://github.com/abrasileirado/dsgovbr-bootstraped).
- [Padrão Digital de Governo](https://www.gov.br/ds).
- [Bootstrap 5 — personalização com Sass](https://getbootstrap.com/docs/5.3/customize/sass/).
- [npm — publicação de pacotes públicos com escopo](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).

A licença aplicável a cada dependência e artefato incorporado deverá ser conferida nas versões efetivamente utilizadas. O projeto deverá indicar expressamente sua condição de integração não oficial.
