// Migração prod sem drizzle-kit (o kit 0.22.x exige drizzle-orm mais novo
// que o 0.31.x do app). Usa o próprio orm do app: compatibilidade garantida.
// Uso: DATABASE_URL=... node migrate.prod.mjs (a partir de packages/db).
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await migrate(drizzle(sql), { migrationsFolder: './migrations' });
  console.log('migrations applied OK');
} finally {
  await sql.end();
}
