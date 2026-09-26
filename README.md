# dsgovbr-bootstraped

> Projeto comunitário, independente e não oficial. Não representa nem
> implica homologação ou endosso pelo GOV.BR DS, pelo Governo Federal ou
> pelo projeto Bootstrap.

[![Semgrep](https://github.com/abrasileirado/dsgovbr-bootstraped/actions/workflows/semgrep.yml/badge.svg)](https://github.com/abrasileirado/dsgovbr-bootstraped/actions/workflows/semgrep.yml)
[![Deploy GitHub Pages](https://github.com/abrasileirado/dsgovbr-bootstraped/actions/workflows/pages.yml/badge.svg)](https://github.com/abrasileirado/dsgovbr-bootstraped/actions/workflows/pages.yml)

Camada de compatibilidade visual entre o **Bootstrap 5** e o **Design
System do Governo Digital Brasileiro (GOV.BR DS)**: continue escrevendo
`.btn`, `.form-control`, `.alert`, `.card` — sem exigir nenhuma classe
`.br-*` — e receba a aparência visual do GOV.BR DS.

## Antes / depois

O mesmo HTML, com dois CSS diferentes:

| Bootstrap padrão | Com dsgovbr-bootstraped |
|---|---|
| [ver ao vivo →](https://abrasileirado.github.io/dsgovbr-bootstraped/exemplos/comparacao-padrao.html) | [ver ao vivo →](https://abrasileirado.github.io/dsgovbr-bootstraped/exemplos/comparacao-tema.html) |

Veja também a [tela de login completa](https://abrasileirado.github.io/dsgovbr-bootstraped/exemplos/login.html)
e o [catálogo de componentes](https://abrasileirado.github.io/dsgovbr-bootstraped/componentes/index.html)
(variantes, tamanhos, estados e diferenças conhecidas por componente).

## Estado do projeto

Em desenvolvimento ativo (MVP). O pacote **ainda não foi publicado no
npm** — ver [requisitos e matriz de compatibilidade](docs/requisitos.md)
para o que já é suportado e o que está fora do escopo atual.

## Início rápido

```bash
git clone --recurse-submodules https://github.com/abrasileirado/dsgovbr-bootstraped.git
cd dsgovbr-bootstraped
npm install
npm run build
```

```html
<link rel="stylesheet" href="dist/dsgovbr-bootstraped.min.css">
```

Nenhum outro CSS do Bootstrap precisa ser carregado — a build é autônoma
(já inclui o Bootstrap inteiro recompilado com os tokens do GOV.BR DS).
Guia completo: [Getting Started](docs/getting-started.md) ·
[Setup de desenvolvimento](docs/setup.md).

## Documentação

- [docs/index.md](docs/index.md) — índice completo da documentação.
- [docs/requisitos.md](docs/requisitos.md) — escopo, decisões e matriz de compatibilidade.
- [Catálogo de componentes](https://abrasileirado.github.io/dsgovbr-bootstraped/componentes/index.html) — por componente suportado.
- [Como contribuir](docs/contribua.md).

## Licença

MIT — ver [LICENSE](LICENSE). Bibliotecas de terceiros usadas (Bootstrap,
`@govbr-ds/core`) mantêm suas próprias licenças (também MIT) e permanecem
como git submodules em `vendor/`, nunca redistribuídas neste repositório.
