import { chromium } from 'playwright';
import { describe, expect, it, vi } from 'vitest';
import { UolEngine, extrairJogadorUol } from '../engines/uol-engine.js';

vi.mock('playwright', () => {
  const mockPage = {
    goto: vi.fn().mockResolvedValue(undefined),
    waitForTimeout: vi.fn().mockResolvedValue(undefined),
    evaluate: vi.fn(),
  };
  const mockContext = {
    newPage: vi.fn().mockResolvedValue(mockPage),
  };
  const mockBrowser = {
    newContext: vi.fn().mockResolvedValue(mockContext),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return {
    chromium: {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    },
  };
});

describe('UolEngine', () => {
  it('should normalize team names correctly (kebab-case, no accents)', () => {
    const engine = new UolEngine();
    const norm = (name: string) =>
      (
        engine as unknown as {
          normalizeTeamName: (name: string) => string;
        }
      ).normalizeTeamName(name);

    expect(norm('México')).toBe('mexico');
    expect(norm('Costa do Marfim')).toBe('costa-do-marfim');
    expect(norm('África do Sul')).toBe('africa-do-sul');
    expect(norm('República Tcheca')).toBe('republica-tcheca');
    expect(norm('Estados Unidos')).toBe('estados-unidos');
  });

  it('should generate systematic match URL based on date and teams', () => {
    const engine = new UolEngine();
    const getUrl = (timeA: string, timeB: string, date: Date) =>
      (
        engine as unknown as {
          getMatchUrl: (
            timeA: string,
            timeB: string,
            date?: Date,
          ) => string | null;
        }
      ).getMatchUrl(timeA, timeB, date);

    const testDate = new Date('2026-06-20T17:00:00.000Z');
    const url = getUrl('Alemanha', 'Costa do Marfim', testDate);

    expect(url).toBe(
      'https://placar.uol.com.br/esporte/futebol/copa-do-mundo/2026/06/20/alemanha-x-costa-do-marfim.htm',
    );

    // Test UTC date that is the next day in UTC but still previous day in Sao Paulo (-3)
    const testDateSaoPauloEdge = new Date('2026-06-21T00:00:00.000Z');
    const urlEdge = getUrl('Equador', 'Curaçao', testDateSaoPauloEdge);
    expect(urlEdge).toBe(
      'https://placar.uol.com.br/esporte/futebol/copa-do-mundo/2026/06/20/equador-x-curacao.htm',
    );
  });

  it('should launch playwright, navigate and return parsed results', async () => {
    const engine = new UolEngine();
    const testDate = new Date('2026-06-20T17:00:00.000Z');

    const mockScrapeResult = {
      golsTimeA: 1,
      golsTimeB: 1,
      status: 'EM_ANDAMENTO',
      eventos: [
        {
          tipo: 'GOL',
          jogador: 'Deniz Undav',
          minuto: 22,
          tempo: '2º T',
          timeNome: 'Alemanha',
        },
      ],
    };

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    vi.mocked(page.evaluate).mockResolvedValueOnce(
      mockScrapeResult as unknown as ReturnType<typeof page.evaluate>,
    );

    const result = await engine.scrapeMatch(
      'Alemanha',
      'Costa do Marfim',
      testDate,
    );

    expect(page.goto).toHaveBeenCalledWith(
      'https://placar.uol.com.br/esporte/futebol/copa-do-mundo/2026/06/20/alemanha-x-costa-do-marfim.htm',
      expect.any(Object),
    );
    expect(result).not.toBeNull();
    expect(result?.golsTimeA).toBe(1);
    expect(result?.golsTimeB).toBe(1);
    expect(result?.status).toBe('EM_ANDAMENTO');
    expect(result?.eventos).toHaveLength(1);
    expect(result?.eventos?.[0].jogador).toBe('Deniz Undav');
  });
});

describe('extrairJogadorUol', () => {
  it('should extract capitalized player name in mixed case or ALL CAPS', () => {
    const goalText1 =
      'GOOOL!GOOOOOOOOL DA FRANÇA! MBAPPÉ AMPLIA PARA OS BLUES!';
    expect(extrairJogadorUol(goalText1, 'GOL', 'França', 'Iraque')).toBe(
      'MBAPPÉ',
    );

    const goalText2 = 'GOOOL!GOOOOOOOOL DO BRASIL! Vini Jr marca o primeiro!';
    expect(extrairJogadorUol(goalText2, 'GOL', 'Brasil', 'Argentina')).toBe(
      'Vini Jr',
    );

    const goalText3 = 'GOOOL! GOL DO BRASIL! NEYMAR JR MARCA!';
    expect(extrairJogadorUol(goalText3, 'GOL', 'Brasil', 'Argentina')).toBe(
      'NEYMAR JR',
    );
  });

  it('should handle card description and extract hyphenated player name correctly', () => {
    const cardText1 = 'Amir Al-AmmariCartão amarelo para Amir Al-Ammari.';
    expect(
      extrairJogadorUol(cardText1, 'CARTAO_AMARELO', 'França', 'Iraque'),
    ).toBe('Amir Al-Ammari');

    const cardText2 = 'Cartão amarelo para Lee Kang-in (Coreia do Sul)';
    expect(
      extrairJogadorUol(cardText2, 'CARTAO_AMARELO', 'México', 'Coreia do Sul'),
    ).toBe('Lee Kang-in');
  });
});
