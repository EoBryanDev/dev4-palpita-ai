## Why

Permitir que os competidores vejam os palpites e pontuações parciais das partidas a qualquer momento (mesmo antes ou durante o jogo), e também permitir que os administradores revisem/corrijam placares de jogos já finalizados caso haja erros de scrape, além de corrigir a ordenação cronológica das ocorrências dos jogos quando há acréscimo.

## What Changes

- **Exibição de Palpites e Pontuações Parciais**: Exibir a listagem de palpites e pontuações a qualquer momento na timeline de eventos.
- **Badge de Status**: Exibir se o placar e pontos são parciais (para jogos não finalizados) ou finais (para jogos finalizados).
- **Remoção de Rótulo "Calculando Encerramento"**: Jogos em andamento ou pós-horário não finalizados serão exibidos apenas como "Em Andamento".
- **Ordenação Cronológica dos Acontecimentos**: Garantir que as ocorrências com acréscimo de tempo (ex: `90+3'`, `90+7'`) sejam ordenadas após os minutos regulamentares correspondentes (ex: `90'`).
- **Ação de Revisão do Admin**: Adicionar botão "Revisar" no painel de partidas finalizadas para que o administrador possa corrigir o placar oficial.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `eventos-timeline`: Exibição de palpites a qualquer momento, cálculo e badge de pontos parciais/finais e ordenação corrigida das ocorrências da partida.
- `area-admin-partidas`: Permissão e interface de revisão e correção de placares de jogos finalizados.

## Impact

- **Server Actions**: `obterPontuadoresPartida` na timeline passa a calcular parciais e não-bloqueantes. `lancarResultadoOficial` passa a permitir atualização mesmo em partidas com status `FINALIZADO`.
- **UI Components**: `eventos-client.tsx` para exibição de status parcial/final e ordenação de ocorrências; `admin-partidas-client.tsx` para introduzir o fluxo de "Revisar/Salvar Correção".
