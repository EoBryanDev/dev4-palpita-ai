export interface IPalpiteProps {
  id: string;
  usuarioId: string;
  partidaId: string;
  golsTimeA: number;
  golsTimeB: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export class Palpite {
  private readonly _id: string;
  private readonly _usuarioId: string;
  private readonly _partidaId: string;
  private _golsTimeA: number;
  private _golsTimeB: number;
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

  public atualizarPlacar(
    golsTimeA: number,
    golsTimeB: number,
    dataPartidaInicio: Date,
    dataReferencia: Date = new Date(),
  ): void {
    this.validarPrazo(dataPartidaInicio, dataReferencia);
    if (golsTimeA < 0 || golsTimeB < 0) {
      throw new Error('Gols nao podem ser negativos');
    }
    this._golsTimeA = golsTimeA;
    this._golsTimeB = golsTimeB;
    this._dataAtualizacao = dataReferencia;
  }

  public validarPrazo(
    dataPartidaInicio: Date,
    dataReferencia: Date = new Date(),
  ): void {
    if (dataReferencia >= dataPartidaInicio) {
      throw new Error('Prazo para palpitar nesta partida expirou');
    }
  }

  public calcularPontos(
    partidaGolsTimeA: number | null,
    partidaGolsTimeB: number | null,
  ): number {
    if (partidaGolsTimeA === null || partidaGolsTimeB === null) {
      return 0;
    }

    const vencedorPalpite = this.obterVencedor(
      this._golsTimeA,
      this._golsTimeB,
    );
    const vencedorPartida = this.obterVencedor(
      partidaGolsTimeA,
      partidaGolsTimeB,
    );

    const acertouPlacarExato =
      this._golsTimeA === partidaGolsTimeA &&
      this._golsTimeB === partidaGolsTimeB;

    if (acertouPlacarExato) {
      return 2;
    }

    return vencedorPalpite === vencedorPartida ? 1 : 0;
  }

  private obterVencedor(golsA: number, golsB: number): 'A' | 'B' | 'EMPATE' {
    if (golsA > golsB) return 'A';
    if (golsB > golsA) return 'B';
    return 'EMPATE';
  }
}
