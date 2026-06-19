## 1. Modificações no Backend / Actions

- [x] 1.1 Modificar `obterPontuadoresPartida` em `apps/web/src/app/actions/eventos.ts` para retornar dados parciais e a flag `isParcial`
- [x] 1.2 Corrigir ordenação de `eventosJogo` na action `obterEventosTimeline` em `apps/web/src/app/actions/eventos.ts`
- [x] 1.3 Atualizar `lancarResultadoOficial` em `apps/web/src/app/actions/admin.ts` para permitir atualização de partidas já finalizadas

## 2. Modificações na UI de Eventos e Admin

- [x] 2.1 Remover o status "Calculando Encerramento" e ajustar `getStatusLabel` em `apps/web/src/components/eventos-client.tsx`
- [x] 2.2 Adicionar indicador visual de resultado parcial/final e marcas de pontuações parciais no modal de pontuadores de `apps/web/src/components/eventos-client.tsx`
- [x] 2.3 Implementar botão "Revisar" e fluxo de edição/salvamento para partidas finalizadas no painel admin em `apps/web/src/components/admin-partidas-client.tsx`

## 3. Validação e Qualidade

- [x] 3.1 Executar typecheck com `pnpm --filter @palpita/web exec tsc --noEmit`
- [x] 3.2 Executar formatação e lint com `pnpm biome check --write`
- [ ] 3.3 Validar que o projeto compila com sucesso rodando `pnpm build`
