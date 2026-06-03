export type TPartidaStatus = 'AGENDADA' | 'EM_ANDAMENTO' | 'FINALIZADA';

export interface IPartidaProps {
  id: string;
  rodadaId: string;
  timeA: string;
  timeB: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: Date;
  status: TPartidaStatus;
  dataCriacao: Date;
}

export class Partida {
  private readonly _id: string;
  private readonly _rodadaId: string;
  private _timeA: string;
  private _timeB: string;
  private _golsTimeA: number | null;
  private _golsTimeB: number | null;
  private _dataInicio: Date;
  private _status: TPartidaStatus;
  private readonly _dataCriacao: Date;

  constructor(props: IPartidaProps) {
    this._id = props.id;
    this._rodadaId = props.rodadaId;
    this._timeA = props.timeA;
    this._timeB = props.timeB;
    this._golsTimeA = props.golsTimeA;
    this._golsTimeB = props.golsTimeB;
    this._dataInicio = props.dataInicio;
    this._status = props.status;
    this._dataCriacao = props.dataCriacao;
  }

  public get id(): string {
    return this._id;
  }

  public get rodadaId(): string {
    return this._rodadaId;
  }

  public get timeA(): string {
    return this._timeA;
  }

  public get timeB(): string {
    return this._timeB;
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

  public get dataCriacao(): Date {
    return this._dataCriacao;
  }

  public finalizar(golsTimeA: number, golsTimeB: number): void {
    if (golsTimeA < 0 || golsTimeB < 0) {
      throw new Error('Gols nao podem ser negativos');
    }
    this._golsTimeA = golsTimeA;
    this._golsTimeB = golsTimeB;
    this._status = 'FINALIZADA';
  }

  public iniciar(): void {
    this._status = 'EM_ANDAMENTO';
  }
}
