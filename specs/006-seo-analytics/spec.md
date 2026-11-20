# 006 — SEO y analítica

- **Estado:** done
- **Fecha:** 2026-11-19
- **Depende de:** 003, 004, 005

## Contexto

La landing tiene que aparecer cuando una clínica busca "historia clínica digital Venezuela" o el nombre de Visoria,
tiene que verse bien al compartirse por WhatsApp (el canal principal en Venezuela) y tiene que permitir medir cuánta
gente llega al formulario, sin cookies.

## Requisitos

- **R1.** EL SISTEMA DEBE generar en cada página `<title>` único, `meta description`, `canonical`, Open Graph y Twitter
  Card.
- **R2.** EL SISTEMA DEBE incluir una imagen OG de 1200×630 coherente con el design system (logo + propuesta de valor
  sobre fondo claro, generada en el build o estática).
- **R3.** EL SISTEMA DEBE publicar `sitemap.xml` y `robots.txt`, excluyendo `/demo/gracias`, `/_estilos` y `/404`.
- **R4.** EL SISTEMA DEBE incluir JSON-LD `Organization` y `SoftwareApplication` (categoría `MedicalApplication`,
  sin `aggregateRating` ni `offers` inventados).
- **R5.** EL SISTEMA DEBE cargar Cloudflare Web Analytics en todas las páginas, sin cookies.
- **R6.** CUANDO alguien llega a `/demo/gracias`, EL SISTEMA DEBE contarlo como página vista para medir conversiones
  (sin JS propio de eventos).
- **R7.** EL SISTEMA DEBE declarar `lang="es"` y `og:locale` `es_VE`.

### Fuera de alcance

- Google Analytics, Meta Pixel o cualquier herramienta con cookies.
- Search Console y campañas de pago (configuración manual fuera del repo).

## Diseño

- Componente `Seo.astro` en `Base.astro`, alimentado por props y valores por defecto de `src/config/site.ts`.
- `@astrojs/sitemap` con filtro de rutas. `SITE_URL` viene del entorno (`*.workers.dev` hasta tener el dominio).
- Imagen OG estática en `public/og.png`, hecha a partir de un HTML en `/_og` y exportada con Chrome headless
  (`npm run og`). Descartado: generarla en runtime, que necesitaría Worker y librerías extra.
- Web Analytics con el token en `site.ts`. Con el dominio en Cloudflare se puede activar también desde el panel sin
  script.

**Archivos afectados:**

- `src/components/Seo.astro`, `src/config/site.ts`, `src/layouts/Base.astro`.
- `astro.config.mjs` (sitemap), `public/robots.txt`, `public/og.png`, `scripts/og.mjs`.

## Tareas

- [x] T1 `site.ts` y componente `Seo` con OG, Twitter y canonical (R1, R7)
- [x] T2 JSON-LD `Organization` y `SoftwareApplication` (R4)
- [x] T3 Sitemap y robots con exclusiones (R3)
- [x] T4 Imagen OG (R2)
- [x] T5 Cloudflare Web Analytics (R5, R6)

## Verificación

- [ ] Validador de datos estructurados de Google sin errores. **Requiere URL pública → spec 007.** En local: JSON-LD
      parseado y revisado (Organization + SoftwareApplication, sin valoraciones, precios ni datos inventados).
- [ ] Vista previa del enlace en WhatsApp muestra título, descripción e imagen. **Requiere URL pública → spec 007.**
      En local: etiquetas OG/Twitter completas con URL absoluta e imagen de 1200×630.
- [x] `sitemap.xml` no contiene las rutas excluidas (solo /, /demo/, /privacidad/ y /terminos/).
- [ ] El panel de Web Analytics registra visitas a `/` y `/demo/gracias`. **Requiere cuenta y token → spec 007.** En
      local: el script aparece solo con token y en modo SPA, y tras enviar el formulario la URL pasa a `/demo/gracias`.
- [x] DevTools → Application → Cookies: ninguna cookie en `/` (ni en `/demo` con Turnstile), comprobado por CDP.

## Hallazgos

- **Conversiones con JS (R6):** el formulario muestra el éxito sin cambiar de página (004 R7), así que `/demo/gracias`
  nunca se visitaba. Tras un envío correcto, `demo-form.ts` hace `history.pushState` a `/demo/gracias` y el beacon de
  Web Analytics, en modo `spa`, lo cuenta como página vista. Si la persona recarga, ve la página de gracias, que es
  coherente. Verificado en Chrome.
