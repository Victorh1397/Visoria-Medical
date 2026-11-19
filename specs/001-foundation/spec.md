# 001 — Foundation

- **Estado:** approved
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

- [ ] T1 Inicializar Astro 7 con TypeScript `strict`, `.nvmrc` y `engines` (R1, R2, R6)
- [ ] T2 Crear la estructura de carpetas con `index.astro` y `404.astro` mínimas (R1, R5)
- [ ] T3 Añadir `wrangler.jsonc` y `worker/index.ts` con `run_worker_first` para `/api/*` (R3, R4)
- [ ] T4 Scripts `dev`, `build`, `check`, `preview` (build + `wrangler dev`) (R2, R3)
- [ ] T5 `README.md` mínimo del proyecto y comprobación del remote `origin` →
      `https://github.com/Victorh1397/Visoria-Medical.git` (R7)

## Verificación

- [ ] `npm run check && npm run build` termina sin errores ni warnings.
- [ ] `npm run preview`: `/` responde 200, `/no-existe` responde 404 con la página propia, `/api/x` responde 404
      desde el Worker (cabecera o cuerpo distinguible).
- [ ] `git remote -v` apunta a `Victorh1397/Visoria-Medical` y, tras el commit de cierre, `main` se ve en GitHub.

## Hallazgos

## Cierre

