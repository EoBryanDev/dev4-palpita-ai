import type { TUsuarioCargo } from './usuario.entity';

export interface ISessaoPayload {
  sub: string;
  cargo: TUsuarioCargo;
  nome: string;
  email: string;
  iat: number;
  exp: number;
}

export class Sessao {
  private readonly _sub: string;
  private readonly _cargo: TUsuarioCargo;
  private readonly _nome: string;
  private readonly _email: string;
  private readonly _iat: Date;
  private readonly _exp: Date;

  constructor(payload: ISessaoPayload) {
    this._sub = payload.sub;
    this._cargo = payload.cargo;
    this._nome = payload.nome;
    this._email = payload.email;
    this._iat = new Date(payload.iat);
    this._exp = new Date(payload.exp);
  }

  public get sub(): string {
    return this._sub;
  }

  public get cargo(): TUsuarioCargo {
    return this._cargo;
  }

  public get nome(): string {
    return this._nome;
  }

  public get email(): string {
    return this._email;
  }

  public get iat(): Date {
    return this._iat;
  }

  public get exp(): Date {
    return this._exp;
  }

  public get expirada(): boolean {
    return this._exp.getTime() <= Date.now();
  }
}
