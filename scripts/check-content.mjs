#!/usr/bin/env node
/**
 * check:content (spec 003 R7, constitution P6).
 *
 * Recorre src/content/ y busca la marca PENDIENTE:
 * - En un valor publicado → ERROR: el sitio no está listo para producción (exit 1).
 * - En un comentario YAML/Markdown ("# PENDIENTE …") → AVISO: no se publica, solo recuerda lo que falta.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('../src/content/', import.meta.url);
const MARK = 'PENDIENTE';

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(ya?ml|md|mdx|json)$/.test(entry.name)) yield path;
  }
}

const errors = [];
const warnings = [];
const rootPath = decodeURIComponent(ROOT.pathname).replace(/^\/([A-Za-z]:)/, '$1');

for await (const file of walk(rootPath)) {
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!line.includes(MARK)) return;
    const where = `${relative(process.cwd(), file)}:${i + 1}`;
    const text = line.trim();
    (text.startsWith('#') || text.startsWith('<!--') ? warnings : errors).push(`${where}  ${text}`);
  });
}

// El email de contacto vive en src/config/site.ts y lo usan /demo (mailto) y el pie (spec 004 R8, R10).
const siteTs = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const contact = siteTs.match(/contactEmail:\s*'([^']*)'/);
if (!contact || contact[1].trim() === '') {
  errors.push('src/config/site.ts  contactEmail vacío: /demo muestra un PENDIENTE en lugar del email');
}

if (warnings.length) {
  console.log(`\nAvisos: ${warnings.length} pendiente(s) sin publicar (comentados):`);
  for (const w of warnings) console.log(`  · ${w}`);
}

if (errors.length) {
  console.error(`\nERROR: ${errors.length} PENDIENTE visible(s) en el contenido publicado:`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('\nEl sitio no está listo para producción (constitution P6).');
  process.exit(1);
}

console.log('\ncheck:content OK: no hay PENDIENTE visibles.');
