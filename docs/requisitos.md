# Requisitos de software — dsgovbr-bootstraped

- **Versão do documento:** 0.1 (proposta inicial).
- **Estado:** especificação; não descreve funcionalidades já implementadas.
- **Projeto:** integração comunitária e não oficial da API de classes Bootstrap 5 com aspectos visuais do GOV.BR DS.
- **Repositório:** <https://github.com/abrasileirado/dsgovbr-bootstraped>.

## 1. Contexto e problema

Aplicações existentes com Bootstrap 5 usam classes, estrutura HTML e, por vezes, plugins JavaScript próprios. Migrá-las para o GOV.BR DS exige frequentemente alterar templates para classes e anatomias de componentes diferentes. Este projeto busca oferecer uma opção gradual: manter a API Bootstrap para componentes declarados como suportados, produzindo uma aparência baseada na referência GOV.BR DS.

A composição SCSS dos projetos é uma oportunidade de reaproveitamento, **não uma garantia de equivalência**. Regras que dependem de `.br-*`, filhos específicos, JavaScript próprio, fontes ou ícones exigirão mapeamento, adaptação ou exclusão documentada.

## 2. Objetivos

- O-01 — Distribuir um pacote reutilizável para projetos Bootstrap 5, sem exigir troca generalizada de classes HTML.
- O-02 — Reaproveitar tokens e, quando tecnicamente viável, fontes SCSS do GOV.BR DS de modo rastreável.
- O-03 — Disponibilizar CSS compilado e fontes SCSS, respeitando contratos de instalação e entrada documentados.
- O-04 — Definir níveis verificáveis de fidelidade, incluindo limitações de markup, comportamento e acessibilidade.
- O-05 — Permitir evolução componente a componente sem afirmar certificação, homologação ou endosso oficial.

## 3. Não objetivos do MVP

- Reproduzir todos os componentes ou padrões do GOV.BR DS.
- Garantir equivalência pixel a pixel em todas as combinações de navegador e dispositivo.
- Substituir o JavaScript do Bootstrap pelo JavaScript do GOV.BR DS.
- Introduzir silenciosamente classes `.br-*` como requisito de uso dos componentes anunciados como Bootstrap compatíveis.
- Implementar, no MVP, header institucional, navegação complexa, modal ou menu com comportamento próprio.
- Publicar fontes, ícones, imagens ou outros ativos de terceiros sem revisão de origem, licença e necessidade.
- Alegar conformidade institucional automática pelo simples uso do pacote.

## 4. Usuários e casos de uso

| Perfil | Necessidade |
|---|---|
| Desenvolvedor de aplicação Bootstrap | Aplicar um tema visual GOV.BR DS sem reescrever todos os templates. |
| Equipe com pipeline Sass | Importar fontes para configurar e compilar estilos da aplicação. |
| Equipe sem pipeline Sass | Consumir CSS previamente compilado com contrato de dependências documentado. |
| Mantenedor | Verificar componentes, versões, origem de tokens e regressões antes da publicação. |

## 5. Premissas e restrições

- A linha inicial de compatibilidade proposta é **Bootstrap 5.3.x**; a faixa exata será definida e testada antes da primeira publicação.
- A versão ou revisão de GOV.BR DS usada como referência deve ser explicitamente fixada antes da implementação. Não se deve depender de `latest` na geração de releases.
- O escopo npm `@abrasileirado/dsgovbr-bootstraped` é **proposto**, não reservado ou publicado por este documento.
- O projeto distingue contrato **visual**, contrato de **markup** e contrato de **comportamento**. A aprovação em um contrato não implica aprovação nos outros.
- Qualquer versão que contenha CSS pronto deverá informar se ele é **autônomo** (inclui Bootstrap) ou **camada adicional** (exige Bootstrap carregado separadamente), com ordem de carregamento e cobertura demonstradas.
- Cores, medidas e nomes de tokens nos artefatos finais devem vir das fontes versionadas escolhidas; não são definidos por suposição neste documento.

## 6. Matriz inicial de compatibilidade

Legenda: **A** = adaptação principalmente por tokens/SCSS; **B** = exige convenção de markup e validação por componente; **C** = adaptação estrutural e/ou comportamental relevante; **D** = fora do escopo inicial. Classificações são hipóteses a verificar, não garantia de implementação.

