# 004 — Formulario de solicitud de demo

- **Estado:** done
- **Fecha:** 2026-11-19
- **Depende de:** 001, 002

## Contexto

La conversión de la landing es una solicitud de demo. El formulario vive en `/demo`, lo procesa el Worker de
Cloudflare en `POST /api/demo`, se protege con Turnstile y envía la solicitud por email a la bandeja de Visoria con el
binding `send_email` de Cloudflare Email Routing. Todo dentro del plan gratuito.

Email Routing exige que el dominio use los DNS de Cloudflare. Hoy el dominio está en otro registrador, así que esta
spec define un modo degradado (mailto) mientras se completa la migración (spec 007).

## Requisitos

- **R1.** EL SISTEMA DEBE pedir: nombre y apellido, email, teléfono o WhatsApp (opcional), nombre del consultorio o
  la clínica, rol (médico, administración, dirección, otro), número de profesionales (1, 2–5, 6–20, más de 20),
  mensaje (opcional, máx. 1000 caracteres) y una casilla de aceptación de la política de privacidad.
- **R2.** EL SISTEMA DEBE mostrar junto al campo de mensaje el aviso "No incluya datos de pacientes."
- **R3.** EL SISTEMA DEBE validar los campos en el navegador con atributos HTML nativos y repetir la validación en el
  Worker. La del Worker es la que manda.
- **R4.** CUANDO se envía el formulario, EL SISTEMA DEBE verificar el token de Turnstile contra `siteverify` antes de
  procesar nada.
- **R5.** SI el token de Turnstile no es válido, el campo trampa (honeypot) viene relleno o el formulario se envió en
  menos de 3 s, ENTONCES EL SISTEMA DEBE rechazar la solicitud sin enviar email y responder con un error genérico.
- **R6.** CUANDO la solicitud es válida, EL SISTEMA DEBE enviar un email a la dirección configurada en
  `DEMO_INBOX`, con asunto `Demo: <institución> (<n.º profesionales>)`, todos los campos en texto plano y
  `Reply-To` con el email del solicitante.
