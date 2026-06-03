import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://palpita:palpita_password@localhost:5432/palpita_db';

// Cria o cliente de conexao postgres-js
export const client = postgres(connectionString);

// Cria a instancia do Drizzle ORM
export const db = drizzle(client, { schema });
