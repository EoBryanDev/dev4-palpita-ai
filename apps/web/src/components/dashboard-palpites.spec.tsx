import { logoutUsuario } from '@/app/actions/auth';
import { salvarPalpite } from '@/app/actions/palpites';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { DashboardPalpites } from './dashboard-palpites';

vi.mock('@/app/actions/palpites', () => ({
  salvarPalpite: vi.fn(),
}));

vi.mock('@/app/actions/auth', () => ({
  logoutUsuario: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const defaultProps = {
  nomeUsuario: 'Competidor Teste',
  emailUsuario: 'user@test.com',
  cargoUsuario: 'COLABORADOR',
  userStatus: 'LIBERADO',
  pontos: 5,
  posicao: 3,
  nomeRodada: 'Fase de Grupos - Rodada 1',
  partidas: [
    {
      id: 'partida-1',
      timeA: 'Argentina',
      timeB: 'França',
      dataInicio: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Futuro daqui a 1 dia
      status: 'AGENDADO',
      jaPalpitou: false,
    },
    {
      id: 'partida-2',
      timeA: 'Alemanha',
      timeB: 'Espanha',
      dataInicio: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // Futuro daqui a 2 dias
      status: 'AGENDADO',
      palpiteGolsA: 2,
      palpiteGolsB: 2,
      jaPalpitou: true,
    },
  ],
  historico: [
    {
      partidaId: 'partida-3',
      timeA: 'Brasil',
      timeB: 'Croácia',
      placarOficialA: 2,
      placarOficialB: 1,
      palpiteA: 2,
      palpiteB: 1,
      pontosGanhos: 1,
      dataInicio: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Passado
    },
  ],
};

describe('DashboardPalpites Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar as informações do competidor, pontos e classificação', () => {
    render(<DashboardPalpites {...defaultProps} />);

    expect(screen.getByText('Competidor Teste')).toBeDefined();
    expect(screen.getByText('user@test.com')).toBeDefined();
    expect(screen.getByText('5 Pontos')).toBeDefined();
    expect(screen.getByText('#3')).toBeDefined();
    expect(screen.getByText('Apostas Liberadas')).toBeDefined();
    expect(screen.getByText('Fase de Grupos - Rodada 1')).toBeDefined();
  });

  it('deve exibir um aviso e desabilitar formulário se o status for ATIVO (ou seja, pendente de liberação de apostas - RN05)', () => {
    render(<DashboardPalpites {...defaultProps} userStatus="ATIVO" />);

    expect(
      screen.getByText('Conta aguardando liberação de apostas'),
    ).toBeDefined();
    expect(screen.getByText('Pendente de Liberação')).toBeDefined();

    // Os inputs de placar de palpites devem ficar desabilitados
    const inputs = screen.getAllByPlaceholderText('0');
    for (const input of inputs) {
      expect((input as HTMLInputElement).disabled).toBe(true);
    }
  });

  it('deve listar palpites pendentes e salvos corretamente', () => {
    render(<DashboardPalpites {...defaultProps} />);

    // Palpite pendente: Argentina vs França
    expect(screen.getByText('Argentina')).toBeDefined();
    expect(screen.getByText('França')).toBeDefined();

    // Palpite salvo: Alemanha vs Espanha
    expect(screen.getByText('Alemanha')).toBeDefined();
    expect(screen.getByText('Espanha')).toBeDefined();
  });

  it('deve listar o histórico de palpites concluídos com sucesso', () => {
    render(<DashboardPalpites {...defaultProps} />);

    expect(screen.getByText('Brasil')).toBeDefined();
    expect(screen.getByText('Croácia')).toBeDefined();
    expect(screen.getByText('Seu Palpite')).toBeDefined();
    expect(screen.getByText('2 x 1')).toBeDefined();
    expect(screen.getByText('+1 Ponto')).toBeDefined();
  });

  it('deve chamar a action salvarPalpite com os placares corretos ao enviar um novo palpite', async () => {
    (salvarPalpite as Mock).mockResolvedValueOnce({
      success: true,
      message: 'Palpite registrado com sucesso!',
    });

    render(<DashboardPalpites {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('0');
    // inputs[0] e inputs[1] são os inputs gols A e gols B da primeira partida pendente (Argentina vs França)
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });

    const btnSalvar = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(salvarPalpite).toHaveBeenCalledWith('partida-1', 3, 2);
    });

    expect(
      await screen.findByText('Palpite registrado com sucesso!'),
    ).toBeDefined();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('deve chamar a action logoutUsuario ao clicar no botão de sair', async () => {
    (logoutUsuario as Mock).mockResolvedValueOnce({
      success: true,
      message: 'Sucesso',
    });

    render(<DashboardPalpites {...defaultProps} />);

    const btnLogout = screen.getByTitle('Sair');
    fireEvent.click(btnLogout);

    await waitFor(() => {
      expect(logoutUsuario).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
