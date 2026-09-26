# Getting Started

> Guia de instalação e uso. Leia primeiro [a documentação](index.md) para o
> contexto do projeto e [os requisitos](requisitos.md) para saber exatamente
> o que já é suportado.

## Estado atual

O pacote **ainda não foi publicado no npm** (ver DP-07 em
[requisitos.md](requisitos.md)). Por enquanto, a única forma de usar o
dsgovbr-bootstraped é clonando este repositório e compilando localmente.

## Usando a partir deste repositório

```bash
git clone --recurse-submodules https://github.com/abrasileirado/dsgovbr-bootstraped.git
cd dsgovbr-bootstraped
npm install
npm run build
```

O CSS pronto fica em `dist/dsgovbr-bootstraped.css` (ou `.min.css`,
minificado). Inclua no seu HTML:

```html
<link rel="stylesheet" href="caminho/para/dsgovbr-bootstraped.min.css">
```

Nenhum outro CSS do Bootstrap precisa ser carregado: a build é **autônoma**
(DP-02 em requisitos.md) — o arquivo já inclui o Bootstrap inteiro
recompilado com os tokens do GOV.BR DS.

## Pré-requisitos externos

- **Fonte "Rawline"** (fallback: Raleway, sans-serif): não é incluída no
  pacote (DP-05). Se quiser fidelidade tipográfica total, carregue-a via
  CDN ou como fonte local — sem ela, o navegador usa o fallback.
- **Ícones Font Awesome 5**: não incluídos. Só são necessários se você for
  replicar manualmente ícones do GOV.BR DS que os componentes adaptados
  ainda não usam (nenhum componente do MVP atual exige ícones).

## O que já está suportado

Ver o [catálogo de componentes](componentes/index.html) para a lista
completa, com exemplos de markup, variantes, tamanhos e estados — e
[exemplos de uso concreto](exemplos/login.html) para ver os componentes
compostos numa tela real.

## Quando o pacote for publicado no npm (planejado)

```bash
npm install @abrasileirado/dsgovbr-bootstraped
```

```html
<link rel="stylesheet" href="node_modules/@abrasileirado/dsgovbr-bootstraped/dist/dsgovbr-bootstraped.min.css">
```

A entrada SCSS para quem quiser compilar no próprio projeto ainda não tem
um contrato estável (DP-04 em requisitos.md) — evite depender de um
caminho `@use`/`@import` específico até essa decisão ser fechada.
