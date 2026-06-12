## 1. Core e Lógica de Pontuação

- [x] 1.1 Criar o componente utilitário `FlagImage` em `apps/web/src/components/ui/flag-image.tsx` para exibição de bandeiras via CDN
- [x] 1.2 Atualizar cálculo de pontuação (2 pts placar exato, 1 pt vencedor/empate) no service `ranking.service.ts`
- [x] 1.3 Atualizar cálculo local de pontos ganhos no histórico de palpites em `meu-espaco/page.tsx`
- [x] 1.4 Adaptar testes unitários de pontuação e ranking em `tests/unitarios/api/ranking/route.spec.ts`
- [x] 1.5 Adaptar testes unitários do dashboard de palpites em `tests/unitarios/components/dashboard-palpites.spec.tsx`

## 2. Prazos e Validação de Rodadas

- [x] 2.1 Buscar a primeira partida da rodada ativa no `layout.tsx` e calcular data limite (data da partida - 30 min)
- [x] 2.2 Atualizar componente `TimeoutBanner` para receber `targetDate` e `labelRodada` e renderizar o countdown correto
- [x] 2.3 Modificar action de backend `salvarPalpite` em `palpites.ts` para bloquear palpites 30 min antes da rodada
- [x] 2.4 Calcular e repassar a flag `isRodadaBloqueada` do servidor em `meu-espaco/page.tsx` para o frontend
- [x] 2.5 Integrar `isRodadaBloqueada` para desabilitar inputs e botões em `dashboard-palpites.tsx`, e exibir aviso de encerramento

## 3. Classificação e Pódio

- [x] 3.1 Filtrar administradores da query do ranking (cláusula `cargo !== 'ADMIN'`) em `ranking.service.ts`
- [x] 3.2 Implementar identificação de ranking não-iniciado (pontuação zerada geral) no `ranking-list.tsx`
- [x] 3.3 Adicionar card com status de "Aguardando competição iniciar" substituindo o pódio em `ranking-list.tsx` quando inativo

## 4. UI: Hero Festiva, Regulamento e Bandeiras

- [x] 4.1 Modificar layout da seção de regulamento em `home/page.tsx` para incluir a tabela de distribuição de prêmios (70%, 20%, 10%) e pontuação atualizada
- [x] 4.2 Incorporar assets das logos oficiais da Copa de 2026 (USA, MEX, CAN) e decorações festivas na Hero da Home em `home/page.tsx`
- [x] 4.3 Substituir visualização de emojis nativos por `<FlagImage />` nos componentes da Home, Agenda, Dashboard e Painel Admin
