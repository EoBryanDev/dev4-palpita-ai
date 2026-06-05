import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://palpita:palpita_password@localhost:5432/palpita_db';

// Cria o cliente de conexao postgres-js com SSL habilitado para o Neon e limite de pool para Serverless
export const client = postgres(connectionString, {
  ssl:
    connectionString.includes('neon.tech') ||
    process.env.NODE_ENV === 'production'
      ? 'require'
      : false,
  max: process.env.NODE_ENV === 'production' ? 1 : undefined,
});

// Cria a instancia do Drizzle ORM
export const db = drizzle(client, { schema });
