# 003 — Página principal: estructura y contenido

- **Estado:** approved (bloqueado: faltan la lista de funciones, las capturas y los datos de seguridad)
- **Fecha:** 2026-11-19
- **Depende de:** 002

## Contexto

La home es la landing. Su público son **médicos, administradores de consultorios y directores de clínicas en
Venezuela** que hoy llevan historias clínicas en papel, Excel o sistemas viejos. Tienen que salir de la página
sabiendo qué hace Visoria, si pueden confiarle sus datos y cómo pedir una demo.

## Requisitos

- **R1.** EL SISTEMA DEBE mostrar las secciones en este orden: Hero, Funciones, Seguridad y privacidad, Preguntas
  frecuentes, CTA final y Footer.
- **R2.** EL SISTEMA DEBE presentar en el hero, sin hacer scroll en un viewport de 1280×800 y de 390×844, el nombre
  del producto, una propuesta de valor de máximo 10 palabras, una línea de apoyo, el botón "Solicitar demo" y una
  captura real de la app.
- **R3.** EL SISTEMA DEBE describir cada función con un título, una o dos frases y una captura anotada (`Annotated`).
  Solo se incluyen funciones que existen hoy en la app (P1).
- **R4.** EL SISTEMA DEBE explicar en "Seguridad y privacidad" las medidas técnicas reales (cifrado, control de acceso
  por rol, registro de auditoría, copias de seguridad, alojamiento de los datos), cada una en una frase concreta y
  verificable.
- **R5.** EL SISTEMA DEBE mostrar las preguntas frecuentes con `<details>`/`<summary>` nativos, sin JavaScript.
- **R6.** EL SISTEMA DEBE cargar todos los textos de la página desde `src/content/`, validados con schema.
- **R7.** SI un texto o una captura está marcado como `PENDIENTE`, ENTONCES EL SISTEMA DEBE mostrar un placeholder
  visible y `npm run check:content` DEBE fallar.
- **R8.** CUANDO se pulsa cualquier botón "Solicitar demo", EL SISTEMA DEBE llevar a `/demo`.
- **R9.** EL SISTEMA DEBE servir las capturas como AVIF/WebP responsive con `width`/`height` explícitos (sin CLS) y
  `loading="lazy"` en todas menos la del hero.

### Fuera de alcance

- Precios y planes.
- Testimonios, logos de clientes y cifras de uso (P1: solo cuando existan y sean verificables, en una spec futura).
- Blog, recursos o documentación.

## Diseño

**Wireframe (escritorio):**

```
[Logo Visoria]                       Funciones  Seguridad  Preguntas  [Solicitar demo]
──────────────────────────────────────────────────────────────────────────────────────
PARA CONSULTORIOS Y CLÍNICAS (mono, muted)
<Propuesta de valor, h1, 2 líneas>                 ┌──────────────────────────────┐
<Línea de apoyo, 1–2 frases>                       │  captura del hero            │
[Solicitar demo]  Ver funciones ↓                  └──────────────────────────────┘
──────────────────────────────────────────────────────────────────────────────────────
01  FUNCIONES
    01 <Función>   texto                ┌ captura anotada ①②③ ┐
    02 <Función>   texto                └─────────────────────┘
    …  (alterna texto/captura a izquierda y derecha)
──────────────────────────────────────────────────────────────────────────────────────
02  SEGURIDAD Y PRIVACIDAD     filas: medida | detalle concreto (tabla de 2 columnas)
──────────────────────────────────────────────────────────────────────────────────────
03  PREGUNTAS FRECUENTES       <details> en filas con líneas finas
──────────────────────────────────────────────────────────────────────────────────────
<Frase de cierre>                                   [Solicitar demo]
──────────────────────────────────────────────────────────────────────────────────────
Footer: logo · contacto · Privacidad · Términos · © año
```

**Contenido como datos:** colección `home` en `src/content/home/` con un archivo por sección
(`hero.md`, `features.yaml`, `security.yaml`, `faq.yaml`, `cta.md`). Schema con Zod en `src/content.config.ts`.
Cada captura declara `src`, `alt` y `annotations[]`.

**Borrador de preguntas frecuentes** (a validar con Victor):

1. ¿Dónde se almacenan los datos de mis pacientes?
2. ¿Quién puede ver cada historia clínica?
3. ¿Puedo migrar historias que ya tengo en papel o Excel?
4. ¿Funciona sin conexión a internet? (relevante en Venezuela)
5. ¿En qué dispositivos se usa?
6. ¿Cuánto cuesta? → "Depende del tamaño del equipo; lo vemos en la demo."
7. ¿Qué pasa con mis datos si dejo de usar Visoria? (exportación)

**Insumos que debe entregar Victor:**

- Lista de funciones reales (5 como máximo en la v1), con una frase sobre el problema que resuelve cada una.
- Capturas a resolución completa (≥ 2× para retina), **con pacientes ficticios**.
- Datos de seguridad: dónde se alojan los datos, tipo de cifrado, roles, auditoría, backups y exportación.
- Respuestas a las preguntas frecuentes.
- Email de contacto público.

**Archivos afectados:**

- `src/content.config.ts`, `src/content/home/*`: contenido y schemas.
- `src/pages/index.astro`, `src/components/home/*.astro`: secciones.
- `public/screens/` o `src/assets/screens/`: capturas (procesadas con `astro:assets`).
- `scripts/check-content.mjs`: detecta `PENDIENTE`.

## Tareas

- [ ] T1 Schemas de contenido y `check:content` con detección de `PENDIENTE` (R6, R7)
- [ ] T2 Hero con captura optimizada (R2, R8, R9)
- [ ] T3 Sección Funciones con `Annotated` (R3, R9)
- [ ] T4 Sección Seguridad y privacidad (R4)
- [ ] T5 Preguntas frecuentes con `<details>` (R5)
- [ ] T6 CTA final y enlaces de navegación con anclas (R1, R8)
- [ ] T7 Redacción final de textos con Victor y sustitución de todos los `PENDIENTE` (R3, R4, R7)

## Verificación

- [ ] A 1280×800 y 390×844 el h1, el CTA y la captura del hero se ven sin scroll.
- [ ] `npm run check:content` pasa (cero `PENDIENTE`).
- [ ] Cada función y cada medida de seguridad confirmada como real por Victor (lista firmada en Hallazgos).
- [ ] Con JS desactivado, la página se ve completa y las preguntas frecuentes se abren.
- [ ] Lighthouse móvil ≥ 95 en las cuatro categorías; CLS = 0.

## Hallazgos


## Cierre
