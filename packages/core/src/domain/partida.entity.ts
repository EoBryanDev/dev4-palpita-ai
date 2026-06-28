export type TPartidaStatus =
  | 'AGENDADA'
  | 'EM_ANDAMENTO'
  | 'FINALIZADA'
  | 'AGENDADO'
  | 'FINALIZADO';

export type TRodadaTipo = 'GRUPO' | 'MATAMATA';
export type TDecididoEm = 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
export type TPenaltyWinner = 'A' | 'B';

export interface IPartidaProps {
  id: string;
  rodadaId: string;
  timeAId: string;
  timeBId: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: Date;
  status: TPartidaStatus;
  decididoEm?: TDecididoEm;
  timeVencedorPenaltis?: TPenaltyWinner;
  dataCriacao: Date;
}

export class Partida {
  private readonly _id: string;
  private readonly _rodadaId: string;
  private _timeAId: string;
  private _timeBId: string;
  private _golsTimeA: number | null;
  private _golsTimeB: number | null;
  private _dataInicio: Date;
  private _status: TPartidaStatus;
  private _decididoEm: TDecididoEm;
  private _timeVencedorPenaltis: TPenaltyWinner | null;
  private readonly _dataCriacao: Date;

  constructor(props: IPartidaProps) {
    this._id = props.id;
    this._rodadaId = props.rodadaId;
    this._timeAId = props.timeAId;
    this._timeBId = props.timeBId;
    this._golsTimeA = props.golsTimeA;
    this._golsTimeB = props.golsTimeB;
    this._dataInicio = props.dataInicio;
    this._status = props.status;
    this._decididoEm = props.decididoEm ?? 'NORMAL';
    this._timeVencedorPenaltis = props.timeVencedorPenaltis ?? null;
    this._dataCriacao = props.dataCriacao;
  }

  public get id(): string {
    return this._id;
  }

  public get rodadaId(): string {
    return this._rodadaId;
  }

  public get timeAId(): string {
    return this._timeAId;
  }

  public get timeBId(): string {
    return this._timeBId;
  }

  public get golsTimeA(): number | null {
    return this._golsTimeA;
  }

  public get golsTimeB(): number | null {
    return this._golsTimeB;
  }

  public get dataInicio(): Date {
    return this._dataInicio;
  }

  public get status(): TPartidaStatus {
    return this._status;
  }

  public get decididoEm(): TDecididoEm {
    return this._decididoEm;
  }

  public get timeVencedorPenaltis(): TPenaltyWinner | null {
    return this._timeVencedorPenaltis;
  }

  public get dataCriacao(): Date {
    return this._dataCriacao;
  }

  public finalizar(
    golsTimeA: number,
    golsTimeB: number,
    decididoEm?: TDecididoEm,
    timeVencedorPenaltis?: TPenaltyWinner,
  ): void {
    if (golsTimeA < 0 || golsTimeB < 0) {
      throw new Error('Gols nao podem ser negativos');
    }
    if (new Date() < this._dataInicio) {
      throw new Error(
        'Nao e possivel finalizar uma partida antes do seu inicio',
      );
    }
    this._golsTimeA = golsTimeA;
    this._golsTimeB = golsTimeB;
    this._status = 'FINALIZADA';
    if (decididoEm) {
      this._decididoEm = decididoEm;
    }
    if (timeVencedorPenaltis) {
      this._timeVencedorPenaltis = timeVencedorPenaltis;
    }
  }

  public iniciar(): void {
    this._status = 'EM_ANDAMENTO';
  }
}
