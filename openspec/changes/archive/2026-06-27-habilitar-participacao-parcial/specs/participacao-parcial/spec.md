# participacao-parcial Specification

## Purpose
Permitir que usuários que entraram no bolão após a Copa ter começado sejam liberados pelo admin para palpitar apenas nas partidas que ainda não aconteceram, com uma janela de 30 minutos.

## Requirements

### Requirement: Janela de 30 min para palpites tardios
Usuários liberados via "Liberar Acesso Tardio" DEVE ter exatamente 30 minutos a partir da `dataLiberacao` para enviar seus palpites.

#### Scenario: Janela de 30 minutos contada a partir da liberação
- **WHEN** o admin libera um usuário às 14:00
- **THEN** o usuário pode palpitar até às 14:30, e apenas em partidas com `dataInicio` posterior ao horário atual.

### Requirement: Filtro de partidas disponíveis
O dashboard do usuário com `dataLiberacao` DEVE exibir apenas partidas que ainda não iniciaram (`dataInicio > now`).

#### Scenario: Usuário tardio vê apenas partidas futuras
- **WHEN** um usuário com `dataLiberacao` acessa o "Meu Espaço"
- **THEN** o sistema exibe apenas as partidas com `dataInicio` futuro, ocultando partidas já iniciadas ou finalizadas.

### Requirement: Banner informativo de prazo
O usuário com `dataLiberacao` DEVE ver um banner no topo do dashboard informando que tem 30 minutos para palpitar.

#### Scenario: Exibição de banner de prazo
- **WHEN** um usuário com `dataLiberacao` acessa o "Meu Espaço" e ainda está dentro da janela de 30 min
- **THEN** o sistema exibe um banner destacado com contagem regressiva.

#### Scenario: Banner de prazo expirado
- **WHEN** um usuário com `dataLiberacao` acessa o "Meu Espaço" após os 30 min
- **THEN** o sistema exibe um banner informando que o prazo expirou e desabilita todos os inputs.
