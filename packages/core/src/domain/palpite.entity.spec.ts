import { describe, expect, it } from 'vitest';
import { Palpite } from './palpite.entity';

describe('Palpite Entity', () => {
  it('deve criar um palpite com propriedades corretas', () => {
    const props = {
      id: 'palpite-1',
      usuarioId: 'usuario-1',
      partidaId: 'partida-1',
      golsTimeA: 2,
      golsTimeB: 1,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    };

    const palpite = new Palpite(props);

    expect(palpite.id).toBe(props.id);
    expect(palpite.usuarioId).toBe(props.usuarioId);
    expect(palpite.partidaId).toBe(props.partidaId);
    expect(palpite.golsTimeA).toBe(2);
    expect(palpite.golsTimeB).toBe(1);
  });

  it('deve lancar erro ao criar palpite com gols negativos', () => {
    const props = {
      id: 'palpite-1',
      usuarioId: 'usuario-1',
      partidaId: 'partida-1',
      golsTimeA: -1,
      golsTimeB: 1,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    };

    expect(() => new Palpite(props)).toThrow('Gols nao podem ser negativos');
  });

  describe('Bloqueio de Horario', () => {
    it('deve permitir atualizar palpite antes do inicio da partida', () => {
      const dataInicioPartida = new Date('2026-06-15T15:00:00Z');
      const dataReferencia = new Date('2026-06-15T14:59:00Z'); // 1 minuto antes

      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 1,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      palpite.atualizarPlacar(2, 0, dataInicioPartida, dataReferencia);

      expect(palpite.golsTimeA).toBe(2);
      expect(palpite.golsTimeB).toBe(0);
      expect(palpite.dataAtualizacao).toBe(dataReferencia);
    });

    it('deve lancar erro ao tentar atualizar palpite no horario exato do inicio da partida', () => {
      const dataInicioPartida = new Date('2026-06-15T15:00:00Z');
      const dataReferencia = new Date('2026-06-15T15:00:00Z'); // Mesma data/hora

      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 1,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      expect(() =>
        palpite.atualizarPlacar(2, 0, dataInicioPartida, dataReferencia),
      ).toThrow('Prazo para palpitar nesta partida expirou');
    });

    it('deve lancar erro ao tentar atualizar palpite apos o inicio da partida', () => {
      const dataInicioPartida = new Date('2026-06-15T15:00:00Z');
      const dataReferencia = new Date('2026-06-15T15:05:00Z'); // 5 minutos depois

      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 1,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      expect(() =>
        palpite.atualizarPlacar(2, 0, dataInicioPartida, dataReferencia),
      ).toThrow('Prazo para palpitar nesta partida expirou');
    });
  });

  describe('Calculo de Pontuacao', () => {
    it('deve retornar 0 pontos se a partida nao tiver resultado lancado (gols nulos)', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 2,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const pontos = palpite.calcularPontos(null, null);
      expect(pontos).toBe(0);
    });

    it('deve atribuir 2 pontos se o placar exato for identico (Vitoria do Time A)', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 2,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const pontos = palpite.calcularPontos(2, 1);
      expect(pontos).toBe(2);
    });

    it('deve atribuir 1 ponto se errar placar mas acertar vencedor (Vitoria do Time A com placar diferente)', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 3,
        golsTimeB: 0,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const pontos = palpite.calcularPontos(2, 1);
      expect(pontos).toBe(1);
    });

    it('deve atribuir 0 pontos se errar o vencedor (Palpitou Vitoria do Time A, mas deu Vitoria do Time B)', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 2,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const pontos = palpite.calcularPontos(0, 3);
      expect(pontos).toBe(0);
    });

    it('deve atribuir 2 pontos se acertar o empate com placar exato', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 1,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const pontos = palpite.calcularPontos(1, 1);
      expect(pontos).toBe(2);
    });

    it('deve atribuir 1 ponto se acertar o empate com placar diferente', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 2,
        golsTimeB: 2,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const pontos = palpite.calcularPontos(1, 1);
      expect(pontos).toBe(1);
    });

    it('deve atribuir 0 pontos se palpitar empate mas jogo teve vencedor', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 1,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const points = palpite.calcularPontos(2, 1);
      expect(points).toBe(0);
    });

    it('deve atribuir 0 pontos se palpitar vencedor mas jogo terminou empatado', () => {
      const palpite = new Palpite({
        id: 'palpite-1',
        usuarioId: 'usuario-1',
        partidaId: 'partida-1',
        golsTimeA: 2,
        golsTimeB: 1,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const points = palpite.calcularPontos(1, 1);
      expect(points).toBe(0);
    });
    describe('Fase Mata-Mata', () => {
      it('deve somar +1 ponto de bonus se acertar o placar exato e o momento da decisao', () => {
        const palpite = new Palpite({
          id: 'palpite-1',
          usuarioId: 'usuario-1',
          partidaId: 'partida-1',
          golsTimeA: 2,
          golsTimeB: 1,
          momentoPrevisto: 'NORMAL',
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
        });

        const pontos = palpite.calcularPontos(2, 1, 'MATAMATA', 'NORMAL');
        expect(pontos).toBe(3); // 2 placar exato + 1 bonus momento
      });

      it('deve somar 2 pontos (sem bonus) se acertar placar exato mas errar o momento da decisao', () => {
        const palpite = new Palpite({
          id: 'palpite-1',
          usuarioId: 'usuario-1',
          partidaId: 'partida-1',
          golsTimeA: 2,
          golsTimeB: 1,
          momentoPrevisto: 'PRORROGACAO',
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
        });

        const pontos = palpite.calcularPontos(2, 1, 'MATAMATA', 'NORMAL');
        expect(pontos).toBe(2); // 2 placar exato + 0 bonus momento
      });

      it('deve somar 2 pontos (1 vencedor + 1 bonus) se errar placar exato mas acertar vencedor e momento da decisao', () => {
        const palpite = new Palpite({
          id: 'palpite-1',
          usuarioId: 'usuario-1',
          partidaId: 'partida-1',
          golsTimeA: 3,
          golsTimeB: 0,
          momentoPrevisto: 'NORMAL',
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
        });

        const pontos = palpite.calcularPontos(2, 1, 'MATAMATA', 'NORMAL');
        expect(pontos).toBe(2); // 1 vencedor + 1 bonus momento
      });

      it('deve somar 1 ponto se errar placar exato, acertar vencedor, mas errar momento da decisao', () => {
        const palpite = new Palpite({
          id: 'palpite-1',
          usuarioId: 'usuario-1',
          partidaId: 'partida-1',
          golsTimeA: 3,
          golsTimeB: 0,
          momentoPrevisto: 'PRORROGACAO',
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
        });

        const pontos = palpite.calcularPontos(2, 1, 'MATAMATA', 'NORMAL');
        expect(pontos).toBe(1); // 1 vencedor + 0 bonus momento
      });

      it('deve somar 0 pontos se errar o vencedor mesmo acertando o momento previsto', () => {
        const palpite = new Palpite({
          id: 'palpite-1',
          usuarioId: 'usuario-1',
          partidaId: 'partida-1',
          golsTimeA: 1,
          golsTimeB: 2,
          momentoPrevisto: 'NORMAL',
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
        });

        const pontos = palpite.calcularPontos(2, 1, 'MATAMATA', 'NORMAL');
        expect(pontos).toBe(0); // errou o vencedor
      });
    });
  });
});
