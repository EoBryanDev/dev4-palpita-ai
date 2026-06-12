import { logoutUsuario } from '@/app/actions/auth';
import {
  obterPalpitesSalvosPaginadosAction,
  salvarPalpite,
} from '@/app/actions/palpites';
import { DashboardPalpites } from '@/components/dashboard-palpites';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/app/actions/palpites', () => ({
  salvarPalpite: vi.fn(),
  obterPalpitesSalvosPaginadosAction: vi.fn(),
}));

vi.mock('@/app/actions/auth', () => ({
  logoutUsuario: vi.fn(),
}));

const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/hooks/use-countdown', () => ({
  useCountdown: () => ({
    timeLeft: { days: 5, hours: 12, minutes: 30, seconds: 0, isExpired: false },
    mounted: true,
    isUrgent: false,
  }),
}));

const defaultProps = {
  nomeUsuario: 'Competidor Teste',
  emailUsuario: 'user@test.com',
  cargoUsuario: 'COLABORADOR',
  userStatus: 'LIBERADO',
  pontos: 5,
  posicao: 3,
  isTudoBloqueado: false,
  rodadas: [
    {
      id: 'rodada-1',
      numero: 1,
      nome: 'Fase de Grupos - Rodada 1',
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
          rodadaNome: 'Fase de Grupos - Rodada 1',
        },
      ],
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
      pontosGanhos: 2,
      dataInicio: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Passado
    },
  ],
  palpitesSalvosIniciais: [
    {
      id: 'partida-2',
      timeA: 'Alemanha',
      timeB: 'Espanha',
      dataInicio: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // Futuro daqui a 2 dias
      status: 'AGENDADO',
      palpiteGolsA: 2,
      palpiteGolsB: 2,
      jaPalpitou: true,
      rodadaNome: 'Fase de Grupos - Rodada 1',
    },
  ],
  totalPalpitesSalvos: 1,
};

describe('DashboardPalpites Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar as informações de pontos, classificação e rodada', () => {
    render(<DashboardPalpites {...defaultProps} />);

    expect(screen.getByText('5 Pontos')).toBeDefined();
    expect(screen.getByText('#3')).toBeDefined();
    expect(screen.getByText('Apostas Liberadas')).toBeDefined();
    expect(screen.getAllByText('Fase de Grupos - Rodada 1').length).toBe(2);
  });

  it('deve exibir um aviso e desabilitar formulário se o status for ATIVO (ou seja, pendente de liberação de apostas)', () => {
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

    // Palpite salvos: Alemanha vs Espanha (lista única com badge da rodada)
    expect(screen.getByText('Alemanha')).toBeDefined();
    expect(screen.getByText('Espanha')).toBeDefined();
    expect(screen.getAllByText('Fase de Grupos - Rodada 1').length).toBe(2);
  });

  it('deve listar o histórico de palpites concluídos com sucesso', () => {
    render(<DashboardPalpites {...defaultProps} />);

    expect(screen.getByText('Brasil')).toBeDefined();
    expect(screen.getByText('Croácia')).toBeDefined();
    expect(screen.getByText('Seu Palpite')).toBeDefined();
    expect(screen.getByText('2 x 1')).toBeDefined();
    expect(screen.getByText('+2 Pontos')).toBeDefined();
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

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Palpite salvo!',
      description: 'Palpite registrado com sucesso!',
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('deve exibir o botão "Veja Mais" se houver mais palpites salvos no banco e carregar mais ao clicar', async () => {
    const propsComMaisPalpites = {
      ...defaultProps,
      totalPalpitesSalvos: 6,
    };

    (obterPalpitesSalvosPaginadosAction as Mock).mockResolvedValueOnce({
      success: true,
      palpites: [
        {
          id: 'partida-4',
          timeA: 'Bélgica',
          timeB: 'Japão',
          dataInicio: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
          status: 'AGENDADO',
          palpiteGolsA: 1,
          palpiteGolsB: 0,
          jaPalpitou: true,
          rodadaNome: 'Fase de Grupos - Rodada 1',
        },
      ],
      total: 6,
    });

    render(<DashboardPalpites {...propsComMaisPalpites} />);

    const btnVejaMais = screen.getByRole('button', { name: /Veja Mais/i });
    expect(btnVejaMais).toBeDefined();

    fireEvent.click(btnVejaMais);

    await waitFor(() => {
      expect(obterPalpitesSalvosPaginadosAction).toHaveBeenCalledWith(5, 5);
    });

    await waitFor(() => {
      expect(screen.getByText('Bélgica')).toBeDefined();
      expect(screen.getByText('Japão')).toBeDefined();
    });
  });
});
