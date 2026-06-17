import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

import { PlaywrightEngine } from './engines/playwright-engine.js';
import { syncOnce } from './services/sync.service.js';

const WATCH_INTERVAL_MS =
  (Number.parseInt(process.env.SCRAPER_INTERVAL_MINUTES ?? '5', 10) || 5) *
  60 *
  1000;

async function main() {
  const mode = process.argv[2] ?? 'run';
  const engine = new PlaywrightEngine();

  let intervalMinutes =
    Number.parseInt(process.env.SCRAPER_INTERVAL_MINUTES ?? '5', 10) || 5;
  const intervalIndex = process.argv.findIndex(
    (arg) => arg === '--interval' || arg === '-i',
  );
  if (intervalIndex !== -1 && process.argv[intervalIndex + 1]) {
    const val = Number.parseInt(process.argv[intervalIndex + 1], 10);
    if (!Number.isNaN(val) && val > 0) {
      intervalMinutes = val;
    }
  }

  const watchIntervalMs = intervalMinutes * 60 * 1000;

  if (mode === 'watch') {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        tipo: 'watch_start',
        interval: watchIntervalMs,
      }),
    );

    const { default: cron } = await import('node-cron');

    cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
      await syncOnce(engine);
    });

    await syncOnce(engine);
  } else {
    await syncOnce(engine);
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      tipo: 'fatal',
      error: (error as Error).message,
      stack: (error as Error).stack,
    }),
  );
  process.exit(1);
});
