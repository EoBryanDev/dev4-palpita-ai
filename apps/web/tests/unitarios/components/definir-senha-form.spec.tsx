import { cadastrarSenha } from '@/app/actions/convites';
import { DefinirSenhaForm } from '@/components/form/definir-senha-form';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/app/actions/convites', () => ({
  cadastrarSenha: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('DefinirSenhaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar campos de senha', () => {
    render(<DefinirSenhaForm tokenId="token-123" />);

    expect(screen.getByLabelText(/^Nova Senha$/i)).toBeDefined();
    expect(screen.getByLabelText(/^Confirmar Nova Senha$/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Salvar Senha e Ativar/i }),
    ).toBeDefined();
  });

  it('deve exibir erro se as senhas não coincidirem', async () => {
    render(<DefinirSenhaForm tokenId="token-123" />);

    const senhaInput = screen.getByLabelText(/^Nova Senha$/i);
    const confirmarInput = screen.getByLabelText(/^Confirmar Nova Senha$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Salvar Senha e Ativar/i,
    });

    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.change(confirmarInput, { target: { value: 'diferente' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/As senhas não coincidem/i)).toBeDefined();
    expect(cadastrarSenha).not.toHaveBeenCalled();
  });

  it('deve exibir erro se a senha tiver menos de 6 caracteres', async () => {
    render(<DefinirSenhaForm tokenId="token-123" />);

    const senhaInput = screen.getByLabelText(/^Nova Senha$/i);
    const confirmarInput = screen.getByLabelText(/^Confirmar Nova Senha$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Salvar Senha e Ativar/i,
    });

    fireEvent.change(senhaInput, { target: { value: '123' } });
    fireEvent.change(confirmarInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/A senha deve conter no mínimo 6 caracteres/i),
    ).toBeDefined();
    expect(cadastrarSenha).not.toHaveBeenCalled();
  });

  it('deve chamar cadastrarSenha e mostrar mensagem de sucesso', async () => {
    (cadastrarSenha as Mock).mockResolvedValueOnce({
      success: true,
      message: 'Sucesso!',
    });

    render(<DefinirSenhaForm tokenId="token-123" />);

    const senhaInput = screen.getByLabelText(/^Nova Senha$/i);
    const confirmarInput = screen.getByLabelText(/^Confirmar Nova Senha$/i);
    const submitBtn = screen.getByRole('button', {
      name: /Salvar Senha e Ativar/i,
    });

    fireEvent.change(senhaInput, { target: { value: 'senha123' } });
    fireEvent.change(confirmarInput, { target: { value: 'senha123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(cadastrarSenha).toHaveBeenCalledWith('token-123', 'senha123');
    });

    expect(await screen.findByText(/Senha cadastrada!/i)).toBeDefined();
  });
});
