export type TUsuarioStatus = 'PENDENTE' | 'ATIVO' | 'DESATIVADO' | 'LIBERADO';
export type TUsuarioCargo = 'ADMIN' | 'COLABORADOR';

export interface IUsuarioProps {
  id: string;
  nome: string;
  email: string;
  status: TUsuarioStatus;
  cargo: TUsuarioCargo;
  dataCriacao: Date;
  senha?: string | null;
}

export class Usuario {
  private readonly _id: string;
  private _nome: string;
  private _email: string;
  private _status: TUsuarioStatus;
  private _cargo: TUsuarioCargo;
  private readonly _dataCriacao: Date;
  private _senha?: string | null;

  constructor(props: IUsuarioProps) {
    this._id = props.id;
    this._nome = props.nome;
    this._email = props.email;
    this._status = props.status;
    this._cargo = props.cargo;
    this._dataCriacao = props.dataCriacao;
    this._senha = props.senha;
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

  public get senha(): string | null | undefined {
    return this._senha;
  }

  public definirSenha(senhaHash: string): void {
    this._senha = senhaHash;
  }

  public ativar(): void {
    this._status = 'ATIVO';
  }

  public liberar(): void {
    this._status = 'LIBERADO';
  }

  public desativar(): void {
    this._status = 'DESATIVADO';
  }
}
