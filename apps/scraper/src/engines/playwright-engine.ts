import type { IScrapeResult, IScraperEngine } from '../types.js';

export class PlaywrightEngine implements IScraperEngine {
  async scrapeMatch(
    _timeA: string,
    _timeB: string,
  ): Promise<IScrapeResult | null> {
    return null;
  }
}
