# 005 — Páginas legales

- **Estado:** in-progress (revisión legal pendiente)
- **Fecha:** 2026-11-19
- **Depende de:** 002

## Contexto

Una clínica que evalúa un software de historias clínicas mira la política de privacidad antes de pedir una demo.

**Actualización del 2026-11-20 (dato de Victor):** la empresa detrás de Visoria Medical está **constituida en Estados
Unidos**, no en Venezuela. Por tanto el responsable es una entidad estadounidense (razón social y estado de
constitución: PENDIENTE) que atiende a profesionales en Venezuela. Esto implica:

- Identificar al responsable como empresa de EE. UU. No hay RIF.
- Informar de que los datos se tratan fuera de Venezuela: Cloudflare (red global) y EE. UU.
- Términos de uso regidos por la ley del estado de constitución (PENDIENTE, a confirmar por el abogado), sin perjuicio
  de los derechos que la ley venezolana reconozca a los usuarios.
- Respetar igualmente el marco venezolano que protege a quien nos escribe: la Constitución (art. 28, habeas data;
  art. 60, vida privada y límites al uso de la informática) y la Ley Especial contra los Delitos Informáticos.
  Venezuela no tiene una ley general de protección de datos personales.

Estas páginas cubren **la landing** (qué datos recoge el formulario y para qué). Las condiciones del servicio
Visoria (contrato con la clínica y tratamiento de datos de pacientes) son un documento aparte que no entra aquí.

## Requisitos

- **R1.** EL SISTEMA DEBE publicar `/privacidad` (política de privacidad del sitio) y `/terminos` (términos de uso del
  sitio).
- **R2.** EL SISTEMA DEBE indicar en `/privacidad`: responsable (empresa constituida en EE. UU.) y contacto, datos
  recogidos por el formulario, finalidad (responder la solicitud de demo), base (consentimiento), plazo de
  conservación, que no se ceden a terceros salvo a los proveedores técnicos (Cloudflare), dónde se tratan los datos
  (fuera de Venezuela), la analítica sin cookies y cómo ejercer acceso, rectificación y supresión.
- **R3.** EL SISTEMA DEBE mostrar en ambas páginas la fecha de última actualización.
- **R4.** MIENTRAS un documento no tenga revisión legal confirmada (`reviewed: false` en su frontmatter), EL SISTEMA
  DEBE mostrar un aviso visible "Documento pendiente de revisión legal" y `check:content` DEBE fallar en el build de
  producción.
- **R5.** EL SISTEMA DEBE enlazar ambas páginas desde el footer, y `/privacidad` desde la casilla del formulario.
- **R6.** EL SISTEMA DEBE redactar los textos en lenguaje llano, con encabezados por tema y sin citar normas que no
  apliquen al sitio como si aplicaran (RGPD, HIPAA, CCPA, etc.).
- **R7.** SI falta un dato de identificación del responsable (razón social, estado de constitución, email), ENTONCES
  EL SISTEMA DEBE mostrarlo como `PENDIENTE` y `check:content` DEBE fallar.

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

- [x] T1 Colección `legal` y layout `Legal` (R1, R3)
- [x] T2 Borrador de política de privacidad (R2, R6)
- [x] T3 Borrador de términos de uso del sitio (R6)
- [x] T4 Aviso de revisión pendiente y bloqueo en `check:content` (R4, R7)
- [x] T5 Enlaces desde el footer y el formulario (R5)

## Verificación

- [ ] Ambas páginas cubren cada punto de R2 (checklist revisada con Victor). **Checklist en Hallazgos; falta la revisión de Victor.**
- [x] Con `reviewed: false`, el aviso se ve y `check:content` falla en modo producción.
- [ ] Revisión del abogado registrada en Hallazgos (fecha y quién). **Pendiente.**

## Hallazgos

- **Cambio de alcance (2026-11-20):** la empresa está constituida en EE. UU. Se actualizaron Contexto, R2 y R6 y se
  añadió R7 antes de implementar.
- **Checklist de R2 en `/privacidad`:**
  - responsable (empresa de EE. UU.) y contacto → "Quién es el responsable" (razón social, estado y email PENDIENTE);
  - datos del formulario → "Qué datos recogemos";
  - finalidad → "Para qué los usamos";
  - base (consentimiento) → "Base para tratarlos";
  - cesión solo a proveedores técnicos → "Con quién los compartimos";
  - dónde se tratan (fuera de Venezuela) → "Dónde se tratan";
  - plazo de conservación → "Cuánto tiempo los conservamos";
  - analítica sin cookies → "Analítica y cookies";
  - acceso, rectificación y supresión → "Sus derechos".
- **Decisiones propuestas que Victor y el abogado deben confirmar:** conservar los emails de solicitud **12 meses**
  desde el último contacto; responder a solicitudes de derechos en **30 días**; ley aplicable de los términos = estado
  de constitución. Están escritas en el borrador y no llevan marca PENDIENTE: el aviso de revisión legal ya bloquea la
  publicación.
- **Marco venezolano:** se citan los artículos 28 (habeas data) y 60 (vida privada) de la Constitución como derechos que
  se respetan. No se citan normas estadounidenses ni otras (HIPAA, CCPA, RGPD) como si aplicaran (R6).
- **Analítica:** la política ya menciona Cloudflare Web Analytics, que se instala en la spec 006. Si la 006 cambia de
  herramienta, hay que actualizar este texto.
- **Turnstile y cookies:** no se afirma si Turnstile usa o no cookies, solo que analiza datos técnicos del navegador con
  fines antispam y no publicitarios. Que el abogado lo valide con la documentación de Cloudflare.
- **Comentarios HTML en Markdown:** `check:content` trata como comentario todo lo que va entre `<!--` y `-->`; un PENDIENTE
  dentro solo avisa.
- **Índice:** con 12 secciones, los números de dos cifras se salían de la columna; se amplió el margen.

## Cierre

- **Qué se hizo:**
  - T1: colección `legal` (glob de Markdown con `title`, `description`, `updated`, `reviewed`) y layout `Legal`
    (columna de 68 ch, fecha, índice automático a partir de los h2).
  - T2: borrador de política de privacidad (12 secciones).
  - T3: borrador de términos de uso del sitio (9 secciones).
  - T4: aviso "Documento pendiente de revisión legal" con `reviewed: false`. `check:content` falla por eso y por cada
    PENDIENTE del responsable.
  - T5: los enlaces del pie y de la casilla del formulario ya llevan a páginas reales.
- **Verificación ejecutada:** check (0 errores), build (7 páginas), `check:content` (falla por revisión legal y
  PENDIENTE) y captura de `/privacidad` a 1280 px. Pendientes: revisión de la checklist de R2 por Victor y revisión
  del abogado.
- **Archivos:** `src/content.config.ts`, `src/content/legal/{privacidad,terminos}.md`, `src/layouts/Legal.astro`,
  `src/pages/{privacidad,terminos}.astro`, `scripts/check-content.mjs`, `specs/005-legal/spec.md`, `specs/README.md`.
- **Cómo verlo en local:** `npm run dev` → http://localhost:4330/privacidad y http://localhost:4330/terminos. Los textos
  se editan en `src/content/legal/*.md`.
- **Cambios de Victor:** —
- **Commit:** `feat(005): páginas legales`. Aprobado el 2026-11-20 con la spec abierta: faltan la revisión del abogado, los datos del responsable y la revisión de la checklist de R2 por Victor.
