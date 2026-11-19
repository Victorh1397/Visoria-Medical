// @ts-check
import { defineConfig } from 'astro/config';

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
});
