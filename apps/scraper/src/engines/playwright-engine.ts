import { type Page, chromium } from 'playwright';
import type { IScrapeEvent, IScrapeResult, IScraperEngine } from '../types.js';

export class PlaywrightEngine implements IScraperEngine {
  private getSearchUrl(timeA: string, timeB: string): string {
    const q = `${timeA} x ${timeB} copa 2026 resultado`;
    return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=pt-BR`;
  }

  async scrapeMatch(
    timeA: string,
    timeB: string,
  ): Promise<IScrapeResult | null> {
    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    try {
      const context = await browser.newContext({
        locale: 'pt-BR',
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();
      const url = this.getSearchUrl(timeA, timeB);

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      await page.waitForTimeout(2_000);

      // Try to expand the sports card to get detailed stats and timeline
      try {
        const expanded = await page.evaluate(() => {
          const els = Array.from(
            document.querySelectorAll('a, button, [role="button"], span, div'),
          );
          for (const el of els) {
            const txt = el.textContent?.trim() || '';
            if (
              txt.toLowerCase() === 'mais sobre este jogo' ||
              txt.toLowerCase().includes('mais sobre este jogo')
            ) {
              (el as HTMLElement).click();
              return true;
            }
          }
          return false;
        });
        console.log(`[PlaywrightEngine] Expand clicked: ${expanded}`);
        if (expanded) {
          await page.waitForTimeout(3000);
        }
      } catch (e) {
        console.warn(
          '[PlaywrightEngine] Warning: failed to expand sports widget:',
          (e as Error).message,
        );
      }

      const golsA = await this.extractScore(page, 'l');
      const golsB = await this.extractScore(page, 'r');
      console.log(`[PlaywrightEngine] Score extracted: A=${golsA}, B=${golsB}`);

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
      // Check if timeline container exists, if not try to click "Linha do tempo" tab
      const tabClicked = await page.evaluate(() => {
        const selectors = [
          '[class*="imso_hs__mntc"]',
          '[class*="imso-hs__mntc"]',
          '[class*="timeline"]',
          '[jsname*="timeline"]',
        ];
        let exists = false;
        for (const sel of selectors) {
          if (document.querySelector(sel)) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          const tabs = Array.from(
            document.querySelectorAll('div[role="tab"], span, a, button, .imso-ln, [class*="imso-ln"]'),
          );
          for (const el of tabs) {
            const txt = el.textContent?.trim() || '';
            if (txt.toLowerCase() === 'linha do tempo') {
              (el as HTMLElement).click();
              return true;
            }
          }
        }
        return false;
      });

      console.log(`[PlaywrightEngine] Tab clicked: ${tabClicked}`);
      if (tabClicked) {
        await page.waitForTimeout(2000);
      }

      const eventos = await page.evaluate(
        ({ tA, tB }: { tA: string; tB: string }) => {
          const results: Array<{
            tipo: string;
            jogador: string;
            minuto: number;
            acrescimos?: number;
            info?: string;
            timeNome?: string;
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

          if (!container) {
            console.log("[PlaywrightEngine DOM] Container not found");
            return [];
          }

           const items = container.querySelectorAll(
            '[class*="imso_gs__t-ev"], [class*="gs__t-ev"], [class*="event-item"], [class*="evt"]',
          );

          console.log(`[PlaywrightEngine DOM] Timeline items found: ${items.length}`);

          if (items.length === 0) return [];

          const cleanTA = tA.toLowerCase().trim();
          const cleanTB = tB.toLowerCase().trim();

          for (const item of items) {
            const text = item.textContent?.trim() || '';
            if (!text) continue;

            const timeEl = item.querySelector('[class*="t-ev-tm"]');
            const timeText = timeEl?.textContent?.trim() || '';

            const timeMatch = timeText.match(/^(\d+)(?:\+(\d+))?'?/);
            if (!timeMatch) continue;

            const minuto = Number.parseInt(timeMatch[1], 10);
            const acrescimos = timeMatch[2]
              ? Number.parseInt(timeMatch[2], 10)
              : undefined;

            const infoEl = item.querySelector(
              '[class*="t-ev-info"], [class*="info"]',
            );
            if (!infoEl) continue;

            const infoText = infoEl.textContent?.trim() || '';
            const infoTextLower = infoText.toLowerCase();

            const playerEl = infoEl.querySelector(
              '.lr-imso-evt-text-title, [class*="evt-text-title"]',
            );
            let jogador = '';
            if (playerEl) {
              jogador = playerEl.textContent?.trim() || '';
            } else {
              jogador = infoEl.firstElementChild?.textContent?.trim() || '';
            }

            const fullItemTextLower = text.toLowerCase();
            let timeNome: string | undefined;
            if (fullItemTextLower.includes(cleanTA)) {
              timeNome = tA;
            } else if (fullItemTextLower.includes(cleanTB)) {
              timeNome = tB;
            }

            let tipo: string | null = null;
            let finalInfo = '';

            if (
              infoTextLower.includes('gol') ||
              infoTextLower.includes('⚽') ||
              infoTextLower.includes('penalidade')
            ) {
              tipo = 'GOL';
              if (
                infoTextLower.includes('pênalti') ||
                infoTextLower.includes('penal')
              ) {
                finalInfo = 'Pênalti';
              }
            } else if (
              infoTextLower.includes('cartão amarelo') ||
              infoTextLower.includes('🟨')
            ) {
              tipo = 'CARTAO_AMARELO';
            } else if (
              infoTextLower.includes('cartão vermelho') ||
              infoTextLower.includes('🟥')
            ) {
              tipo = 'CARTAO_VERMELHO';
            } else if (
              infoTextLower.includes('substituição') ||
              infoTextLower.includes('saída') ||
              infoTextLower.includes('entrada') ||
              infoTextLower.includes('sai') ||
              infoTextLower.includes('entra') ||
              infoTextLower.includes('substituído') ||
              infoTextLower.includes('🔃')
            ) {
              tipo = 'SUBSTITUICAO';
              finalInfo = infoText;
            }

            if (tipo) {
              results.push({
                tipo,
                jogador,
                minuto,
                acrescimos,
                info: finalInfo || undefined,
                timeNome,
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
