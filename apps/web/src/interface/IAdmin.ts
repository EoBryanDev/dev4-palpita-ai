export interface IAdminConfiguracoesClientProps {
  totalLiberados: number;
  valorInicial: number;
}

export interface IRodadaAdmin {
  id: string;
  numero: number;
  nome: string;
  ativa: boolean;
}

export interface IPartidaAdmin {
  id: string;
  rodadaId: string;
  timeA: string;
  timeB: string;
  timeAEmoji?: string;
  timeBEmoji?: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: string;
  status: string;
  rodadaNome: string;
}

export interface ITimeAdmin {
  id: string;
  nome: string;
  emoji: string;
  grupo: string;
}

export interface IAdminPartidasClientProps {
  rodadas: IRodadaAdmin[];
  partidas: IPartidaAdmin[];
  times: ITimeAdmin[];
}

export interface IUsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  status: 'PENDENTE' | 'ATIVO' | 'DESATIVADO' | 'LIBERADO';
  cargo: 'ADMIN' | 'COLABORADOR';
  dataCriacao: string;
  tokenId?: string | null;
}

export interface IAdminUsuariosClientProps {
  usuarios: IUsuarioAdmin[];
  adminEmail: string;
}
