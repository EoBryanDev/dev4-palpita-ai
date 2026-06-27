## Context

Na fase de Mata-Mata (Knockout), o jogo não pode terminar empatado no agregado final. O sistema de pontuação clássico atribui 2 pontos por placar exato e 1 ponto por vencedor correto. 
Para incentivar o palpite detalhado, se a partida ocorrer em uma rodada configurada como mata-mata, o usuário ganha 1 ponto de bônus adicional se acertar o momento em que a classificação/vitória ocorre (tempo regulamentar/normal, prorrogação ou pênaltis). 

Ao mesmo tempo, flexibilizamos a regra de bloqueio de palpites: em vez de travar 30 minutos antes do primeiro jogo da Copa do Mundo, a trava agora ocorre 30 minutos antes do início do primeiro jogo de cada rodada correspondente.

## Goals / Non-Goals

**Goals:**
- Adicionar coluna `tipo` na tabela `rodadas` (valores: `'GRUPO'` ou `'MATAMATA'`).
- Adicionar coluna `decididoEm` na tabela `partidas` e `momentoPrevisto` na tabela `palpites` (valores: `'NORMAL'`, `'PRORROGACAO'`, `'PENALTIS'`).
- Modificar `Palpite.calcularPontos` no core para ler o tipo da rodada e aplicar a bonificação.
- Atualizar a verificação temporal de `salvarPalpite` para aplicar o limite de 30 minutos antes do início da rodada do jogo.

**Non-Goals:**
- Não computar gols de penalidades nos gols regulamentares salvos na partida (os gols continuam registrando o placar ao término do tempo regulamentar/prorrogação).

## Decisions

### 1. Extensão de Tabelas Drizzle Schema
Adicionar os seguintes enums e colunas:
- `rodadas.tipo`: varchar ou text com valores `GRUPO` e `MATAMATA`, padrão `GRUPO`.
- `partidas.decididoEm`: varchar ou text com valores `NORMAL`, `PRORROGACAO`, `PENALTIS`, padrão `NORMAL`.
- `palpites.momentoPrevisto`: varchar ou text com valores `NORMAL`, `PRORROGACAO`, `PENALTIS`, padrão `NORMAL`.

### 2. Lógica de Pontuação do Core
No arquivo `packages/core/src/domain/palpite.entity.ts`, modificar o método `calcularPontos`:
- Aceitar parâmetro adicional `tipoRodada: 'GRUPO' | 'MATAMATA'`.
- Aceitar parâmetro adicional `decididoEm: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS'`.
- Se `tipoRodada === 'MATAMATA'`:
  - Calcular base normalmente (placar exato = 2 pontos, vencedor = 1 ponto, erro = 0 pontos).
  - Se os pontos base > 0 (ou seja, acertou o placar ou acertou o vencedor/empate) E o usuário acertou o momento da vitória (`this._momentoPrevisto === decididoEm`), adicionar +1 ponto de bônus.

### 3. Validação do Deadline de Rodada no Servidor
Na action `salvarPalpite` em `apps/web/src/app/actions/palpites.ts`:
- Em vez de buscar a primeira partida do torneio inteiro, a query busca a primeira partida *da rodada* a qual o `partidaId` pertence:
  ```typescript
  const primeiraPartidaRodada = await db
    .select({ dataInicio: partidas.dataInicio })
    .from(partidas)
    .where(eq(partidas.rodadaId, match.rodadaId))
    .orderBy(partidas.dataInicio)
    .limit(1);
  ```
- O cálculo do `dataLimite` é feito subtraindo 30 minutos dessa data.

## Risks / Trade-offs

- [Fuso Horário] → O servidor Next.js deve converter as datas usando fusos corretos ou trabalhar exclusivamente em UTC para evitar discrepâncias.
- [Mata-Mata sem prorrogação em algumas competições] → O administrador deve configurar os resultados com precisão. A engine do scraper também deve ser estendida futuramente para ler o momento oficial da partida.
