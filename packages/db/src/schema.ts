import type {
  TDecididoEm,
  TPartidaStatus,
  TRodadaTipo,
  TUsuarioCargo,
  TUsuarioStatus,
} from '@palpita/core';
import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// 1. Tabela de Rodadas
export const rodadas = pgTable('rodadas', {
  id: uuid('id').primaryKey().defaultRandom(),
  numero: integer('numero').notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  ativa: boolean('ativa').default(true).notNull(),
  tipo: varchar('tipo', { length: 50 })
    .$type<TRodadaTipo>()
    .default('GRUPO')
    .notNull(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 2. Tabela de Usuarios
export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).$type<TUsuarioStatus>().notNull(),
  cargo: varchar('cargo', { length: 50 }).$type<TUsuarioCargo>().notNull(),
  senha: varchar('senha', { length: 255 }),
  ultimoLoginAt: timestamp('ultimo_login_at'),
  dataLiberacao: timestamp('data_liberacao'),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 3. Tabela de Times
export const times = pgTable('times', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 100 }).notNull().unique(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  confederacao: varchar('confederacao', { length: 50 }).notNull(),
  grupo: varchar('grupo', { length: 10 }).notNull(),
  idioma: varchar('idioma', { length: 100 }),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 4. Tabela de Partidas
export const partidas = pgTable('partidas', {
  id: uuid('id').primaryKey().defaultRandom(),
  rodadaId: uuid('rodada_id')
    .notNull()
    .references(() => rodadas.id, { onDelete: 'cascade' }),
  timeAId: uuid('time_a_id')
    .notNull()
    .references(() => times.id, { onDelete: 'restrict' }),
  timeBId: uuid('time_b_id')
    .notNull()
    .references(() => times.id, { onDelete: 'restrict' }),
  golsTimeA: integer('gols_time_a'),
  golsTimeB: integer('gols_time_b'),
  dataInicio: timestamp('data_inicio').notNull(),
  status: varchar('status', { length: 50 }).$type<TPartidaStatus>().notNull(),
  decididoEm: varchar('decidido_em', { length: 50 })
    .$type<TDecididoEm>()
    .default('NORMAL')
    .notNull(),
  timeVencedorPenaltis: varchar('time_vencedor_penaltis', { length: 1 }),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 4. Tabela de Palpites
export const palpites = pgTable(
  'palpites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    partidaId: uuid('partida_id')
      .notNull()
      .references(() => partidas.id, { onDelete: 'cascade' }),
    golsTimeA: integer('gols_time_a').notNull(),
    golsTimeB: integer('gols_time_b').notNull(),
    momentoPrevisto: varchar('momento_previsto', { length: 50 })
      .$type<TDecididoEm>()
      .default('NORMAL')
      .notNull(),
    timeVencedorPrevisto: varchar('time_vencedor_previsto', { length: 1 }),
    dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
    dataAtualizacao: timestamp('data_atualizacao').defaultNow().notNull(),
  },
  (table) => ({
    // Garante que o usuario so pode dar 1 palpite por partida
    usuarioPartidaUnique: uniqueIndex('palpites_usuario_partida_idx').on(
      table.usuarioId,
      table.partidaId,
    ),
  }),
);

// 5. Tabela de Tokens de Convite
export const tokensConvite = pgTable('tokens_convite', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
  usado: boolean('usado').default(false).notNull(),
});

// 6. Tabela de Configurações
export const configuracoes = pgTable('configuracoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  chave: varchar('chave', { length: 100 }).notNull().unique(),
  valor: varchar('valor', { length: 255 }).notNull(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('data_atualizacao').defaultNow().notNull(),
});

// 7. Tabela de Eventos de Partida (scraper)
export const eventosPartida = pgTable('eventos_partida', {
  id: uuid('id').primaryKey().defaultRandom(),
  partidaId: uuid('partida_id')
    .notNull()
    .references(() => partidas.id, { onDelete: 'cascade' }),
  tipo: varchar('tipo', { length: 30 }).notNull(),
  timeId: uuid('time_id').references(() => times.id, { onDelete: 'set null' }),
  jogador: varchar('jogador', { length: 100 }),
  minuto: integer('minuto').notNull(),
  acrescimos: integer('acrescimos'),
  info: varchar('info', { length: 255 }),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 9. Tabela de Feedbacks (Palpita a Feature)
export const feedbacks = pgTable('feedbacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  titulo: varchar('titulo', { length: 200 }).notNull(),
  descricao: varchar('descricao', { length: 2000 }).notNull(),
  tipo: varchar('tipo', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('pendente').notNull(),
  respostaAdmin: varchar('resposta_admin', { length: 2000 }),
  linkAdmin: varchar('link_admin', { length: 255 }),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 10. Tabela de Votos em Feedbacks
export const feedbacksVotos = pgTable(
  'feedbacks_votos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    feedbackId: uuid('feedback_id')
      .notNull()
      .references(() => feedbacks.id, { onDelete: 'cascade' }),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
  },
  (table) => ({
    usuarioVotoUnique: uniqueIndex('feedback_voto_unique').on(
      table.feedbackId,
      table.usuarioId,
    ),
  }),
);

// 11. Tabela de Comentários
export const comentarios = pgTable('comentarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  partidaId: uuid('partida_id')
    .notNull()
    .references(() => partidas.id, { onDelete: 'cascade' }),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  conteudo: varchar('conteudo', { length: 500 }).notNull(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});
