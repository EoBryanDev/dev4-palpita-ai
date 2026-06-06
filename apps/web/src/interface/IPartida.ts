export interface IPartidaFormatada {
  id: string;
  timeA: string;
  timeB: string;
  timeAEmoji?: string;
  timeBEmoji?: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: Date;
  status: string;
  rodada: string;
}

export interface IHomePartida {
  id: string;
  timeA: string;
  timeB: string;
  timeAEmoji?: string;
  timeBEmoji?: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: string;
  status: string;
  rodada: string;
}
