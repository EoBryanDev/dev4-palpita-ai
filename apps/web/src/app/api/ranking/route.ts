import { calcularRankingGeral } from '@/services/ranking.service';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const rankedUsers = await calcularRankingGeral();
    return NextResponse.json(rankedUsers);
  } catch (error) {
    console.error('Erro ao calcular ranking:', error);
    return NextResponse.json(
      { error: 'Erro interno ao calcular ranking.' },
      { status: 500 },
    );
  }
}
