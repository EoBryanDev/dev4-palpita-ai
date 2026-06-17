import dotenv from 'dotenv';
dotenv.config();

import { GoogleEngine } from './engines/google-engine.js';
import { syncOnce } from './services/sync.service.js';

const WATCH_INTERVAL_MS =
  (Number.parseInt(process.env.SCRAPER_INTERVAL_MINUTES ?? '5', 10) || 5) *
  60 *
  1000;

async function main() {
  const mode = process.argv[2] ?? 'run';
  const engine = new GoogleEngine();

  if (mode === 'watch') {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        tipo: 'watch_start',
        interval: WATCH_INTERVAL_MS,
      }),
    );

    const { default: cron } = await import('node-cron');

    cron.schedule(`*/${WATCH_INTERVAL_MS / 60000} * * * *`, async () => {
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