| Área | API Bootstrap pretendida | Referência GOV.BR DS | Classe inicial | MVP | Condição para declarar suporte |
|---|---|---|---|---|---|
| Fundamentos | Tokens e variáveis Bootstrap | Tokens de design | A | Sim | Mapeamento versionado, origem registrada e testes de compilação. |
| Layout | `.container`, `.row`, `.col-*` | Princípios de layout | A | Manter Bootstrap | Documentar divergências; não prometer identidade de grid. |
| Botões | `.btn` e variantes selecionadas | Button | B | Sim | Variantes e estados testados; mapeamento de ênfases explícito. |
| Texto e formulários | `.form-control`, `.form-label` | Input | B | Sim | Estados, labels, ajuda e erro testados sem dependência oculta de `.br-input`. |
| Seleção | `.form-check`, `.form-check-input` | Checkbox e Radio | B | Sim | Foco, marcação, desabilitado e uso por teclado verificados. |
| Feedback | `.alert` e variantes selecionadas | Message | B | Sim | Severidades e eventual ícone/fechamento documentados. |
| Conteúdo | `.card` e partes selecionadas | Card | B | Sim | Anatomia suportada e variações aceitas explicitadas. |
| Modal | `.modal` e plugin Bootstrap | Modal | C | Não | Projeto e testes próprios de markup, foco e comportamento. |
| Menu/header | `.navbar`, `.dropdown` | Header/menu | C/D | Não | Decisão arquitetural específica e testes de interação. |

O suporte não é global: cada componente terá status **planejado**, **experimental**, **estável**, **limitado** ou **não suportado**. Apenas componentes com critérios atendidos poderão ser anunciados como estáveis.

## 7. Requisitos funcionais

| ID | Prioridade | Requisito | Critério de aceite |
|---|---|---|---|
| RF-01 | Obrigatório | Gerar CSS a partir dos fontes SCSS com build documentado. | Comando de build reproduzível gera CSS normal e minificado, sem erros, nas versões de dependências fixadas. |
| RF-02 | Obrigatório | Manter mapa rastreável de tokens GOV.BR DS → variáveis/componentes Bootstrap. | Cada token utilizado registra origem, propósito e destino; valores inexistentes são tratados como escolha local e identificados como tal. |
| RF-03 | Obrigatório | Preservar as classes públicas Bootstrap para os componentes anunciados como suportados. | Fixtures de teste usam classes Bootstrap sem classes `.br-*` obrigatórias. |
| RF-04 | Obrigatório | Disponibilizar adaptação de botões para variantes selecionadas. | Página de teste demonstra tamanhos e estados definidos na matriz de variantes; diferenças conhecidas são documentadas. |
| RF-05 | Obrigatório | Disponibilizar adaptação básica de campos de texto, checkbox e radio. | Fixtures incluem label associado, ajuda, erro, foco, desabilitado e operação por teclado. |
| RF-06 | Obrigatório | Disponibilizar adaptações básicas de alertas e cards. | Cada variação suportada tem fixture, regra documentada de uso e teste visual. |
| RF-07 | Obrigatório | Fornecer uma matriz pública de suporte. | Matriz registra status, seletores Bootstrap aceitos, diferenças e versão de introdução por componente. |
| RF-08 | Obrigatório | Publicar artefatos CSS e SCSS em pacote npm público. | `npm pack --dry-run` lista os arquivos esperados; instalação local do tarball e exemplos CSS/SCSS passam em build de consumidor. |
| RF-09 | Obrigatório | Declarar a relação entre Bootstrap e CSS distribuído. | README informa se Bootstrap precisa ser importado antes; teste de integração detecta ordem incorreta ou ausência da dependência. |
| RF-10 | Desejável | Permitir entrada SCSS específica para customização ou consumo parcial. | Pelo menos uma entrada documentada compila num projeto consumidor; parcialização é entregue apenas se comprovadamente estável. |
| RF-11 | Desejável | Disponibilizar catálogo demonstrativo. | Exemplos exibem markup, variante, estados e limitação por componente. |
| RF-12 | Desejável | Publicar source map para CSS não minificado. | Arquivo de mapa referencia os fontes distribuídos e não contém caminhos locais indevidos. |

