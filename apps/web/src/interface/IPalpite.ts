export interface IPalpiteIndividual {
  id: string;
  usuarioNome: string;
  golsTimeA: number;
  golsTimeB: number;
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
