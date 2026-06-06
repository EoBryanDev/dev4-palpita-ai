import { configuracoes, db } from '@palpita/db';
import { eq } from 'drizzle-orm';

export async function obterValorPalpite(): Promise<number> {
  const config = await db.query.configuracoes.findFirst({
    where: eq(configuracoes.chave, 'valor_palpite'),
  });

  if (config) {
    const parsed = Number.parseFloat(config.valor);
    return Number.isNaN(parsed) ? 50 : parsed;
  }

  return 50;
}
