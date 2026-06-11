# PRD — Bolão Copa 2026

## 1. Visão Geral

| Campo                 | Descrição                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Produto**           | Bolão Copa 2026                                                                                                                               |
| **Tipo**              | Web App Responsivo                                                                                                                            |
| **Proposta de valor** | Promover integração e engajamento entre colaboradores de uma empresa durante a Copa de 2026 através de uma plataforma interativa de palpites. |
| **Modelo de negócio** | Interno / Corporativo                                                                                                                         |
| **Meio de pagamento** | Controle manual de contribuição pelo Administrador (Sem gateway de pagamento)                                                                 |
| **Versão**            | 1.0                                                                                                                                           |
| **Data**              | Junho de 2026                                                                                                                                 |

A plataforma de palpites para a Copa de 2026 foi concebida para atender à necessidade de engajamento social em ambientes de trabalho. O sistema permite que visitantes solicitem convites, registrem palpites sobre os placares das partidas após aprovação, acompanhem estatísticas de apostas coletivas e visualizem um ranking atualizado dinamicamente à medida que os resultados dos jogos de futebol são inseridos pelo administrador.

---

## 2. Problema

A ausência de uma ferramenta integrada e dedicada para a realização de bolões corporativos resulta em processos manuais e descentralizados (como o uso de planilhas e mensagens de texto), o que reduz a adesão dos colaboradores, aumenta a margem de erro na contagem de pontos e dificulta a visualização transparente do ranking e das estatísticas das partidas em tempo real.

---

## 3. Personas

| Persona                      | Descrição                                                                                                           | Necessidade principal                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Fulano** (O Competidor)    | Colaborador que acompanha o futebol de perto e quer provar seus conhecimentos para os colegas de trabalho.          | Visualização clara do ranking atualizado, regras de pontuação explícitas e facilidade para revisar palpites de rodadas futuras.                                    |
| **Mariana** (A Casual)       | Colaboradora que participa do bolão com o objetivo de integração social, mas sem acompanhar o futebol no dia a dia. | Uma interface extremamente intuitiva, lembretes de pendências de palpites e facilidade para registrar seus palpites sem atritos.                                   |
| **Administrador** (O Gestor) | Responsável pela moderação do bolão e validação da participação financeira e dos resultados dos jogos.              | Ferramenta simples para aprovação rápida de convites, liberação manual de acessos e inserção de resultados oficiais para recalcular o ranking de forma automática. |

---

## 4. Funcionalidades

### 4.1 Interface Global e Navegação

| Funcionalidade              | Descrição                                                                                              | Prioridade |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| **Banner de Timeout**       | Banner no topo do site mostrando um cronômetro regressivo para o bloqueio de palpites da rodada atual. | Alta       |
| **Toggle de Tema**          | Alternador visual rápido entre os modos Light Theme (Claro) e Dark Theme (Escuro).                     | Média      |
| **Botão de Voltar ao Topo** | Botão flutuante rápido para retornar ao topo de páginas longas.                                        | Baixa      |

### 4.2 Área Pública (Sem Autenticação)

| Funcionalidade         | Descrição                                                                                                                                                                                     | Prioridade |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Página `/home`**     | Apresenta a seção Hero com imagem temática de futebol, CTA ("Peça seu convite") para formulário de interesse, explicação das regras de pontuação, partidas ao vivo e lista de próximos jogos. | Alta       |
| **Página `/agenda`**   | Calendário interativo que lista partidas por dia selecionado.                                                                                                                                 | Média      |
| **Página `/times`**    | Lista completa e visual das seleções que participam da Copa de 2026.                                                                                                                          | Baixa      |
| **Página `/chaves`**   | Visualização do chaveamento de grupos e cruzamentos do mata-mata.                                                                                                                             | Média      |
| **Página `/ranking`**  | Classificação em formato de lista com a pontuação e ranking dos usuários cadastrados.                                                                                                         | Alta       |
| **Página `/palpites`** | Analytics de dados agregados com as porcentagens e volumes de palpites para jogos específicos.                                                                                                | Média      |
| **Página `/login`**    | Acesso para os usuários e o administrador realizarem autenticação.                                                                                                                            | Alta       |

### 4.3 Área Privada (Com Autenticação - Usuários)

| Funcionalidade                 | Descrição                                                                                                       | Prioridade |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------- |
| **Dashboard `/meu-espaço`**    | Central do usuário contendo uma visualização resumida de seus pontos e posição no ranking.                      | Alta       |
| **Fazer/Alterar Palpites**     | Tela que permite preencher e atualizar placares dos jogos futuros (somente para usuários liberados pelo Admin). | Alta       |
| **Visualizador de Pendências** | Destaque visual indicando jogos que o usuário ainda não palpitou na rodada atual.                               | Alta       |
| **Histórico de Palpites**      | Lista de palpites passados do usuário com seus respectivos resultados e pontuações obtidas.                     | Média      |

### 4.4 Área Administrativa (Acesso `/admin`)

