// Entidades de Domínio
export {
  Usuario,
  type IUsuarioProps,
  type TUsuarioCargo,
  type TUsuarioStatus,
} from './domain/usuario.entity';

export {
  Partida,
  type IPartidaProps,
  type TPartidaStatus,
} from './domain/partida.entity';

export {
  Palpite,
  type IPalpiteProps,
} from './domain/palpite.entity';

export {
  TokenConvite,
  type ITokenConviteProps,
} from './domain/token-convite.entity';

export {
  Sessao,
  type ISessaoPayload,
} from './domain/sessao.js';

export {
  criarToken,
  verificarToken,
  obterSegredoParaValidacao,
} from './services/sessao-service.js';
