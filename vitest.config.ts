/**
 * Tests del Worker dentro del runtime real de Workers (workerd) con @cloudflare/vitest-plugin.
 * Se configura sin wrangler.jsonc para no depender de dist/ (static assets).
 */
import { defineConfig } from 'vitest/config';
import { cloudflareTest } from '@cloudflare/vitest-plugin';

export default defineConfig({
  plugins: [
    cloudflareTest({
      main: './worker/index.ts',
      miniflare: {
        compatibilityDate: '2026-11-01',
        bindings: {
          FORM_ENABLED: 'true',
          DEMO_INBOX: 'inbox@example.com',
          DEMO_FROM: 'demo@example.com',
          // Clave secreta de prueba oficial de Turnstile: siempre falla (los tests inyectan su propio verificador).
          TURNSTILE_SECRET: '2x0000000000000000000000000000000AA',
        },
      },
    }),
  ],
  test: {
    include: ['worker/**/*.test.ts'],
  },
});
