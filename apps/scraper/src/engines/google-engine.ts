import * as cheerio from 'cheerio';
import type { IScrapeEvent, IScrapeResult, IScraperEngine } from '../types.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
];

export class RateLimitError extends Error {
  constructor(
    public retryAfter: number,
    message?: string,
  ) {
    super(message ?? 'Rate limited by Google');
    this.name = 'RateLimitError';
  }
}

function selectUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// biome-ignore lint/suspicious/noMisleadingCharacterClass: combining accent range is intentional and correct
const ACCENTS_RE = /[\u0300-\u036f]/gu;

function sanitizarQuery(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(ACCENTS_RE, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();
}

function parsePlacar(
  $: cheerio.CheerioAPI,
): { golsA: number; golsB: number } | null {
  const scoreSelectors = [
    '[class*="imso_mh__l-tm-sc"], [class*="imso_mh__r-tm-sc"]',
    '[class*="imso_mh__"]',
    '[class*="score"]',
    '[data-attrid="subtitle"]',
  ];

  for (const sel of scoreSelectors) {
    const texts: string[] = [];
    $(sel).each((_, el) => {
      const t = $(el).text().trim();
      const n = Number.parseInt(t, 10);
      if (!Number.isNaN(n)) texts.push(t);
    });

    if (texts.length >= 2) {
      const gols = texts.map((t) => Number.parseInt(t, 10));
      return { golsA: gols[0], golsB: gols[1] };
    }
  }

  return null;
}

function parseStatus($: cheerio.CheerioAPI): string {
  const statusSelectors = [
    '[class*="imso_mh__m-st"]',
    '.imso_mh__m-st',
    '[class*="status"]',
  ];

  for (const sel of statusSelectors) {
    const text = $(sel).first().text().trim().toLowerCase();
    if (text.includes('final')) return 'FINALIZADO';
    if (text.includes('ao vivo') || text.includes('andamento'))
      return 'EM_ANDAMENTO';
    if (text.includes('agendado')) return 'AGENDADO';
  }

  return 'EM_ANDAMENTO';
}

function parseEventos($: cheerio.CheerioAPI): IScrapeEvent[] {
  const eventos: IScrapeEvent[] = [];
  const eventSelectors = [
    '[class*="imso_mh__e-tx"]',
    '.imso_mh__e-tx',
    '[class*="event"]',
  ];

  for (const sel of eventSelectors) {
    $(sel).each((_, el) => {
      const text = $(el).text().trim();
      if (!text) return;

      const matchGol = text.match(
        /(?:(\d+)(?:\+(\d+))?'?\s*)?(?:⚽\s*)?(.+?)(?:\s*\((.+?)\))?$/,
      );
      if (matchGol) {
        eventos.push({
          tipo: 'GOL',
          timeId: '',
          jogador: matchGol[3]?.trim() ?? text,
          minuto: Number.parseInt(matchGol[1], 10) || 0,
          acrescimos: matchGol[2]
            ? Number.parseInt(matchGol[2], 10)
            : undefined,
          info: matchGol[4] ? `Assistência: ${matchGol[4]}` : undefined,
        });
      }
    });
  }

  return eventos;
}

function buildGoogleUrl(timeA: string, timeB: string): string {
  const q = sanitizarQuery(`${timeA} ${timeB} copa 2026 resultado`);
  return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=pt-BR`;
}

export class GoogleEngine implements IScraperEngine {
  async scrapeMatch(
    timeA: string,
    timeB: string,
  ): Promise<IScrapeResult | null> {
    const url = buildGoogleUrl(timeA, timeB);

    const response = await fetch(url, {
      headers: {
        'User-Agent': selectUserAgent(),
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (response.status === 429) {
      const retryAfter = Number.parseInt(
        response.headers.get('Retry-After') ?? '60',
        10,
      );
      throw new RateLimitError(retryAfter);
    }

    if (!response.ok) {
      console.warn(`[GoogleEngine] HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const placar = parsePlacar($);
    if (!placar) return null;

    const status = parseStatus($);
    const eventos = parseEventos($);

    return {
      golsTimeA: placar.golsA,
      golsTimeB: placar.golsB,
      status: status as IScrapeResult['status'],
      eventos: eventos.length > 0 ? eventos : undefined,
    };
  }
}
