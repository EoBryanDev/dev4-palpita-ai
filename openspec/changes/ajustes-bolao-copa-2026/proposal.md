## Why

O bolão atual da Copa 2026 precisa de ajustes para melhorar a experiência competitiva, alinhar as regras de pontuação à prática comum de bolões (acertos exatos valem mais), exibir as estimativas reais de prêmio com base nos participantes, corrigir a representação de bandeiras de países em navegadores Windows e garantir que os palpites sejam finalizados rigorosamente antes do início de cada rodada.

## What Changes

- **Alteração na Pontuação de Palpites:** Palpites com placar exato passam a valer 2 pontos; acertos apenas de vencedor ou empate (mas com placar incorreto) continuam valendo 1 ponto; erros totais valem 0 pontos.
- **Tabela de Distribuição do Prêmio:** Exibição da distribuição do prêmio acumulado em uma nova tabela à direita das regras na página inicial, dividida em: 1º Lugar (70%), 2º Lugar (20%) e 3º Lugar (10%), com cálculos em reais estimados em tempo real.
- **Filtro de Administrador no Ranking:** Usuários com cargo `ADMIN` serão omitidos da listagem de classificação geral.
- **Status de Competição Pendente:** Caso nenhum competidor possua pontos acumulados, a exibição do pódio será suspensa e substituída por uma indicação visual de "Aguardando competição iniciar".
- **Limite de Palpites e Countdown:** O banner de contagem regressiva e a validação de palpites passarão a operar com base no início de cada rodada. Os palpites serão bloqueados 30 minutos antes do início da primeira partida da rodada ativa.
- **Componente para Bandeiras:** Substituição dos emojis unicode nativos por componentes de imagem SVG/PNG da FlagCDN para assegurar que as bandeiras dos países sejam renderizadas perfeitamente no Chrome e Edge sob sistemas operacionais Windows.
- **Hero Festiva:** Aplicação de assets de logos e decorações gráficas festivas da Copa do Mundo na seção Hero da Home.

## Capabilities

### New Capabilities

*(Nenhuma nova capacidade criada do zero)*

### Modified Capabilities

- `dominio-core`: Atualização das regras de pontuação (2 pontos para placar exato, 1 ponto para resultado geral e 0 pontos para erro).
- `area-privada-palpites`: Alteração no fluxo e validação de prazos de palpites, introduzindo o limite de 30 minutos antes do primeiro jogo da rodada e bloqueio correspondente no dashboard.
- `area-publica-dados`: Ajustes no ranking (exclusão de administradores, exibição de estado aguardando início) e exibição das bandeiras via FlagCDN em toda a aplicação.

## Impact

- **Banco de Dados / Lógica de Negócio:** Alteração no cálculo de pontuação no ranking geral e histórico individual de palpites do competidor.
- **Interfaces do Usuário (UI):** Alterações na Home (hero, regulamento e prêmios), no Layout principal (TimeoutBanner com nova lógica), no Painel de Palpites (bloqueio por rodada e desativação de inputs) e na página de Classificação (pódio/tabela de ranking).
- **APIs:** Mudança na validação em `/api/palpites` e `/api/ranking`.
