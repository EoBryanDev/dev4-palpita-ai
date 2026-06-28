import type {
  TDecididoEm,
  TPenaltyWinner,
  TRodadaTipo,
} from './partida.entity';

export interface IPalpiteProps {
  id: string;
  usuarioId: string;
  partidaId: string;
  golsTimeA: number;
  golsTimeB: number;
  momentoPrevisto?: TDecididoEm;
  timeVencedorPrevisto?: TPenaltyWinner;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export class Palpite {
  private readonly _id: string;
  private readonly _usuarioId: string;
  private readonly _partidaId: string;
  private _golsTimeA: number;
  private _golsTimeB: number;
  private _momentoPrevisto: TDecididoEm;
  private _timeVencedorPrevisto: TPenaltyWinner | null;
  private readonly _dataCriacao: Date;
  private _dataAtualizacao: Date;

  constructor(props: IPalpiteProps) {
    if (props.golsTimeA < 0 || props.golsTimeB < 0) {
      throw new Error('Gols nao podem ser negativos');
    }
    this._id = props.id;
    this._usuarioId = props.usuarioId;
    this._partidaId = props.partidaId;
    this._golsTimeA = props.golsTimeA;
    this._golsTimeB = props.golsTimeB;
    this._momentoPrevisto = props.momentoPrevisto ?? 'NORMAL';
    this._timeVencedorPrevisto = props.timeVencedorPrevisto ?? null;
    this._dataCriacao = props.dataCriacao;
    this._dataAtualizacao = props.dataAtualizacao;
  }

  public get id(): string {
    return this._id;
  }

  public get usuarioId(): string {
    return this._usuarioId;
  }

  public get partidaId(): string {
    return this._partidaId;
  }

  public get golsTimeA(): number {
    return this._golsTimeA;
  }

  public get golsTimeB(): number {
    return this._golsTimeB;
  }

  public get dataCriacao(): Date {
    return this._dataCriacao;
  }

  public get dataAtualizacao(): Date {
    return this._dataAtualizacao;
  }

  public get momentoPrevisto(): TDecididoEm {
    return this._momentoPrevisto;
  }

  public get timeVencedorPrevisto(): TPenaltyWinner | null {
    return this._timeVencedorPrevisto;
  }

  public atualizarPlacar(
    golsTimeA: number,
    golsTimeB: number,
    dataPartidaInicio: Date,
    dataReferencia: Date = new Date(),
    deadlineGlobal?: Date,
    momentoPrevisto?: TDecididoEm,
    timeVencedorPrevisto?: TPenaltyWinner,
  ): void {
    this.validarPrazo(dataPartidaInicio, dataReferencia, deadlineGlobal);
    if (golsTimeA < 0 || golsTimeB < 0) {
      throw new Error('Gols nao podem ser negativos');
    }
    this._golsTimeA = golsTimeA;
    this._golsTimeB = golsTimeB;
    if (momentoPrevisto) {
      this._momentoPrevisto = momentoPrevisto;
    }
    if (timeVencedorPrevisto) {
      this._timeVencedorPrevisto = timeVencedorPrevisto;
    }
    this._dataAtualizacao = dataReferencia;
  }

  public validarPrazo(
    dataPartidaInicio: Date,
    dataReferencia: Date = new Date(),
    deadlineGlobal?: Date,
  ): void {
    if (dataReferencia >= dataPartidaInicio) {
      throw new Error('Prazo para palpitar nesta partida expirou');
    }
    if (deadlineGlobal && dataReferencia >= deadlineGlobal) {
      throw new Error('Prazo global para palpitar expirou');
    }
  }

  public calcularPontos(
    partidaGolsTimeA: number | null,
    partidaGolsTimeB: number | null,
    tipoRodada: TRodadaTipo = 'GRUPO',
    decididoEm: TDecididoEm = 'NORMAL',
    timeVencedorPenaltis?: TPenaltyWinner | null,
  ): number {
    if (partidaGolsTimeA === null || partidaGolsTimeB === null) {
      return 0;
    }

    const acertouPlacarExato =
      this._golsTimeA === partidaGolsTimeA &&
      this._golsTimeB === partidaGolsTimeB;

    let pontosBase = 0;
    if (acertouPlacarExato) {
      pontosBase = 2;
    } else {
      const vencedorPalpite = this.obterVencedor(
        this._golsTimeA,
        this._golsTimeB,
      );
      const vencedorPartida = this.obterVencedor(
        partidaGolsTimeA,
        partidaGolsTimeB,
      );
      if (vencedorPalpite === vencedorPartida) {
        pontosBase = 1;
      }
    }

    if (tipoRodada === 'MATAMATA' && pontosBase > 0) {
      if (this._golsTimeA !== this._golsTimeB) {
        if (this._momentoPrevisto === decididoEm) {
          return pontosBase + 1;
        }
      } else if (
        timeVencedorPenaltis &&
        this._timeVencedorPrevisto === timeVencedorPenaltis
      ) {
        return pontosBase + 1;
      }
    }

    return pontosBase;
  }

  private obterVencedor(golsA: number, golsB: number): 'A' | 'B' | 'EMPATE' {
    if (golsA > golsB) return 'A';
    if (golsB > golsA) return 'B';
    return 'EMPATE';
  }
}
