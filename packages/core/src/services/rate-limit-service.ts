interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

type RateLimitTipo = 'API' | 'LOGIN' | 'CSRF';

const CONFIGS: Record<RateLimitTipo, RateLimitConfig> = {
  API: { maxRequests: 100, windowMs: 60_000 },
  LOGIN: { maxRequests: 5, windowMs: 60_000 },
  CSRF: { maxRequests: 10, windowMs: 60_000 },
};

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function iniciarCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

function pararCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

function buildKey(identificador: string, tipo: RateLimitTipo): string {
  return `${tipo}:${identificador}`;
}

export function verificarRateLimit(
  identificador: string,
  tipo: RateLimitTipo = 'API',
): { permitido: boolean; atual: number; maximo: number; resetEmMs: number } {
  iniciarCleanup();

  const config = CONFIGS[tipo];
  const key = buildKey(identificador, tipo);
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  return {
    permitido: entry.count <= config.maxRequests,
    atual: entry.count,
    maximo: config.maxRequests,
    resetEmMs: Math.max(0, entry.resetAt - now),
  };
}

export function limparRateLimit(identificador: string, tipo: RateLimitTipo): void {
  const key = buildKey(identificador, tipo);
  store.delete(key);
}

export function resetarRateLimitStore(): void {
  store.clear();
}

export function encerrarRateLimit(): void {
  pararCleanup();
  store.clear();
}

export { type RateLimitTipo, type RateLimitConfig, CONFIGS };
