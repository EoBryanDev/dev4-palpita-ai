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
  type TRodadaTipo,
  type TDecididoEm,
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
} from './domain/sessao';

export {
  criarToken,
  verificarToken,
  obterSegredoParaValidacao,
} from './services/sessao-service';

export { validarEnvSeguranca } from './services/env-validator';

export {
  gerarTokenCsrf,
  validarTokenCsrf,
  validarCsrf,
  CSRF_CONFIG,
} from './services/csrf-service';

export {
  verificarRateLimit,
  limparRateLimit,
  resetarRateLimitStore,
  encerrarRateLimit,
  type RateLimitTipo,
} from './services/rate-limit-service';

export {
  logAuditoria,
  type AuditoriaEvento,
  type AuditoriaDados,
} from './services/auditoria-service';

export type {
  TFeedbackStatus,
  TFeedbackTipo,
} from './domain/feedback.entity';
