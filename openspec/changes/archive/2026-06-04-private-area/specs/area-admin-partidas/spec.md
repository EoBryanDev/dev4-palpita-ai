# area-admin-partidas Specification

## Purpose
Prover ferramentas para gerenciamento de partidas e inserção de resultados oficiais que servem como gatilho para o recálculo automático das pontuações dos usuários participantes do bolão.

## ADDED Requirements

### Requirement: Gerenciamento de Jogos e Rodadas
O sistema DEVE permitir que o administrador cadastre e atualize datas, horários e times (Time A e Time B) para cada partida e configure as rodadas do bolão.

#### Scenario: Cadastro de novo jogo
- **WHEN** o administrador insere os dados de duas seleções, data/hora do jogo e clica em salvar
- **THEN** a partida é gravada com status "Não Iniciada" e passa a estar disponível no calendário e para preenchimento de palpites.

### Requirement: Lançamento de Resultados Oficiais e Recálculo de Pontos (RN01)
O sistema DEVE processar automaticamente a pontuação de todos os palpites válidos de uma partida no momento em que o administrador lançar seu resultado oficial.

#### Scenario: Inserção de placar de partida finalizada
- **WHEN** o administrador acessa o painel de resultados de jogos, insere o placar final oficial de um jogo e clica em salvar
- **THEN** o sistema atualiza o status do jogo para "Finalizado", executa o algoritmo de cálculo de pontuação (RN01) sobre todos os palpites dos usuários para este jogo, atualiza a soma de pontuação de cada usuário e recalcula as colocações da tabela de ranking.
