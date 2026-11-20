# 007 — Despliegue en Cloudflare

- **Estado:** approved
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
  `npm ci && npm run check && npm run check:content && npm run build`, y despliegue con `wrangler deploy`.
- Cabeceras en `public/_headers` (soportado por Workers static assets) para HTML y assets. Las respuestas de
  `/api/*` llevan sus cabeceras desde el Worker.
- Hasta tener el dominio: el sitio vive en `visoria-landing.<cuenta>.workers.dev` con `FORM_ENABLED=false`.

**Orden de activación:**

1. Desplegar en `*.workers.dev` (formulario en modo mailto).
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
- [ ] T2 `_headers` con CSP y cabeceras de seguridad y caché (R5, R7)
- [ ] T3 Primer despliegue en `*.workers.dev` (R1)
- [ ] T4 [Victor] Migrar los nameservers del dominio a Cloudflare (R4)
- [ ] T5 Custom Domain y redirección `www` (R4)
- [ ] T6 [Victor] Email Routing + Turnstile; Claude configura bindings y secretos (R6)
- [ ] T7 Activar `FORM_ENABLED` y prueba de extremo a extremo (R1, R6)

## Verificación

- [ ] Un push con un error de tipos no despliega.
- [ ] Una rama genera una URL de preview funcional.
- [ ] securityheaders.com da A o superior en el dominio.
- [ ] `curl -I` a un asset con hash muestra `Cache-Control: public, max-age=31536000, immutable`.
- [ ] Envío real del formulario desde producción recibido en `DEMO_INBOX`.

## Hallazgos


## Cierre