- **R7.** CUANDO el email se envía bien, EL SISTEMA DEBE mostrar una confirmación ("Recibimos su solicitud. Le
  escribiremos en un plazo de 2 días hábiles.") sin perder el foco ni recargar la página si hay JS, o redirigir a
  `/demo/gracias` si no lo hay.
- **R8.** SI el envío del email falla, ENTONCES EL SISTEMA DEBE responder 502, mostrar el email de contacto como
  alternativa y conservar lo escrito en el formulario.
- **R9.** EL SISTEMA NO DEBE almacenar las solicitudes ni registrarlas en logs con datos personales (solo el
  resultado: ok, rechazada o error).
- **R10.** MIENTRAS la variable `FORM_ENABLED` no sea `true`, EL SISTEMA DEBE mostrar en `/demo`, en lugar del
  formulario, un enlace `mailto:` con asunto prellenado.
- **R11.** EL SISTEMA DEBE asociar cada error a su campo con `aria-describedby` y anunciar el resultado del envío en
  una región `aria-live="polite"`.

### Fuera de alcance

- Guardar las solicitudes en D1 o en un CRM.
- Enviar un email de confirmación al solicitante (evita usar el formulario para mandar spam a terceros).
- Agendar la demo de forma automática.

## Diseño

- **Página `/demo`:** dos columnas en escritorio. A la izquierda, qué incluye la demo (duración, formato por
  videollamada y lo que se revisa); a la derecha, el formulario. Una columna en móvil.
- **Worker (`worker/demo.ts`):** acepta `application/x-www-form-urlencoded` y `multipart/form-data` (funciona sin
  JS). Responde JSON si la petición trae `Accept: application/json`, y `303` a `/demo/gracias` en caso contrario.
- **Email:** binding `send_email` con `destination_address` = `DEMO_INBOX` (verificada en Email Routing). Mensaje MIME
  construido con `mimetext`. Remitente `demo@<dominio>`.
- **Turnstile:** widget en modo `managed`, script cargado solo en `/demo`. Secreto en `TURNSTILE_SECRET`
  (`wrangler secret put`). En desarrollo se usan las claves de prueba oficiales de Cloudflare.
- **JS de cliente (`src/scripts/demo-form.ts`, < 5 KB):** intercepta el submit, envía con `fetch`, gestiona estados
  (enviando, ok, error) y pinta los errores por campo devueltos por el Worker.
- Descartado: servicios de formularios de terceros (Formspree y similares). Envían datos de contacto a otra empresa
  y tienen límites en el plan gratuito.

**Archivos afectados:**

- `src/pages/demo.astro`, `src/pages/demo/gracias.astro`.
- `src/components/DemoForm.astro`, `src/scripts/demo-form.ts`.
- `worker/index.ts` (router), `worker/demo.ts`, `worker/validate.ts`.
- `wrangler.jsonc`: binding `send_email`, vars `FORM_ENABLED`, `DEMO_INBOX`, `TURNSTILE_SITE_KEY`.

## Tareas

- [x] T1 Página `/demo` con el formulario HTML nativo y su validación (R1, R2, R3, R11)
- [x] T2 Modo degradado con mailto controlado por `FORM_ENABLED` (R10)
- [x] T3 Worker: router, parseo y validación de servidor (R3, R9)
- [x] T4 Turnstile, honeypot y tiempo mínimo (R4, R5)
- [x] T5 Envío con `send_email` y manejo de errores (R6, R8, R9)
- [x] T6 JS de mejora progresiva y página `/demo/gracias` (R7, R8, R11)
- [x] T7 Tests del validador y del handler con `vitest` + `@cloudflare/vitest-plugin` (R3, R5, R6, R8). Ver Hallazgos.

## Verificación

- [x] Tests en verde: campos inválidos, honeypot, token inválido, envío ok y fallo de email (13 tests en workerd).
- [x] En local con las claves de prueba: envío con JS (mensaje inline, probado en Chrome por DevTools Protocol) y sin JS
      (redirección 303 a `/demo/gracias`, probado con curl).
- [ ] En producción: llega un email real a `DEMO_INBOX` con `Reply-To` correcto. **Pasa a la spec 007** (requiere dominio,
      Email Routing y `DEMO_INBOX`).
- [x] Con `FORM_ENABLED=false` se ve solo el mailto (hoy, un bloque PENDIENTE porque falta el email de contacto).
- [x] Los logs del Worker no muestran datos personales: test automático y log de `wrangler dev` revisado. `wrangler tail`
      en producción se repite en la 007.
- [ ] Lector de pantalla (NVDA): los errores y la confirmación se anuncian. **Pendiente de Victor.** Comprobado por código:
      `aria-describedby` en cada campo, `aria-invalid`, región `role="status" aria-live="polite"` y foco que no se mueve.

## Hallazgos

- **Sin `mimetext`:** el binding `send_email` acepta ahora un objeto con `{ from, to, replyTo, subject, text }` y monta el
  MIME él mismo. Es una dependencia menos (P7). La protección contra inyección de cabeceras se hace en la validación:
  los campos que acaban en cabeceras no admiten saltos de línea (hay un test).
- **Tests con `@cloudflare/vitest-plugin`, no `vitest-pool-workers`:** este último está deprecado (renombrado) y su
  última versión traía 6 vulnerabilidades altas. Se usa `@cloudflare/vitest-plugin` 1.8 con vitest 5.1, sin
  vulnerabilidades, y los tests corren en workerd. El handler recibe `verify`/`send` inyectables, así que los tests
  no dependen de la red ni de Email Routing.
- **Turnstile necesita JavaScript:** sin JS el widget no genera token y ningún envío puede pasar R4. Sin JS, `/demo`
  muestra un aviso `<noscript>` con el email de contacto (constitution P4). La ruta sin JS del Worker (303) existe y
  está probada, pero en la práctica solo la usa quien tiene JS y aun así no carga `demo-form.ts`.
- **Nueva página `/demo/error`:** destino del 303 cuando un envío sin JS falla. Un sitio estático no puede mostrar el
  error en `/demo` sin JS. Sin JS no se puede conservar lo escrito (R8); con JS sí se conserva.
- **`FORM_ENABLED` se lee en dos sitios:** al construir (Astro, `astro:env`, decide qué se pinta en `/demo`) y en
  runtime (Worker, `vars`). El Worker además se considera desactivado (503) si faltan `DEMO_INBOX`, `DEMO_FROM` o el
  binding. La spec 007 (paso 6) ya lo recoge.
- **`DEMO_INBOX` y `DEMO_FROM` vacíos (PENDIENTE)** en `wrangler.jsonc`. El binding `send_email` se declara sin
  `destination_address`: el destino lo fija `DEMO_INBOX`, que debe estar verificado en Email Routing (spec 007).
- **Email de contacto pendiente:** `site.contactEmail` está vacío. `/demo` muestra un bloque "Pendiente · email de
  contacto" en lugar del mailto, y `check:content` ahora también falla por eso.
- **Texto de la demo sin duración ni formato:** no hay datos confirmados (P1). Lo que se muestra deriva de las
  funciones confirmadas en la 003; la duración y el formato quedan como `# PENDIENTE` en `demo.yaml`.
- **Foco tras el envío:** deshabilitar el botón enfocado (`disabled`) hacía que Chrome moviera el foco al `body`. Se
  sustituyó por `aria-disabled` + bandera interna; verificado en Chrome que el foco se queda en el botón (R7).
- **Prueba local de punta a punta:** `npm run preview:form` construye con `.env.formtest` (solo valores públicos de
  prueba) y arranca `wrangler dev` con el formulario activo y la clave secreta de prueba de Turnstile. El email se
  simula y queda en `.wrangler/tmp/email/`.
- **Acentos con curl en Windows:** al probar con curl desde Git Bash, los acentos llegaban rotos. Con texto UTF-8 real,
  como el que envía cualquier navegador, el asunto sale bien ("Demo: Clínica Ávila Ñandú (1 profesional)").
- **JS de `/demo`:** 2.9 KB (1.5 KB gzip), incrustado en el HTML. Turnstile solo se carga con el formulario activo. La
  home sigue sin scripts.

## Cierre

- **Qué se hizo:**
  - T1: `/demo` con el formulario nativo: 7 campos + privacidad, aviso "No incluya datos de pacientes", errores
    asociados con `aria-describedby`. Los campos se definen una sola vez en `worker/fields.ts` y los comparten la
    página, el JS y el Worker.
  - T2: con `FORM_ENABLED=false`, `/demo` muestra el bloque de email (hoy PENDIENTE).
  - T3: router del Worker (`POST /api/demo`, 405 para otros métodos, 404 para otras rutas) y validación de servidor.
  - T4: Turnstile (siteverify), honeypot `website` y tiempo mínimo de 3 s.
  - T5: email con `send_email` (asunto, todos los campos, Reply-To), 502 si falla y logs sin datos personales.
  - T6: `demo-form.ts` (validación en español, envío con fetch, aria-live, reset de Turnstile), `/demo/gracias` y
    `/demo/error`.
  - T7: 13 tests en workerd.
- **Verificación ejecutada:** check (0 errores), `npm test` (13/13), build (5 páginas), prueba de punta a punta con
  `preview:form` (200, 422 y 303), formulario manejado en Chrome por CDP (errores, foco, éxito) y build normal con el
  formulario oculto. Pendientes: email real en producción (007) y prueba con NVDA (Victor).
- **Archivos:** `worker/{fields,validate,turnstile,email,demo,index}.ts`, `worker/demo.test.ts`, `worker/tsconfig.json`,
  `vitest.config.ts`, `wrangler.jsonc`, `astro.config.mjs`, `.env.formtest`, `.gitignore`, `package.json`,
  `package-lock.json`, `src/content.config.ts`, `src/content/demo/demo.yaml`, `src/components/DemoForm.astro`,
  `src/components/Button.astro` (estilo `aria-disabled`), `src/scripts/demo-form.ts`,
  `src/pages/demo.astro`, `src/pages/demo/{gracias,error}.astro`, `scripts/check-content.mjs`, `README.md`,
  `CLAUDE.md`, `specs/004-demo-form/spec.md`, `specs/007-deploy/spec.md` (paso 6), `specs/README.md`.
- **Cómo verlo en local:**
  - `npm run dev` → http://localhost:4330/demo: versión sin formulario (bloque de email PENDIENTE).
  - `npm run preview:form` → http://127.0.0.1:8787/demo: formulario activo. Pruebe enviarlo vacío, con un email mal
    escrito y completo. Los emails simulados quedan en `.wrangler/tmp/email/`.
- **Cambios de Victor:** —
- **Commit:** `feat(004): formulario de demo`. Aprobado el 2026-11-20. Quedan fuera de esta spec: el email real en producción (se verifica en la 007) y la prueba con NVDA (pendiente de Victor).
