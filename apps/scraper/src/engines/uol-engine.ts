import { type Page, chromium } from 'playwright';
import type { IScrapeEvent, IScrapeResult, IScraperEngine } from '../types.js';

export class UolEngine implements IScraperEngine {
  private normalizeTeamName(name: string): string {
    return (
      name
        .normalize('NFD')
        // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics removal range
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-')
    ); // substitui espaços por hífens
  }

  private getMatchUrl(
    timeA: string,
    timeB: string,
    date?: Date,
  ): string | null {
    const matchDate = date || new Date();
    const year = matchDate.getFullYear();
    const month = String(matchDate.getMonth() + 1).padStart(2, '0');
    const day = String(matchDate.getDate()).padStart(2, '0');

    const normA = this.normalizeTeamName(timeA);
    const normB = this.normalizeTeamName(timeB);

    if (!normA || !normB) return null;

    return `https://placar.uol.com.br/esporte/futebol/copa-do-mundo/${year}/${month}/${day}/${normA}-x-${normB}.htm`;
  }

  async scrapeMatch(
    timeA: string,
    timeB: string,
    date?: Date,
  ): Promise<IScrapeResult | null> {
    const url = this.getMatchUrl(timeA, timeB, date);
    if (!url) {
      console.warn(`[UolEngine] Cannot build URL for ${timeA} x ${timeB}`);
      return null;
    }

    console.log(`[UolEngine] Scraping URL: ${url}`);

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

      // Navega e aguarda o carregamento inicial do DOM
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 20_000,
      });

      // Aguarda a hidratação do placar: se houver gols no minuto a minuto, espera até que o placar não seja 0x0
      try {
        await page.waitForFunction(
          () => {
            const scoreAEl = document.querySelector('.team-one .team-score');
            const scoreBEl = document.querySelector('.team-two .team-score');
            if (!scoreAEl || !scoreBEl) return false;

            const scoreAText = scoreAEl.textContent?.trim() || '';
            const scoreBText = scoreBEl.textContent?.trim() || '';
            if (scoreAText === '' || scoreBText === '') return false;

            const golsA = Number.parseInt(scoreAText, 10);
            const golsB = Number.parseInt(scoreBText, 10);
            if (Number.isNaN(golsA) || Number.isNaN(golsB)) return false;

            // Se o placar já for diferente de 0x0, já está hidratado
            if (golsA > 0 || golsB > 0) return true;

            // Se o placar for 0x0, verifica se há gols nos cards do minuto a minuto
            const cards = Array.from(
              document.querySelectorAll('.solar-card.live-post'),
            );
            const hasGoalInTimeline = cards.some((card) => {
              const txt = card.textContent?.toLowerCase() || '';
              const heading =
                card
                  .querySelector('.solar-card-heading')
                  ?.textContent?.toLowerCase() || '';
              return (
                heading.includes('goool') ||
                txt.includes('goooooool') ||
                txt.includes('gol!')
              );
            });

            // Se houver gols nos lances mas o placar ainda estiver 0x0, não está hidratado.
            // Se não houver gols nos lances e o placar for 0x0, consideramos hidratado (ou jogo não iniciado).
            return !hasGoalInTimeline;
          },
          { timeout: 6000 },
        );
      } catch {
        console.warn(
          `[UolEngine] Timeout ao aguardar hidratação de ${timeA} x ${timeB}, prosseguindo.`,
        );
      }

      // Pequena folga para garantir a renderização final de eventos
      await page.waitForTimeout(500);

      // Executa o script de parsing no contexto da página
      const result = await page.evaluate(
        (args: { timeANome: string; timeBNome: string }) => {
          const tA = args.timeANome;
          const tB = args.timeBNome;

          // 1. Extração dos gols de cada time
          const scoreAEl = document.querySelector('.team-one .team-score');
          const scoreBEl = document.querySelector('.team-two .team-score');

          if (!scoreAEl || !scoreBEl) {
            return null; // Caso não encontre os placares, a página não é válida
          }

          const golsTimeA = Number.parseInt(
            scoreAEl.textContent?.trim() || '0',
            10,
          );
          const golsTimeB = Number.parseInt(
            scoreBEl.textContent?.trim() || '0',
            10,
          );

          if (Number.isNaN(golsTimeA) || Number.isNaN(golsTimeB)) {
            return null;
          }

          // 2. Extração do status do jogo
          const liveEl = document.querySelector('.bold-text2.live');
          const timeEl = document.querySelector('.time.regular-text2');
          const statusText = (timeEl?.textContent?.trim() || '').toLowerCase();
          const cards = Array.from(
            document.querySelectorAll('.solar-card.live-post'),
          );

          // Determinar se o jogo terminou analisando as atualizações
          const hasFimDeJogo = cards.some((card) => {
            const txt = card.textContent?.toLowerCase() || '';
            return (
              txt.includes('fim de jogo') ||
              txt.includes('fim de partida') ||
              txt.includes('fim do jogo')
            );
          });

          let status: 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO' = 'AGENDADO';
          if (
            hasFimDeJogo ||
            statusText.includes('encerrado') ||
            statusText.includes('fim de jogo') ||
            statusText.includes('finalizado')
          ) {
            status = 'FINALIZADO';
          } else if (
            liveEl ||
            statusText.includes('º') ||
            statusText.includes('prorrogacao') ||
            statusText.includes('pro')
          ) {
            status = 'EM_ANDAMENTO';
          } else {
            status = 'AGENDADO';
          }

          // 3. Extração dos eventos estruturados do minuto a minuto
          const rawEvents: Array<{
            tipo: 'GOL' | 'CARTAO_AMARELO' | 'CARTAO_VERMELHO' | 'SUBSTITUICAO';
            jogador: string;
            minuto: number;
            acrescimos?: number;
            info?: string;
            timeNome?: string;
          }> = [];

          for (const card of cards) {
            const header = card.querySelector('.solar-card-header');
            if (!header) continue;
            const headerText = header.textContent?.trim() || '';

            const timeRegex =
              /^(\d+)(?:\+(\d+))?'\s*(1º T|2º T|Prorrogação|Pro)?/i;
            const match = headerText.match(timeRegex);
            if (!match) continue;

            const minuto = Number.parseInt(match[1], 10);
            const acrescimo = match[2]
              ? Number.parseInt(match[2], 10)
              : undefined;
            const bodyText =
              card.textContent?.replace(headerText, '').trim() || '';

            // A. Detecção de Gol
            const isGol =
              card
                .querySelector('.solar-card-heading')
                ?.textContent?.includes('GOOOL') ||
              bodyText.toLowerCase().includes('goooooool') ||
              bodyText.toLowerCase().includes('gol!');

            if (isGol) {
              // Determina qual time fez o gol pesquisando nomes na descrição do gol
              let timeNome: string | undefined = undefined;
              const normalizedBody = bodyText.toLowerCase();
              if (normalizedBody.includes(tA.toLowerCase())) {
                timeNome = tA;
              } else if (normalizedBody.includes(tB.toLowerCase())) {
                timeNome = tB;
              }

              // Tenta descobrir o nome do jogador (maiusculas no texto ou regex antes do texto de exultação)
              let jogador = 'Desconhecido';
              const playerMatch = bodyText.match(
                /(?:gol!|goooooool da \S+|goooooool do \S+)\s*!\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
              );
              if (playerMatch) {
                jogador = playerMatch[1].trim();
              } else {
                // Fallback: tenta pegar a primeira frase ou nome próprio
                const matchName = bodyText.match(
                  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
                );
                if (matchName) {
                  jogador = matchName[1].trim();
                }
              }

              rawEvents.push({
                tipo: 'GOL',
                jogador,
                minuto,
                acrescimos: acrescimo,
                timeNome,
                info: bodyText,
              });
              continue;
            }

            // B. Detecção de Substituição
            const subMatch = bodyText.match(
              /Substituição\s*Entra\s*(.+?)\s*Sai\s*(.+)/i,
            );
            if (subMatch) {
              const jogadorEntra = subMatch[1].trim();
              const jogadorSai = subMatch[2].trim();

              rawEvents.push({
                tipo: 'SUBSTITUICAO',
                jogador: jogadorEntra,
                minuto,
                acrescimos: acrescimo,
                info: `Entra: ${jogadorEntra} | Sai: ${jogadorSai}`,
              });
              continue;
            }

            // C. Detecção de Cartão
            const hasYC = card.querySelector('.card-rect.yc') !== null;
            const hasRC = card.querySelector('.card-rect.rc') !== null;
            if (hasYC || hasRC) {
              let jogador = 'Desconhecido';
              const matchName = bodyText.match(
                /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
              );
              if (matchName) {
                jogador = matchName[1].trim();
              }

              rawEvents.push({
                tipo: hasYC ? 'CARTAO_AMARELO' : 'CARTAO_VERMELHO',
                jogador,
                minuto,
                acrescimos: acrescimo,
                info: bodyText,
              });
            }
          }

          return {
            golsTimeA,
            golsTimeB,
            status,
            eventos: rawEvents,
          };
        },
        { timeANome: timeA, timeBNome: timeB },
      );

      await browser.close();

      if (!result) {
        return null;
      }

      // Tipar corretamente o resultado final para compatibilidade externa
      return {
        golsTimeA: result.golsTimeA,
        golsTimeB: result.golsTimeB,
        status: result.status,
        eventos: result.eventos?.map((evt) => ({
          tipo: evt.tipo,
          jogador: evt.jogador,
          minuto: evt.minuto,
          acrescimos: evt.acrescimos,
          info: evt.info,
          timeNome: evt.timeNome,
        })),
      };
    } catch (error) {
      await browser.close();
      console.warn(
        `[UolEngine] Error scraping ${timeA} x ${timeB} at ${url}:`,
        (error as Error).message,
      );
      return null;
    }
  }
}
