import { validarEnvSeguranca } from '@palpita/core';
import type { NextConfig } from 'next';

validarEnvSeguranca();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
