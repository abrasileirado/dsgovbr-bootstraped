# Avisos de terceiros

Este pacote redistribui código de terceiros. Os avisos de licença originais
são preservados abaixo.

## Bootstrap

- Redistribuído: `vendor/bootstrap/scss/` (fonte Sass) e `vendor/bootstrap/LICENSE`.
- Versão: v5.3.8 (submodule fixado por tag).
- Origem: <https://github.com/twbs/bootstrap>
- Licença: MIT — Copyright (c) 2011-2025 The Bootstrap Authors.
  Texto completo em `vendor/bootstrap/LICENSE`.

O CSS em `dist/` é a compilação do Bootstrap com os tokens do GOV.BR DS
aplicados, portanto também é um trabalho derivado do Bootstrap, sob a mesma
licença.

As páginas do catálogo (`src/site/componentes/`, publicadas em
`docs/componentes/`) adaptam a estrutura de marcação dos exemplos de
<https://getbootstrap.com/docs/5.3/components/>, código sob a mesma licença
MIT. Os textos das páginas são próprios deste projeto.

## GOV.BR DS (`@govbr-ds/core`)

- Não redistribuído como arquivo. Valores de tokens (cores, tipografia,
  espaçamento, raios, sombras) foram copiados de `vendor/govbr-ds-core`
  (v3.7.0) para `src/scss/_tokens.scss`, com a origem de cada valor indicada
  em comentário.
- Origem: <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core>
- Licença: MIT — Copyright (c) 2022 SERPRO.

## Ativos externos

O pacote npm não inclui arquivo de fonte nem de ícone: o CSS só referencia a
fonte pelo nome, e o consumidor carrega os dois via CDN, como no próprio
GOV.BR DS (DP-05). A exceção é o **site de documentação**, que hospeda uma
cópia da Rawline (abaixo).

### Fonte Rawline

- Uso: `font-family: "Rawline", "Raleway", sans-serif` (só o nome no pacote).
- Origem documentada pelo GOV.BR DS (CDN do SERPRO):
  `https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css`
- Licença: **SIL Open Font License 1.1**, conforme a tabela `name` das próprias
  fontes (campo de licença e copyright "The Raleway Project Authors"). A
  Rawline deriva da Raleway. A página de
  [tipografia do Padrão Digital de Governo](https://www.gov.br/ds/fundamentos-visuais/tipografia)
  indica a fonte sem texto de licença; o CDN não publica arquivo de licença.
- **Redistribuída só no site** (issue #45): `src/site/fonts/rawline/` contém os
  18 `woff2` do CDN, sem modificação, um `rawline.css` próprio que só os
  referencia e o `OFL.txt`; o build copia tudo para `docs/assets/fonts/rawline/`.
  Motivo: o CDN não envia `Access-Control-Allow-Origin`, então o navegador
  recusa o `<link>` com `integrity` (SRI) e o alerta `missing-integrity` do
  Semgrep não tinha correção. Não vai para o pacote npm (fora de `files`).

### Font Awesome 5 (Free)

- Origem documentada pelo GOV.BR DS (versão 5.11.2, cdnjs):
  `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css`
- Licença (Font Awesome Free, conforme o
  [LICENSE.txt oficial](https://github.com/FortAwesome/Font-Awesome/blob/master/LICENSE.txt)):
  ícones sob CC BY 4.0, fontes sob SIL OFL 1.1, código sob MIT. A atribuição
  vem em comentários nos próprios arquivos; não removê-los. A versão Pro é
  comercial e não é coberta. Conferir o texto da versão exata que for usada.
- Efeito neste projeto: nenhum componente adaptado do MVP usa ícones.

Este projeto é comunitário, independente e não oficial; não representa nem
implica endosso pelo GOV.BR DS, pelo Governo Federal ou pelo projeto
Bootstrap.
