import { FeedbackCard } from '@/components/feedback/feedback-card';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/actions/feedback', () => ({
  votarFeedback: vi.fn(),
}));

describe('FeedbackCard', () => {
  it('deve renderizar título, descrição e nome do autor', () => {
    render(
      <FeedbackCard
        id="1"
        titulo="Modo escuro"
        descricao="Implementar modo escuro no ranking"
        tipo="sugestao"
        status="pendente"
        totalVotos={5}
        usuarioVotou={false}
        usuarioNome="João"
      />,
    );

    expect(screen.getByText('Modo escuro')).toBeDefined();
    expect(screen.getByText(/Implementar modo escuro/)).toBeDefined();
    expect(screen.getByText(/João/)).toBeDefined();
  });

  it('deve exibir o número de votos', () => {
    render(
      <FeedbackCard
        id="1"
        titulo="Modo escuro"
        descricao="Descrição"
        tipo="sugestao"
        status="pendente"
        totalVotos={5}
        usuarioVotou={false}
        usuarioNome="João"
      />,
    );

    expect(screen.getByText('5')).toBeDefined();
  });

  it('deve exibir label do status', () => {
    render(
      <FeedbackCard
        id="1"
        titulo="Bug crítico"
        descricao="Descrição"
        tipo="bug"
        status="concluido"
        totalVotos={0}
        usuarioVotou={false}
        usuarioNome="Maria"
      />,
    );

    expect(screen.getByText('Concluído')).toBeDefined();
  });

  it('deve desabilitar o botão de voto se usuário não estiver logado', () => {
    render(
      <FeedbackCard
        id="1"
        titulo="Ideia"
        descricao="Descrição"
        tipo="sugestao"
        status="pendente"
        totalVotos={0}
        usuarioVotou={false}
        usuarioNome="João"
        usuarioLogado={false}
      />,
    );

    const btn = screen.getByTitle('Faça login para votar');
    expect(btn).toBeDefined();
    expect(btn.hasAttribute('disabled')).toBe(true);
  });
});
