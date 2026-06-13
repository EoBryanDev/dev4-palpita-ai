import { z } from 'zod';

const ZJwtExpiresIn = z.string().regex(/^\d+[smhd]$/, {
  message:
    'JWT_EXPIRES_IN must be a number followed by s (seconds), m (minutes), h (hours), or d (days). Example: 7d',
});

const ZEnvSeguranca = z.object({
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: ZJwtExpiresIn.optional().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int()
    .min(10, 'BCRYPT_SALT_ROUNDS must be at least 10')
    .optional(),
});

type TEnvSeguranca = z.infer<typeof ZEnvSeguranca>;

let _parsed: TEnvSeguranca | null = null;

export function validarEnvSeguranca(): TEnvSeguranca {
  if (_parsed) return _parsed;

  const result = ZEnvSeguranca.safeParse({
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
  });

  if (!result.success) {
    const msgs = result.error.flatten().fieldErrors;
    const lines: string[] = ['Environment variable validation failed:'];
    for (const [key, errors] of Object.entries(msgs)) {
      for (const err of errors ?? []) {
        lines.push(`  - ${key}: ${err}`);
      }
    }
    throw new Error(lines.join('\n'));
  }

  _parsed = result.data;
  return _parsed;
}
