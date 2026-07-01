export interface IScrapeEvent {
  tipo: 'GOL' | 'CARTAO_AMARELO' | 'CARTAO_VERMELHO' | 'SUBSTITUICAO';
  timeId?: string;
  timeNome?: string;
  jogador: string;
  minuto: number;
  acrescimos?: number;
  info?: string;
}

export interface IScrapeResult {
  golsTimeA: number;
  golsTimeB: number;
  status: string;
  decididoEm?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
  timeVencedorPenaltis?: 'A' | 'B' | null;
  eventos?: IScrapeEvent[];
}

export interface IScraperEngine {
  scrapeMatch(
    timeA: string,
    timeB: string,
    date?: Date,
  ): Promise<IScrapeResult | null>;
}