- **Token de Web Analytics opcional:** variable de build `CF_WEB_ANALYTICS_TOKEN` (astro:env). Sin token no se carga
  nada (local, previews). Con el dominio en Cloudflare también puede activarse la inyección automática desde el panel,
  pero entonces hay que comprobar que el modo SPA cuente el paso a `/demo/gracias`. Anotado en la 007.
- **OG sin ruta `/_og`:** `scripts/og.mjs` arma un HTML independiente (tokens, fuentes de Fontsource, logo y título de
  `hero.yaml`) y lo captura con Chrome headless. No necesita servidor ni deja rutas de desarrollo extra. `yaml` pasa a
  dependencia de desarrollo explícita. Si cambia el título del hero, hay que ejecutar `npm run og`.
- **`applicationCategory: HealthApplication`** en lugar de `MedicalApplication`: el valor de la spec no está entre las
  categorías que reconoce Google. No se incluyen `operatingSystem` (no está confirmado si hay apps nativas), `offers`
  ni `aggregateRating`. Sin estos dos campos, Google no muestra el resultado enriquecido de software, pero los datos
  son válidos y verdaderos (P1).
- **Logo estable en `public/brand/visoria-medical.png`** (600 px, 70 KB) para el JSON-LD; el del sitio sigue
  optimizándose con `astro:assets`.
- **`robots.txt` generado en el build** (`src/pages/robots.txt.ts`) para que la URL del sitemap use `SITE_URL`. También
  bloquea `/api/`, `/demo/gracias` y `/demo/error`, que además llevan `noindex`.
- **`SITE_URL` por defecto (`visoria-landing.workers.dev`) no es la URL real:** la de la cuenta será
  `visoria-landing.<subdominio>.workers.dev` o el dominio propio. Hay que definirla en Workers Builds (007).
- **Detectado para la 007:** su comando de build incluye `check:content`, que hoy falla, así que el primer despliegue
  no pasaría. Anotado allí con dos opciones.
- **Títulos:** la home usa "Visoria Medical · Historia clínica y agenda para consultorios y clínicas"; el resto,
  "<página> · Visoria Medical". Los 7 son únicos.

## Cierre

- **Qué se hizo:**
  - T1: `Seo.astro` (title, description de 145 caracteres en la home, canonical, Open Graph con `es_VE` y Twitter Card)
    integrado en `Base`; textos SEO de la home en `site.ts`.
  - T2: `JsonLd.astro` en la home: Organization + SoftwareApplication con las 4 funciones confirmadas.
  - T3: `@astrojs/sitemap` con exclusiones y `robots.txt` generado.
  - T4: `public/og.png` (1200×630) con `npm run og`.
  - T5: beacon de Cloudflare Web Analytics con token opcional y modo SPA; conversión por `pushState` a
    `/demo/gracias`.
- **Verificación ejecutada:** check (0 errores), `npm test` (13/13), build (7 páginas + sitemap + robots), títulos
  únicos, canonical alineado con el sitemap, JSON-LD revisado, beacon solo con token, 0 cookies en `/` y en `/demo`,
  y conversión a `/demo/gracias` en Chrome. Pendientes por necesitar URL pública o cuenta: validador de Google, vista
  previa en WhatsApp y panel de Web Analytics (spec 007).
- **Archivos:** `src/components/{Seo,JsonLd}.astro`, `src/layouts/Base.astro`, `src/config/site.ts`,
  `src/pages/index.astro`, `src/pages/robots.txt.ts`, `src/scripts/demo-form.ts`, `astro.config.mjs`, `scripts/og.mjs`,
  `public/og.png`, `public/brand/visoria-medical.png`, `package.json`, `package-lock.json`, `README.md`, `CLAUDE.md`,
  `specs/006-seo-analytics/spec.md`, `specs/007-deploy/spec.md`, `specs/README.md`.
- **Cómo verlo en local:** `npm run build` y abrir `dist/sitemap-0.xml`, `dist/robots.txt` y el `<head>` de
  `dist/index.html`. La imagen está en `public/og.png`. En http://localhost:4330 la pestaña muestra el título nuevo.
- **Cambios de Victor:** —
- **Commit:** `feat(006): SEO y analítica`. Aprobado el 2026-11-20. El validador de Google, la vista previa en WhatsApp y el panel de Web Analytics se verifican en la 007 (necesitan URL pública).
