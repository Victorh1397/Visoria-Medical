# 007 — Despliegue en Cloudflare

- **Estado:** in-progress
- **Fecha:** 2026-11-19
- **Depende de:** 001 (y 004 para activar el formulario)

## Contexto

El sitio se aloja en Cloudflare Workers (plan gratuito: 100 000 peticiones al día al Worker; los archivos estáticos
no cuentan contra ese límite). El dominio de Visoria Medical está en otro registrador: para usar Email Routing y
Turnstile en el dominio hay que **cambiar sus nameservers a Cloudflare** (gratis; el dominio sigue registrado donde
está).

**Ojo:** desde que se conecte Workers Builds, cada push a `main` despliega a producción. Con el flujo de trabajo
acordado eso ocurre en cada cierre de spec, después del OK de Victor.

Hay pasos que solo puede hacer Victor desde los paneles de Cloudflare y del registrador. En las tareas van marcados
con **[Victor]**.

## Requisitos

- **R1.** CUANDO se hace push a `main`, EL SISTEMA DEBE construir y desplegar a producción automáticamente
  (Workers Builds conectado a GitHub).
- **R2.** CUANDO se hace push a otra rama, EL SISTEMA DEBE generar una URL de preview sin tocar producción.
- **R3.** SI `npm run check`, `check:content` o `build` fallan, ENTONCES EL SISTEMA NO DEBE desplegar.
- **R4.** EL SISTEMA DEBE servir el sitio en el dominio propio con HTTPS, y redirigir `www` al dominio raíz (o al
  revés, según se decida) con 301.
