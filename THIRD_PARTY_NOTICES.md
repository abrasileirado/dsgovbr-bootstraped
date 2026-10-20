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

Este projeto é comunitário, independente e não oficial; não representa nem
implica endosso pelo GOV.BR DS, pelo Governo Federal ou pelo projeto
Bootstrap.
