import { describe, expect, it, vi } from 'vitest';
import { GoogleEngine } from '../engines/google-engine.js';

const mockHtml = (golsA: number, golsB: number, statusText: string) => `
<html><body>
<div class="imso_mh__l-tm-sc">${golsA}</div>
<div class="imso_mh__r-tm-sc">${golsB}</div>
<div class="imso_mh__m-st">${statusText}</div>
</body></html>`;

describe('GoogleEngine', () => {
  it('should parse scores from Google HTML', async () => {
    const engine = new GoogleEngine();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(mockHtml(3, 1, 'Final')),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await engine.scrapeMatch('Brasil', 'Argentina');
    expect(result).not.toBeNull();
    expect(result?.golsTimeA).toBe(3);
    expect(result?.golsTimeB).toBe(1);
    expect(result?.status).toBe('FINALIZADO');

    vi.unstubAllGlobals();
  });

  it('should detect ao vivo matches', async () => {
    const engine = new GoogleEngine();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(mockHtml(1, 0, 'Ao vivo')),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await engine.scrapeMatch('Brasil', 'Argentina');
    expect(result).not.toBeNull();
    expect(result?.status).toBe('EM_ANDAMENTO');

    vi.unstubAllGlobals();
  });

  it('should return null when fetch fails', async () => {
    const engine = new GoogleEngine();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await engine.scrapeMatch('Brasil', 'Argentina');
    expect(result).toBeNull();

    vi.unstubAllGlobals();
  });

  it('should throw RateLimitError on HTTP 429', async () => {
    const engine = new GoogleEngine();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => '30' },
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(engine.scrapeMatch('Brasil', 'Argentina')).rejects.toThrow(
      'Rate limited',
    );

    vi.unstubAllGlobals();
  });
});
