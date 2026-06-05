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
  senha: varchar('senha', { length: 255 }),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
});

// 3. Tabela de Times
export const times = pgTable('times', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 100 }).notNull().unique(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  confederacao: varchar('confederacao', { length: 50 }).notNull(),
  grupo: varchar('grupo', { length: 10 }).notNull(),
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

// 6. Tabela de Configurações
export const configuracoes = pgTable('configuracoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  chave: varchar('chave', { length: 100 }).notNull().unique(),
  valor: varchar('valor', { length: 255 }).notNull(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('data_atualizacao').defaultNow().notNull(),
});
