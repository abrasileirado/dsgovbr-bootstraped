# dsgovbr-bootstrapped

> Projeto comunitário, independente e não oficial. Não representa nem
> implica homologação ou endosso pelo GOV.BR DS, pelo Governo Federal ou
> pelo projeto Bootstrap.

[![Semgrep](https://github.com/abrasileirado/dsgovbr-bootstrapped/actions/workflows/semgrep.yml/badge.svg)](https://github.com/abrasileirado/dsgovbr-bootstrapped/actions/workflows/semgrep.yml)
[![Deploy GitHub Pages](https://github.com/abrasileirado/dsgovbr-bootstrapped/actions/workflows/pages.yml/badge.svg)](https://github.com/abrasileirado/dsgovbr-bootstrapped/actions/workflows/pages.yml)

Camada de compatibilidade visual entre o **Bootstrap 5** e o **Design
System do Governo Digital Brasileiro (GOV.BR DS)**: continue escrevendo
`.btn`, `.form-control`, `.alert`, `.card` — sem exigir nenhuma classe
`.br-*` — e receba a aparência visual do GOV.BR DS.

## Antes / depois

O mesmo HTML, com dois CSS diferentes:

| Bootstrap padrão | Com dsgovbr-bootstrapped |
|---|---|
| [ver ao vivo →](https://abrasileirado.github.io/dsgovbr-bootstrapped/exemplos/comparacao-padrao.html) | [ver ao vivo →](https://abrasileirado.github.io/dsgovbr-bootstrapped/exemplos/comparacao-tema.html) |

Veja também a [tela de login completa](https://abrasileirado.github.io/dsgovbr-bootstrapped/exemplos/login.html)
e o [catálogo de componentes](https://abrasileirado.github.io/dsgovbr-bootstrapped/componentes/index.html):
uma página para cada componente de
[getbootstrap.com/docs/5.3/components](https://getbootstrap.com/docs/5.3/components/)
(variantes, tamanhos, estados e diferenças conhecidas), com a chave
**Aplicar GOV.BR DS** para comparar cada uma com o Bootstrap puro.

## Migração do nome antigo (1.0.0)

O projeto se chamava `dsgovbr-bootstraped` (grafia errada, com um "p"). A partir da 1.0.0 o nome correto é `dsgovbr-bootstrapped`. Para migrar:

- pacote npm: troque `@abrasileirado/dsgovbr-bootstraped` por `@abrasileirado/dsgovbr-bootstrapped` (o antigo está depreciado);
- arquivos: `dsgovbr-bootstraped*.css` e `dsgovbr-bootstraped-*.js` viram `dsgovbr-bootstrapped*.css` e `dsgovbr-bootstrapped-*.js`;
- eventos e chaves de `localStorage`: `dsgovbr-bootstraped:modo`, `:tema` e `:cookies` viram `dsgovbr-bootstrapped:...` (a preferência de modo salva é perdida uma vez);
- URLs: o repositório é redirecionado pelo GitHub; o endereço do Pages muda e não é redirecionado.

## Estado do projeto

Em desenvolvimento ativo (MVP). A compatibilidade é parcial: consulte a
[matriz de compatibilidade](https://abrasileirado.github.io/dsgovbr-bootstrapped/requisitos.html#matriz-de-compatibilidade-atual-v0-5-1)
para ver os subconjuntos suportados, limitações e itens fora do escopo. Consulte
a [página de releases](https://github.com/abrasileirado/dsgovbr-bootstrapped/releases)
para obter versões e arquivos publicados.

Para as decisões e recomendações sobre modal, navbar, dropdown e navegação GOV.BR,
consulte a [análise de compatibilidade](https://abrasileirado.github.io/dsgovbr-bootstrapped/analise-modal-navegacao.html).

## Início rápido

```bash
git clone --recurse-submodules https://github.com/abrasileirado/dsgovbr-bootstrapped.git
cd dsgovbr-bootstrapped
npm install
npm run build
```

```html
<link rel="stylesheet" href="dist/dsgovbr-bootstrapped.min.css">
```

Nenhum outro CSS do Bootstrap precisa ser carregado — a build é autônoma
(já inclui o Bootstrap inteiro recompilado com os tokens do GOV.BR DS).
Modo claro/escuro: o JS opcional `dist/dsgovbr-bootstrapped-modo.js` alterna o
`data-bs-theme` por um botão com `data-dsgovbr-modo` (ver
[Getting Started](https://abrasileirado.github.io/dsgovbr-bootstrapped/getting-started.html#modo-claro-escuro-opcional)).
Web components opcionais (`<dsgovbr-header>`, `<dsgovbr-menu>`, `<dsgovbr-footer>` e
`<dsgovbr-breadcrumb>`): `dist/dsgovbr-bootstrapped-componentes.js` (ver
[Getting Started](https://abrasileirado.github.io/dsgovbr-bootstrapped/getting-started.html#web-components-de-header-menu-footer-e-breadcrumb-opcional)).
Consentimento de cookies: `dist/dsgovbr-bootstrapped-cookies.js` traz o `<dsgovbr-cookiebar>` e a
API `window.dsgovbrCookies` (ver
[Getting Started](https://abrasileirado.github.io/dsgovbr-bootstrapped/getting-started.html#consentimento-de-cookies-opcional)).
Guia completo: [Getting Started](https://abrasileirado.github.io/dsgovbr-bootstrapped/getting-started.html) ·
[Setup de desenvolvimento](https://abrasileirado.github.io/dsgovbr-bootstrapped/setup.html).

## Documentação

- [Documentação](https://abrasileirado.github.io/dsgovbr-bootstrapped/) — índice completo (fonte em `docs/*.rst`, gerada com Sphinx).
- [Requisitos](https://abrasileirado.github.io/dsgovbr-bootstrapped/requisitos.html) — escopo, decisões e matriz de compatibilidade.
- [Catálogo de componentes](https://abrasileirado.github.io/dsgovbr-bootstrapped/componentes/index.html) — todos os componentes do Bootstrap 5.3, com a chave para ativar/inativar o GOV.BR DS.
- [Como contribuir](https://abrasileirado.github.io/dsgovbr-bootstrapped/contribua.html).

## Licença

MIT — ver [LICENSE](LICENSE). Bibliotecas de terceiros usadas (Bootstrap,
`@govbr-ds/core`) mantêm suas próprias licenças (também MIT) e permanecem
como git submodules em `vendor/`, nunca redistribuídas neste repositório.
