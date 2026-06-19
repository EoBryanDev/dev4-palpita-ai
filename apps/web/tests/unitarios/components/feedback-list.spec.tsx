import { FeedbackList } from '@/components/feedback/feedback-list';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const feedbacks = [
  {
    id: '1',
    titulo: 'Sugestão top',
    descricao: 'Descrição da sugestão',
    tipo: 'sugestao',
    status: 'pendente',
    dataCriacao: new Date('2026-06-15'),
    totalVotos: 5,
    usuarioVotou: false,
    usuarioId: 'u1',
    usuarioNome: 'João',
  },
  {
    id: '2',
    titulo: 'Bug crítico',
    descricao: 'Descrição do bug',
    tipo: 'bug',
    status: 'concluido',
    dataCriacao: new Date('2026-06-18'),
    totalVotos: 10,
    usuarioVotou: true,
    usuarioId: 'u2',
    usuarioNome: 'Maria',
  },
];

describe('FeedbackList', () => {
  it('deve renderizar todos os feedbacks', () => {
    render(<FeedbackList feedbacks={feedbacks} />);

    expect(screen.getByText('Sugestão top')).toBeDefined();
    expect(screen.getByText('Bug crítico')).toBeDefined();
  });

  it('deve exibir ordenação padrão como "Mais votados"', () => {
    render(<FeedbackList feedbacks={feedbacks} />);

    const cards = screen.getAllByText(/Sugestão top|Bug crítico/);
    expect(cards).toHaveLength(2);
  });

  it('deve filtrar por tipo "bug"', () => {
    render(<FeedbackList feedbacks={feedbacks} />);

    fireEvent.click(screen.getByText('Bugs'));

    expect(screen.getByText('Bug crítico')).toBeDefined();
    expect(screen.queryByText('Sugestão top')).toBeNull();
  });

  it('deve exibir mensagem quando não há feedbacks', () => {
    render(<FeedbackList feedbacks={[]} />);

    expect(screen.getByText('Nenhum feedback encontrado.')).toBeDefined();
  });
});
