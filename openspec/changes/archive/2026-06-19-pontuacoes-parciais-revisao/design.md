## Context

Atualmente, o cálculo e exibição de pontuadores de partidas na timeline de eventos são bloqueados até que a partida seja finalizada pelo administrador. Com isso, os palpites e pontuações parciais não ficam visíveis enquanto o jogo está em andamento. Além disso:
- Há um status visual redundante ("Calculando Encerramento") na timeline para jogos em andamento após 115 minutos.
- A ordenação das ocorrências de partida ordena os acréscimos cronológicos incorretamente (ex: `90+3'`, `90+7'` antes de `90'`).
- Os administradores não conseguem corrigir placares de jogos finalizados porque a action `lancarResultadoOficial` bloqueia atualizações para partidas com status `FINALIZADO`.

## Goals / Non-Goals

**Goals:**
* Permitir a exibição de palpites e pontuações parciais para jogos em andamento e agendados.
* Destacar visualmente na UI do modal se as pontuações e o placar são parciais (jogo em andamento ou agendado) ou finais (jogo encerrado).
* Remover o status visual "Calculando Encerramento", exibindo apenas "Em Andamento".
* Corrigir a ordenação dos acontecimentos da partida para que o tempo regulamentar venha antes dos acréscimos correspondentes.
* Habilitar um botão "Revisar" no painel de administração de partidas finalizadas, permitindo correção e salvamento de placares com recálculo automático de ranking.

**Non-Goals:**
* Modificar a lógica essencial do algoritmo de cálculo de pontos da entidade `Palpite` (RN01).
* Alterar o funcionamento básico do scraper.

## Decisions

### 1. Permitir cálculo de pontos parciais e remover bloqueio
* **Abordagem**: Em `obterPontuadoresPartida`, removeremos a trava de status `FINALIZADA` e gols nulos. Se gols forem nulos, serão tratados como `0` para cálculo temporário na entidade `Palpite` (assim, se o jogo não iniciou e os gols do banco de dados forem nulos, todos ficam temporariamente com `0 PTS`).
* **Justificativa**: Simplifica a exibição e unifica a lógica de cálculo usando a própria entidade de domínio `Palpite`.

### 2. Ordenação de ocorrências em memória via Javascript
* **Abordagem**: Na action `obterEventosTimeline`, após fazer a consulta no banco para `eventosPartida`, realizaremos a ordenação usando `sort` no Javascript:
  `eventosJogo.sort((a, b) => a.minuto - b.minuto || (a.acrescimos ?? 0) - (b.acrescimos ?? 0))`
* **Justificativa**: É a maneira mais simples, portável e segura de ordenar tratando valores `null` de acréscimo de tempo como `0`, garantindo compatibilidade entre diferentes bancos e dialetos SQL.

### 3. Liberação de re-gravação no status finalizado do admin
* **Abordagem**: Na action `lancarResultadoOficial`, a linha `if (match.status === 'FINALIZADO')` será removida. A tela administrativa do front-end (`AdminPartidasClient`) manterá o estado `editingPartidas` para chavear se uma partida finalizada está em modo de edição (exibindo os inputs e salvando com a mesma action).
* **Justificativa**: Reutiliza a action existente com segurança, pois apenas administradores autenticados podem chamá-la.

## Risks / Trade-offs

* **[Risco]**: Exposição de palpites de outros usuários pode ser explorada antes do jogo iniciar.
  * **Mitigação**: O usuário confirmou explicitamente que não há problema em exibir os palpites e pontuadores antes do início da partida.
