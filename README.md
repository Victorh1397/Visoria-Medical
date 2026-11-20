# Visoria Landing

Landing page de **Visoria Medical**, software de historias clínicas para consultorios y clínicas.
Sitio estático con [Astro](https://astro.build) y un Worker de Cloudflare para el formulario de demo,
desplegado en Cloudflare Workers.

## Requisitos

- Node 24 (ver `.nvmrc`).

## Comandos

```bash
npm install       # dependencias
npm run dev       # servidor de desarrollo en http://localhost:4330 (recarga en vivo)
npm run check     # tipos de Astro + tipos del Worker
npm run check:content  # falla si queda algún PENDIENTE visible (capturas, email…)
npm test          # tests del Worker dentro de workerd (vitest + @cloudflare/vitest-plugin)
npm run og        # regenera public/og.png (imagen para compartir) con Chrome headless
npm run build     # genera dist/
npm run preview   # build + wrangler dev: sitio y Worker como en producción, en http://localhost:8787
npm run preview:form  # igual, con el formulario de demo activo y claves de prueba de Turnstile
npm run deploy    # build + despliegue manual con wrangler (normalmente lo hace Workers Builds)
```

## Estructura

```
src/pages/      páginas (index, 404, …)
src/components/ componentes Astro
src/layouts/    layouts
src/content/    textos de la página
src/styles/     tokens y estilos base
public/         archivos estáticos
worker/         Worker de Cloudflare (solo /api/*)
specs/          especificaciones: cómo se trabaja en este repo
```

## Cómo se trabaja

Desarrollo guiado por especificaciones: ver [specs/README.md](specs/README.md) y [CLAUDE.md](CLAUDE.md).
