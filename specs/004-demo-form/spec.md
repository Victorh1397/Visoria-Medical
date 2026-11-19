# 004 — Formulario de solicitud de demo

- **Estado:** approved
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

- [ ] T1 Página `/demo` con el formulario HTML nativo y su validación (R1, R2, R3, R11)
- [ ] T2 Modo degradado con mailto controlado por `FORM_ENABLED` (R10)
- [ ] T3 Worker: router, parseo y validación de servidor (R3, R9)
- [ ] T4 Turnstile, honeypot y tiempo mínimo (R4, R5)
- [ ] T5 Envío con `send_email` y manejo de errores (R6, R8, R9)
- [ ] T6 JS de mejora progresiva y página `/demo/gracias` (R7, R8, R11)
- [ ] T7 Tests del validador y del handler con `vitest` + `@cloudflare/vitest-pool-workers` (R3, R5, R6, R8)

## Verificación

- [ ] Tests en verde: campos inválidos, honeypot, token inválido, envío ok y fallo de email.
- [ ] En local con las claves de prueba: envío con JS (mensaje inline) y sin JS (redirección a `/demo/gracias`).
- [ ] En producción: llega un email real a `DEMO_INBOX` con `Reply-To` correcto.
- [ ] Con `FORM_ENABLED=false` se ve solo el mailto.
- [ ] Los logs del Worker (`wrangler tail`) no muestran datos personales.
- [ ] Lector de pantalla (NVDA): los errores y la confirmación se anuncian.

## Hallazgos


## Cierre
