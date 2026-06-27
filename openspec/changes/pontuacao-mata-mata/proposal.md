## Why

Com a chegada da fase de Mata-Mata (eliminatórias), as partidas passam a admitir a possibilidade de prorrogação e disputa de pênaltis para determinar o vencedor que avança de fase. O sistema de pontuação atual calcula apenas a exatidão em relação aos 90 minutos regulamentares.
Além disso, precisamos atualizar a regra de deadline de palpites para permitir palpitar em qualquer jogo de uma rodada até exatamente 30 minutos antes do início do primeiro jogo daquela respectiva rodada.

## What Changes

1. **Alteração no Banco de Dados:**
   - Adicionar uma coluna/propriedade `tipo` à tabela `rodadas` (ex.: `'GRUPO'` ou `'MATAMATA'`).
   - Adicionar uma coluna `momentoVitoria` (ou semelhante) na tabela `palpites` e `partidas` para registrar se a vitória ocorre em tempo normal, prorrogação ou pênaltis (por exemplo, `TMedioVencedor = 'NORMAL' | 'PRORROGACAO' | 'PENALTIS'`).
   
2. **Alteração na Lógica de Negócio (`core`):**
   - Alterar `Palpite.calcularPontos()` para considerar se a rodada correspondente à partida é `'MATAMATA'`.
   - Implementar o bônus de acerto de momento (+1 ponto extra) quando o usuário prevê corretamente o momento de vitória no mata-mata.
   
3. **Alteração nas Trava Temporais (Deadline):**
   - Alterar a lógica da action `salvarPalpite` para permitir palpitar até 30 minutos antes do início do primeiro jogo daquela rodada, ao invés da primeira partida do campeonato inteiro.

4. **Alteração de Frontend:**
   - Adicionar campo nos formulários de palpites para que o usuário escolha o momento da vitória quando for partida de mata-mata.
   - Exibir a explicação detalhada da regra de bônus de momento nas páginas de regras pública.

## Capabilities

### New Capabilities
- `pontuacao-mata-mata-bonus`: Lógica de pontuação de bônus (+1 ponto) para apostas que acertarem o momento de vitória da partida no mata-mata (tempo normal, prorrogação ou pênaltis).

### Modified Capabilities
- `dominio-core`: Extensão de `Palpite` e `Partida` para suportar o tipo de rodada mata-mata e o momento da vitória.
- `area-privada-palpites`: Atualização de salvamento e validação de palpites para respeitar o deadline de 30 minutos antes do primeiro jogo da rodada.
- `persistencia-db`: Inclusão de novas colunas no schema Drizzle para rodadas, palpites e partidas.
