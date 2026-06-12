## Context

O projeto requer um conjunto de novas funcionalidades e correções:
1. Cores personalizadas e cálculo dinâmico de status na tela de estatísticas de palpites.
2. Manutenção de jogos em andamento (não finalizados) na listagem e na paginação de palpites no "Meu Espaço", ordenados por último.
3. Criação de uma nova tela de "Eventos" para jogadores logados, exibindo confrontos iniciados/finalizados, pontuadores da rodada correspondente e um modal com comentários interactivos dos jogadores.

## Goals / Non-Goals

**Goals:**
- Ajustar rótulos e cores de status na tela `/palpites` (Encerrado: cinza, Agendado: verde, Em Andamento: azul claro, Calculando Encerramento: roxo claro).
- Ajustar os serviços e controllers no "Meu Espaço" para listar e paginar palpites de jogos em andamento (não finalizados), garantindo que fiquem por último no ordenamento.
- Criar a tabela `comentarios` no banco de dados e as devidas migrações.
- Desenvolver a nova tela `/eventos` com linha do tempo de jogos iniciados/finalizados, pontuação por rodada de cada competidor, e modal interativo de comentários.

**Non-Goals:**
- Permitir alteração de palpites para jogos que já iniciaram (a trava temporal de 30 minutos antes da rodada continua valendo).

## Decisions

### 1. Modelagem do Banco de Dados para Comentários
Criaremos uma nova tabela `comentarios` em `packages/db/src/schema.ts`:
- `id` (uuid, chave primária)
- `partidaId` (uuid, FK para partidas.id, cascade)
- `usuarioId` (uuid, FK para usuarios.id, cascade)
- `conteudo` (varchar(500), não nulo)
- `dataCriacao` (timestamp, defaultNow)

Geraremos e aplicaremos a migração usando `drizzle-kit generate` e `drizzle-kit migrate` (ou pelo script pnpm correspondente).

### 2. Lógica de Ordenação no "Meu Espaço"
Para incluir partidas em andamento e deixá-las por último na paginação do "Meu Espaço":
- Nos métodos `obterTotalPalpitesSalvosFuturos` e `obterPalpitesSalvosFuturosPaginados` de `palpites.service.ts`, removeremos a condição `gt(partidas.dataInicio, agora)` para incluir todas as partidas não finalizadas.
- Adicionaremos a ordenação usando `sql` no Drizzle:
  ```typescript
  .orderBy(
    sql`CASE WHEN ${partidas.dataInicio} >= ${agora} THEN 0 ELSE 1 END`,
    asc(partidas.dataInicio)
  )
  ```
- No componente do frontend `dashboard-palpites.tsx`, faremos o mesmo ajuste no filtro de `partidasFuturas` e na ordenação para garantir paridade visual.

### 3. Tela de Eventos e Pontuadores da Rodada
- A tela `/eventos` listará jogos cuja data de início já passou (`partidas.dataInicio <= agora`) ou que estão finalizados.
- Para obter os pontuadores da rodada de cada confronto:
  - Buscaremos todos os usuários.
  - Para a rodada correspondente, buscaremos todas as partidas finalizadas daquela rodada.
  - Calcularemos a pontuação de cada usuário na rodada em tempo real (2 pontos para placar exato, 1 ponto para acertar o vencedor/empate) e retornaremos os maiores pontuadores formatados.
- Criaremos server actions em `apps/web/src/app/actions/eventos.ts` para carregar a timeline, listar comentários, enviar comentário e obter pontuadores.

## Risks / Trade-offs

### 1. Migração de Banco de Dados em Ambiente Local
- *Risco*: Alterar o esquema do banco local sem rodar as migrações pode quebrar o build ou a execução.
- *Mitigação*: Executaremos `pnpm --filter @palpita/db db:generate` e depois aplicaremos com o comando de push/migration para manter o banco sincronizado.
