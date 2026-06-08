## Context

A plataforma de palpites Copa 2026 está funcional, mas requer refinamentos importantes nas regras de negócio e na experiência do usuário. 
A pontuação de 1 ponto fixo desincentiva a precisão exata do palpite (acerto "na mosca").
O countdown atual aponta para o início da Copa de forma estática, enquanto as regras de palpites exigem um fechamento dinâmico baseado em rodadas.
Adicionalmente, emojis de bandeira de países em sistemas operacionais Windows não renderizam na maioria dos navegadores baseados em Chromium, prejudicando o visual em produção.

## Goals / Non-Goals

**Goals:**
- Ajustar a pontuação de palpites: 2 pontos para acerto exato do placar, 1 ponto para acerto do resultado final e 0 para erro.
- Atualizar a Home para incluir a tabela de distribuição de prêmios (70%, 20%, 10%) integrada ao regulamento, com valores reais dinâmicos.
- Omitir administradores do ranking geral e tratar o pódio em estado zerado como "Aguardando competição iniciar".
- Implementar contagem regressiva e validação no servidor com prazo de 30 minutos antes do primeiro jogo da rodada.
- Criar e aplicar um componente de bandeiras compatível com Windows utilizando a FlagCDN.
- Deixar a Hero festiva aplicando as logos da Copa de 2026.

**Non-Goals:**
- Alterar as regras de classificação da FIFA para o desempate das seleções na tabela de grupos.
- Criar um novo painel administrativo para controle manual de prêmios.

## Decisions

### 1. Utilização da FlagCDN para Bandeiras Compatíveis com Windows
- **Decisão:** Criar um componente `<FlagImage>` em `apps/web/src/components/ui/flag-image.tsx`.
- **Funcionamento:** O componente converterá os emojis de bandeira existentes no banco (usando Regional Indicator Symbols unicode) para siglas ISO de 2 letras (ex: `🇧🇷` -> `"br"`). Subdivisões do Reino Unido como Escócia e Inglaterra serão mapeadas manualmente para `gb-sct` e `gb-eng`.
- **Por que não outra alternativa?** Usar imagens locais de bandeiras exigiria baixar +30 imagens de seleções e gerenciar seus caminhos estáticos. A CDN `flagcdn.com` é gratuita, robusta, amplamente utilizada, e serve imagens no tamanho e formato corretos (PNG/SVG) de forma transparente.
- **Fallback:** Se a sigla falhar ou a imagem não carregar, o componente exibirá o emoji original nativo.

### 2. Validação e Bloqueio de Palpites no Nível da Rodada
- **Decisão:** Alterar a lógica do backend `salvarPalpite` em `palpites.ts` e do frontend `meu-espaco/page.tsx` para buscar a data de início da primeira partida da rodada correspondente e subtrair 30 minutos.
- **Por que não outra alternativa?** Validar individualmente por partida faria com que jogadores pudessem palpitar no segundo jogo da rodada após verem o resultado do primeiro jogo, o que quebraria a igualdade do bolão. Bloquear a rodada inteira com base na primeira partida de forma centralizada resolve a brecha.
- **Desabilitação no Front:** O valor `isRodadaBloqueada` será repassado para o `DashboardPalpites` que desabilitará as tags `<input>` e os botões `<button>` de salvar/alterar palpites.

### 3. Omissão de Administradores e Tratamento de Pódio Zerado
- **Decisão:** Na query do ranking (`calcularRankingGeral`), aplicar a cláusula `ne(usuarios.cargo, 'ADMIN')`. No front, se `ranking.every(u => u.pontos === 0)`, ocultar o pódio gráfico do topo e renderizar um banner de status informando "Aguardando competição iniciar".
- **Por que não outra alternativa?** Se todos têm 0 pontos, o primeiro usuário da ordenação estaria no topo do pódio de forma injusta ou aleatória. Ocultar o pódio e mostrar um estado de espera traz maior clareza visual antes do início dos jogos.

## Risks / Trade-offs

- **[Risco]** Instabilidade temporária da CDN de bandeiras.
  - *Mitigação:* O componente possui tratamento de erro (`onError`) que ativa uma flag de fallback para o emoji unicode original, garantindo que a página nunca fique em branco.
- **[Risco]** Fuso horário no cálculo dos 30 minutos antes do primeiro jogo.
  - *Mitigação:* Toda a lógica de comparação de datas deve ser processada no servidor utilizando objetos `Date` nativos (que lidam automaticamente com fuso horário em UTC) e as datas das partidas armazenadas no banco de dados.
