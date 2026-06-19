import { describe, expect, it } from 'vitest';
import { PlaywrightEngine } from '../engines/playwright-engine.js';

describe('PlaywrightEngine parseOgolEvents', () => {
  const engine = new PlaywrightEngine();
  const parseEvents = (text: string, timeA: string, timeB: string) => {
    return (engine as any).parseOgolEvents(text, timeA, timeB);
  };

  it('should parse Format 1 yellow cards (live commentary summary format)', () => {
    const text = `
      4'
      Cartão amarelo para Lee Kang-in (Coreia do Sul)
    `;
    const events = parseEvents(text, 'México', 'Coreia do Sul');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      tipo: 'CARTAO_AMARELO',
      jogador: 'Lee Kang-in',
      minuto: 4,
      acrescimos: undefined,
      timeNome: 'Coreia do Sul',
    });
  });

  it('should parse Format 2 yellow cards (standard timeline format)', () => {
    const text = `
      35'
      Argélia: Youcef Atal recebeu cartão amarelo
    `;
    const events = parseEvents(text, 'Argélia', 'Colômbia');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      tipo: 'CARTAO_AMARELO',
      jogador: 'Youcef Atal',
      minuto: 35,
      acrescimos: undefined,
      timeNome: 'Argélia',
    });
  });

  it('should parse Format 1 red cards', () => {
    const text = `
      88'
      Cartão vermelho para Jorge Sánchez (México)
    `;
    const events = parseEvents(text, 'México', 'Coreia do Sul');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      tipo: 'CARTAO_VERMELHO',
      jogador: 'Jorge Sánchez',
      minuto: 88,
      acrescimos: undefined,
      timeNome: 'México',
    });
  });

  it('should parse Format 2 red cards', () => {
    const text = `
      75'
      México: Jorge Sánchez recebeu cartão vermelho
    `;
    const events = parseEvents(text, 'México', 'Coreia do Sul');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      tipo: 'CARTAO_VERMELHO',
      jogador: 'Jorge Sánchez',
      minuto: 75,
      acrescimos: undefined,
      timeNome: 'México',
    });
  });

  it('should parse substitutions correctly', () => {
    const text = `
      81'
      Argélia: Adil Boulbina(entra) - Ibrahim Maza(sai)
    `;
    const events = parseEvents(text, 'Argélia', 'Colômbia');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      tipo: 'SUBSTITUICAO',
      jogador: 'Adil Boulbina',
      minuto: 81,
      acrescimos: undefined,
      info: 'Entra: Adil Boulbina | Sai: Ibrahim Maza',
      timeNome: 'Argélia',
    });
  });

  it('should be diacritic and case-insensitive when matching team names', () => {
    const text = `
      12'
      Mèxico: Raúl Jiménez recebeu cartão amarelo
      45+2'
      Coreia do sul: Son Heung-min recebeu cartão amarelo
    `;
    const events = parseEvents(text, 'México', 'Coreia do Sul');
    expect(events).toHaveLength(2);

    expect(events[0]).toEqual({
      tipo: 'CARTAO_AMARELO',
      jogador: 'Raúl Jiménez',
      minuto: 12,
      acrescimos: undefined,
      timeNome: 'México',
    });

    expect(events[1]).toEqual({
      tipo: 'CARTAO_AMARELO',
      jogador: 'Son Heung-min',
      minuto: 45,
      acrescimos: 2,
      timeNome: 'Coreia do Sul',
    });
  });

  it('should parse cards even without team name prefix if name matches (Format 3)', () => {
    const text = `
      60'
      Raúl Jiménez recebeu cartão amarelo
    `;
    const events = parseEvents(text, 'México', 'Coreia do Sul');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      tipo: 'CARTAO_AMARELO',
      jogador: 'Raúl Jiménez',
      minuto: 60,
      acrescimos: undefined,
      timeNome: undefined,
    });
  });
});
