# Diretrizes de Desenvolvimento Next.js

Este documento estabelece as regras de arquitetura, coesão e a estrutura de pastas padronizada para o desenvolvimento Next.js no projeto, inspiradas na arquitetura do projeto de referência `synit-web-app`.

---

## 1. Estrutura de Pastas (`/src`)

Para garantir consistência, separação clara de responsabilidades e alta escalabilidade, a estrutura de arquivos no diretório `/src` deve seguir a seguinte organização:

### `/src/app`
- **Responsabilidade:** Roteamento de páginas e definição de layouts estruturais utilizando o Next.js **App Router**.
- **Conteúdo:** Layouts (`layout.tsx`), páginas (`page.tsx`), rotas de API (`/api/*`), templates e agrupamentos lógicos de rotas (ex.: `(admin)`).

### `/src/components`
- **Responsabilidade:** Componentes visuais e de interface do usuário (UI).
- **Regra:** Todos os componentes devem ser agrupados em subpastas funcionais e de domínio específicos (ex.: `auth/`, `buttons/`, `carts/`, `forms/`, `inputs/`, `ui/` para elementos base do design system, `sections/`, etc.), em vez de acumular arquivos avulsos na raiz da pasta.

### `/src/hooks`
- **Responsabilidade:** Custom hooks do React para abstração de lógica e estado.
- **Estrutura:**
  - `queries/`: Hooks customizados focados em busca e leitura de dados utilizando **TanStack Query / React Query** (ex.: `useGetProducts.ts`).
  - `mutations/`: Hooks customizados focados em mutações de dados (criação, edição, remoção) utilizando **TanStack Query** (ex.: `useCreateOrder.ts`).
  - Raiz do diretório `/hooks`: Hooks de uso genérico, como comportamento de tela, sessão ou lógica de formulário (ex.: `useBreakPoint.ts`, `useSession.ts`).

### `/src/lib`
- **Responsabilidade:** Instanciação, encapsulamento e configuração de bibliotecas de terceiros ou utilitários globais.
- **Conteúdo:** Adaptadores de comunicação externa, helpers de concatenação de classes (ex.: utilitário `cn` com tailwind-merge) e conexões de APIs. Exemplos: `api-fetch.ts`, `backend-fetch.ts`, `utils.ts`.

### `/src/helpers`
- **Responsabilidade:** Utilitários de lógica pura e independente.
- **Regra:** Funções sem efeitos colaterais e com foco em transformação de dados.
- **Conteúdo:** Formatações de moeda e datas, manipulação de cookies, máscaras de inputs e cálculos matemáticos específicos (ex.: `calculateTotals.ts`, `format-cents-brlformated.ts`, `masks.ts`).

### `/src/providers`
- **Responsabilidade:** Provedores de contexto que devem envolver a árvore de renderização.
- **Conteúdo:** Contextos de tema, autenticação global ou injeção de dependências (ex.: `theme-provider.tsx`, `MultiTenancyProvider.tsx`, `react-query.tsx`).

### `/src/store`
- **Responsabilidade:** Gerenciamento de estado global no lado do cliente.
- **Conteúdo:** Stores da aplicação, preferencialmente implementados com **Zustand** (ex.: `cart-store/`, `checkout-store/`).

### `/src/tests`
- **Responsabilidade:** Testes automatizados da camada da aplicação.
- **Conteúdo:** Testes de unidade e integração (ex.: `tests/unit/*`).

---

## 2. Princípios de Componentes Enxutos (SOLID) e Alta Coesão

Todos os componentes criados devem manter responsabilidades isoladas e dimensões enxutos, seguindo estritamente o princípio da **Alta Coesão**. Isso significa que cada parte do código deve estar no seu respectivo local arquitetural:

*   **Interfaces e Tipos:** Devem ficar isolados na pasta/arquivo de tipos (ex.: `types/`, `.types.ts` ou arquivos de contratos compartilhados em pacotes de domínio). Nunca declare interfaces complexas dentro do arquivo de visualização (JSX/TSX).
*   **Métodos e Ações de UI:** Submissões de formulários, validações, manipulação de estados complexos e disparos de requisições devem ser isolados em **Hooks Customizados** (ex.: `useDeleteAccount.ts`). O componente de UI não deve conhecer detalhes de mutação ou validação direta.
*   **Tratamento de Dados e Formatações:** Formatações de strings, datas, moedas ou manipulações puras de arrays devem ser extraídas para a pasta de **Helpers** (ex.: `/src/helpers/date.ts`).

### Divisão de Responsabilidades no React (SOLID)

