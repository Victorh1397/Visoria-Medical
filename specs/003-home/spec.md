# 003 — Página principal: estructura y contenido

- **Estado:** in-progress (faltan capturas)
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

- [x] T1 Schemas de contenido y `check:content` con detección de `PENDIENTE` (R6, R7)
- [x] T2 Hero con captura optimizada (R2, R8, R9)
- [x] T3 Sección Funciones con `Annotated` (R3, R9)
- [x] T4 Sección Seguridad y privacidad (R4)
- [x] T5 Preguntas frecuentes con `<details>` (R5)
- [x] T6 CTA final y enlaces de navegación con anclas (R1, R8)
- [ ] T7 Redacción final de textos con Victor y sustitución de todos los `PENDIENTE` (R3, R4, R7). Textos hechos; **faltan las 5 capturas**.

## Verificación

- [x] A 1280×800 y 390×844 el h1, el CTA y la captura del hero se ven sin scroll.
- [ ] `npm run check:content` pasa (cero `PENDIENTE`). **Falla hoy por las 5 capturas pendientes** (hero + 4 funciones).
- [x] Cada función y cada medida de seguridad confirmada como real por Victor (lista firmada en Hallazgos).
- [x] Con JS desactivado, la página se ve completa y las preguntas frecuentes se abren.
- [x] Lighthouse móvil ≥ 95 en las cuatro categorías; CLS = 0.

## Hallazgos

- **Fuente de los textos:** la landing anterior (Vite + Tailwind, carpeta `OneDrive\Documentos\Visoria\Logo Visoria`)
  tenía señales de plantilla: teléfono `+1 (555) 123-4567`, ubicación "Ciudad de México" y frases como "los más altos
  estándares de seguridad". Solo se reutilizó lo que Victor confirmó.
- **Confirmado por Victor el 2026-11-19:**
  - Funciones: historia clínica, registro de pacientes, agenda de citas, reportes y estadísticas.
  - Seguridad: cifrado, respaldos automáticos en la nube, acceso por roles, multiplataforma (computadora, tablet y
    teléfono).
- **No confirmado, por tanto no publicado:** notificaciones automáticas de citas (las anunciaba la landing anterior);
  registro de auditoría y lugar de alojamiento de los datos (R4 los mencionaba como ejemplos); detalle del cifrado
  (en tránsito, en reposo o tipo). La frase de cifrado queda genérica hasta tener ese dato.
- **Multiplataforma** va en el texto del hero y en las preguntas frecuentes, no en Seguridad: el acceso desde
  cualquier dispositivo no es una medida de protección.
- **Preguntas frecuentes:** se publican 3 con respuesta confirmada. Otras 5 (alojamiento, uso sin conexión, migración,
  exportación y precio) quedan como comentarios `# PENDIENTE` en `faq.yaml`: no se publican y `check:content` solo
  avisa. Ampliación de R7: un PENDIENTE comentado avisa y uno visible falla.
- **Una colección por sección:** cada YAML tiene una única entrada y las listas internas conservan el orden escrito.
  Así se evita depender del orden de `getCollection`.
- **Capturas:** `src` es el nombre de archivo en `src/assets/screens/` o `PENDIENTE`. `src/lib/screens.ts` las resuelve
  y el build falla con un mensaje claro si el nombre no existe. R9 (AVIF/WebP, lazy) está implementado en `Annotated`,
  pero no se puede verificar hasta que haya imágenes.
- **Ajustes visuales:** hero en dos columnas iguales (con 5/7 el h1 ocupaba 4 líneas) y, en las funciones pares, la
  captura conserva la columna ancha.
- **Dev server tras crear `content.config.ts`:** hay que reiniciar `npm run dev`. Si no, las colecciones no existen y la
  home da 500 ("Falta src/content/home/hero.yaml"). El build no se ve afectado.
- **Enlaces que aún no funcionan:** "Solicitar demo" (`/demo`, spec 004) y Privacidad/Términos (spec 005).
- **Lighthouse móvil** (build de producción con `astro preview`): 100/100/100/100, LCP 0.8 s, CLS 0, TBT 0 ms. Con
  capturas reales el LCP será la imagen del hero; hay que volver a medir.

## Cierre

- **Qué se hizo:**
  - T1: `src/content.config.ts` con 5 colecciones (hero, features, security, faq, cta) validadas con Zod (el título
    del hero no puede pasar de 10 palabras) y `npm run check:content` (`scripts/check-content.mjs`).
  - T2: hero con etiqueta, h1, texto, "Solicitar demo" + "Ver funciones ↓" y la captura (placeholder) con prioridad
    de carga.
  - T3: 4 funciones en filas numeradas que alternan texto y captura.
  - T4: Seguridad como lista de definiciones: cifrado, copias de seguridad y acceso por roles.
  - T5: 3 preguntas frecuentes con `<details>` nativo e indicador +/− en mono.
  - T6: cierre con CTA. Los anclajes `#funciones`, `#seguridad` y `#preguntas` de la cabecera ya funcionan.
  - T7: textos redactados y confirmados. **Abierta por las capturas.**
- **Verificación ejecutada:** check (0 errores), build, capturas a 1280×800 y 390×844 (todo visible sin scroll),
  ningún `<script>` en el HTML final, Lighthouse móvil 100 en las cuatro categorías. `check:content` falla por las
  5 capturas, como se espera.
- **Archivos:** `src/content.config.ts`, `src/content/home/{hero,features,security,faq,cta}.yaml`,
  `src/components/home/{Hero,Features,Security,Faq,FinalCta}.astro`, `src/lib/screens.ts`, `src/pages/index.astro`,
  `src/assets/screens/.gitkeep`, `scripts/check-content.mjs`, `package.json`, `specs/003-home/spec.md`,
  `specs/README.md`. Se elimina `src/content/.gitkeep`.
- **Cómo verlo en local:** `npm run dev` → http://localhost:4330. Los textos se editan en `src/content/home/*.yaml` y la
  página se recarga sola. `npm run check:content` lista lo pendiente.
- **Cambios de Victor:** —
- **Commit:** `feat(003): home`. Aprobado el 2026-11-20 con la spec abierta: faltan las capturas (T7 y `check:content`). Se cierra con un commit propio al recibirlas.
