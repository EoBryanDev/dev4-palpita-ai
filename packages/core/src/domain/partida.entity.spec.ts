import { describe, expect, it } from 'vitest';
import { Partida } from './partida.entity';

describe('Partida Entity', () => {
  it('deve criar uma partida com propriedades corretas', () => {
    const props = {
      id: 'partida-1',
      rodadaId: 'rodada-1',
      timeAId: 'time-a-id',
      timeBId: 'time-b-id',
      golsTimeA: null,
      golsTimeB: null,
      dataInicio: new Date('2026-06-15T15:00:00Z'),
      status: 'AGENDADA' as const,
      dataCriacao: new Date(),
    };

    const partida = new Partida(props);

    expect(partida.id).toBe(props.id);
    expect(partida.rodadaId).toBe(props.rodadaId);
    expect(partida.timeAId).toBe(props.timeAId);
    expect(partida.timeBId).toBe(props.timeBId);
    expect(partida.golsTimeA).toBeNull();
    expect(partida.golsTimeB).toBeNull();
    expect(partida.dataInicio).toBe(props.dataInicio);
    expect(partida.status).toBe('AGENDADA');
  });

  it('deve iniciar uma partida', () => {
    const partida = new Partida({
      id: 'partida-1',
      rodadaId: 'rodada-1',
      timeAId: 'time-a-id',
      timeBId: 'time-b-id',
      golsTimeA: null,
      golsTimeB: null,
      dataInicio: new Date('2026-06-15T15:00:00Z'),
      status: 'AGENDADA',
      dataCriacao: new Date(),
    });

    partida.iniciar();

    expect(partida.status).toBe('EM_ANDAMENTO');
  });

  it('deve finalizar uma partida com placar oficial se o jogo ja comecou', () => {
    const partida = new Partida({
      id: 'partida-1',
      rodadaId: 'rodada-1',
      timeAId: 'time-a-id',
      timeBId: 'time-b-id',
      golsTimeA: null,
      golsTimeB: null,
      dataInicio: new Date(Date.now() - 3600 * 1000), // 1 hora atrás
      status: 'EM_ANDAMENTO',
      dataCriacao: new Date(),
    });

    partida.finalizar(2, 1);

    expect(partida.status).toBe('FINALIZADA');
    expect(partida.golsTimeA).toBe(2);
    expect(partida.golsTimeB).toBe(1);
  });

  it('deve lancar erro ao finalizar com gols negativos', () => {
    const partida = new Partida({
      id: 'partida-1',
      rodadaId: 'rodada-1',
      timeAId: 'time-a-id',
      timeBId: 'time-b-id',
      golsTimeA: null,
      golsTimeB: null,
      dataInicio: new Date(Date.now() - 3600 * 1000),
      status: 'EM_ANDAMENTO',
      dataCriacao: new Date(),
    });

    expect(() => partida.finalizar(-1, 0)).toThrow(
      'Gols nao podem ser negativos',
    );
    expect(() => partida.finalizar(0, -2)).toThrow(
      'Gols nao podem ser negativos',
    );
  });

  it('deve lancar erro ao finalizar antes do inicio da partida', () => {
    const partida = new Partida({
      id: 'partida-1',
      rodadaId: 'rodada-1',
      timeAId: 'time-a-id',
      timeBId: 'time-b-id',
      golsTimeA: null,
      golsTimeB: null,
      dataInicio: new Date(Date.now() + 3600 * 1000), // 1 hora no futuro
      status: 'EM_ANDAMENTO',
      dataCriacao: new Date(),
    });

    expect(() => partida.finalizar(2, 1)).toThrow(
      'Nao e possivel finalizar uma partida antes do seu inicio',
    );
  });
});
