// @ts-check
import { defineConfig, envField } from 'astro/config';

// Hasta tener dominio propio, el sitio vive en *.workers.dev (spec 007).
const site = process.env.SITE_URL ?? 'https://visoria-landing.workers.dev';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  // Puerto fijo para no chocar con el portfolio (que usa el 4321 por defecto).
  server: { port: 4330 },
  build: {
    format: 'directory',
  },
  // Variables que se leen AL CONSTRUIR el sitio (spec 004). El Worker tiene las suyas en wrangler.jsonc.
  env: {
    schema: {
      // true → /demo muestra el formulario; false → enlace de email (R10).
      FORM_ENABLED: envField.boolean({ context: 'server', access: 'public', default: false }),
      // Clave pública de Turnstile. Por defecto, la clave de prueba oficial (siempre pasa).
      TURNSTILE_SITE_KEY: envField.string({
        context: 'server',
        access: 'public',
        default: '1x00000000000000000000AA',
      }),
    },
  },
});
