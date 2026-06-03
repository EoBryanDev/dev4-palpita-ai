# area-publica-navegacao Specification

## Purpose
Garantir que os usuários possam navegar pelas páginas públicas da aplicação (Home, Agenda, Seleções, Chaves e Login) sob uma interface de alta fidelidade visual (premium), responsiva e de fácil acessibilidade.

## ADDED Requirements

### Requirement: Toggle de Tema Global (Claro/Escuro)
O sistema DEVE disponibilizar um controle de toggle de tema acessível de forma global que alterne instantaneamente as cores do app entre Light Theme (Claro) e Dark Theme (Escuro).

#### Scenario: Alternar tema ativo
- **WHEN** o usuário clica no toggle de tema na barra de navegação pública
- **THEN** o sistema aplica a classe CSS correspondente, atualizando os tokens de cores do Tailwind e persistindo a escolha do usuário no LocalStorage.

### Requirement: Botão de Voltar ao Topo
O sistema DEVE exibir um botão flutuante rápido para retornar ao topo da página quando o usuário rolar páginas longas (como agenda ou ranking).

#### Scenario: Rolagem de página longa
- **WHEN** a rolagem vertical da tela ultrapassa 300px da altura inicial
- **THEN** o botão de voltar ao topo torna-se visível de forma suave e, ao ser clicado, rola a janela de volta para o topo (y=0) com animação suave (smooth scroll).

### Requirement: Roteamento da Área Pública
O sistema DEVE fornecer as páginas públicas descritas no PRD nas seguintes rotas: `/home` (ou `/`), `/agenda`, `/times`, `/chaves` e `/login`.

#### Scenario: Acesso às rotas sem autenticação
- **WHEN** um visitante acessa qualquer uma das rotas `/home`, `/agenda`, `/times`, `/chaves` ou `/login` sem estar autenticado
- **THEN** o sistema permite a visualização normal de todo o conteúdo da rota pública sem realizar qualquer redirecionamento para login.
