import ChavesClient from '@/components/chaves-client';
import { db, partidas, times } from '@palpita/db';
import { asc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Chaveamento & Grupos - Copa 2026 | Palpita AI',
  description:
    'Veja a composition dos grupos e a projeção do chaveamento do mata-mata até a grande final.',
};

export default async function ChavesPage() {
  // 1. Buscar todos os times
  const dbTimes = await db
    .select()
    .from(times)
    .orderBy(asc(times.grupo), asc(times.nome));

  // 2. Buscar todas as partidas finalizadas
  const partidasFinalizadas = await db
    .select()
    .from(partidas)
    .where(eq(partidas.status, 'FINALIZADO'));

  // 3. Inicializar mapa de estatísticas por time
  const statsTimes = new Map<
    string,
    { pontos: number; saldoGols: number; golsPro: number }
  >();

  for (const t of dbTimes) {
    statsTimes.set(t.id, { pontos: 0, saldoGols: 0, golsPro: 0 });
  }

  // 4. Calcular pontos, saldo de gols e gols pró das partidas finalizadas (Regras FIFA)
  for (const partida of partidasFinalizadas) {
    const { timeAId, timeBId, golsTimeA, golsTimeB } = partida;
    if (golsTimeA === null || golsTimeB === null) continue;

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

  // 5. Agrupar times por grupo
  const gruposMap = new Map<
    string,
    {
      nome: string;
      times: {
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
      nome: t.nome,
      emoji: t.emoji,
      pontos: stats.pontos,
      saldoGols: stats.saldoGols,
      golsPro: stats.golsPro,
    });
  }

  // 6. Ordenar os times dentro de cada grupo pelos critérios da FIFA:
  //    - Mais pontos
  //    - Melhor saldo de gols
  //    - Mais gols pró
  //    - Ordem alfabética (desempate final)
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

  // Mapear para o formato do ChavesClient (omitindo propriedades extras de ordenação)
  const grupos = Array.from(gruposMap.values())
    .map((g) => ({
      nome: g.nome,
      times: g.times.map((t) => ({
        nome: t.nome,
        emoji: t.emoji,
        pontos: t.pontos,
      })),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return <ChavesClient grupos={grupos} />;
}
