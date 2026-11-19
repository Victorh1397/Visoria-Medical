# 005 — Páginas legales

- **Estado:** approved
- **Fecha:** 2026-11-19
- **Depende de:** 002

## Contexto

Una clínica que evalúa un software de historias clínicas mira la política de privacidad antes de pedir una demo.
Venezuela no tiene una ley general de protección de datos personales. El marco aplicable está disperso: la
Constitución (art. 28, habeas data; art. 48, secreto de las comunicaciones; art. 60, protección de la vida privada
y límites al uso de la informática), la Ley Especial contra los Delitos Informáticos, la Ley de Infogobierno y las
normas de secreto médico (Ley de Ejercicio de la Medicina y Código de Deontología Médica).

Estas páginas cubren **la landing** (qué datos recoge el formulario y para qué). Las condiciones del servicio
Visoria (contrato con la clínica y tratamiento de datos de pacientes) son un documento aparte que no entra aquí.

## Requisitos

- **R1.** EL SISTEMA DEBE publicar `/privacidad` (política de privacidad del sitio) y `/terminos` (términos de uso del
  sitio).
- **R2.** EL SISTEMA DEBE indicar en `/privacidad`: responsable y contacto, datos recogidos por el formulario,
  finalidad (responder la solicitud de demo), base (consentimiento), plazo de conservación, que no se ceden a
  terceros salvo a los proveedores técnicos (Cloudflare), la analítica sin cookies y cómo ejercer acceso,
  rectificación y supresión.
- **R3.** EL SISTEMA DEBE mostrar en ambas páginas la fecha de última actualización.
- **R4.** MIENTRAS un documento no tenga revisión legal confirmada (`reviewed: false` en su frontmatter), EL SISTEMA
  DEBE mostrar un aviso visible "Documento pendiente de revisión legal" y `check:content` DEBE fallar en el build de
  producción.
- **R5.** EL SISTEMA DEBE enlazar ambas páginas desde el footer, y `/privacidad` desde la casilla del formulario.
- **R6.** EL SISTEMA DEBE redactar los textos en lenguaje llano, con encabezados por tema y sin copiar plantillas de
  otras jurisdicciones (no citar RGPD, HIPAA, etc. como si aplicaran).

### Fuera de alcance

- Contrato de servicio y acuerdo de tratamiento de datos de pacientes.
- Banner de cookies: no hace falta, porque el sitio no usa cookies de seguimiento (Turnstile solo usa las
  estrictamente necesarias para la protección antibots, y así se explica en `/privacidad`).

## Diseño

- Colección `legal` en `src/content/legal/` con `privacidad.md` y `terminos.md`, cada uno con el frontmatter
  `title`, `updated` y `reviewed`.
- Layout `Legal.astro`: columna de 68 ch, índice de secciones arriba y tipografía de lectura.
- Claude redacta un borrador; **Victor lo hace revisar por un abogado** antes de publicar. El paso a
  `reviewed: true` es manual.

**Archivos afectados:**

- `src/content/legal/*.md`, `src/content.config.ts`.
- `src/layouts/Legal.astro`, `src/pages/privacidad.astro`, `src/pages/terminos.astro`.

## Tareas

- [ ] T1 Colección `legal` y layout `Legal` (R1, R3)
- [ ] T2 Borrador de política de privacidad (R2, R6)
- [ ] T3 Borrador de términos de uso del sitio (R6)
- [ ] T4 Aviso de revisión pendiente y bloqueo en `check:content` (R4)
- [ ] T5 Enlaces desde el footer y el formulario (R5)

## Verificación

- [ ] Ambas páginas cubren cada punto de R2 (checklist revisada con Victor).
- [ ] Con `reviewed: false`, el aviso se ve y `check:content` falla en modo producción.
- [ ] Revisión del abogado registrada en Hallazgos (fecha y quién).

## Hallazgos


## Cierre
