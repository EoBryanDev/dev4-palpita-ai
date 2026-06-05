import { describe, expect, it } from 'vitest';
import { TokenConvite } from './token-convite.entity';

describe('TokenConvite Entity', () => {
  it('deve criar um token de convite com propriedades corretas', () => {
    const dataCriacao = new Date();
    const props = {
      id: 'token-uuid',
      usuarioId: 'usuario-uuid',
      dataCriacao,
      usado: false,
    };

    const token = new TokenConvite(props);

    expect(token.id).toBe(props.id);
    expect(token.usuarioId).toBe(props.usuarioId);
    expect(token.dataCriacao).toBe(dataCriacao);
    expect(token.usado).toBe(false);
  });

  describe('Expiracao de Token (5 minutos)', () => {
    it('nao deve estar expirado logo apos a criacao', () => {
      const dataCriacao = new Date('2026-06-15T10:00:00Z');
      const token = new TokenConvite({
        id: 'token-uuid',
        usuarioId: 'usuario-uuid',
        dataCriacao,
        usado: false,
      });

      const dataReferencia = new Date('2026-06-15T10:04:59Z'); // 4m 59s depois
      expect(token.estaExpirado(dataReferencia)).toBe(false);
    });

    it('deve estar expirado apos 5 minutos', () => {
      const dataCriacao = new Date('2026-06-15T10:00:00Z');
      const token = new TokenConvite({
        id: 'token-uuid',
        usuarioId: 'usuario-uuid',
        dataCriacao,
        usado: false,
      });

      const dataReferencia = new Date('2026-06-15T10:05:01Z'); // 5m 1s depois
      expect(token.estaExpirado(dataReferencia)).toBe(true);
    });
  });

  describe('Metodo usar()', () => {
    it('deve marcar o token como usado com sucesso se estiver no prazo', () => {
      const dataCriacao = new Date('2026-06-15T10:00:00Z');
      const token = new TokenConvite({
        id: 'token-uuid',
        usuarioId: 'usuario-uuid',
        dataCriacao,
        usado: false,
      });

      const dataReferencia = new Date('2026-06-15T10:02:00Z'); // 2 minutos depois
      token.usar(dataReferencia);

      expect(token.usado).toBe(true);
    });

    it('deve lancar erro se tentar usar um token ja utilizado', () => {
      const dataCriacao = new Date('2026-06-15T10:00:00Z');
      const token = new TokenConvite({
        id: 'token-uuid',
        usuarioId: 'usuario-uuid',
        dataCriacao,
        usado: true, // Já usado
      });

      const dataReferencia = new Date('2026-06-15T10:02:00Z');
      expect(() => token.usar(dataReferencia)).toThrow(
        'Este token ja foi utilizado',
      );
    });

    it('deve lancar erro se tentar usar um token expirado', () => {
      const dataCriacao = new Date('2026-06-15T10:00:00Z');
      const token = new TokenConvite({
        id: 'token-uuid',
        usuarioId: 'usuario-uuid',
        dataCriacao,
        usado: false,
      });

      const dataReferencia = new Date('2026-06-15T10:06:00Z'); // 6 minutos depois
      expect(() => token.usar(dataReferencia)).toThrow(
        'Este token de convite expirou',
      );
    });
  });
});
