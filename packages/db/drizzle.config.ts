import { join } from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Carrega o .env da raiz do monorepo (dois níveis acima de packages/db)
config({ path: join(__dirname, '../../.env') });

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://palpita:palpita_password@localhost:5432/palpita_db',
  },
  verbose: true,
  strict: true,
});
