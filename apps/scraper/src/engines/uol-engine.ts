import { type Page, chromium } from 'playwright';
import type { IScrapeEvent, IScrapeResult, IScraperEngine } from '../types.js';

export function extrairJogadorUol(
  text: string,
  tipo: 'GOL' | 'CARTAO_AMARELO' | 'CARTAO_VERMELHO',
  tA: string,
  tB: string,
): string {
  const normalize = (name: string) => {
    return (
      name
        .normalize('NFD')
        // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics removal range
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    );
  };

  const cleanText = text.replace(/\s+/g, ' ').trim();

  const stopWords = new Set([
    'goool',
    'goooooool',
    'gol',
    'da',
    'do',
    'de',
    'para',
    'os',
    'o',
    'a',
    'um',
    'uma',
    'no',
    'na',
    'em',
    'dos',
    'das',
    'com',
    'por',
    'se',
    'ao',
    'aos',
    'amplia',
    'marca',
    'abre',
    'faz',
    'bate',
    'chuta',
    'desvia',
    'finaliza',
    'escora',
    'completa',
    'anota',
    'coloca',
    'empata',
    'diminui',
    'converte',
    'cabeceia',
    'soma',
    'garante',
    'marcou',
    'ampliou',
    'empatou',
    'diminuiu',
    'fez',
    'converteu',
    'chutou',
    'cabeceou',
    'bateu',
    'contra',
    'e',
    'mais',
    'outro',
    'novamente',
    'placar',
    'amarelo',
    'vermelho',
    'cartao',
    'cartão',
  ]);

  const teamNames = new Set([
    tA.toLowerCase(),
    tB.toLowerCase(),
    normalize(tA),
    normalize(tB),
  ]);

  // If it's a card, try to extract using card-specific patterns first
  if (tipo === 'CARTAO_AMARELO' || tipo === 'CARTAO_VERMELHO') {
    // Pattern 1: "para [Jogador]"
    const paraMatch = cleanText.match(/para\s+([A-Z\xc0-\xffa-z\s-]+)/i);
    if (paraMatch) {
      const candidate = paraMatch[1].trim();
      if (candidate.length > 2) return candidate;
    }

    // Pattern 2: "[Jogador] recebeu"
    const recebeuMatch = cleanText.match(/([A-Z\xc0-\xffa-z\s-]+)\s+recebeu/i);
    if (recebeuMatch) {
      const candidate = recebeuMatch[1].trim();
      if (candidate.length > 2) return candidate;
    }
  }

  // Split by punctuation marks
  const parts = cleanText
    .split(/[!.?,;-]/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    const partLower = part.toLowerCase();

    if (partLower.startsWith('gol') || partLower.startsWith('goo')) {
      const deMatch = part.match(
        /gol\s+(?:de|do|da)\s+([A-Z\xc0-\xffa-z\s-]+)/i,
      );
      if (deMatch) {
        const candidate = deMatch[1].trim();
        const candidateLower = candidate.toLowerCase();
        if (
          !teamNames.has(candidateLower) &&
          !stopWords.has(candidateLower) &&
          candidate.length > 2
        ) {
          const words = candidate.split(/\s+/);
          const cleanWords = [];
          for (const w of words) {
            if (stopWords.has(w.toLowerCase())) break;
            cleanWords.push(w);
          }
          if (cleanWords.length > 0) {
            return cleanWords.join(' ');
          }
        }
      }
      continue;
    }

    const words = part.split(/\s+/);
    const candidateWords = [];
    for (const word of words) {
      const wordLower = word.toLowerCase();
      if (stopWords.has(wordLower)) {
        if (candidateWords.length > 0) {
          break;
        }
        continue;
      }

      if (teamNames.has(wordLower)) {
        continue;
      }

      const isCapitalized = /^[A-Z\xc0-\xff]/.test(word);
      if (isCapitalized && word.length > 1) {
        candidateWords.push(word);
      } else if (candidateWords.length > 0) {
        break;
      }
    }

    if (candidateWords.length > 0) {
      return candidateWords.join(' ');
    }
  }

  // Fallbacks
  const fallbackMatch = cleanText.match(
    /([A-Z\xc0-\xff][A-Za-z\xc0-\xff-]+(?:\s+[A-Z\xc0-\xff][A-Za-z\xc0-\xff-]+)+)/,
  );
  if (fallbackMatch) {
    return fallbackMatch[1].trim();
  }

  const fallbackSingleWord = cleanText.match(
    /([A-Z\xc0-\xff][A-Za-z\xc0-\xff-]+)/,
  );
  if (fallbackSingleWord) {
    const word = fallbackSingleWord[1].trim();
    if (
      !stopWords.has(word.toLowerCase()) &&
      !teamNames.has(word.toLowerCase())
    ) {
      return word;
    }
  }

  return 'Desconhecido';
}

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
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(matchDate);
    const year =
      parts.find((p) => p.type === 'year')?.value ||
      String(matchDate.getFullYear());
    const month =
      parts.find((p) => p.type === 'month')?.value ||
      String(matchDate.getMonth() + 1).padStart(2, '0');
    const day =
      parts.find((p) => p.type === 'day')?.value ||
      String(matchDate.getDate()).padStart(2, '0');

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

            let container: Element | null = null;
            const allElements = Array.from(
              (document.body || document).querySelectorAll('*'),
            );
            const candidateContainers: Element[] = [];
            for (const el of allElements) {
              if (
                ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)
              )
                continue;
              if (!el.querySelector('.team-score, [class*="team-score"]'))
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
                  const child = el.children[i];
                  if (
                    !child.querySelector('.team-score, [class*="team-score"]')
                  )
                    continue;
                  const childText = (child.textContent || '')
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
                  className.includes('team') ||
                  className.includes('match') ||
                  className.includes('placar') ||
                  className.includes('jogo') ||
                  className.includes('scoreboard') ||
                  className.includes('score')
                );
              });
              container = prioritized || candidateContainers[0];
            }

            const scope = container || document;
            const scoreAEl = scope.querySelector(
              '.team-one .team-score, .team-one [class*="team-score"]',
            );
            const scoreBEl = scope.querySelector(
              '.team-two .team-score, .team-two [class*="team-score"]',
            );
            if (!scoreAEl || !scoreBEl) return false;

            const scoreAText = scoreAEl.textContent?.trim() || '';
            const scoreBText = scoreBEl.textContent?.trim() || '';
            if (scoreAText === '' || scoreBText === '') return false;

            const golsA = Number.parseInt(scoreAText, 10);
            const golsB = Number.parseInt(scoreBText, 10);
            if (Number.isNaN(golsA) || Number.isNaN(golsB)) return false;

            // Se o placar já for diferente de 0x0, já está hidratado
            if (golsA > 0 || golsB > 0) return true;

            // Se o placar for 0x0, verifica se há gols nos lances do minuto a minuto
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
          { tA: timeA, tB: timeB },
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

          const normA = tA
            .normalize('NFD')
            // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics removal range
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
          const normB = tB
            .normalize('NFD')
            // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics removal range
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

          // Find the best match container
          let container: Element | null = null;
          const allElements = Array.from(
            (document.body || document).querySelectorAll('*'),
          );
          const candidateContainers: Element[] = [];
          for (const el of allElements) {
            if (
              ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)
            )
              continue;

            // Ensure the container actually contains score elements
            if (!el.querySelector('.team-score, [class*="team-score"]'))
              continue;

            const text = (el.textContent || '')
              .normalize('NFD')
              // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics removal range
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim();
            if (text.includes(normA) && text.includes(normB)) {
              let childContainsBoth = false;
              for (let i = 0; i < el.children.length; i++) {
                const child = el.children[i];
                if (!child.querySelector('.team-score, [class*="team-score"]'))
                  continue;

                const childText = (child.textContent || '')
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics removal range
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
                className.includes('team') ||
                className.includes('match') ||
                className.includes('placar') ||
                className.includes('jogo') ||
                className.includes('scoreboard') ||
                className.includes('score')
              );
            });
            container = prioritized || candidateContainers[0];
          }

          const scope = container || document;

          // 1. Extração dos gols de cada time
          const scoreAEl = scope.querySelector(
            '.team-one .team-score, .team-one [class*="team-score"]',
          );
          const scoreBEl = scope.querySelector(
            '.team-two .team-score, .team-two [class*="team-score"]',
          );

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
          const liveEl = scope.querySelector(
            '.bold-text2.live, [class*="live"]',
          );
          const timeEl = scope.querySelector(
            '.time.regular-text2, [class*="time"]',
          );
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
              // Determina qual time fez o gol pesquisando o sufix-image e a descrição
              let timeNome: string | undefined = undefined;
              const sufixImg = card.querySelector('.sufix-image');
              if (sufixImg) {
                const imgUrl = (sufixImg as HTMLImageElement).src.toLowerCase();
                const normSlugA = tA
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '');
                const normSlugB = tB
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '');
                if (imgUrl.includes(normSlugA)) {
                  timeNome = tA;
                } else if (imgUrl.includes(normSlugB)) {
                  timeNome = tB;
                }
              }

              if (!timeNome) {
                const normalizedBody = bodyText.toLowerCase();
                const cleanA = tA
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase();
                const cleanB = tB
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase();
                if (normalizedBody.includes(cleanA)) {
                  timeNome = tA;
                } else if (normalizedBody.includes(cleanB)) {
                  timeNome = tB;
                } else {
                  const prefA = cleanA.slice(0, 4);
                  const prefB = cleanB.slice(0, 4);
                  if (prefA !== prefB) {
                    if (cleanA.length >= 4 && normalizedBody.includes(prefA)) {
                      timeNome = tA;
                    } else if (
                      cleanB.length >= 4 &&
                      normalizedBody.includes(prefB)
                    ) {
                      timeNome = tB;
                    }
                  }
                }
              }

              rawEvents.push({
                tipo: 'GOL',
                jogador: 'Desconhecido',
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

              let timeNome: string | undefined = undefined;
              const sufixImg = card.querySelector('.sufix-image');
              if (sufixImg) {
                const imgUrl = (sufixImg as HTMLImageElement).src.toLowerCase();
                const normSlugA = tA
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '');
                const normSlugB = tB
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '');
                if (imgUrl.includes(normSlugA)) {
                  timeNome = tA;
                } else if (imgUrl.includes(normSlugB)) {
                  timeNome = tB;
                }
              }

              rawEvents.push({
                tipo: 'SUBSTITUICAO',
                jogador: jogadorEntra,
                minuto,
                acrescimos: acrescimo,
                timeNome,
                info: `Entra: ${jogadorEntra} | Sai: ${jogadorSai}`,
              });
              continue;
            }

            // C. Detecção de Cartão
            const hasYC = card.querySelector('.card-rect.yc') !== null;
            const hasRC = card.querySelector('.card-rect.rc') !== null;
            if (hasYC || hasRC) {
              const tipo = hasYC ? 'CARTAO_AMARELO' : 'CARTAO_VERMELHO';

              let timeNome: string | undefined = undefined;
              const sufixImg = card.querySelector('.sufix-image');
              if (sufixImg) {
                const imgUrl = (sufixImg as HTMLImageElement).src.toLowerCase();
                const normSlugA = tA
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '');
                const normSlugB = tB
                  .normalize('NFD')
                  // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard diacritics range
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '');
                if (imgUrl.includes(normSlugA)) {
                  timeNome = tA;
                } else if (imgUrl.includes(normSlugB)) {
                  timeNome = tB;
                }
              }

              rawEvents.push({
                tipo,
                jogador: 'Desconhecido',
                minuto,
                acrescimos: acrescimo,
                timeNome,
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
        {
          timeANome: timeA,
          timeBNome: timeB,
        },
      );

      await browser.close();

      if (!result) {
        return null;
      }

      // Fallback: se o placar retornou 0x0 mas existem gols nos eventos, calcula com base nos eventos de gol
      let finalGolsA = result.golsTimeA;
      let finalGolsB = result.golsTimeB;

      const eventosDeGol =
        result.eventos?.filter((evt) => evt.tipo === 'GOL') || [];
      const hasGolsNoMinutoAMinuto = eventosDeGol.length > 0;

      if (finalGolsA === 0 && finalGolsB === 0 && hasGolsNoMinutoAMinuto) {
        let countA = 0;
        let countB = 0;
        for (const evt of eventosDeGol) {
          if (evt.timeNome === timeA) {
            countA++;
          } else if (evt.timeNome === timeB) {
            countB++;
          } else {
            // Fallback para caso o timeNome seja indefinido por outro motivo
            const infoLower = (evt.info || '').toLowerCase();
            if (infoLower.includes(timeA.toLowerCase())) {
              countA++;
            } else if (infoLower.includes(timeB.toLowerCase())) {
              countB++;
            }
          }
        }
        finalGolsA = countA;
        finalGolsB = countB;
        console.log(
          `[UolEngine] Placar do topo estava 0x0 mas foram encontrados gols nos eventos. Corrigido para: A=${finalGolsA}, B=${finalGolsB}`,
        );
      }

      // Tipar corretamente o resultado final para compatibilidade externa e extrair o jogador
      return {
        golsTimeA: finalGolsA,
        golsTimeB: finalGolsB,
        status: result.status,
        eventos: result.eventos?.map((evt) => {
          const jogador =
            evt.tipo === 'SUBSTITUICAO' ||
            (evt.jogador && evt.jogador !== 'Desconhecido')
              ? evt.jogador
              : extrairJogadorUol(evt.info || '', evt.tipo, timeA, timeB);
          return {
            tipo: evt.tipo,
            jogador,
            minuto: evt.minuto,
            acrescimos: evt.acrescimos,
            info: evt.info,
            timeNome: evt.timeNome,
          };
        }),
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
