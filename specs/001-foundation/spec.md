# 001 — Foundation

- **Estado:** done
- **Fecha:** 2026-11-19
- **Depende de:** 000

## Contexto

Antes de diseñar nada hace falta el esqueleto: un proyecto Astro estático con TypeScript estricto, la estructura de
carpetas acordada, el Worker vacío que más adelante recibirá el formulario y los comandos de calidad que se ejecutan
antes de cada commit.

El hosting será Cloudflare Workers con static assets (plan gratuito): sirve `dist/` como archivos estáticos y ejecuta
un único Worker solo para `/api/*`.

## Requisitos

- **R1.** EL SISTEMA DEBE generar un sitio 100 % estático en `dist/` con `npm run build`.
- **R2.** EL SISTEMA DEBE pasar `npm run check` (tipos de TypeScript y schemas de contenido) sin errores ni warnings.
- **R3.** EL SISTEMA DEBE poder servirse en local con el Worker incluido (`npm run preview`) igual que en producción.
- **R4.** CUANDO llega una petición a una ruta que no es `/api/*`, EL SISTEMA DEBE responder con el archivo estático
  sin ejecutar el Worker.
- **R5.** SI se pide una ruta inexistente, ENTONCES EL SISTEMA DEBE responder con una página 404 propia y estado 404.
- **R6.** EL SISTEMA DEBE fijar la versión de Node en `.nvmrc` y en `engines` de `package.json`.
- **R7.** EL SISTEMA DEBE versionarse en el repositorio `Victorh1397/Visoria-Medical`, con `main` como rama de
  producción y un `README.md` con los comandos básicos.

### Fuera de alcance

- Estilos y componentes visuales (spec 002).
- Lógica real del formulario (spec 004).

## Diseño

- **Astro 7** con `output: 'static'`, sin adaptador: el sitio no necesita SSR.
- **Cloudflare Workers + static assets** con `wrangler.jsonc`: `assets.directory = "./dist"`,
  `assets.not_found_handling = "404-page"` y `run_worker_first = ["/api/*"]`.
  Descartado: Pages + Functions. Cloudflare prioriza Workers para proyectos nuevos y algunos bindings, como
  `send_email`, están documentados para Workers.
- El Worker vive en `worker/index.ts`, fuera de `src/`, para que Astro no lo procese. En esta spec responde
  `404` a todo `/api/*`.
- Estructura:

```
src/
  content/        textos (spec 003)
  components/
  layouts/
  pages/          index, demo, legales, 404
  styles/         tokens.css, base.css
public/           favicon, og, capturas
worker/           index.ts
specs/
```

**Archivos afectados:**

- `package.json`, `.nvmrc`, `tsconfig.json`, `astro.config.mjs`: proyecto base.
- `wrangler.jsonc`, `worker/index.ts`: hosting y Worker vacío.
- `src/pages/index.astro`, `src/pages/404.astro`: páginas mínimas.
- `.gitignore`, `.editorconfig`, `README.md`.

## Tareas

- [x] T1 Inicializar Astro 7 con TypeScript `strict`, `.nvmrc` y `engines` (R1, R2, R6)
- [x] T2 Crear la estructura de carpetas con `index.astro` y `404.astro` mínimas (R1, R5)
- [x] T3 Añadir `wrangler.jsonc` y `worker/index.ts` con `run_worker_first` para `/api/*` (R3, R4)
- [x] T4 Scripts `dev`, `build`, `check`, `preview` (build + `wrangler dev`) (R2, R3)
- [x] T5 `README.md` mínimo del proyecto y comprobación del remote `origin` →
      `https://github.com/Victorh1397/Visoria-Medical.git` (R7)

## Verificación

- [x] `npm run check && npm run build` termina sin errores ni warnings.
- [x] `npm run preview`: `/` responde 200, `/no-existe` responde 404 con la página propia, `/api/x` responde 404
      desde el Worker (cabecera o cuerpo distinguible).
- [x] `git remote -v` apunta a `Victorh1397/Visoria-Medical` y, tras el commit de cierre, `main` se ve en GitHub.

## Hallazgos

- **TypeScript 6 y no 7:** `typescript@7` ya está publicado, pero `@astrojs/check` está probado con la 6. Se fija
  `^6.0.3`, igual que en el portfolio.
- **Tipos del Worker separados:** `worker/` queda fuera del `tsconfig` de Astro y tiene el suyo con
  `@cloudflare/workers-types`. `npm run check` ejecuta los dos (`astro check && tsc -p worker/tsconfig.json`).
- **Finales de línea:** git avisaba de conversiones LF→CRLF en Windows. Se añaden `.gitattributes` (`eol=lf`) y
  `.editorconfig`.
- **Sin `public/.gitkeep`:** se copiaba a `dist/` y quedaba publicado. `public/` recibirá archivos reales en la 002.
- **Dos servidores locales:** `npm run dev` (Astro, puerto 4321, recarga en vivo) para trabajar en el diseño, y
  `npm run preview` (wrangler, puerto 8787) para probar el Worker y el 404 real como en producción. El servidor de
  Astro no sirve la 404 con el comportamiento exacto de Cloudflare.

## Cierre

- **Qué se hizo:**
  - T1: Astro 7.4 con TypeScript `strict`, Node 24 en `.nvmrc` y `engines`.
  - T2: `src/{pages,components,layouts,content,styles}`, `index.astro` y `404.astro` mínimas, sin estilos.
  - T3: `wrangler.jsonc` (static assets, `404-page`, `run_worker_first: ["/api/*"]`) y `worker/index.ts`, que
    responde `404 {"error":"not_found"}` con la cabecera `x-visoria-worker: 1`.
  - T4: scripts `dev`, `build`, `check`, `preview` y `deploy`.
  - T5: `README.md` y remote `origin` → `Victorh1397/Visoria-Medical`.
- **Verificación ejecutada:** check (0 errores, 0 warnings), build (2 páginas). En `wrangler dev`: `/` → 200,
  `/no-existe` → 404 con la página propia, `/api/x` → 404 JSON desde el Worker.
- **Archivos:** `package.json`, `package-lock.json`, `.nvmrc`, `.gitignore`, `.gitattributes`, `.editorconfig`,
  `.vscode/extensions.json`, `tsconfig.json`, `astro.config.mjs`, `wrangler.jsonc`, `worker/index.ts`,
  `worker/tsconfig.json`, `src/pages/index.astro`, `src/pages/404.astro`, `src/*/.gitkeep`, `README.md`,
  `specs/001-foundation/spec.md`, `specs/README.md`.
- **Cómo verlo en local:** `npm run dev` → http://localhost:4321 (página en blanco con título; aún sin diseño).
  Para el Worker: `npm run preview` → http://localhost:8787/api/x y http://localhost:8787/no-existe.
- **Cambios de Victor:** —
- **Commit:** `feat(001): foundation`. Aprobado el 2026-11-19.

