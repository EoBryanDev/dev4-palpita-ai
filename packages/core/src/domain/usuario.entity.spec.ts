import { describe, expect, it } from 'vitest';
import { Usuario } from './usuario.entity';

describe('Usuario Entity', () => {
  it('deve criar um usuario com propriedades corretas', () => {
    const props = {
      id: 'uuid-1',
      nome: 'Fulano Competidor',
      email: 'fulano@empresa.com',
      status: 'PENDENTE' as const,
      cargo: 'COLABORADOR' as const,
      dataCriacao: new Date(),
    };

    const usuario = new Usuario(props);

    expect(usuario.id).toBe(props.id);
    expect(usuario.nome).toBe(props.nome);
    expect(usuario.email).toBe(props.email);
    expect(usuario.status).toBe('PENDENTE');
    expect(usuario.cargo).toBe('COLABORADOR');
    expect(usuario.dataCriacao).toBe(props.dataCriacao);
  });

  it('deve ativar um usuario', () => {
    const usuario = new Usuario({
      id: 'uuid-1',
      nome: 'Fulano Competidor',
      email: 'fulano@empresa.com',
      status: 'PENDENTE',
      cargo: 'COLABORADOR',
      dataCriacao: new Date(),
    });

    usuario.ativar();

    expect(usuario.status).toBe('ATIVO');
  });

  it('deve desativar um usuario', () => {
    const usuario = new Usuario({
      id: 'uuid-1',
      nome: 'Fulano Competidor',
      email: 'fulano@empresa.com',
      status: 'ATIVO',
      cargo: 'COLABORADOR',
      dataCriacao: new Date(),
    });

    usuario.desativar();

    expect(usuario.status).toBe('DESATIVADO');
  });
});
