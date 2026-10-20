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

## GOV.BR DS (`@govbr-ds/core`)

- Não redistribuído como arquivo. Valores de tokens (cores, tipografia,
  espaçamento, raios, sombras) foram copiados de `vendor/govbr-ds-core`
  (v3.7.0) para `src/scss/_tokens.scss`, com a origem de cada valor indicada
  em comentário.
- Origem: <https://gitlab.com/govbr-ds/bibliotecas/javascript/govbr-ds-core>
- Licença: MIT — Copyright (c) 2022 SERPRO.

## Ativos externos (não redistribuídos)

Carregados pelo consumidor via CDN, como no próprio GOV.BR DS (DP-05). Nenhum
arquivo de fonte ou de ícone está neste pacote nem neste repositório; o CSS
apenas referencia a fonte pelo nome.

### Fonte Rawline

- Uso: `font-family: "Rawline", "Raleway", sans-serif` (só o nome; sem arquivo).
- Origem documentada pelo GOV.BR DS (CDN do SERPRO):
  `https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css`
- Licença: **não confirmada em fonte oficial.** A página de
  [tipografia do Padrão Digital de Governo](https://www.gov.br/ds/fundamentos-visuais/tipografia)
  indica a fonte e remete ao CDNFonts, sem texto de licença. Um comentário de
  terceiros em [issue do suap-companion/chamados](https://github.com/suap-companion/chamados/issues/124)
  afirma SIL OFL 1.1 com nome reservado "RAWLINE" — **não verificado**. A
  Rawline deriva da Raleway (SIL OFL).
- Efeito neste projeto: como não redistribuímos nem modificamos a fonte, não
  assumimos obrigação de licença de fonte. Quem hospedar a Rawline por conta
  própria deve confirmar a licença com o SERPRO/gov.br antes.

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