## 8. Requisitos não funcionais

| ID | Prioridade | Requisito | Critério de aceite |
|---|---|---|---|
| RNF-01 | Obrigatório | Compatibilidade de versões explícita. | `package.json` e documentação registram faixa Bootstrap testada e revisão/versão dos artefatos GOV.BR DS. |
| RNF-02 | Obrigatório | Acessibilidade básica verificável. | Inspeção manual por teclado e testes automatizados aplicáveis cobrem foco, semântica e contraste dos componentes do MVP; problemas são registrados. |
| RNF-03 | Obrigatório | Build determinístico. | CI instala a partir de lockfile e recompila os artefatos sem diferenças inesperadas. |
| RNF-04 | Obrigatório | Isolamento de seletores. | Testes de regressão procuram conflitos relevantes com Bootstrap e estilos globais GOV.BR DS; não se importa indiscriminadamente o CSS completo de ambas as bibliotecas. |
| RNF-05 | Obrigatório | Verificação de licenças e atribuições. | Dependências e ativos redistribuídos têm licença verificada; avisos MIT aplicáveis são preservados. |
| RNF-06 | Obrigatório | Segurança de publicação. | CI testa o tarball antes de publicar; fluxo automatizado deve priorizar npm trusted publishing/OIDC e proveniência, sujeito à configuração do pacote. |
| RNF-07 | Obrigatório | Versionamento e rastreabilidade. | Toda release tem tag, changelog, matriz atualizada e referência às versões upstream. |
| RNF-08 | Obrigatório | Comunicação de caráter não oficial. | README, documentação e metadata não alegam endosso ou homologação. |
| RNF-09 | Desejável | Cobertura visual automatizada. | Fixtures do MVP têm capturas de referência em ao menos dois tamanhos de tela e testes de estados interativos relevantes. |

## 9. Contrato de distribuição

A proposta de publicação é um pacote npm contendo `dist/` com CSS compilado e `src/scss/` com SCSS importável. As superfícies exatas deverão ser congeladas antes da versão 1.0:

- Arquivos CSS normal e minificado em caminhos documentados; consumidor sem Sass deve conseguir usar o CSS em uma aplicação de teste.
- Uma entrada SCSS documentada; consumidor com Sass deve conseguir compilar no próprio projeto.
- Campos `files`, `exports` e, se necessários, `style`/`sass` no `package.json`, testados nos ambientes de consumo que o projeto decidir suportar.
- Declaração da dependência Bootstrap coerente com a estratégia escolhida para o CSS pronto. Se houver um build autônomo e outro de camada adicional, nomes e instruções devem distingui-los sem ambiguidade.
- Dependências de compilação e fontes GOV.BR DS não podem depender implicitamente de arquivos que não constem do pacote ou das dependências declaradas.
- GitHub Releases e, opcionalmente, documentação online complementam o npm; não substituem o registro primário.

Um trecho de instalação só poderá ser publicado como instrução oficial após o primeiro tarball ser validado num projeto consumidor limpo.

## 10. Estratégia de implementação

1. Inspecionar as versões upstream selecionadas: árvore SCSS, tokens, dependências, JavaScript e licenças.
2. Produzir uma prova de conceito para tokens e `.btn`, confrontando estados e estrutura com as referências.
3. Decidir entre reaproveitar mixins upstream ou implementar adaptadores próprios por componente, registrando o custo de manutenção.
4. Adicionar formulários, alertas e cards, sempre acompanhados de fixtures e matriz de suporte.
5. Fechar contrato CSS/SCSS do pacote com testes de instalação local.
6. Publicar versão pré-1.0 com limites claros; só ampliar suporte após regressão visual, de acessibilidade e de comportamento.

Preferir código novo em `@use`/`@forward` quando possível. Se uma dependência exigir `@import`, isolar o uso, registrar avisos de depreciação e planejar migração; não presumir que é possível converter fontes de terceiros sem impacto.

## 11. Critérios de aceite do MVP

