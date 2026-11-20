// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Hasta tener dominio propio, el sitio vive en *.workers.dev (spec 007).
const site = process.env.SITE_URL ?? 'https://visoria-landing.workers.dev';

/** Rutas fuera del sitemap (spec 006 R3): páginas de resultado del formulario, 404 y referencia de estilos. */
const NOT_IN_SITEMAP = ['/demo/gracias', '/demo/error', '/404', '/_estilos'];

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  // Puerto fijo para no chocar con el portfolio (que usa el 4321 por defecto).
  server: { port: 4330 },
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !NOT_IN_SITEMAP.some((path) => new URL(page).pathname.replace(/\/$/, '') === path),
    }),
  ],
  // Variables que se leen AL CONSTRUIR el sitio. El Worker tiene las suyas en wrangler.jsonc.
  env: {
    schema: {
      // Spec 004. true → /demo muestra el formulario; false → enlace de email (R10).
      FORM_ENABLED: envField.boolean({ context: 'server', access: 'public', default: false }),
      // Spec 004. Clave pública de Turnstile. Por defecto, la clave de prueba oficial (siempre pasa).
      TURNSTILE_SITE_KEY: envField.string({
        context: 'server',
        access: 'public',
        default: '1x00000000000000000000AA',
      }),
      // Spec 006. Token de Cloudflare Web Analytics. Vacío = no se carga el script (p. ej. en local, o si se
      // activa la inyección automática desde el panel de Cloudflare).
      CF_WEB_ANALYTICS_TOKEN: envField.string({ context: 'server', access: 'public', default: '' }),
    },
  },
});
