import type {
  TPartidaStatus,
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
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 2. Tabela de Usuarios
export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).$type<TUsuarioStatus>().notNull(),
  cargo: varchar('cargo', { length: 50 }).$type<TUsuarioCargo>().notNull(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 3. Tabela de Partidas
export const partidas = pgTable('partidas', {
  id: uuid('id').primaryKey().defaultRandom(),
  rodadaId: uuid('rodada_id')
    .notNull()
    .references(() => rodadas.id, { onDelete: 'cascade' }),
  timeA: varchar('time_a', { length: 100 }).notNull(),
  timeB: varchar('time_b', { length: 100 }).notNull(),
  golsTimeA: integer('gols_time_a'),
  golsTimeB: integer('gols_time_b'),
  dataInicio: timestamp('data_inicio').notNull(),
  status: varchar('status', { length: 50 }).$type<TPartidaStatus>().notNull(),
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
