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
  momentoPrevisto?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
  timeVencedorPrevisto?: 'A' | 'B' | null;
  decididoEm?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
  timeVencedorPenaltis?: 'A' | 'B' | null;
  tipoRodada?: 'GRUPO' | 'MATAMATA';
  jaPalpitou: boolean;
  rodadaNome?: string;
}

export interface IRodadaDashboard {
  id: string;
  numero: number;
  nome: string;
  tipo?: 'GRUPO' | 'MATAMATA';
  partidas: IPartidaDashboard[];
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
  status?: string;
  momentoPrevisto?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
  timeVencedorPrevisto?: 'A' | 'B' | null;
  timeVencedorPenaltis?: 'A' | 'B' | null;
  decididoEm?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
  tipoRodada?: 'GRUPO' | 'MATAMATA';
}

export interface IDashboardPalpitesProps {
  nomeUsuario: string;
  emailUsuario: string;
  cargoUsuario: string;
  userStatus: string;
  pontos: number;
  posicao: number;
  rodadas: IRodadaDashboard[];
  historico: IHistoricoDashboard[];
  prazoLimite?: string;
  isTudoBloqueado: boolean;
  isLiberacaoTardia?: boolean;
  palpitesSalvosIniciais: IPartidaDashboard[];
  totalPalpitesSalvos: number;
  partidasEmAndamento: IPartidaDashboard[];
}
