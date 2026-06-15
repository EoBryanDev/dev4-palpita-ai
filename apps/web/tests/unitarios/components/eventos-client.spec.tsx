import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { obterEventosTimeline } from '@/app/actions/eventos';
import { EventosClient } from '@/components/eventos-client';

vi.mock('@/app/actions/eventos', () => ({
  obterEventosTimeline: vi.fn(),
  obterPontuadoresPartida: vi.fn(),
  obterComentariosPartida: vi.fn(),
  adicionarComentario: vi.fn(),
}));

const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('EventosClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir spinner de carregamento inicialmente', async () => {
    (obterEventosTimeline as Mock).mockReturnValue(new Promise(() => {}));

    render(<EventosClient />);

    expect(
      screen.getByText(/Carregando a linha do tempo de eventos/i),
    ).toBeDefined();
  });

  it('deve exibir mensagem de erro se a busca de eventos falhar', async () => {
    (obterEventosTimeline as Mock).mockResolvedValue({
      success: false,
      eventos: [],
      message: 'Erro do servidor',
    });

    render(<EventosClient />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar eventos/i)).toBeDefined();
      expect(screen.getByText('Erro do servidor')).toBeDefined();
    });
  });

  it('deve exibir estado vazio se não houver eventos na timeline', async () => {
    (obterEventosTimeline as Mock).mockResolvedValue({
      success: true,
      eventos: [],
    });

    render(<EventosClient />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum evento registrado ainda')).toBeDefined();
    });
  });

  it('deve renderizar a timeline e limitar a exibição a 5 eventos inicialmente', async () => {
    const mockEventos = Array.from({ length: 7 }, (_, i) => ({
      id: `e-${i}`,
      timeA: `Time A ${i + 1}`,
      timeB: `Time B ${i + 1}`,
      timeAEmoji: '🇧🇷',
      timeBEmoji: '🇦🇷',
      golsTimeA: 1,
      golsTimeB: 0,
      dataInicio: '2026-06-12T15:00:00Z',
      status: 'FINALIZADO',
      rodadaId: 'r1',
      rodadaNome: 'Rodada 1',
      comentariosCount: 0,
    }));

    (obterEventosTimeline as Mock).mockResolvedValue({
      success: true,
      eventos: mockEventos,
    });

    render(<EventosClient />);

    // Espera os eventos carregarem e renderizarem
    await waitFor(() => {
      expect(screen.getByText('Time A 1')).toBeDefined();
    });

    // Deve exibir do evento 1 ao 5
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Time A ${i}`)).toBeDefined();
    }

    // Não deve exibir eventos 6 e 7 inicialmente
    expect(screen.queryByText('Time A 6')).toBeNull();
    expect(screen.queryByText('Time A 7')).toBeNull();

    // Deve mostrar o botão "Visualizar mais"
    const loadMoreBtn = screen.getByRole('button', {
      name: /Visualizar mais/i,
    });
    expect(loadMoreBtn).toBeDefined();

    // Clicar em "Visualizar mais"
    fireEvent.click(loadMoreBtn);

    // Agora todos os 7 eventos devem ser exibidos
    await waitFor(() => {
      expect(screen.getByText('Time A 6')).toBeDefined();
      expect(screen.getByText('Time A 7')).toBeDefined();
    });

    // O botão "Visualizar mais" deve sumir
    expect(
      screen.queryByRole('button', { name: /Visualizar mais/i }),
    ).toBeNull();
  });
});
