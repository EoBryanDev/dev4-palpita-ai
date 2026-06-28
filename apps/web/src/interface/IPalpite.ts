export interface IPalpiteIndividual {
  id: string;
  usuarioNome: string;
  golsTimeA: number;
  golsTimeB: number;
  momentoPrevisto?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
  timeVencedorPrevisto?: 'A' | 'B' | null;
}

export interface IPartidaStats {
  id: string;
  timeA: string;
  timeB: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: string;
  status: string;
  rodadaNome: string;
  tipoRodada?: 'GRUPO' | 'MATAMATA';
  decididoEm?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
  timeVencedorPenaltis?: 'A' | 'B' | null;
  estatisticas: {
    total: number;
    vitoriasA: number;
    vitoriasB: number;
    empates: number;
    pctVitoriasA: number;
    pctVitoriasB: number;
    pctEmpates: number;
  };
  palpitesIndividuaisLiberados: boolean;
  palpitesIndividuais: IPalpiteIndividual[];
}