- **R5.** EL SISTEMA DEBE enviar las cabeceras de seguridad `Content-Security-Policy` (permitiendo solo Turnstile y Web
  Analytics), `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
- **R6.** EL SISTEMA DEBE guardar los secretos (`TURNSTILE_SECRET`) con `wrangler secret`, nunca en el repo.
- **R7.** EL SISTEMA DEBE cachear los assets con hash de forma inmutable (1 año) y el HTML con revalidación.

### Fuera de alcance

- Entorno de staging separado (las previews por rama cubren esa necesidad).
- Monitorización de uptime externa.

## Diseño

- Repo existente `Victorh1397/Visoria-Medical` en GitHub → Workers Builds: comando de build
  `npm ci && npm run ci` (check, check:content, test y build), y despliegue con `wrangler deploy`.
- Cabeceras en `public/_headers` (soportado por Workers static assets) para HTML y assets. Las respuestas de
  `/api/*` llevan sus cabeceras desde el Worker.
- Hasta tener el dominio: el sitio vive en `visoria-landing.<cuenta>.workers.dev` con `FORM_ENABLED=false`.
- **Variables de build (añadido en la spec 006):** `SITE_URL` (URL pública real: canonical, OG, sitemap y robots;
  por defecto `https://visoria-landing.workers.dev`, que no es la URL real de la cuenta) y `CF_WEB_ANALYTICS_TOKEN`
  (o bien activar la inyección automática de Web Analytics desde el panel, sin token). La CSP debe permitir
  `static.cloudflareinsights.com` (script) y `cloudflareinsights.com` (connect), además de
  `challenges.cloudflare.com` para Turnstile (script y frame).
- **A resolver al empezar esta spec (detectado en la 006):** el comando de build incluye `check:content`, que falla
  mientras falten capturas, revisión legal o datos del responsable. Así, el paso 1 ("desplegar en `*.workers.dev`")
  no puede pasar. Opciones: excluir `check:content` de las previews por rama y exigirlo solo en `main`, o no conectar
  `main` a producción hasta que el contenido esté completo.

**Decisión de Victor (2026-11-20): esperar al contenido.** No se conecta nada a Cloudflare hasta que
`check:content` pase (capturas, revisión legal, email de contacto y datos del responsable). Mientras tanto se hacen
las partes que no publican nada: T2 (cabeceras) y el comando `npm run ci`. Victor ya tiene cuenta de Cloudflare;
el dominio está por decidir.

**Configuración de Workers Builds (para T1, cuando toque):**

| Campo | Valor |
|---|---|
| Repositorio | `Victorh1397/Visoria-Medical`, rama de producción `main` |
| Comando de build | `npm ci && npm run ci` |
| Comando de despliegue | `npx wrangler deploy` |
| Variables de build | `SITE_URL`, `CF_WEB_ANALYTICS_TOKEN`; con el formulario: `FORM_ENABLED=true`, `TURNSTILE_SITE_KEY` |
| Secreto del Worker | `TURNSTILE_SECRET` (`wrangler secret put`) |

**Orden de activación:**

1. Desplegar en `*.workers.dev` (formulario en modo mailto), una vez que `check:content` pase.
2. [Victor] Añadir el dominio a Cloudflare y cambiar los nameservers en el registrador. Esperar la propagación.
3. Asociar el dominio como Custom Domain del Worker.
4. [Victor] Activar Email Routing y verificar la dirección de destino `DEMO_INBOX`.
5. [Victor] Crear el widget de Turnstile para el dominio; guardar el secreto.
6. Poner `FORM_ENABLED=true` **en dos sitios**: variable de build de Workers Builds (la lee Astro al generar `/demo`) y
   `vars` de `wrangler.jsonc` (la lee el Worker). Rellenar también `DEMO_INBOX`, `DEMO_FROM` y `TURNSTILE_SITE_KEY`
   (build) con los valores reales, y desplegar. Ver Hallazgos de la spec 004.

**Archivos afectados:**

- `wrangler.jsonc` (rutas, vars, bindings), `public/_headers`.
- `CLAUDE.md` y este archivo (pasos documentados).

## Tareas

- [ ] T1 Conectar el repo existente `Victorh1397/Visoria-Medical` con Workers Builds [Victor + Claude] (R1, R2, R3)
- [x] T2 `_headers` con CSP y cabeceras de seguridad y caché (R5, R7)
- [ ] T3 Primer despliegue en `*.workers.dev` (R1)
- [ ] T4 [Victor] Migrar los nameservers del dominio a Cloudflare (R4)
- [ ] T5 Custom Domain y redirección `www` (R4)
- [ ] T6 [Victor] Email Routing + Turnstile; Claude configura bindings y secretos (R6)
- [ ] T7 Activar `FORM_ENABLED` y prueba de extremo a extremo (R1, R6)

## Verificación

- [ ] Un push con un error de tipos no despliega.
- [ ] Una rama genera una URL de preview funcional.
- [ ] securityheaders.com da A o superior en el dominio.
- [ ] `curl -I` a un asset con hash muestra `Cache-Control: public, max-age=31536000, immutable`. **En local (wrangler
      dev) sí; falta repetirlo en producción.**
- [ ] Envío real del formulario desde producción recibido en `DEMO_INBOX`.

**Heredadas de specs anteriores (necesitan URL pública):**

- [ ] 004: email real en `DEMO_INBOX` con Reply-To correcto; `wrangler tail` sin datos personales.
- [ ] 006: validador de datos estructurados de Google, vista previa del enlace en WhatsApp y panel de Web Analytics
      con visitas a `/` y `/demo/gracias`.

## Hallazgos

- **Fase 1 (2026-11-20), sin publicar nada:** T2 y `npm run ci`. El resto de tareas espera a que el contenido esté
  completo (decisión de Victor).
- **CSP sin `'unsafe-inline'` en scripts:** Astro incrustaba en el HTML el JS pequeño de `/demo`. Con
  `vite.build.assetsInlineLimit = 0`, todo el JS sale como archivo externo. `style-src` sí necesita `'unsafe-inline'`
  por los atributos `style` (marcadores de capturas, `aspect-ratio`). El JSON-LD es un bloque de datos y la CSP no lo
  bloquea.
- **JS huérfano de `/_estilos`:** su script se empaquetaba en `dist/` aunque la página no se publica. Pasó a
  `is:inline`, porque solo existe en desarrollo.
- **Caché:** HTML y archivos sin hash (`og.png`, favicons) con `max-age=0, must-revalidate`; `/_astro/*` (con hash)
  inmutable un año. Se usa `! Cache-Control` en la regla específica para que no se combine con la general.
- **Cabeceras de la API:** los static assets no aplican `_headers` a las respuestas del Worker. `worker/index.ts` añade
  HSTS, `nosniff`, `Referrer-Policy` y una CSP `default-src 'none'` a todo `/api/*` (test añadido: 14 en total).
- **`upgrade-insecure-requests` en local:** no rompe `wrangler dev` sobre `http://127.0.0.1`. Comprobado en Chrome:
  consola limpia, todas las fuentes cargadas y envío completo con Turnstile bajo la CSP.
- **`www` → raíz (R4):** depende del dominio; queda para T5.

## Cierre

Spec abierta: fase 1 hecha, el resto espera al contenido.

- **Qué se hizo (fase 1):**
  - T2: `public/_headers` (CSP, HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y caché)
    y cabeceras de seguridad en las respuestas del Worker.
  - `npm run ci` (check + check:content + test + build) como comando de build de Workers Builds; tabla de
    configuración en Diseño.
  - Scripts siempre externos (CSP más estricta) y JS de `/_estilos` fuera de `dist/`.
- **Verificación ejecutada:** check (0 errores), `npm test` (14/14), build (7 páginas), cabeceras comprobadas con
  `curl -I` en `wrangler dev` y páginas cargadas en Chrome sin violaciones de CSP ni fallos de red. `npm run ci` falla
  por `check:content`, como se espera.
- **Archivos:** `public/_headers`, `worker/index.ts`, `worker/demo.test.ts`, `astro.config.mjs`,
  `src/pages/[estilos].astro`, `package.json`, `README.md`, `CLAUDE.md`, `specs/007-deploy/spec.md`, `specs/README.md`.
- **Cómo verlo en local:** `npm run preview` y `curl -I http://127.0.0.1:8787/`, o DevTools → Network → cabeceras de
  cualquier página.
- **Cambios de Victor:** ninguno.
- **Commit:** `feat(007): cabeceras de seguridad y comando ci (fase 1)`, aprobado por Victor el 2026-11-20. La spec sigue abierta.