1. **S - Single Responsibility Principle (Responsabilidade Única):**
   - Um componente de visualização (UI) tem uma única responsabilidade: renderizar os elementos visuais na tela baseado nas propriedades (props) recebidas ou no hook consumido. Lógicas de negócio ou controle de estado complexos devem ser externalizados.
2. **O - Open/Closed Principle (Aberto/Fechado):**
   - O comportamento interno de um componente de layout ou UI deve ser configurável ou estendível externamente (através de composição de `children` ou padrões polimórficos como o `Slot` do Radix UI) sem que seja necessária a edição de seu código interno original para novos comportamentos simples.
3. **L - Liskov Substitution Principle (Substituição de Liskov):**
   - Seus componentes de UI customizados que envelopam elementos HTML devem poder substituir os elementos nativos sem quebrar o comportamento esperado. Sempre estenda tipos de props nativas do React (ex.: `ComponentPropsWithoutRef<'button'>`).
4. **I - Interface Segregation Principle (Segregação de Interfaces):**
   - Forneça interfaces de propriedades estritamente necessárias ao componente. Não passe objetos gigantescos (como registros inteiros do banco de dados) se o componente precisa apenas de uma propriedade de texto e uma imagem.
5. **D - Dependency Inversion Principle (Inversão de Dependência):**
   - Evite injetar chamadas a bibliotecas HTTP diretamente no corpo visual do componente. Use injeção por propriedades ou hooks customizados para que o componente visual não conheça a origem exata dos dados.

---

## 3. Exemplo Prático de Coesão vs. Baixa Coesão

Para demonstrar a necessidade de isolamento de responsabilidades, considere a criação de um componente para exclusão de conta de usuário.

### ❌ Exemplo de Baixa Coesão (Anti-padrão)
*Nesse exemplo, interfaces, lógica de mutação de API, validações locais de formulário e formatação de datas estão todos misturados dentro da UI:*

```tsx
// @repo/ui/src/components/forms/DeleteAccountBad.tsx
'use client'

import { useState } from 'react'

// INTERFACE NO ARQUIVO DA UI (Incorreto)
interface DeleteUserPayload {
  userId: string
  reason: string
}

export default function DeleteAccountBad() {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  // REQUISIÇÕES E VALIDAÇÃO MISTURADAS COM A UI (Incorreto)
  const handleDelete = async () => {
    if (reason.length < 10) {
      setError('A justificativa deve ter no mínimo 10 caracteres.')
      return
    }
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '123', reason } as DeleteUserPayload)
      })
      if (!response.ok) throw new Error()
      alert('Conta deletada.')
    } catch {
      setError('Erro ao deletar conta.')
    }
  }

  // FORMATAÇÃO DE DATA NA UI (Incorreto)
  const today = new Date().toLocaleDateString('pt-BR')

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-bold">Excluir conta</h3>
      <p className="text-sm text-gray-500">Solicitado em: {today}</p>
      
      <textarea 
        value={reason} 
        onChange={(e) => setReason(e.target.value)} 
        placeholder="Motivo..."
        className="w-full mt-2 border p-2 rounded"
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
      
      <button onClick={handleDelete} className="mt-4 bg-red-600 text-white p-2 rounded">
        Confirmar Exclusão
      </button>
    </div>
  )
}
```

###  Exemplo de Alta Coesão (Recomendado)
*Abaixo, cada elemento assume seu papel em arquivos e pastas específicas de acordo com nossa arquitetura:*

#### 1. Pasta de Tipos (`/src/types/TUser.ts`)
```typescript
// @repo/src/types/user.ts
export interface TUser {
  id: string
  name: string
  email: string
}
```

#### 1.1 Interface Global (`/src/interface/IUser.ts`)
```typescript
// @repo/src/types/user.ts
export interface IDeleteUserPayload {
  userId: string
  reason: string
}
```

#### 2. Pasta de Helpers (`/src/helpers/date.ts`)
```typescript
// @repo/src/helpers/date.ts
export function formatToBRLDate(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}
```

#### 3. Pasta de Hooks Customizados (`/src/hooks/mutations/useDeleteAccount.ts`)
```typescript
// @repo/src/hooks/mutations/useDeleteAccount.ts
'use client'

import { useState } from 'react'
import type { IDeleteUserPayload } from '../../types/user'

export function useDeleteAccount(userId: string) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = (): boolean => {
    if (reason.length < 10) {
      setError('A justificativa deve ter no mínimo 10 caracteres.')
      return false
    }
    setError('')
    return true
  }

  const handleDelete = async () => {
    if (!validate()) return

    try {
      const payload: IDeleteUserPayload = { userId, reason }
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error()
      setIsSuccess(true)
    } catch {
      setError('Erro ao deletar conta. Tente novamente.')
    }
  }

  return {
    reason,
    setReason,
    error,
    isSuccess,
    handleDelete,
  }
}
```