- [ ] Revisões exatas de Bootstrap e GOV.BR DS selecionadas e registradas.
- [ ] Tokens e fontes incorporados têm origem e licença verificadas.
- [ ] `npm run build` e `npm test` ou equivalentes estão documentados e passam no CI.
- [ ] Botão, input, checkbox/radio, alerta e card têm demonstrações para os subconjuntos efetivamente suportados.
- [ ] Fixtures não exigem classes `.br-*` ocultas nos componentes declarados como Bootstrap compatíveis.
- [ ] Os estados de foco, desabilitado e erro aplicáveis foram avaliados com teclado e testes automatizados pertinentes.
- [ ] Um projeto consumidor limpo instala o tarball e usa CSS pré-compilado.
- [ ] Um projeto consumidor limpo instala o tarball e compila a entrada SCSS documentada.
- [ ] A matriz de compatibilidade informa diferenças, restrições e itens ainda não suportados.
- [ ] O pacote inclui licença, avisos de terceiros quando necessários, README, changelog e versão correta.
- [ ] `npm pack --dry-run` e validação do conteúdo publicado passam antes da release.

## 12. Decisões pendentes

| ID | Decisão | Alternativas e critério |
|---|---|---|
| DP-01 | Referência GOV.BR DS | Definir versão/revisão e origem consumível dos tokens e fontes SCSS; avaliar estabilidade e licença dos artefatos. |
| DP-02 | Formato de CSS pronto | Camada adicional sobre Bootstrap ou build autônomo; comparar tamanho, sobreposição, ergonomia e risco de conflito. |
| DP-03 | Política de dependências | Definir `peerDependencies` e dependências de build conforme DP-02 e disponibilidade dos insumos upstream. |
| DP-04 | Contrato de Sass | Testar `@use`/`@forward`, imports legados do upstream, package importer, bundlers alvo e caminhos expostos em `exports`. |
| DP-05 | Fonte e ícones | Decidir se serão externos, dependências, incorporados ou excluídos; verificar licenças, tamanho e fallback. |
| DP-06 | Variantes Bootstrap | Delimitar quais classes (`primary`, `secondary`, `outline-*` etc.) têm mapeamento semântico defensável. |
| DP-07 | Nome do pacote | Confirmar disponibilidade e titularidade do escopo npm e manter indicação de que o projeto não é oficial. |
| DP-08 | Política de licenciamento | Confirmar licença do repositório e avisos de todos os arquivos efetivamente copiados ou redistribuídos. |
| DP-09 | Versões e suporte | Definir política de atualização, navegadores alvo e comportamento diante de mudanças upstream. |

## 13. Riscos iniciais

| Risco | Impacto | Mitigação |
|---|---|---|
| Dependência de seletores e markup `.br-*` nos SCSS upstream | Adaptação não viável por mera composição Sass | Prova de conceito pequena; usar adaptador próprio ou declarar componente não suportado. |
| Colisão de reset, utilitários e estilos globais | Regressões visuais fora dos componentes alvo | Importação seletiva; isolamento; testes em aplicação Bootstrap existente. |
| Divergência de comportamentos JavaScript | Interface visualmente correta, mas interação incorreta | Preservar o motor Bootstrap no MVP e testar suas interações separadamente. |
| Atualizações upstream quebrarem tokens/imports | Build ou aparência instáveis | Fixar versões, rodar CI de compatibilidade e versionar alterações. |
| Publicar CSS com expectativa errada de dependência Bootstrap | Estilos incompletos ou duplicados no consumidor | Nomear builds claramente, documentar ordem e testar as duas formas de consumo. |
| Distribuição inadvertida de fontes/ícones sem revisão | Risco jurídico e aumento do pacote | Inventário de terceiros, `files` restritivo e revisão do tarball. |

## 14. Referências

- [Bootstrap 5.3 — Sass](https://getbootstrap.com/docs/5.3/customize/sass/).
- [Bootstrap 5.3 — licença](https://getbootstrap.com/docs/5.3/about/license/).
- [Padrão Digital de Governo](https://www.gov.br/ds).
- [GOVBR-DS Wiki — licenças](https://govbr-ds.gitlab.io/tools/govbr-ds-wiki/git-gitlab/guias/licencas/).
- [Sass — depreciação de `@import`](https://sass-lang.com/documentation/at-rules/import/).
- [npm — pacotes públicos com escopo](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).
- [npm — trusted publishing](https://docs.npmjs.com/trusted-publishers/).
