import { type Page, chromium } from 'playwright';
import type { IScrapeEvent, IScrapeResult, IScraperEngine } from '../types.js';

export class PlaywrightEngine implements IScraperEngine {
  private getSearchUrl(timeA: string, timeB: string): string {
    const q = `${timeA} ${timeB} copa 2026 resultado minuto a minuto`;
    return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=pt-BR`;
  }

  async scrapeMatch(
    timeA: string,
    timeB: string,
  ): Promise<IScrapeResult | null> {
    const browser = await chromium.launch({ headless: true });

    try {
      const context = await browser.newContext({
        locale: 'pt-BR',
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();
      const url = this.getSearchUrl(timeA, timeB);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

      await page.waitForTimeout(2_000);

      const golsA = await this.extractScore(page, 'l');
      const golsB = await this.extractScore(page, 'r');

      if (golsA === null || golsB === null) {
        await browser.close();
        return null;
      }

      const status = await this.extractStatus(page);
      const eventos = await this.extractTimeline(page, timeA, timeB);

      await browser.close();

      return {
        golsTimeA: golsA,
        golsTimeB: golsB,
        status: status as IScrapeResult['status'],
        eventos: eventos.length > 0 ? eventos : undefined,
      };
    } catch (error) {
      await browser.close();
      console.warn(
        `[PlaywrightEngine] Error scraping ${timeA} x ${timeB}:`,
        (error as Error).message,
      );
      return null;
    }
  }

  private async extractScore(
    page: Page,
    side: 'l' | 'r',
  ): Promise<number | null> {
    const selectors = [
      `[class*="imso_mh__${side}-tm-sc"]`,
      `[class*="imso-hov__${side}-tr-sc"]`,
      `[data-half="${side}"] [class*="score"]`,
    ];

    for (const sel of selectors) {
      try {
        const el = await page.$(sel);
        if (!el) continue;
        const text = await el.textContent();
        if (!text) continue;
        const n = Number.parseInt(text.trim(), 10);
        if (!Number.isNaN(n)) return n;
      } catch {
        /* empty */
      }
    }

    const allText = await page.evaluate(() => {
      const els = document.querySelectorAll('[class*="imso_mh__"]');
      return Array.from(els)
        .map((el) => el.textContent?.trim())
        .filter(Boolean);
    });

    const nums = allText
      .map((t: string) => Number.parseInt(t, 10))
      .filter((n: number) => !Number.isNaN(n));
    if (nums.length >= 2) {
      return side === 'l' ? nums[0] : nums[1];
    }

    return null;
  }

  private async extractStatus(page: Page): Promise<string> {
    const selectors = [
      '[class*="imso_mh__m-st"]',
      '[class*="imso-hov__m-st"]',
      '[class*="status"]',
      '[data-attrid*="status"]',
    ];

    for (const sel of selectors) {
      try {
        const el = await page.$(sel);
        if (!el) continue;
        const text = (await el.textContent())?.trim().toLowerCase();
        if (!text) continue;
        if (text.includes('final')) return 'FINALIZADO';
        if (text.includes('ao vivo') || text.includes('andamento'))
          return 'EM_ANDAMENTO';
        if (text.includes('agendado')) return 'AGENDADO';
        if (text.includes('encerrado')) return 'FINALIZADO';
      } catch {
        /* empty */
      }
    }

    return 'EM_ANDAMENTO';
  }

  private async extractTimeline(
    page: Page,
    timeA: string,
    timeB: string,
  ): Promise<IScrapeEvent[]> {
    try {
      const eventos = await page.evaluate(
        ({ tA, tB }: { tA: string; tB: string }) => {
          const results: Array<{
            tipo: string;
            jogador: string;
            minuto: number;
            acrescimos?: number;
            info?: string;
          }> = [];

          const containerSelectors = [
            '[class*="imso_hs__mntc"]',
            '[class*="imso-hs__mntc"]',
            '[class*="timeline"]',
            '[jsname*="timeline"]',
          ];

          let container: Element | null = null;
          for (const sel of containerSelectors) {
            container = document.querySelector(sel);
            if (container) break;
          }

          if (!container) return [];

          const items = container.querySelectorAll(
            '[class*="imso_gs__t-ev"], [class*="gs__t-ev"], [class*="event-item"], [class*="evt"]',
          );

          if (items.length === 0) return [];

          for (const item of items) {
            const text = item.textContent?.trim() || '';
            if (!text) continue;

            const timeMatch = text.match(/^(\d+)(?:\+(\d+))?'?\s*/);
            let minuto = 0;
            let acrescimos: number | undefined;
            if (timeMatch) {
              minuto = Number.parseInt(timeMatch[1], 10);
              if (timeMatch[2]) acrescimos = Number.parseInt(timeMatch[2], 10);
            }

            const textoLimpo = text.replace(/^\d+(?:\+\d+)?'?\s*/, '').trim();

            if (
              textoLimpo.includes('gol') ||
              textoLimpo.includes('⚽') ||
              textoLimpo.includes('penalidade') ||
              (textoLimpo.includes('final') &&
                !textoLimpo.includes('finalização'))
            ) {
              results.push({
                tipo: 'GOL',
                jogador: textoLimpo
                  .replace(/gol\s+(d[eo])\s+/i, '')
                  .replace(/⚽\s*/, '')
                  .replace(/penalidade/i, '')
                  .trim(),
                minuto,
                acrescimos,
              });
            } else if (
              textoLimpo.includes('cartão amarelo') ||
              textoLimpo.includes('🟨')
            ) {
              results.push({
                tipo: 'CARTAO_AMARELO',
                jogador: textoLimpo
                  .replace(/cartão amarelo\s+(para|p\/)\s+/i, '')
                  .replace(/🟨\s*/, '')
                  .trim(),
                minuto,
                acrescimos,
              });
            } else if (
              textoLimpo.includes('cartão vermelho') ||
              textoLimpo.includes('🟥')
            ) {
              results.push({
                tipo: 'CARTAO_VERMELHO',
                jogador: textoLimpo
                  .replace(/cartão vermelho\s+(para|p\/)\s+/i, '')
                  .replace(/🟥\s*/, '')
                  .trim(),
                minuto,
                acrescimos,
              });
            } else if (
              textoLimpo.includes('substituição') ||
              textoLimpo.includes('🔃') ||
              textoLimpo.includes('sai') ||
              textoLimpo.includes('entra')
            ) {
              results.push({
                tipo: 'SUBSTITUICAO',
                jogador: textoLimpo
                  .replace(/substituição\s*/i, '')
                  .replace(/🔃\s*/, '')
                  .trim(),
                minuto,
                acrescimos,
                info: textoLimpo,
              });
            }
          }

          return results;
        },
        { tA: timeA, tB: timeB },
      );

      return eventos as IScrapeEvent[];
    } catch {
      return [];
    }
  }
}
