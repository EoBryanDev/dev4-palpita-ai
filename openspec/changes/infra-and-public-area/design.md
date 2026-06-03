# design - infra-and-public-area

## Context
A aplicação `@palpita/web` necessita de uma fundação sólida de controle de estado. Zustand gerenciará dados de UI (como o alternador de temas claro/escuro e modais) e o TanStack Query gerenciará o cache, as buscas e as revalidações assíncronas do lado do cliente (como o ranking e dados de palpites).
Além disso, precisamos criar as telas públicas: Home, Agenda, Times, Chaves, Ranking, Estatísticas de Palpites e Login.
Por fim, no fluxo de solicitação e validação de convites, precisamos persistir e processar os tokens na rota `/validation-user/[id]`, validando o tempo limite de 5 minutos, e salvando o hash da senha de forma segura no banco de dados corporativo local.

## Goals / Non-Goals

**Goals:**
- Configurar TanStack Query (QueryClientProvider) e Zustand na aplicação Next.js.
- Ajustar `biome.json` para ignorar a pasta `.turbo` em testes e builds.
- Implementar as rotas públicas de navegação `/`, `/agenda`, `/times`, `/chaves`, `/ranking`, `/palpites` e `/login` com visual premium responsivo (Mobile-First) e toggle de tema.
- Implementar o fluxo transacional robusto de solicitação de convite e ativação do usuário com expiração de 5 minutos e hash de senha via `bcryptjs`.

**Non-Goals:**
- Implementar as rotas privadas `/meu-espaço`, `/admin` ou as Server Actions de controle do administrador (esses itens serão desenvolvidos na change seguinte).
- Integração de gateways de pagamento ou APIs esportivas externas.

## Decisions

1. **Zustand para Estado de UI**:
   - Criaremos uma store `useUiStore` para armazenar o tema (`theme: 'light' | 'dark'`), a visibilidade de barras de navegação ou modais, persistindo o tema no LocalStorage de forma simples.
   - *Alternativa considerada*: Usar Context API do React. Rationale: Zustand é mais limpo, evita re-renderizações desnecessárias e tem suporte robusto fora da árvore do React.

2. **TanStack Query para Estado do Servidor**:
   - Envolveremos o layout com um QueryClientProvider customizado (client component) e criaremos hooks para buscar o ranking e os analytics agregados.
   - *Alternativa considerada*: Usar apenas Server Actions/fetch nativo do Next.js. Rationale: TanStack Query nos dá controle fácil de staleTime, refetchOnWindowFocus e cache eficiente, garantindo que o ranking atualize rapidamente e de forma performática.

3. **Criptografia de Senhas**:
   - Usaremos `bcryptjs` no servidor (dentro das Server Actions de cadastro) para gerar o hash seguro das senhas dos usuários.
   - *Alternativa considerada*: `crypto` nativo do Node. Rationale: `bcryptjs` é o padrão ouro aceito pela indústria para hashing de senhas.

4. **Visual Premium e Toggle de Tema**:
   - Utilizaremos componentes do `shadcn/ui` baseados no Tailwind CSS.
   - A paleta de cores será HSL dinâmico baseado na Copa 2026 (verde, dourado, azul marinho) com transições suaves e modo escuro nativo.
   - Um botão flutuante de Voltar ao Topo aparecerá suavemente após 300px de rolagem.

## Risks / Trade-offs

- **Risco (Hydration Mismatch)**: Erro de hidratação ao usar Zustand ou ao renderizar elementos sensíveis ao tema antes do render inicial completo.
  - *Mitigação*: Utilizar um useEffect no client component para renderizar o toggle apenas após a montagem no cliente, ou usar o padrão de supressão de aviso de hidratação apropriado.
- **Risco (Expiração de Token)**: Token de convite expirar durante a digitação de uma senha complexa.
  - *Mitigação*: A validação de expiração contra o banco de dados é feita no envio (submit) do formulário, e exibiremos um aviso na tela caso o token já esteja prestes a expirar.
