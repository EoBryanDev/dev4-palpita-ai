import type { TUsuarioCargo } from './usuario.entity.js';

export interface ISessaoPayload {
  sub: string;
  cargo: TUsuarioCargo;
  iat: number;
  exp: number;
}

export class Sessao {
  private readonly _sub: string;
  private readonly _cargo: TUsuarioCargo;
  private readonly _iat: Date;
  private readonly _exp: Date;

  constructor(payload: ISessaoPayload) {
    this._sub = payload.sub;
    this._cargo = payload.cargo;
    this._iat = new Date(payload.iat);
    this._exp = new Date(payload.exp);
  }

  public get sub(): string {
    return this._sub;
  }

  public get cargo(): TUsuarioCargo {
    return this._cargo;
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
