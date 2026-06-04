## Why

Implementar a Área Privada do Bolão Copa 2026, permitindo que os competidores logados façam e gerenciem seus palpites futuros (Jornada 2), acompanhem suas pendências e visualizem seu histórico. Também compreende a Área Administrativa (`/admin`) para gestão de usuários, convites, jogos e o lançamento de resultados que atualizam o ranking de forma automática (Jornada 3).

## What Changes

- **Área Privada do Usuário**:
  - Dashboard `/meu-espaço`: Exibe resumo de pontuação, posição no ranking e histórico de palpites anteriores.
  - Painel de Palpites: Tela de preenchimento/edição de palpites para jogos futuros.
  - Visualizador de Pendências: Destaque de partidas da rodada que ainda não receberam palpite.
- **Área Administrativa (`/admin`)**:
  - Painel de Solicitações: Aprovação/rejeição de convites e geração automatizada de links de validação.
  - Gestão de Jogos e Rodadas: Cadastro/edicao de partidas, horários, times e fases de rodadas.
  - Gestão de Usuários: Liberação de palpites (RN05) e controle ativo/inativo.
  - Lançamento de Resultados: Registro de placar oficial e recálculo em lote de pontos (RN01) e atualização do ranking.
- **Mecanismos de Segurança**:
  - Restrição de acesso a rotas `/admin/*` e `/meu-espaço/*` baseada em sessões autenticadas.
  - Validação estrita de limites de horário (RN02) e permissões de apostas (RN05).

## Capabilities

### New Capabilities
- `area-privada-dashboard`: Dashboard `/meu-espaço` contendo estatísticas pessoais, visualizador de pendências e histórico de palpites.
- `area-privada-palpites`: Formulário de palpites futuros com validação de status de liberação (RN05) e limite de horário de início do jogo (RN02).
- `area-admin-usuarios`: Moderação administrativa de convites, disparo de links e gerenciamento de permissão de aposta ("Liberado" / "Pendente").
- `area-admin-partidas`: Gestão de rodadas, jogos e inserção de resultados oficiais com processamento automático de recálculo de pontos (RN01).

### Modified Capabilities
<!-- Nenhuma modificação a nível de requisitos em especificações existentes é necessária para esta fase. -->

## Impact

- **Segurança**: Middleware ou serviço de validação de rotas do Next.js para proteger `/meu-espaço` e `/admin`.
- **Banco de Dados**: Mutação em lote de palpites e transações de recálculo de pontuações de usuários pós-jogo.
- **Ações e Serviços**: Criação de Server Actions para realizar palpites, moderar usuários e lançar resultados oficiais de jogos.