#### 4. Pasta de Componentes (`/src/components/forms/delete-account-form.tsx`)
```tsx
// @repo/ui/src/components/forms/delete-account-form.tsx
'use client'

import { useDeleteAccount } from '../../hooks/mutations/useDeleteAccount'
import { formatToBRLDate } from '../../helpers/date'

interface IDeleteAccountFormProps {
  userId: string
}

export function DeleteAccountForm({ userId }: IDeleteAccountFormProps) {
  const { reason, setReason, error, isSuccess, handleDelete } = useDeleteAccount(userId)
  const requestedAt = formatToBRLDate(new Date())

  if (isSuccess) {
    return <div className="text-green-600 font-medium text-sm">Conta deletada com sucesso.</div>
  }

  return (
    <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Excluir conta</h3>
      <p className="text-xs text-gray-400 mt-1">Solicitado em: {requestedAt}</p>
      
      <textarea 
        value={reason} 
        onChange={(e) => setReason(e.target.value)} 
        placeholder="Por favor, nos informe a justificativa..."
        className="w-full mt-3 border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
      />
      {error && <span className="text-red-600 text-xs mt-1 block">{error}</span>}
      
      <button 
        onClick={handleDelete} 
        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
      >
        Confirmar Exclusão
      </button>
    </div>
  )
}
```

---

## 4. Padrão de Composição (Composite / Compound Pattern)

Para afastar o anti-padrão de **"Prop Soup"** (um único componente gigante aceitando dezenas de propriedades condicionais como `showTitle`, `titleText`, `showFooter`, `closeOnBackdropClick`), **deve-se adotar o Compound Component Pattern**.

Esse padrão permite a distribuição da lógica através de múltiplos subcomponentes que compartilham estado implicitamente por meio de contextos React.

### Vantagens do Padrão
- **Alta Flexibilidade:** Facilidade para reorganizar a árvore do componente sem precisar adicionar novas propriedades configuráveis na API do componente.
- **DX Aprimorada:** O código JSX torna-se autoexplicativo, assemelhando-se à estrutura semântica do HTML (ex.: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`).
- **Respeito aos Limites de Renderização (Server vs. Client):** O componente raiz pode conter estado ('use client') enquanto seus filhos ou o próprio conteúdo podem ser renderizados diretamente no servidor (Server Components), maximizando o desempenho sem quebrar os limites de serialização.

*Para ler mais detalhes sobre as regras de composição recomendadas pela Vercel, acesse:*
👉 [Vercel Academy - Next.js Component Composition Patterns](https://vercel.com/academy/nextjs-foundations/component-composition-patterns)

### Exemplo Prático de Implementação (Modal/Dialog)

```tsx
// @repo/ui/src/components/dialog.tsx
'use client'

import React, { createContext, useContext, useState } from 'react'
import { createPortal } from 'react-dom'

// 1. Criação do contexto para manter o estado local de controle
const DialogContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
} | null>(null)

export function DialogRoot({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

// 2. Criação dos subcomponentes para compor o elemento final
export function DialogTrigger({ children }: { children: React.ReactElement }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogTrigger deve estar dentro de DialogRoot')

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      context.setIsOpen(true)
    }
  })
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogContent deve estar dentro de DialogRoot')

  if (!context.isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-col gap-1.5">{children}</div>
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900 leading-none">{children}</h3>
}

export function DialogClose({ children }: { children: React.ReactElement }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogClose deve estar dentro de DialogRoot')

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      context.setIsOpen(false)
    }
  })
}

// 3. Export namespaced para facilidade de importação
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Close: DialogClose,
}
```

### Exemplo de Consumo

```tsx
import { Dialog } from '@repo/ui/components/dialog'

export default function Home() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium">
          Deletar conta
        </button>
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Confirmar exclusão de conta?</Dialog.Title>
        </Dialog.Header>

        <p className="text-gray-600 text-sm mb-6">
          Ao confirmar, todos os seus dados serão apagados permanentemente dos nossos servidores.
        </p>

        <div className="flex justify-end gap-3">
          <Dialog.Close>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm">
              Cancelar
            </button>
          </Dialog.Close>
          <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium text-sm">
            Excluir permanentemente
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
```
