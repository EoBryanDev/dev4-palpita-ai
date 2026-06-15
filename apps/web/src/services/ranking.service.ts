import { db, palpites, partidas, usuarios } from '@palpita/db';
import { and, eq, ne, or } from 'drizzle-orm';

export interface IRankedUser {
  id: string;
  nome: string;
  email: string;
  pontos: number;
  posicao: number;
  posicaoGrupo: number;
  jogosPontuados: number;
  palpitesCerteiros: number;
}

const obterVencedor = (golsA: number, golsB: number): 'A' | 'B' | 'EMPATE' => {
  if (golsA > golsB) return 'A';
  if (golsB > golsA) return 'B';
  return 'EMPATE';
};

export async function calcularRankingGeral(): Promise<IRankedUser[]> {
  // 1. Buscar usuários ativos ou liberados que não sejam ADMIN
  const activeUsers = await db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
    })
    .from(usuarios)
    .where(
      and(
        or(eq(usuarios.status, 'ATIVO'), eq(usuarios.status, 'LIBERADO')),
        ne(usuarios.cargo, 'ADMIN'),
      ),
    );

  // 2. Buscar partidas finalizadas
  const finishedMatches = await db
    .select({
      id: partidas.id,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
    })
    .from(partidas)
    .where(eq(partidas.status, 'FINALIZADO'));

  // Criar um mapa de partidas finalizadas para busca O(1)
  const matchesMap = new Map<
    string,
    { golsTimeA: number; golsTimeB: number }
  >();
  for (const match of finishedMatches) {
    if (match.golsTimeA !== null && match.golsTimeB !== null) {
      matchesMap.set(match.id, {
        golsTimeA: match.golsTimeA,
        golsTimeB: match.golsTimeB,
      });
    }
  }

  // 3. Buscar palpites
  const allPalpites = await db.select().from(palpites);

  // Criar um mapa de palpites agrupados por usuário
  const userPalpitesMap = new Map<string, typeof allPalpites>();
  for (const p of allPalpites) {
    const userList = userPalpitesMap.get(p.usuarioId) || [];
    userList.push(p);
    userPalpitesMap.set(p.usuarioId, userList);
  }

  // 4. Calcular pontos para cada usuário
  const rankingData = activeUsers.map((user) => {
    const userGuesses = userPalpitesMap.get(user.id) || [];
    let pontos = 0;
    let jogosPontuados = 0;
    let palpitesCerteiros = 0;

    for (const guess of userGuesses) {
      const match = matchesMap.get(guess.partidaId);
      if (match) {
        const vencedorPalpite = obterVencedor(guess.golsTimeA, guess.golsTimeB);
        const vencedorPartida = obterVencedor(match.golsTimeA, match.golsTimeB);

        const acertouPlacarExato =
          guess.golsTimeA === match.golsTimeA &&
          guess.golsTimeB === match.golsTimeB;

        if (acertouPlacarExato) {
          pontos += 2;
          palpitesCerteiros++;
          jogosPontuados++;
        } else if (vencedorPalpite === vencedorPartida) {
          pontos += 1;
          jogosPontuados++;
        }
      }
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      pontos,
      jogosPontuados,
      palpitesCerteiros,
    };
  });

  // 5. Ordenar por pontos (desc) e nome (asc)
  rankingData.sort((a, b) => {
    if (b.pontos !== a.pontos) {
      return b.pontos - a.pontos;
    }
    return a.nome.localeCompare(b.nome);
  });

  // 6. Atribuir posições considerando empates
  let rankGrupo = 1;
  let lastPoints = -1;
  const rankedUsers = rankingData.map((user, index) => {
    if (user.pontos !== lastPoints) {
      rankGrupo = index + 1;
      lastPoints = user.pontos;
    }
    return {
      ...user,
      posicao: index + 1,
      posicaoGrupo: rankGrupo,
    };
  });

  return rankedUsers;
}
