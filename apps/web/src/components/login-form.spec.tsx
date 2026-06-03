import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { loginUsuario } from '@/app/actions/auth';
import { LoginForm } from './login-form';

vi.mock('@/app/actions/auth', () => ({
  loginUsuario: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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

  it('deve chamar loginUsuario, armazenar no localStorage se lembrarMe for true, e mostrar sucesso', async () => {
    (loginUsuario as Mock).mockResolvedValueOnce({
      success: true,
      message: 'Sucesso!',
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^E-mail$/i);
    const senhaInput = screen.getByLabelText(/^Senha$/i);
    const lembrarCheckbox = screen.getByLabelText(/Lembrar de mim/i);
    const submitBtn = screen.getByRole('button', {
      name: /Entrar na plataforma/i,
    });

    fireEvent.change(emailInput, { target: { value: 'lembrar@empresa.com' } });
    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.click(lembrarCheckbox);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(loginUsuario).toHaveBeenCalledWith(
        'lembrar@empresa.com',
        'senha123',
      );
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'palpita_user_email',
      'lembrar@empresa.com',
    );
    expect(await screen.findByText(/Bem-vindo de volta!/i)).toBeDefined();
  });
});
