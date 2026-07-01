import { db, partidas, times } from '@palpita/db';
import { asc, isNotNull } from 'drizzle-orm';

export interface IGrupoClassificado {
  nome: string;
  times: {
    nome: string;
    emoji: string;
    pontos: number;
    saldoGols: number;
    golsPro: number;
  }[];
}

export interface IBracketMatch {
  id: string;
  timeA: string;
  emojiA: string;
  timeB: string;
  emojiB: string;
  data: string;
  vencedor?: 'A' | 'B';
}

export async function obterGruposClassificados(): Promise<{
  grupos: IGrupoClassificado[];
  bracket: {
    dezesseisAvos: IBracketMatch[];
    oitavas: IBracketMatch[];
    quartas: IBracketMatch[];
    semis: IBracketMatch[];
    final: IBracketMatch[];
  };
}> {
  // 1. Buscar todos os times
  const dbTimes = await db
    .select()
    .from(times)
    .orderBy(asc(times.grupo), asc(times.nome));

  // 2. Buscar todas as partidas (para calcular grupos e mata-mata)
  // Usamos isNotNull(partidas.id) para compatibilidade com os mocks
  const dbPartidas = await db
    .select()
    .from(partidas)
    .where(isNotNull(partidas.id));

  // 3. Inicializar mapa de estatísticas por time
  const statsTimes = new Map<
    string,
    { pontos: number; saldoGols: number; golsPro: number }
  >();

  for (const t of dbTimes) {
    statsTimes.set(t.id, { pontos: 0, saldoGols: 0, golsPro: 0 });
  }

  // Mapeamento de times para facilitação do chaveamento
  const timesMap = new Map<string, (typeof dbTimes)[0]>();
  const timesByName = new Map<string, (typeof dbTimes)[0]>();
  for (const t of dbTimes) {
    timesMap.set(t.id, t);
    timesByName.set(t.nome, t);
  }

  // 4. Calcular pontos, saldo de gols e gols pró das partidas finalizadas (Regras FIFA)
  // Apenas para jogos da fase de grupos (times do mesmo grupo)
  for (const partida of dbPartidas) {
    const { timeAId, timeBId, golsTimeA, golsTimeB, status } = partida;
    if (golsTimeA === null || golsTimeB === null) continue;
    if (status !== 'FINALIZADO') continue;

    const timeA = timesMap.get(timeAId);
    const timeB = timesMap.get(timeBId);
    if (!timeA || !timeB) continue;

    if (timeA.grupo === timeB.grupo) {
      const statsA = statsTimes.get(timeAId) || {
        pontos: 0,
        saldoGols: 0,
        golsPro: 0,
      };
      const statsB = statsTimes.get(timeBId) || {
        pontos: 0,
        saldoGols: 0,
        golsPro: 0,
      };

      statsA.golsPro += golsTimeA;
      statsA.saldoGols += golsTimeA - golsTimeB;

      statsB.golsPro += golsTimeB;
      statsB.saldoGols += golsTimeB - golsTimeA;

      if (golsTimeA > golsTimeB) {
        statsA.pontos += 3;
      } else if (golsTimeB > golsTimeA) {
        statsB.pontos += 3;
      } else {
        statsA.pontos += 1;
        statsB.pontos += 1;
      }

      statsTimes.set(timeAId, statsA);
      statsTimes.set(timeBId, statsB);
    }
  }

  // 5. Agrupar times por grupo
  const gruposMap = new Map<
    string,
    {
      nome: string;
      times: {
        id: string;
        nome: string;
        emoji: string;
        pontos: number;
        saldoGols: number;
        golsPro: number;
      }[];
    }
  >();

  for (const t of dbTimes) {
    let grupo = gruposMap.get(t.grupo);
    if (!grupo) {
      grupo = {
        nome: t.grupo,
        times: [],
      };
      gruposMap.set(t.grupo, grupo);
    }

    const stats = statsTimes.get(t.id) || {
      pontos: 0,
      saldoGols: 0,
      golsPro: 0,
    };
    grupo.times.push({
      id: t.id,
      nome: t.nome,
      emoji: t.emoji,
      pontos: stats.pontos,
      saldoGols: stats.saldoGols,
      golsPro: stats.golsPro,
    });
  }

  // 6. Ordenar os times dentro de cada grupo pelos critérios da FIFA:
  for (const grupo of gruposMap.values()) {
    grupo.times.sort((a, b) => {
      if (b.pontos !== a.pontos) {
        return b.pontos - a.pontos;
      }
      if (b.saldoGols !== a.saldoGols) {
        return b.saldoGols - a.saldoGols;
      }
      if (b.golsPro !== a.golsPro) {
        return b.golsPro - a.golsPro;
      }
      return a.nome.localeCompare(b.nome);
    });
  }

  // Mapear para o formato de retorno público dos grupos
  const grupos = Array.from(gruposMap.values())
    .map((g) => ({
      nome: g.nome,
      times: g.times.map((t) => ({
        nome: t.nome,
        emoji: t.emoji,
        pontos: t.pontos,
        saldoGols: t.saldoGols,
        golsPro: t.golsPro,
      })),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // --- CÁLCULO DO CHAVEAMENTO (MATA-MATA) ---

  const classificados1: Record<string, (typeof dbTimes)[0]> = {};
  const classificados2: Record<string, (typeof dbTimes)[0]> = {};
  const terceiros: {
    id: string;
    nome: string;
    emoji: string;
    grupo: string;
    grupoLetter: string;
    pontos: number;
    saldoGols: number;
    golsPro: number;
  }[] = [];

  for (const [grupoNome, grupoData] of gruposMap.entries()) {
    const grupoLetter = grupoNome.replace('Grupo ', '').trim();
    if (grupoData.times.length >= 1) {
      const t = timesMap.get(grupoData.times[0].id);
      if (t) classificados1[grupoLetter] = t;
    }
    if (grupoData.times.length >= 2) {
      const t = timesMap.get(grupoData.times[1].id);
      if (t) classificados2[grupoLetter] = t;
    }
    if (grupoData.times.length >= 3) {
      const t = timesMap.get(grupoData.times[2].id);
      if (t) {
        terceiros.push({
          id: t.id,
          nome: t.nome,
          emoji: t.emoji,
          grupo: t.grupo,
          grupoLetter,
          pontos: grupoData.times[2].pontos,
          saldoGols: grupoData.times[2].saldoGols,
          golsPro: grupoData.times[2].golsPro,
        });
      }
    }
  }

  // Ordenar terceiros colocados pelas regras da FIFA
  terceiros.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
    if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
    return a.nome.localeCompare(b.nome);
  });

  const melhoresTerceiros = terceiros.slice(0, 8);

  // Mapear confrontos de mata-mata reais do banco de dados (se existirem)
  const dbMataMata = dbPartidas.filter((partida) => {
    const timeA = timesMap.get(partida.timeAId);
    const timeB = timesMap.get(partida.timeBId);
    if (!timeA || !timeB) return false;
    return (
      timeA.grupo !== timeB.grupo ||
      new Date(partida.dataInicio) >= new Date('2026-06-28')
    );
  });

  // Função auxiliar para procurar jogo no banco de dados
  const buscarJogoBD = (timeANome: string, timeBNome: string) => {
    const timeA = timesByName.get(timeANome);
    const timeB = timesByName.get(timeBNome);
    if (!timeA || !timeB) return undefined;

    return dbMataMata.find(
      (p) =>
        (p.timeAId === timeA.id && p.timeBId === timeB.id) ||
        (p.timeAId === timeB.id && p.timeBId === timeA.id),
    );
  };

  // Função auxiliar para verificar se time avançou por pênaltis (jogando rodada posterior)
  const avancouPorPenaltis = (timeId: string, dataAtual: Date) => {
    return dbMataMata.some(
      (p) =>
        (p.timeAId === timeId || p.timeBId === timeId) &&
        new Date(p.dataInicio) > dataAtual,
    );
  };

  const obterVencedorMatch = (
    p: (typeof dbPartidas)[0],
    timeA: (typeof dbTimes)[0],
    timeB: (typeof dbTimes)[0],
  ) => {
    if (
      (p.status !== 'FINALIZADO' && p.status !== 'FINALIZADA') ||
      p.golsTimeA === null ||
      p.golsTimeB === null
    )
      return null;
    if (p.golsTimeA > p.golsTimeB) {
      return p.timeAId === timeA.id ? 'A' : 'B';
    }
    if (p.golsTimeB > p.golsTimeA) {
      return p.timeBId === timeB.id ? 'B' : 'A';
    }
    // Disputa por pênaltis
    if (p.timeVencedorPenaltis === 'A') return 'A';
    if (p.timeVencedorPenaltis === 'B') return 'B';

    const dataJogo = new Date(p.dataInicio);
    if (avancouPorPenaltis(timeA.id, dataJogo)) return 'A';
    if (avancouPorPenaltis(timeB.id, dataJogo)) return 'B';
    return null; // Não assumir 'A' como padrão caso ainda não esteja decidido
  };

  // Atribuição gulosa determinista dos 8 melhores terceiros
  const slotsTerceiros = [
    { id: 'J79', allowed: ['C', 'E', 'F', 'H', 'I'] },
    { id: 'J85', allowed: ['E', 'F', 'G', 'I', 'J'] },
    { id: 'J82', allowed: ['B', 'E', 'F', 'I', 'J'] },
    { id: 'J75', allowed: ['A', 'B', 'C', 'D', 'F'] },
    { id: 'J81', allowed: ['A', 'E', 'H', 'I', 'J'] },
    { id: 'J78', allowed: ['C', 'D', 'F', 'G', 'H'] },
    { id: 'J88', allowed: ['D', 'E', 'I', 'J', 'L'] },
    { id: 'J80', allowed: ['E', 'H', 'I', 'J', 'K'] },
  ];

  const atribuidos = new Set<string>();
  const terceirosAtribuidos: Record<
    string,
    { nome: string; emoji: string; id: string }
  > = {};

  for (const slot of slotsTerceiros) {
    const match = melhoresTerceiros.find(
      (t) => slot.allowed.includes(t.grupoLetter) && !atribuidos.has(t.id),
    );
    if (match) {
      terceirosAtribuidos[slot.id] = {
        id: match.id,
        nome: match.nome,
        emoji: match.emoji,
      };
      atribuidos.add(match.id);
    } else {
      const fallback = melhoresTerceiros.find((t) => !atribuidos.has(t.id));
      if (fallback) {
        terceirosAtribuidos[slot.id] = {
          id: fallback.id,
          nome: fallback.nome,
          emoji: fallback.emoji,
        };
        atribuidos.add(fallback.id);
      } else {
        terceirosAtribuidos[slot.id] = {
          id: '',
          nome: `3º ${slot.allowed.join('/')}`,
          emoji: '⚽',
        };
      }
    }
  }

  // Formatador de data simplificado
  // Formatador de data simplificado com fuso horário America/Sao_Paulo
  const formatarDataJogo = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const dia =
      parts.find((p) => p.type === 'day')?.value ||
      String(d.getDate()).padStart(2, '0');
    const mesRaw = parts.find((p) => p.type === 'month')?.value || 'Jun';
    const mes =
      mesRaw.charAt(0).toUpperCase() + mesRaw.slice(1).replace('.', '');
    const hora =
      parts.find((p) => p.type === 'hour')?.value ||
      String(d.getHours()).padStart(2, '0');
    const min =
      parts.find((p) => p.type === 'minute')?.value ||
      String(d.getMinutes()).padStart(2, '0');

    return `${dia}/${mes} - ${hora}:${min}`;
  };

  const criarBracketMatch = (
    id: string,
    projA: { nome: string; emoji: string; id: string } | null,
    projB: { nome: string; emoji: string; id: string } | null,
    dataPadrao: string,
  ) => {
    let matchBD: (typeof dbPartidas)[0] | undefined = undefined;
    if (projA && projB) {
      matchBD = buscarJogoBD(projA.nome, projB.nome);
    }

    const tA = matchBD ? timesMap.get(matchBD.timeAId) : undefined;
    const tB = matchBD ? timesMap.get(matchBD.timeBId) : undefined;

    const timeA = tA ? tA.nome : projA?.nome || 'A confirmar';
    const emojiA = tA ? tA.emoji : projA?.emoji || '⚽';
    const timeB = tB ? tB.nome : projB?.nome || 'A confirmar';
    const emojiB = tB ? tB.emoji : projB?.emoji || '⚽';

    const data = matchBD ? formatarDataJogo(matchBD.dataInicio) : dataPadrao;

    let vencedor: 'A' | 'B' | undefined = undefined;
    if (matchBD) {
      const tA = timesMap.get(matchBD.timeAId);
      const tB = timesMap.get(matchBD.timeBId);
      if (tA && tB) {
        const v = obterVencedorMatch(matchBD, tA, tB);
        if (v) vencedor = v;
      }
    }

    return {
      id,
      timeA,
      emojiA,
      timeB,
      emojiB,
      data,
      vencedor,
    };
  };

  const r32MatchesList = [
    criarBracketMatch(
      'Jogo 73 (16-1)',
      classificados2.A || null,
      classificados2.B || null,
      '28/Jun - 13:00',
    ),
    criarBracketMatch(
      'Jogo 74 (16-2)',
      classificados1.C || null,
      classificados2.F || null,
      '28/Jun - 17:00',
    ),
    criarBracketMatch(
      'Jogo 75 (16-3)',
      classificados1.E || null,
      terceirosAtribuidos.J75 || null,
      '29/Jun - 13:00',
    ),
    criarBracketMatch(
      'Jogo 76 (16-4)',
      classificados1.F || null,
      classificados2.C || null,
      '29/Jun - 17:00',
    ),
    criarBracketMatch(
      'Jogo 77 (16-5)',
      classificados2.E || null,
      classificados2.I || null,
      '30/Jun - 13:00',
    ),
    criarBracketMatch(
      'Jogo 78 (16-6)',
      classificados1.I || null,
      terceirosAtribuidos.J78 || null,
      '30/Jun - 17:00',
    ),
    criarBracketMatch(
      'Jogo 79 (16-7)',
      classificados1.A || null,
      terceirosAtribuidos.J79 || null,
      '01/Jul - 13:00',
    ),
    criarBracketMatch(
      'Jogo 80 (16-8)',
      classificados1.L || null,
      terceirosAtribuidos.J80 || null,
      '01/Jul - 17:00',
    ),
    criarBracketMatch(
      'Jogo 81 (16-9)',
      classificados1.G || null,
      terceirosAtribuidos.J81 || null,
      '02/Jul - 13:00',
    ),
    criarBracketMatch(
      'Jogo 82 (16-10)',
      classificados1.D || null,
      terceirosAtribuidos.J82 || null,
      '02/Jul - 17:00',
    ),
    criarBracketMatch(
      'Jogo 83 (16-11)',
      classificados1.H || null,
      classificados2.J || null,
      '03/Jul - 13:00',
    ),
    criarBracketMatch(
      'Jogo 84 (16-12)',
      classificados2.K || null,
      classificados2.L || null,
      '03/Jul - 17:00',
    ),
    criarBracketMatch(
      'Jogo 85 (16-13)',
      classificados1.B || null,
      terceirosAtribuidos.J85 || null,
      '28/Jun - 21:00',
    ),
    criarBracketMatch(
      'Jogo 86 (16-14)',
      classificados2.D || null,
      classificados2.G || null,
      '29/Jun - 21:00',
    ),
    criarBracketMatch(
      'Jogo 87 (16-15)',
      classificados1.J || null,
      classificados2.H || null,
      '30/Jun - 21:00',
    ),
    criarBracketMatch(
      'Jogo 88 (16-16)',
      classificados1.K || null,
      terceirosAtribuidos.J88 || null,
      '01/Jul - 21:00',
    ),
  ];

  const obterTimeVencedorR32 = (matchLabel: string) => {
    const match = r32MatchesList.find((m) => m.id.startsWith(matchLabel));
    if (!match || !match.vencedor) return null;
    const key = match.vencedor === 'A' ? match.timeA : match.timeB;
    const t = timesByName.get(key || '');
    if (!t) return null;
    return { id: t.id, nome: t.nome, emoji: t.emoji };
  };

  const criarSubsequenteMatch = (
    id: string,
    vencedorMatchAId: string,
    vencedorMatchBId: string,
    dataPadrao: string,
  ) => {
    const timeAProj = obterTimeVencedorR32(vencedorMatchAId);
    const timeBProj = obterTimeVencedorR32(vencedorMatchBId);

    let matchBD: (typeof dbPartidas)[0] | undefined = undefined;
    if (timeAProj && timeBProj) {
      matchBD = buscarJogoBD(timeAProj.nome, timeBProj.nome);
    }

    const tA = matchBD ? timesMap.get(matchBD.timeAId) : undefined;
    const tB = matchBD ? timesMap.get(matchBD.timeBId) : undefined;

    const timeA = tA
      ? tA.nome
      : timeAProj?.nome || `Vencedor ${vencedorMatchAId}`;
    const emojiA = tA ? tA.emoji : timeAProj?.emoji || '⚽';
    const timeB = tB
      ? tB.nome
      : timeBProj?.nome || `Vencedor ${vencedorMatchBId}`;
    const emojiB = tB ? tB.emoji : timeBProj?.emoji || '⚽';

    const data = matchBD ? formatarDataJogo(matchBD.dataInicio) : dataPadrao;

    let vencedor: 'A' | 'B' | undefined = undefined;
    if (matchBD) {
      const tA = timesMap.get(matchBD.timeAId);
      const tB = timesMap.get(matchBD.timeBId);
      if (tA && tB) {
        const v = obterVencedorMatch(matchBD, tA, tB);
        if (v) vencedor = v;
      }
    }

    return {
      id,
      timeA,
      emojiA,
      timeB,
      emojiB,
      data,
      vencedor,
    };
  };

  const oitavasList = [
    criarSubsequenteMatch(
      'Jogo 89 (O1)',
      'Jogo 75',
      'Jogo 78',
      '04/Jul - 13:00',
    ),
    criarSubsequenteMatch(
      'Jogo 90 (O2)',
      'Jogo 73',
      'Jogo 76',
      '04/Jul - 17:00',
    ),
    criarSubsequenteMatch(
      'Jogo 91 (O3)',
      'Jogo 84',
      'Jogo 83',
      '05/Jul - 13:00',
    ),
    criarSubsequenteMatch(
      'Jogo 92 (O4)',
      'Jogo 82',
      'Jogo 81',
      '05/Jul - 17:00',
    ),
    criarSubsequenteMatch(
      'Jogo 93 (O5)',
      'Jogo 74',
      'Jogo 77',
      '06/Jul - 13:00',
    ),
    criarSubsequenteMatch(
      'Jogo 94 (O6)',
      'Jogo 79',
      'Jogo 80',
      '06/Jul - 17:00',
    ),
    criarSubsequenteMatch(
      'Jogo 95 (O7)',
      'Jogo 87',
      'Jogo 86',
      '07/Jul - 13:00',
    ),
    criarSubsequenteMatch(
      'Jogo 96 (O8)',
      'Jogo 85',
      'Jogo 88',
      '07/Jul - 17:00',
    ),
  ];

  const obterTimeVencedorOitavas = (matchLabel: string) => {
    const match = oitavasList.find((m) => m.id.startsWith(matchLabel));
    if (!match || !match.vencedor) return null;
    const key = match.vencedor === 'A' ? match.timeA : match.timeB;
    const t = timesByName.get(key || '');
    if (!t) return null;
    return { id: t.id, nome: t.nome, emoji: t.emoji };
  };

  const criarQuartasMatch = (
    id: string,
    vencedorMatchAId: string,
    vencedorMatchBId: string,
    dataPadrao: string,
  ) => {
    const timeAProj = obterTimeVencedorOitavas(vencedorMatchAId);
    const timeBProj = obterTimeVencedorOitavas(vencedorMatchBId);

    let matchBD: (typeof dbPartidas)[0] | undefined = undefined;
    if (timeAProj && timeBProj) {
      matchBD = buscarJogoBD(timeAProj.nome, timeBProj.nome);
    }

    const tA = matchBD ? timesMap.get(matchBD.timeAId) : undefined;
    const tB = matchBD ? timesMap.get(matchBD.timeBId) : undefined;

    const timeA = tA
      ? tA.nome
      : timeAProj?.nome || `Vencedor ${vencedorMatchAId}`;
    const emojiA = tA ? tA.emoji : timeAProj?.emoji || '⚽';
    const timeB = tB
      ? tB.nome
      : timeBProj?.nome || `Vencedor ${vencedorMatchBId}`;
    const emojiB = tB ? tB.emoji : timeBProj?.emoji || '⚽';

    const data = matchBD ? formatarDataJogo(matchBD.dataInicio) : dataPadrao;

    let vencedor: 'A' | 'B' | undefined = undefined;
    if (matchBD) {
      const tA = timesMap.get(matchBD.timeAId);
      const tB = timesMap.get(matchBD.timeBId);
      if (tA && tB) {
        const v = obterVencedorMatch(matchBD, tA, tB);
        if (v) vencedor = v;
      }
    }

    return {
      id,
      timeA,
      emojiA,
      timeB,
      emojiB,
      data,
      vencedor,
    };
  };

  const quartasList = [
    criarQuartasMatch('Jogo 97 (Q1)', 'Jogo 89', 'Jogo 90', '09/Jul - 13:00'),
    criarQuartasMatch('Jogo 98 (Q2)', 'Jogo 91', 'Jogo 92', '10/Jul - 17:00'),
    criarQuartasMatch('Jogo 99 (Q3)', 'Jogo 93', 'Jogo 94', '11/Jul - 13:00'),
    criarQuartasMatch('Jogo 100 (Q4)', 'Jogo 95', 'Jogo 96', '12/Jul - 17:00'),
  ];

  const obterTimeVencedorQuartas = (matchLabel: string) => {
    const match = quartasList.find((m) => m.id.startsWith(matchLabel));
    if (!match || !match.vencedor) return null;
    const key = match.vencedor === 'A' ? match.timeA : match.timeB;
    const t = timesByName.get(key || '');
    if (!t) return null;
    return { id: t.id, nome: t.nome, emoji: t.emoji };
  };

  const criarSemisMatch = (
    id: string,
    vencedorMatchAId: string,
    vencedorMatchBId: string,
    dataPadrao: string,
  ) => {
    const timeAProj = obterTimeVencedorQuartas(vencedorMatchAId);
    const timeBProj = obterTimeVencedorQuartas(vencedorMatchBId);

    let matchBD: (typeof dbPartidas)[0] | undefined = undefined;
    if (timeAProj && timeBProj) {
      matchBD = buscarJogoBD(timeAProj.nome, timeBProj.nome);
    }

    const tA = matchBD ? timesMap.get(matchBD.timeAId) : undefined;
    const tB = matchBD ? timesMap.get(matchBD.timeBId) : undefined;

    const timeA = tA
      ? tA.nome
      : timeAProj?.nome || `Vencedor ${vencedorMatchAId}`;
    const emojiA = tA ? tA.emoji : timeAProj?.emoji || '⚽';
    const timeB = tB
      ? tB.nome
      : timeBProj?.nome || `Vencedor ${vencedorMatchBId}`;
    const emojiB = tB ? tB.emoji : timeBProj?.emoji || '⚽';

    const data = matchBD ? formatarDataJogo(matchBD.dataInicio) : dataPadrao;

    let vencedor: 'A' | 'B' | undefined = undefined;
    if (matchBD) {
      const tA = timesMap.get(matchBD.timeAId);
      const tB = timesMap.get(matchBD.timeBId);
      if (tA && tB) {
        const v = obterVencedorMatch(matchBD, tA, tB);
        if (v) vencedor = v;
      }
    }

    return {
      id,
      timeA,
      emojiA,
      timeB,
      emojiB,
      data,
      vencedor,
    };
  };

  const semisList = [
    criarSemisMatch('Jogo 101 (S1)', 'Jogo 97', 'Jogo 98', '14/Jul - 16:00'),
    criarSemisMatch('Jogo 102 (S2)', 'Jogo 99', 'Jogo 100', '15/Jul - 16:00'),
  ];

  const obterTimeVencedorSemis = (matchLabel: string) => {
    const match = semisList.find((m) => m.id.startsWith(matchLabel));
    if (!match || !match.vencedor) return null;
    const key = match.vencedor === 'A' ? match.timeA : match.timeB;
    const t = timesByName.get(key || '');
    if (!t) return null;
    return { id: t.id, nome: t.nome, emoji: t.emoji };
  };

  const criarFinalMatch = (
    id: string,
    vencedorMatchAId: string,
    vencedorMatchBId: string,
    dataPadrao: string,
  ) => {
    const timeAProj = obterTimeVencedorSemis(vencedorMatchAId);
    const timeBProj = obterTimeVencedorSemis(vencedorMatchBId);

    let matchBD: (typeof dbPartidas)[0] | undefined = undefined;
    if (timeAProj && timeBProj) {
      matchBD = buscarJogoBD(timeAProj.nome, timeBProj.nome);
    }

    const tA = matchBD ? timesMap.get(matchBD.timeAId) : undefined;
    const tB = matchBD ? timesMap.get(matchBD.timeBId) : undefined;

    const timeA = tA
      ? tA.nome
      : timeAProj?.nome || `Vencedor ${vencedorMatchAId}`;
    const emojiA = tA ? tA.emoji : timeAProj?.emoji || '🏆';
    const timeB = tB
      ? tB.nome
      : timeBProj?.nome || `Vencedor ${vencedorMatchBId}`;
    const emojiB = tB ? tB.emoji : timeBProj?.emoji || '🏆';

    const data = matchBD ? formatarDataJogo(matchBD.dataInicio) : dataPadrao;

    let vencedor: 'A' | 'B' | undefined = undefined;
    if (matchBD) {
      const tA = timesMap.get(matchBD.timeAId);
      const tB = timesMap.get(matchBD.timeBId);
      if (tA && tB) {
        const v = obterVencedorMatch(matchBD, tA, tB);
        if (v) vencedor = v;
      }
    }

    return {
      id,
      timeA,
      emojiA,
      timeB,
      emojiB,
      data,
      vencedor,
    };
  };

  const finalList = [
    criarFinalMatch('Jogo 104 (F1)', 'Jogo 101', 'Jogo 102', '19/Jul - 16:00'),
  ];

  return {
    grupos,
    bracket: {
      dezesseisAvos: r32MatchesList,
      oitavas: oitavasList,
      quartas: quartasList,
      semis: semisList,
      final: finalList,
    },
  };
}
