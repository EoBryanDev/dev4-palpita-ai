export type TUsuarioStatus = 'PENDENTE' | 'ATIVO' | 'DESATIVADO';
export type TUsuarioCargo = 'ADMIN' | 'COLABORADOR';

export interface IUsuarioProps {
  id: string;
  nome: string;
  email: string;
  status: TUsuarioStatus;
  cargo: TUsuarioCargo;
  dataCriacao: Date;
}

export class Usuario {
  private readonly _id: string;
  private _nome: string;
  private _email: string;
  private _status: TUsuarioStatus;
  private _cargo: TUsuarioCargo;
  private readonly _dataCriacao: Date;

  constructor(props: IUsuarioProps) {
    this._id = props.id;
    this._nome = props.nome;
    this._email = props.email;
    this._status = props.status;
    this._cargo = props.cargo;
    this._dataCriacao = props.dataCriacao;
  }

  public get id(): string {
    return this._id;
  }

  public get nome(): string {
    return this._nome;
  }

  public get email(): string {
    return this._email;
  }

  public get status(): TUsuarioStatus {
    return this._status;
  }

  public get cargo(): TUsuarioCargo {
    return this._cargo;
  }

  public get dataCriacao(): Date {
    return this._dataCriacao;
  }

  public ativar(): void {
    this._status = 'ATIVO';
  }

  public desativar(): void {
    this._status = 'DESATIVADO';
  }
}
