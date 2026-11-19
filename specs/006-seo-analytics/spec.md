# 006 — SEO y analítica

- **Estado:** approved
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

- [ ] T1 `site.ts` y componente `Seo` con OG, Twitter y canonical (R1, R7)
- [ ] T2 JSON-LD `Organization` y `SoftwareApplication` (R4)
- [ ] T3 Sitemap y robots con exclusiones (R3)
- [ ] T4 Imagen OG (R2)
- [ ] T5 Cloudflare Web Analytics (R5, R6)

## Verificación

- [ ] Validador de datos estructurados de Google sin errores.
- [ ] Vista previa del enlace en WhatsApp muestra título, descripción e imagen.
- [ ] `sitemap.xml` no contiene las rutas excluidas.
- [ ] El panel de Web Analytics registra visitas a `/` y `/demo/gracias`.
- [ ] DevTools → Application → Cookies: ninguna cookie en `/`.

## Hallazgos


## Cierre
