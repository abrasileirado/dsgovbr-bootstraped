# Desenvolvimento — dsgovbr-bootstraped

> Guia de trabalho inicial. O projeto está em especificação; caminhos, scripts e comandos marcados como **propostos** deverão ser ajustados e testados quando a implementação existir.

## Objetivo técnico

Produzir uma integração SCSS/CSS que mantenha classes Bootstrap 5 nos componentes suportados e adote aspectos visuais rastreáveis do GOV.BR DS. A iniciativa é comunitária e não oficial; estilos e comportamento precisam ser verificados separadamente.

Leia primeiro [os requisitos](requisitos.md), sobretudo a matriz inicial, os critérios de aceite e as decisões pendentes.

## Roteiro do MVP

O MVP foi quebrado nas issues abaixo, cada uma associada a um marco concreto. A ordem reflete as
dependências entre elas (uma issue geralmente depende da anterior estar concluída):

| Issue | Marco | Estimativa |
|---|---|---|
| [#2](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/2) | Estrutura inicial: submodules (Bootstrap + govbr-ds-core) e scaffold do projeto | 6h |
| [#3](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/3) | Prova de conceito: tokens de fundação + adaptação de `.btn` | 8h |
| [#4](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/4) | Adaptação: campos de texto, checkbox e radio | 8h |
| [#5](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/5) | Adaptação: alert e card | 6h |
| [#6](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/6) | Matriz pública de suporte + página de showcase dos componentes | 10h |
| [#7](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/7) | Exemplo(s) de uso concreto | 6h |
| [#8](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/8) | Documentação: Getting Started e Setup | 4h |
| [#9](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/9) | README.md com screenshots | 3h |
| [#10](https://github.com/abrasileirado/dsgovbr-bootstraped/issues/10) | Pipeline de CI/CD de release | 6h |

Cada issue detalha objetivo, escopo, critério de aceite e dependências no próprio GitHub. A página
de showcase (#6) é estática (HTML/CSS, sem framework), publicada em `docs/showcase/` via o GitHub
Pages já habilitado neste repositório.

## Organização proposta

```text
src/scss/
  index.scss                 # Entrada pública quando estabilizada
  _tokens.scss               # Mapeamento documentado de tokens
  _bootstrap-settings.scss   # Ajustes de variáveis Bootstrap
  components/               # Adaptadores específicos, um por componente
dist/                       # Artefatos gerados para publicação
vendor/                     # Submodules (Bootstrap, govbr-ds-core), fixados por tag
docs/
  componentes/               # Fixture de teste + catálogo demonstrativo, por componente
  *.md                        # Documentação e decisões
package.json
package-lock.json            # Ou lockfile do gerenciador escolhido
```

Essa árvore é uma proposta de arquitetura, **não** uma descrição dos arquivos já existentes. Não crie/importações rígidas para fontes upstream antes de verificar a estrutura da versão selecionada.

Cada página em `docs/componentes/` cumpre dupla função: é a fixture usada para
validar a adaptação de um componente (variantes, tamanhos, estados, diferenças
conhecidas) e, ao mesmo tempo, o catálogo demonstrativo (RF-11) publicado via
GitHub Pages — não há uma pasta `tests/fixtures/` separada.

## Sequência recomendada

1. Registrar revisão e licença das fontes Bootstrap e GOV.BR DS; inventariar tokens, dependências, mixins e seletores.
2. Criar uma fixture Bootstrap pura para botões, incluindo estados aplicáveis; documentar diferenças em relação à referência GOV.BR DS.
3. Compilar um protótipo de tokens + botão sem importar indiscriminadamente o CSS integral dos dois projetos.
4. Decidir se CSS pré-compilado será autônomo ou exigirá Bootstrap separado; criar teste de integração compatível com a decisão.
5. Implementar componentes restantes do MVP com testes correspondentes.
6. Validar instalação de um tarball local antes de publicar.

## Comandos planejados

Após a criação do `package.json`, manter scripts com contratos simples como estes (nomes ainda sujeitos à decisão de implementação):

```bash
npm ci
npm run build
npm test
npm pack --dry-run
```

Antes da primeira publicação, testar o `.tgz` gerado por `npm pack` em **dois projetos consumidores limpos**: um que use apenas CSS pronto e outro que compile SCSS. Registrar no README a ordem de inclusão de estilos, dependências necessárias e ferramenta Sass suportada. Não publicar exemplos `@use` ou imports CSS como instruções finais até que tenham sido executados com o pacote empacotado.

## Verificações por componente

Uma contribuição de componente deve conter, no mínimo:

- Seletores Bootstrap aceitos e markup de fixture.
- Referência GOV.BR DS e revisão utilizada.
- Mapeamento semântico das variantes e diferenças deliberadas.
- Estados normal, `hover`, `focus-visible`, ativo, desabilitado e erro quando aplicáveis.
- Testes de teclado, associação de labels e contraste relevantes.
- Avaliação se o componente depende de JavaScript, ícones, fontes ou de markup não nativo Bootstrap.
- Atualização do status na matriz dos requisitos e documentação de limitações.

Não declare equivalência comportamental com GOV.BR DS apenas porque as capturas visuais se parecem. Componentes operados pelo JavaScript Bootstrap devem conservar seus testes comportamentais.

## Sass e dependências

Priorizar `@use`/`@forward` no código novo. Verificar antes se as dependências efetivamente consumidas ainda dependem de `@import` e isolar conflitos, avisos e ordem de carregamento. Fixar versões em lockfile e manter a matriz de compatibilidade atualizada.

A decisão de usar fontes upstream como dependência, copiar trechos ou reimplementar adaptadores é tomada por componente, com revisão de licença e manutenção; não há uma estratégia global presumida para todos os arquivos.

## Publicação planejada

1. Abrir PR com build, testes, atualização de documentação e changelog.
2. Validar `npm pack --dry-run` e o conteúdo real do tarball.
3. Criar tag da versão aprovada.
4. Publicar no npm, preferencialmente via trusted publishing/OIDC quando configurado.
5. Registrar versão e compatibilidade em GitHub Release.

Nenhuma etapa deste documento configura o npm ou publica o pacote por si só.

## Leituras úteis

- [Bootstrap — customização Sass](https://getbootstrap.com/docs/5.3/customize/sass/).
- [Sass — `@import` depreciado](https://sass-lang.com/documentation/at-rules/import/).
- [npm — publicação com escopo](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).
- [npm — trusted publishing](https://docs.npmjs.com/trusted-publishers/).
