import { type Page, chromium } from 'playwright';
import type { IScrapeEvent, IScrapeResult, IScraperEngine } from '../types.js';

export class PlaywrightEngine implements IScraperEngine {
  private getGoogleUrl(timeA: string, timeB: string): string {
    const q = `${timeA} x ${timeB} copa 2026 resultado`;
    return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=pt-BR`;
  }

  private getOgolSearchUrl(timeA: string, timeB: string): string {
    const q = `${timeA} ${timeB} copa mundo 2026`;
    return `https://www.ogol.com.br/pesquisa?q=${encodeURIComponent(q)}&tipo=jogos`;
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

      // ─── Step 1: Google → placar e status ────────────────────────────
      const googleUrl = this.getGoogleUrl(timeA, timeB);
      await page.goto(googleUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      await page.waitForTimeout(2_000);

      // Expand Google card
      try {
        const expanded = await page.evaluate(() => {
          const els = Array.from(
            document.querySelectorAll('a, button, [role="button"], span, div'),
          );
          for (const el of els) {
            const txt = el.textContent?.trim() || '';
            if (txt.toLowerCase().includes('mais sobre este jogo')) {
              (el as HTMLElement).click();
              return true;
            }
          }
          return false;
        });
        console.log(`[PlaywrightEngine] Google expand: ${expanded}`);
        if (expanded) await page.waitForTimeout(3_000);
      } catch {
        /* ignore */
      }

      const googleData = await page.evaluate(
        (args: { tA: string; tB: string }) => {
          const normA = args.tA
            .normalize('NFD')
            // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
          const normB = args.tB
            .normalize('NFD')
            // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

          // Find the best match container
          let container: Element | null = null;

          // 1. Try to find container using score elements
          const leftScores = Array.from(
            document.querySelectorAll('[class*="imso_mh__l-tm-sc"]'),
          );
          for (const leftScore of leftScores) {
            let parent = leftScore.parentElement;
            while (parent) {
              if (parent.querySelector('[class*="imso_mh__r-tm-sc"]')) {
                const text = (parent.textContent || '')
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .trim();
                if (text.includes(normA) && text.includes(normB)) {
                  container = parent;
                  break;
                }
                break;
              }
              parent = parent.parentElement;
            }
            if (container) break;
          }

          // 2. Fallback to deepest element containing both team names
          if (!container) {
            const allElements = Array.from(document.querySelectorAll('*'));
            const candidateContainers: Element[] = [];
            for (const el of allElements) {
              if (
                ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)
              )
                continue;
              const text = (el.textContent || '')
                .normalize('NFD')
                // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
              if (text.includes(normA) && text.includes(normB)) {
                let childContainsBoth = false;
                for (let i = 0; i < el.children.length; i++) {
                  const childText = (el.children[i].textContent || '')
                    .normalize('NFD')
                    // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .trim();
                  if (childText.includes(normA) && childText.includes(normB)) {
                    childContainsBoth = true;
                    break;
                  }
                }
                if (!childContainsBoth) {
                  candidateContainers.push(el);
                }
              }
            }

            if (candidateContainers.length > 0) {
              const prioritized = candidateContainers.find((el) => {
                const className = (el.className || '').toString().toLowerCase();
                return (
                  className.includes('imso') ||
                  className.includes('match') ||
                  className.includes('sport')
                );
              });
              container = prioritized || candidateContainers[0];
            }
          }

          // If no container found, fall back to document body
          const searchScope = container || document.body;

          // 1. Extract score for side 'l' (golsA)
          let golsA: number | null = null;
          const selectorsA = [
            '.imso_mh__l-tm-sc',
            '[class*="imso_mh__l-tm-sc"]',
          ];
          for (const sel of selectorsA) {
            const el = searchScope.querySelector(sel);
            if (el) {
              const n = Number.parseInt(el.textContent?.trim() || '', 10);
              if (!Number.isNaN(n)) {
                golsA = n;
                break;
              }
            }
          }
          if (golsA === null) {
            const sep = searchScope.querySelector(
              '[class*="imso_mh__scr-sep"], [class*="imso_mh__ma-sc-cont"]',
            );
            if (sep) {
              const text = sep.textContent?.trim() || '';
              const m = text.match(/(\d+)\s*[×x]\s*(\d+)/);
              if (m) {
                golsA = Number.parseInt(m[1], 10);
              }
            }
          }

          // 2. Extract score for side 'r' (golsB)
          let golsB: number | null = null;
          const selectorsB = [
            '.imso_mh__r-tm-sc',
            '[class*="imso_mh__r-tm-sc"]',
          ];
          for (const sel of selectorsB) {
            const el = searchScope.querySelector(sel);
            if (el) {
              const n = Number.parseInt(el.textContent?.trim() || '', 10);
              if (!Number.isNaN(n)) {
                golsB = n;
                break;
              }
            }
          }
          if (golsB === null) {
            const sep = searchScope.querySelector(
              '[class*="imso_mh__scr-sep"], [class*="imso_mh__ma-sc-cont"]',
            );
            if (sep) {
              const text = sep.textContent?.trim() || '';
              const m = text.match(/(\d+)\s*[×x]\s*(\d+)/);
              if (m) {
                golsB = Number.parseInt(m[2], 10);
              }
            }
          }

          // 3. Extract status
          let status = 'EM_ANDAMENTO';
          const statusSelectors = [
            '.imso_mh__ft-mtch',
            '[class*="imso_mh__ft-mtch"]',
            '[class*="imso_mh__m-st"]',
          ];
          for (const sel of statusSelectors) {
            const el = searchScope.querySelector(sel);
            if (el) {
              const text = el.textContent?.trim().toLowerCase() || '';
              if (text.includes('encerrado') || text.includes('final')) {
                status = 'FINALIZADO';
                break;
              }
              if (text.includes('ao vivo') || text.includes('andamento')) {
                status = 'EM_ANDAMENTO';
                break;
              }
              if (text.includes('agendado')) {
                status = 'AGENDADO';
                break;
              }
            }
          }

          // Extract goals
          const results: Array<{
            tipo: 'GOL';
            jogador: string;
            minuto: number;
            acrescimos: number | undefined;
            timeNome: string;
          }> = [];

          const sides = [
            { suffix: 'imso_gs__left-team', team: args.tA },
            { suffix: 'imso_gs__right-team', team: args.tB },
          ];

          for (let si = 0; si < sides.length; si++) {
            const selectorSuffix = sides[si].suffix;
            const teamName = sides[si].team;
            const allTgs = searchScope.querySelectorAll(
              '[class*="imso_gs__tgs"]',
            );
            let goalsContainer: Element | null = null;
            for (let i = 0; i < allTgs.length; i++) {
              if (allTgs[i].className.indexOf(selectorSuffix) >= 0) {
                goalsContainer = allTgs[i];
                break;
              }
            }
            if (!goalsContainer) continue;

            const rows = goalsContainer.querySelectorAll(
              '[class*="imso_gs__gs-r"]',
            );
            for (let ri = 0; ri < rows.length; ri++) {
              const row = rows[ri];
              const fullText = row.textContent ? row.textContent.trim() : '';
              if (!fullText) continue;

              let jogador = '';
              const directChildren = row.children;
              if (directChildren.length > 0) {
                const firstText = directChildren[0].textContent
                  ? directChildren[0].textContent.trim()
                  : '';
                if (firstText && firstText.search(/\d/) === -1) {
                  jogador = firstText;
                }
              }
              if (!jogador) {
                const idx = fullText.search(/\d/);
                if (idx > 0) jogador = fullText.slice(0, idx).trim();
              }
              if (!jogador) continue;

              const minuteEls = row.querySelectorAll(
                '[class*="imso_gs__g-a-t"]',
              );
              if (minuteEls.length > 0) {
                for (let mi = 0; mi < minuteEls.length; mi++) {
                  const t = minuteEls[mi].textContent
                    ? minuteEls[mi].textContent.trim().replace(/[',\s]/g, '')
                    : '';
                  const m = t.match(/^(\d+)(\+(\d+))?/);
                  if (!m) continue;
                  const minuto = Number.parseInt(m[1], 10);
                  const acrescimos = m[3]
                    ? Number.parseInt(m[3], 10)
                    : undefined;
                  if (!Number.isNaN(minuto)) {
                    results.push({
                      tipo: 'GOL',
                      jogador,
                      minuto,
                      acrescimos,
                      timeNome: teamName,
                    });
                  }
                }
              } else {
                const re = /(\d+)(\+(\d+))?'/g;
                let m = re.exec(fullText);
                while (m) {
                  const minuto = Number.parseInt(m[1], 10);
                  const acrescimos = m[3]
                    ? Number.parseInt(m[3], 10)
                    : undefined;
                  if (!Number.isNaN(minuto)) {
                    results.push({
                      tipo: 'GOL',
                      jogador,
                      minuto,
                      acrescimos,
                      timeNome: teamName,
                    });
                  }
                  m = re.exec(fullText);
                }
              }
            }
          }

          results.sort(
            (a, b) =>
              a.minuto + (a.acrescimos || 0) - (b.minuto + (b.acrescimos || 0)),
          );

          return { golsA, golsB, status, goalEvents: results };
        },
        { tA: timeA, tB: timeB },
      );

      const golsA = googleData.golsA;
      const golsB = googleData.golsB;
      console.log(`[PlaywrightEngine] Score: A=${golsA}, B=${golsB}`);

      if (golsA === null || golsB === null) {
        await browser.close();
        return null;
      }

      const status = googleData.status;
      console.log(`[PlaywrightEngine] Status: ${status}`);

      // ─── Step 2: Google goals summary ────────────────────────────────
      const goalEvents = googleData.goalEvents.map((e) => ({
        tipo: e.tipo as IScrapeEvent['tipo'],
        jogador: e.jogador,
        minuto: e.minuto,
        acrescimos: e.acrescimos,
        timeNome: e.timeNome,
      }));
      console.log(`[PlaywrightEngine] Goals from Google: ${goalEvents.length}`);

      // ─── Step 3: Ogol → substituições, cartões e demais eventos ─────
      let ogolEvents: IScrapeEvent[] = [];
      try {
        ogolEvents = await this.scrapeOgolEvents(page, timeA, timeB);
        console.log(
          `[PlaywrightEngine] Events from Ogol: ${ogolEvents.length}`,
        );
      } catch (e) {
        console.warn(
          '[PlaywrightEngine] Ogol scrape failed:',
          (e as Error).message,
        );
      }

      await browser.close();

      // Merge: use Google goals as authoritative + Ogol non-goal events
      const merged = this.mergeEvents(goalEvents, ogolEvents);

      return {
        golsTimeA: golsA,
        golsTimeB: golsB,
        status: status as IScrapeResult['status'],
        eventos: merged.length > 0 ? merged : undefined,
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

  // ─── Full events from Ogol ────────────────────────────────────────────
  private async scrapeOgolEvents(
    page: Page,
    timeA: string,
    timeB: string,
  ): Promise<IScrapeEvent[]> {
    // Navigate to ogol search to find the match
    const searchUrl = this.getOgolSearchUrl(timeA, timeB);
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForTimeout(1_500);

    // Find the match link
    let matchUrl = await page.evaluate(
      (args: { tA: string; tB: string }) => {
        const tA = args.tA.toLowerCase();
        const tB = args.tB.toLowerCase();
        const allEls = Array.from(document.querySelectorAll('*'));
        for (const el of allEls) {
          const txt = (el.textContent || '').trim().toLowerCase();
          if (txt.includes(tA) && txt.includes(tB) && txt.length < 250) {
            const link =
              el.querySelector('a') || (el.tagName === 'A' ? el : null);
            if (link) {
              const href = (link as HTMLAnchorElement).href;
              if (href.includes('jogo') || href.includes('ao-vivo'))
                return href;
            }
          }
        }
        return null;
      },
      { tA: timeA, tB: timeB },
    );

    if (!matchUrl) {
      console.warn(
        '[PlaywrightEngine] Ogol search failed, trying Google fallback',
      );
      const googleQ = `${timeA} ${timeB} ogol`;
      try {
        await page.goto(
          `https://www.google.com/search?q=${encodeURIComponent(googleQ)}&hl=pt-BR`,
          { waitUntil: 'domcontentloaded', timeout: 30_000 },
        );
        await page.waitForTimeout(2_000);

        matchUrl = await page.evaluate(
          (args: { tA: string; tB: string }) => {
            const links = Array.from(document.querySelectorAll('a'));
            for (const link of links) {
              const href = link.href;
              if (
                href.includes('ogol.com.br') &&
                (href.includes('ao-vivo') || href.includes('jogo'))
              ) {
                const txt = (link.textContent || '').toLowerCase();
                if (
                  txt.includes(args.tA.toLowerCase()) ||
                  txt.includes(args.tB.toLowerCase())
                )
                  return href;
              }
            }
            return null;
          },
          { tA: timeA, tB: timeB },
        );
      } catch (err) {
        console.warn(
          '[PlaywrightEngine] Google fallback failed:',
          (err as Error).message,
        );
      }
    }

    if (!matchUrl) {
      console.warn('[PlaywrightEngine] Ogol: match page not found');
      return [];
    }

    console.log(`[PlaywrightEngine] Ogol match URL: ${matchUrl}`);
    await page.goto(matchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForTimeout(2_000);

    // Extract full text and parse events
    const pageText = await page.evaluate(() => document.body.innerText);

    return this.parseOgolEvents(pageText, timeA, timeB);
  }

  /**
   * Parses ogol's plain text timeline to extract structured events.
   * Lines follow patterns like:
   *   "81'\nArgélia: Adil Boulbina(entra) - Ibrahim Maza(sai)"
   *   "35'\nArgélia: Youcef Atal recebeu cartão amarelo"
   *   "17'\n1-0"  (goal marker - we skip, handled by Google)
   */
  private parseOgolEvents(
    text: string,
    timeA: string,
    timeB: string,
  ): IScrapeEvent[] {
    const events: IScrapeEvent[] = [];
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const minuteRe = /^(\d{1,3})(\+(\d+))?'$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const minMatch = line.match(minuteRe);
      if (!minMatch) continue;

      const minuto = Number.parseInt(minMatch[1], 10);
      const acrescimos = minMatch[3]
        ? Number.parseInt(minMatch[3], 10)
        : undefined;
      const nextLine = lines[i + 1] || '';

      // Skip score lines (e.g. "1-0", "2-0", "3-0")
      if (/^\d+-\d+$/.test(nextLine)) continue;

      // Detect substitution: "Time: Player(entra) - Player(sai)"
      const subMatch = nextLine.match(
        /^(.+?):\s*(.+?)\(entra\)\s*-\s*(.+?)\(sai\)/,
      );
      if (subMatch) {
        const teamRaw = subMatch[1].trim();
        const playerIn = subMatch[2].trim();
        const playerOut = subMatch[3].trim();

        const normA = this.normalizeName(timeA);
        const normB = this.normalizeName(timeB);
        const normTeam = this.normalizeName(teamRaw);

        let timeNome: string | undefined;
        if (normTeam.includes(normA) || normA.includes(normTeam)) {
          timeNome = timeA;
        } else if (normTeam.includes(normB) || normB.includes(normTeam)) {
          timeNome = timeB;
        }

        events.push({
          tipo: 'SUBSTITUICAO',
          jogador: playerIn,
          minuto,
          acrescimos,
          info: `Entra: ${playerIn} | Sai: ${playerOut}`,
          timeNome,
        });
        continue;
      }

      // Detect card type (yellow / red)
      const hasYellow =
        nextLine.toLowerCase().includes('cartão amarelo') ||
        nextLine.toLowerCase().includes('cartao amarelo');
      const hasRed =
        nextLine.toLowerCase().includes('cartão vermelho') ||
        nextLine.toLowerCase().includes('cartao vermelho');

      if (hasYellow || hasRed) {
        const tipo = hasYellow ? 'CARTAO_AMARELO' : 'CARTAO_VERMELHO';
        let player: string | undefined;
        let teamRaw: string | undefined;

        // Try Format 1: "Cartão amarelo para Player (Team)"
        let cardMatch = nextLine.match(
          /^Cart[ãa]o\s+\S+\s+para\s+(.+?)\s*\((.+?)\)/i,
        );

        if (cardMatch) {
          player = cardMatch[1].trim();
          teamRaw = cardMatch[2].trim();
        } else {
          // Try Format 2: "Team: Player recebeu cartão amarelo"
          cardMatch = nextLine.match(
            /^(.+?):\s*(.+?)\s+recebeu\s+cart[ãa]o\s+(?:amarelo|vermelho)/i,
          );
          if (cardMatch) {
            teamRaw = cardMatch[1].trim();
            player = cardMatch[2].trim();
          } else {
            // Try Format 3: "Player recebeu cartão amarelo" (without team prefix)
            cardMatch = nextLine.match(
              /^(.+?)\s+recebeu\s+cart[ãa]o\s+(?:amarelo|vermelho)/i,
            );
            if (cardMatch) {
              player = cardMatch[1].trim();
            }
          }
        }

        if (player) {
          const normA = this.normalizeName(timeA);
          const normB = this.normalizeName(timeB);
          let timeNome: string | undefined;

          if (teamRaw) {
            const normTeam = this.normalizeName(teamRaw);
            if (normTeam.includes(normA) || normA.includes(normTeam)) {
              timeNome = timeA;
            } else if (normTeam.includes(normB) || normB.includes(normTeam)) {
              timeNome = timeB;
            }
          }

          events.push({
            tipo,
            jogador: player,
            minuto,
            acrescimos,
            timeNome,
          });
        }
      }
    }

    return events;
  }

  private normalizeName(name: string): string {
    return (
      name
        .normalize('NFD')
        // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics removal range
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    );
  }

  /**
   * Merges Google goals with Ogol non-goal events.
   * Google goals are authoritative (correct minute/player).
   * Ogol provides substitutions and cards.
   */
  private mergeEvents(
    goals: IScrapeEvent[],
    ogolEvents: IScrapeEvent[],
  ): IScrapeEvent[] {
    // Take all goals from Google, all non-goals from Ogol
    const nonGoals = ogolEvents.filter((e) => e.tipo !== 'GOL');
    const merged = [...goals, ...nonGoals];
    merged.sort(
      (a, b) =>
        a.minuto + (a.acrescimos || 0) - (b.minuto + (b.acrescimos || 0)),
    );
    return merged;
  }
}
