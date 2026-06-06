## 1. Setup e Organização de Pastas

- [x] 1.1 Garantir a criação das pastas `/src/types` e `/src/interface` dentro do app `apps/web/src` se não existirem
- [x] 1.2 Mover a store do Zustand de `apps/web/src/lib/store/ui.ts` para `apps/web/src/store/ui-store.ts` e ajustar os imports no componente `ThemeToggle`

## 2. Centralização de Helpers de Formatação

- [x] 2.1 Criar o arquivo de utilitários `apps/web/src/helpers/date.ts`
- [x] 2.2 Migrar formatações de data e configurações de fuso horário de São Paulo para `date.ts`
- [x] 2.3 Substituir a lógica de formatação de data inline de `app/agenda/page.tsx`, `components/dashboard-palpites.tsx` e `app/home/page.tsx` pelos helpers centralizados

## 3. Segregação de Tipos e Interfaces

- [x] 3.1 Extrair as interfaces `IPartidaDashboard` e `IHistoricoDashboard` do componente `dashboard-palpites.tsx` para o arquivo `apps/web/src/interface/IDashboard.ts`
- [x] 3.2 Extrair `IPartidaFormatada` do arquivo `app/agenda/page.tsx` para `apps/web/src/interface/IPartida.ts`
- [x] 3.3 Extrair `IHomePartida` do arquivo `app/home/page.tsx` para `apps/web/src/interface/IPartida.ts`

## 4. Extração de Hooks Customizados (Comportamento)

- [ ] 4.1 Criar o hook `apps/web/src/hooks/use-solicitar-convite.ts` e mover toda a lógica de estado, loading e chamada de Server Action do componente `SolicitarConviteForm`
- [ ] 4.2 Criar o hook `apps/web/src/hooks/use-login-form.ts` e mover estados, lógica de validação de login e chamada da Action do componente `LoginForm`
- [ ] 4.3 Criar o hook `apps/web/src/hooks/use-countdown.ts` e extrair o cálculo matemático do cronômetro de início da Copa do componente `TimeoutBanner`
- [ ] 4.4 Criar o hook `apps/web/src/hooks/use-dashboard-palpites.ts` e extrair a manipulação de matriz de palpites, transições de gravação da Server Action e encerramento de sessão de `DashboardPalpites`

## 5. Testes e Validação Final

- [ ] 5.1 Executar a suíte de testes unitários do frontend (`pnpm test`) para garantir regressão zero
- [ ] 5.2 Executar o linter e o formatador (`pnpm lint` e `pnpm format`) para validação estética
