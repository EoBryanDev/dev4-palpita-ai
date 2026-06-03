# design - private-area

## Context
A área privada exige um controle rígido de segurança para proteger as páginas `/meu-espaço` (competidores) e `/admin` (administração). É necessário implementar um fluxo de autenticação e proteção de rotas via Middleware do Next.js, além de transações seguras no banco de dados PostgreSQL para lançamento de resultados e recálculo das pontuações em massa de todos os palpites.

## Goals / Non-Goals

**Goals:**
- Implementar autenticação e controle de rotas protegidas (Middleware) diferenciando papéis (`role`: `ADMIN` vs `USER`).
- Desenvolver o dashboard `/meu-espaço`, permitindo visualização de pontos, pendências de palpites e histórico.
- Implementar o formulário de palpites futuros com restrições de prazo (RN02) e liberação administrativa (RN05).
- Desenvolver o painel `/admin` com gestão de convites (RN04), controle de usuários, cadastro de partidas e lançamento de resultados que executam o recálculo dinâmico das pontuações.

**Non-Goals:**
- Adicionar gateways de pagamentos ou envio automático de e-mails em produção (o envio será simulado localmente).

## Decisions

1. **Proteção de Rotas com Middleware do Next.js**:
   - Criaremos um `middleware.ts` na raiz do Next.js que interceptará requisições para `/meu-espaço/:path*` e `/admin/:path*`.
   - Se o token de sessão ou cookie estiver ausente, redireciona para `/login`. Se o usuário tentar acessar `/admin/*` e não possuir a role `ADMIN`, redireciona para `/meu-espaço`.
   - *Alternativa considerada*: Proteção apenas no nível de página (Server Components). Rationale: O Middleware do Next.js é executado na borda (edge) e impede que o HTML ou os pacotes de páginas privadas sejam servidos para agentes não autenticados, oferecendo maior segurança e menor tempo de resposta.

2. **Cálculo de Pontuação e Ranking Transacional**:
   - O lançamento de um resultado oficial e o recálculo dos pontos dos palpites dos competidores associados àquela partida serão executados dentro de uma transação PostgreSQL única (`db.transaction`), garantindo consistência atômica.
   - *Alternativa considerada*: Processar palpites um a um no backend de forma assíncrona fora de transação. Rationale: Riscos de falhas parciais que deixariam o ranking inconsistente inviabilizam processamentos sem atomicidade.

3. **Validação de Palpites no Servidor**:
   - A Server Action de salvamento de palpites sempre confrontará o horário do servidor (UTC) com a data/hora cadastrada do início do jogo antes de gravar ou atualizar o palpite (RN02).
   - O status de liberação do usuário (`status: 'Liberado'`) também será verificado antes de qualquer gravação (RN05).

## Risks / Trade-offs

- **Risco (Concorrência/Gargalo no Recálculo)**: O processamento em massa de centenas de palpites de usuários no banco Neon PostgreSQL pode estourar o limite de tempo em conexões serverless.
  - *Mitigação*: Faremos buscas otimizadas no Drizzle ORM trazendo apenas os palpites ativos associados ao jogo finalizado e utilizaremos queries em lote (upserts otimizados) para recálculo veloz.
