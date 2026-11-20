#!/usr/bin/env node
/**
 * npm run og (spec 006 R2): genera public/og.png (1200×630) con el design system.
 *
 * Arma un HTML independiente con tokens.css, las fuentes de Fontsource, el logo y el título del hero
 * (src/content/home/hero.yaml), y lo captura con Chrome headless. No necesita servidor.
 * Chrome: variable CHROME_PATH o la ruta por defecto de cada sistema.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const at = (...p) => join(root, ...p);
const fileUrl = (...p) => pathToFileURL(at(...p)).href;

const hero = parse(readFileSync(at('src/content/home/hero.yaml'), 'utf8')).hero;
const tokens = readFileSync(at('src/styles/tokens.css'), 'utf8');
const font = (pkg, file) => fileUrl('node_modules/@fontsource', pkg, 'files', file);

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>
${tokens}
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url('${font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 600; src: url('${font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'IBM Plex Mono'; font-weight: 500; src: url('${font('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')}') format('woff2'); }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body {
  display: grid; grid-template-rows: auto 1fr auto; padding: 64px 72px 56px;
  background: var(--c-bg); color: var(--c-text); font-family: var(--font-sans);
}
.logo { height: 64px; width: auto; display: block; }
.copy { align-self: center; display: grid; gap: 20px; }
.label { font-family: var(--font-mono); font-weight: 500; font-size: 20px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--c-text-muted); }
h1 { font-weight: 600; font-size: 66px; line-height: 1.08; letter-spacing: -0.02em; max-width: 940px; }
.foot { display: flex; justify-content: space-between; align-items: center; padding-top: 24px;
  border-top: 1px solid var(--c-line); }
.foot .cta { color: var(--c-accent); }
</style></head>
<body>
  <img class="logo" src="${fileUrl('src/assets/brand/visoria-medical.png')}" alt="">
  <div class="copy">
    <p class="label">${hero.eyebrow}</p>
    <h1>${hero.title}</h1>
  </div>
  <div class="foot">
    <span class="label">Historia clínica · Pacientes · Agenda · Reportes</span>
    <span class="label cta">Solicite una demo</span>
  </div>
</body></html>`;

const dir = join(tmpdir(), 'visoria-og');
mkdirSync(dir, { recursive: true });
const page = join(dir, 'og.html');
writeFileSync(page, html, 'utf8');

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.error('No se encontró Chrome. Defina CHROME_PATH.');
  process.exit(1);
}

const out = at('public/og.png');
execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--allow-file-access-from-files',
  `--user-data-dir=${join(dir, 'profile')}`,
  '--window-size=1200,630',
  '--virtual-time-budget=3000',
  `--screenshot=${out}`,
  pathToFileURL(page).href,
], { stdio: 'ignore' });

console.log(`OG generada: ${out}`);
