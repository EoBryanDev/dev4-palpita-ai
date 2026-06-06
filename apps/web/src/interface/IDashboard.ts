export interface IPartidaDashboard {
  id: string;
  timeA: string;
  timeB: string;
  timeAEmoji?: string;
  timeBEmoji?: string;
  dataInicio: string;
  status: string;
  golsTimeA?: number | null;
  golsTimeB?: number | null;
  palpiteGolsA?: number | null;
  palpiteGolsB?: number | null;
  jaPalpitou: boolean;
}

export interface IHistoricoDashboard {
  partidaId: string;
  timeA: string;
  timeB: string;
  timeAEmoji?: string;
  timeBEmoji?: string;
  placarOficialA: number;
  placarOficialB: number;
  palpiteA: number;
  palpiteB: number;
  pontosGanhos: number;
  dataInicio: string;
}

export interface IDashboardPalpitesProps {
  nomeUsuario: string;
  emailUsuario: string;
  cargoUsuario: string;
  userStatus: string;
  pontos: number;
  posicao: number;
  nomeRodada: string;
  partidas: IPartidaDashboard[];
  historico: IHistoricoDashboard[];
}
