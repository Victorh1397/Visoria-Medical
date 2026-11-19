// @ts-check
import { defineConfig } from 'astro/config';

// Hasta tener dominio propio, el sitio vive en *.workers.dev (spec 007).
const site = process.env.SITE_URL ?? 'https://visoria-landing.workers.dev';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