| Funcionalidade                  | Descrição                                                                                                                     | Prioridade |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Dashboard**                   | Tela administrativa que exibe resumo de cadastros e status geral de envios de palpites.                                       | Média      |
| **Gestão de Solicitações**      | Tela para aprovar ou rejeitar solicitações de convites de novos usuários.                                                     | Alta       |
| **Disparo de Convites**         | Geração automática de link de convite por e-mail com validade estrita de 5 minutos para o usuário criar sua senha.            | Alta       |
| **Cadastro de `/jogos`**        | Painel para gerenciar os horários, datas e times que disputam cada partida.                                                   | Alta       |
| **Criação de `/rodadas`**       | Definição das rodadas de palpites (como separação de fases de grupos e eliminatórias).                                        | Alta       |
| **Gestão de `/usuarios`**       | Tela de gerenciamento para ativar/inativar usuários e alternar o status entre "Pendente" e "Liberado" para realizar palpites. | Alta       |
| **Lançamento de `/resultados`** | Campo para inserção do placar oficial pós-partida e processamento automatizado da pontuação e ranking.                        | Alta       |

---

## 5. Jornadas do Usuário

### Jornada 1 — Acesso ao Bolão (Do interesse ao Cadastro)

1. O visitante acessa a `/home` e clica no botão "Peça seu convite".
2. O visitante insere seu e-mail e envia a solicitação de interesse.
3. O administrador recebe a solicitação no painel `/admin/solicitacoes` e a aprova.
4. O sistema gera um link temporário exclusivo e o envia ao e-mail informado.
5. O usuário clica no link enviado (antes de expirar o prazo de 5 minutos), define uma senha e conclui o cadastro de seu perfil.

### Jornada 2 — Realização de Palpites no "Meu Espaço"

1. O usuário devidamente cadastrado e autenticado clica na seção `/meu-espaço`.
2. O painel aponta que ele possui palpites pendentes para a próxima rodada de jogos.
3. Se o administrador tiver alterado seu status para "Liberado", o usuário preenche os placares desejados e clica em salvar.
4. O usuário visualiza a confirmação de que seus palpites foram registrados com sucesso.

### Jornada 3 — Fechamento da Rodada e Atualização do Ranking

1. Uma partida da Copa de 2026 chega ao fim.
2. O administrador acessa `/admin/resultados` e preenche o placar definitivo da partida.
3. O sistema roda o algoritmo de validação de pontos sobre todos os palpites registrados para o respectivo jogo.
4. Os pontos dos usuários são somados e a página pública `/ranking` é atualizada instantaneamente com as novas colocações.

---

## 6. Regras de Negócio

| #        | Regra                                                                                                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN01** | **Cálculo de Pontuação:** Se o usuário acertar o placar exato do jogo (acerto na mosca, incluindo empates), ganha 2 pontos. Se o usuário errar o placar exato, mas acertar o vencedor ou a ocorrência de empate, ganha 1 ponto. Se errar tudo, ganha 0 pontos.                                                      |
| **RN02** | **Bloqueio Automático de Palpites:** O formulário de preenchimento de palpite de um jogo é desativado para todos os usuários no minuto exato cadastrado como o de início real do jogo.                                                                                                                              |
| **RN03** | **Segurança e Analytics de Palpites:** No módulo público `/palpites`, os dados de percentual coletivo (analytics) podem ser vistos livremente. Os palpites individuais de cada usuário (quem apostou em qual placar específico) só se tornam visíveis aos demais participantes após o início da respectiva partida. |
| **RN04** | **Expiração de Convite:** O link para definição de senha enviado na aprovação de cadastro expira em exatamente 5 minutos após o disparo.                                                                                                                                                                            |
| **RN05** | **Liberação Condicionada de Palpites:** Os usuários só têm permissão para gravar palpites no sistema se seu status de usuário estiver definido como "Liberado" pelo Administrador (indicando confirmação de adesão/contribuição).                                                                                   |

---

## 7. Métricas de Sucesso

| Métrica                           | Descrição                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Taxa de Conversão de Convites** | Percentual de solicitações de interesse que de fato completam o processo de cadastro de senha em até 5 minutos. |
| **Adesão Geral do Time**          | Percentual total de colaboradores da empresa que se cadastraram no bolão.                                       |
| **Média de Palpites por Usuário** | Quantidade média de palpites válidos salvos por usuário cadastrado a cada rodada.                               |
| **Visualizações no Ranking**      | Total de acessos diários na página `/ranking` (indica retenção e engajamento).                                  |

---

## 8. Fora de Escopo (v1)

- Integração com APIs externas automatizadas para cadastro de jogos ou atualização em tempo real de resultados esportivos.
- Gateway de pagamento integrado (ex: Pix, cartões) para cobrança de taxas de inscrição do bolão de forma direta.
- Aplicação móvel nativa hospedada em lojas digitais (Google Play Store ou Apple App Store).

---

## 9. Requisitos Não-Funcionais

| Requisito           | Descrição                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance**     | Carregamento da página de `/ranking` em menos de 2 segundos, utilizando estratégias de cache para suportar acessos simultâneos de colaboradores pós-jogos. |
| **Segurança**       | Criptografia de senhas (ex: hashing usando bcrypt) e restrição total de acessos às rotas iniciadas em `/admin` para contas sem privilégio administrativo.  |
| **Responsividade**  | Interface web totalmente responsiva com priorização de design focado em navegação por smartphones (Mobile-First).                                          |
| **Disponibilidade** | Arquitetura web configurada para manter o serviço online continuamente durante os picos de tráfego que ocorrem no mês de Junho de 2026.                    |