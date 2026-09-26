# Contribua — dsgovbr-bootstraped

Obrigado pelo interesse em contribuir. Este é um projeto comunitário e **não oficial** de integração visual entre Bootstrap 5 e o GOV.BR DS. Leia a [documentação inicial](index.md) e os [requisitos](requisitos.md) antes de propor suporte a componentes.

## Tipos de contribuição

- Relatos reproduzíveis de diferenças visuais, falhas de compilação e conflitos com aplicações Bootstrap existentes.
- Mapeamentos de tokens com fonte e versão verificáveis.
- Fixtures HTML usando exclusivamente a API Bootstrap anunciada para o componente.
- Testes de acessibilidade, teclado, regressão visual e instalação do pacote.
- Documentação de limites e diferenças em relação às referências upstream.

## Antes de abrir uma alteração

1. Confira se o componente está no escopo do MVP ou marcado como pendente na [matriz](requisitos.md#6-matriz-inicial-de-compatibilidade).
2. Abra uma issue para mudanças de API, dependências, CSS distribuído ou versões suportadas; descreva alternativas e impacto na atualização do pacote.
3. Para erros, informe versões, markup mínimo, ordem de carregamento dos estilos, comando Sass/bundler, resultado esperado e observado. Imagens de comparação podem complementar, mas não substituem o HTML reproduzível.
4. Não copie arquivos, fontes, ícones ou imagens de terceiros sem identificar origem e licença.

## Pull requests

Mantenha cada PR focado e inclua:

- Descrição do comportamento alterado, componente e status de suporte pretendido.
- Referências verificáveis às especificações e versões upstream usadas.
- Fixture de consumidor Bootstrap sem classe `.br-*` obrigatória se a mudança anuncia compatibilidade Bootstrap.
- Testes ou justificativa quando um teste ainda não for possível.
- Atualização dos requisitos/matriz, notas de limitações e changelog quando a alteração afetar consumidores.
- Revisão de licença e avisos de terceiros se houver inclusão de código ou ativos.

Ao implementar um componente, valide separadamente aparência, markup e comportamento JavaScript. Não adicione estilos globais indiscriminados do Bootstrap e do GOV.BR DS para fazer a fixture passar; isso pode quebrar páginas não cobertas pelos testes.

## Ambiente de desenvolvimento

Consulte [Desenvolvimento](desenvolvimento.md) para a estrutura e o fluxo **propostos**. Os scripts npm e os entry points ainda serão definidos; não presuma que `npm run build` funciona até a implementação correspondente estar no repositório.

## Revisão e governança

As contribuições serão avaliadas por fidelidade documentada, acessibilidade, compatibilidade com a API Bootstrap declarada, custo de manutenção e rastreabilidade das fontes. Uma contribuição pode ser aprovada como experimental ou limitada sem tornar o componente genericamente suportado.

Não represente o projeto como homologado ou mantido pelas equipes oficiais do GOV.BR DS ou Bootstrap. Para questões sensíveis de segurança ou distribuição de ativos, prefira discutir com os mantenedores antes de publicar dados desnecessários em uma issue pública.
