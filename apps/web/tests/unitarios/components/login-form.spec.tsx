import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { loginUsuario } from '@/app/actions/auth';
import { LoginForm } from '@/components/form/login-form';

const mockPush = vi.fn();
const mockQueryClear = vi.fn();

vi.mock('@/app/actions/auth', () => ({
  loginUsuario: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockQueryClear,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(localStorage, 'setItem');
  });

  it('deve renderizar campos de login', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/^E-mail$/i)).toBeDefined();
    expect(screen.getByLabelText(/^Senha$/i)).toBeDefined();
    expect(screen.getByLabelText(/Lembrar de mim/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Entrar na plataforma/i }),
    ).toBeDefined();
  });

  it('deve exibir erro se o e-mail estiver vazio', async () => {
    render(<LoginForm />);

    const submitBtn = screen.getByRole('button', {
      name: /Entrar na plataforma/i,
    });

    fireEvent.click(submitBtn);

    expect(await screen.findByText(/O e-mail é obrigatório/i)).toBeDefined();
    expect(loginUsuario).not.toHaveBeenCalled();
  });

  it('deve exibir erro se a senha estiver vazia', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^E-mail$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Entrar na plataforma/i,
    });

    fireEvent.change(emailInput, { target: { value: 'teste@empresa.com' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/A senha é obrigatória/i)).toBeDefined();
    expect(loginUsuario).not.toHaveBeenCalled();
  });

  it('deve chamar loginUsuario e mostrar erro em caso de falha', async () => {
    (loginUsuario as Mock).mockResolvedValueOnce({
      success: false,
      message: 'Credenciais inválidas.',
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^E-mail$/i);
    const senhaInput = screen.getByLabelText(/^Senha$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Entrar na plataforma/i,
    });

    fireEvent.change(emailInput, { target: { value: 'teste@empresa.com' } });
    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(loginUsuario).toHaveBeenCalledWith(
        'teste@empresa.com',
        'senha123',
      );
    });

    expect(await screen.findByText(/Credenciais inválidas/i)).toBeDefined();
  });

  it('deve redirecionar colaborador para /meu-espaco após login bem-sucedido', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (loginUsuario as Mock).mockResolvedValueOnce({
      success: true,
      message: 'Sucesso!',
      user: {
        id: '1',
        nome: 'User',
        email: 'user@empresa.com',
        cargo: 'COLABORADOR',
      },
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^E-mail$/i);
    const senhaInput = screen.getByLabelText(/^Senha$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Entrar na plataforma/i,
    });

    fireEvent.change(emailInput, { target: { value: 'user@empresa.com' } });
    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => expect(loginUsuario).toHaveBeenCalled());

    await vi.advanceTimersByTimeAsync(1500);

    expect(mockPush).toHaveBeenCalledWith('/meu-espaco');
    vi.useRealTimers();
  });

  it('deve redirecionar admin para /admin após login bem-sucedido', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (loginUsuario as Mock).mockResolvedValueOnce({
      success: true,
      message: 'Sucesso!',
      user: {
        id: '2',
        nome: 'Admin',
        email: 'admin@empresa.com',
        cargo: 'ADMIN',
      },
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^E-mail$/i);
    const senhaInput = screen.getByLabelText(/^Senha$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Entrar na plataforma/i,
    });

    fireEvent.change(emailInput, { target: { value: 'admin@empresa.com' } });
    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => expect(loginUsuario).toHaveBeenCalled());

    await vi.advanceTimersByTimeAsync(1500);

    expect(mockPush).toHaveBeenCalledWith('/admin');
    vi.useRealTimers();
  });

  it('deve chamar queryClient.clear() após login bem-sucedido para evitar dados obsoletos', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (loginUsuario as Mock).mockResolvedValueOnce({
      success: true,
      message: 'Sucesso!',
      user: {
        id: '1',
        nome: 'User',
        email: 'user@empresa.com',
        cargo: 'COLABORADOR',
      },
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^E-mail$/i);
    const senhaInput = screen.getByLabelText(/^Senha$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Entrar na plataforma/i,
    });

    fireEvent.change(emailInput, { target: { value: 'user@empresa.com' } });
    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => expect(loginUsuario).toHaveBeenCalled());

    await vi.advanceTimersByTimeAsync(1500);

    expect(mockQueryClear).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
