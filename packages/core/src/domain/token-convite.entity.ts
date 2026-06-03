export interface ITokenConviteProps {
  id: string;
  usuarioId: string;
  dataCriacao: Date;
  usado: boolean;
}

export class TokenConvite {
  private readonly _id: string;
  private readonly _usuarioId: string;
  private readonly _dataCriacao: Date;
  private _usado: boolean;

  constructor(props: ITokenConviteProps) {
    this._id = props.id;
    this._usuarioId = props.usuarioId;
    this._dataCriacao = props.dataCriacao;
    this._usado = props.usado;
  }

  public get id(): string {
    return this._id;
  }

  public get usuarioId(): string {
    return this._usuarioId;
  }

  public get dataCriacao(): Date {
    return this._dataCriacao;
  }

  public get usado(): boolean {
    return this._usado;
  }

  public estaExpirado(dataReferencia: Date = new Date()): boolean {
    const diferencaMs = dataReferencia.getTime() - this._dataCriacao.getTime();
    const limiteMs = 5 * 60 * 1000; // 5 minutos em milissegundos
    return diferencaMs > limiteMs;
  }

  public usar(dataReferencia: Date = new Date()): void {
    if (this._usado) {
      throw new Error('Este token ja foi utilizado');
    }
    if (this.estaExpirado(dataReferencia)) {
      throw new Error('Este token de convite expirou');
    }
    this._usado = true;
  }
}
