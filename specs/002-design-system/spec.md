# 002 — Design system

- **Estado:** approved (bloqueado: falta el logo en SVG y su color exacto)
- **Fecha:** 2026-11-19
- **Depende de:** 001

## Contexto

La dirección elegida es **clínico preciso**: blanco, grises fríos, tipografía técnica y un único acento. El logo de
Visoria es morado, y el riesgo es caer en la estética genérica de "SaaS morado" (fondos lavanda, degradados
violeta→azul, morado saturado por todas partes). Esta spec define los tokens y componentes base para que el morado
se lea como **marca** y no como decoración.

## Requisitos

- **R1.** EL SISTEMA DEBE definir todos los colores, tipografías, tamaños y espaciados como custom properties en
  `src/styles/tokens.css`. Ningún componente usa valores literales de color.
- **R2.** EL SISTEMA DEBE derivar el acento del color del logo y ajustarlo a una versión profunda y poco saturada que
  cumpla contraste ≥ 4.5:1 sobre el fondo, como texto y como fondo de botón con texto blanco.
- **R3.** EL SISTEMA DEBE usar neutros con un matiz violeta casi imperceptible (croma OKLCH ≤ 0.012), para que
  convivan con el logo sin teñir la página.
- **R4.** EL SISTEMA DEBE autoalojar IBM Plex Sans (400, 500, 600) e IBM Plex Mono (400, 500), con subset latino,
  `font-display: swap` y precarga de la fuente del `h1`.
- **R5.** EL SISTEMA DEBE ofrecer los componentes base `Header`, `Footer`, `Button` (primario y secundario),
  `Section`, `NumberedList` y `Annotated` (captura con marcadores).
- **R6.** CUANDO un elemento interactivo recibe foco por teclado, EL SISTEMA DEBE mostrar un anillo de foco de 2 px en
  el color de acento con separación de 2 px.
- **R7.** MIENTRAS `prefers-reduced-motion: reduce` está activo, EL SISTEMA DEBE desactivar todas las transiciones.
- **R8.** EL SISTEMA DEBE verse correcto desde 360 px de ancho sin scroll horizontal.
- **R9.** EL SISTEMA DEBE incluir una página interna `/_estilos` (excluida del build de producción) que muestre los
  tokens y los componentes, para revisarlos visualmente.

### Fuera de alcance

- Tema oscuro. Una landing B2B clínica en tema claro es suficiente para la v1; los tokens quedan preparados para
  añadirlo después con una spec propia.
- Rediseño del logo.

## Diseño

**Paleta propuesta** (los valores finales se calculan con el hex del logo; aquí van como referencia en OKLCH):

| Token | Uso | Valor de partida |
|---|---|---|
| `--c-bg` | fondo | `oklch(99.2% 0.002 300)` |
| `--c-surface` | bandas alternas, fondo de capturas | `oklch(97.2% 0.004 300)` |
| `--c-line` | separadores de 1 px | `oklch(90% 0.006 300)` |
| `--c-text-muted` | texto secundario, metadatos | `oklch(48% 0.012 300)` |
| `--c-text` | texto principal | `oklch(20% 0.012 300)` |
| `--c-accent` | botón primario, enlaces, foco, marcadores | logo → L≈42 %, C≈0.13 |
| `--c-accent-ink` | hover del acento | `--c-accent` con L −6 % |
| `--c-accent-weak` | fondo del marcador de anotación (solo ahí) | `--c-accent` con L≈95 %, C≈0.03 |

Reglas de uso del morado:

1. El morado aparece en puntos, no en áreas: un botón, un enlace, un número. Nunca como fondo de sección.
2. Nada de degradados, tampoco morado→morado.
3. Los colores de estado (error en el formulario) son tokens propios y neutros: rojo apagado para errores; el éxito
   se comunica con texto, no con verde.

**Tipografía:** escala modular 1.2 con `clamp()`. `h1` en Plex Sans 600 con `letter-spacing: -0.02em`. Etiquetas y
numeración en Plex Mono 500, en mayúsculas pequeñas con `letter-spacing: 0.04em`. Ancho de línea máximo de 68 ch.

**Retícula:** contenedor de 1120 px, 12 columnas, gutter de 24 px, márgenes laterales de 20 px en móvil. Las secciones
se separan con una línea de 1 px y 96 px de aire (56 px en móvil). Radio de borde de 4 px en botones y capturas, sin
sombras (como mucho una línea de 1 px).

**`Annotated`:** recibe la imagen y una lista `{n, x%, y%, label, text}`. Pinta círculos numerados en Plex Mono sobre
la captura y la misma lista como `<ol>` debajo. En móvil solo se muestran los números sobre la imagen y la lista
debajo.

Descartado: Tailwind u otra librería CSS (choca con P3 y P7). CSS plano con custom properties y estilos con scope de
Astro.

**Archivos afectados:**

- `src/styles/tokens.css`, `src/styles/base.css`: tokens, reset y tipografía.
- `src/components/*.astro`: componentes base.
- `src/layouts/Base.astro`: estructura HTML, fuentes, skip link.
- `src/pages/_estilos.astro`: página de referencia.
- `public/brand/`: logo SVG, versión monocromo y favicon.

## Tareas

- [ ] T1 Recibir el logo, extraer su hex y calcular `--c-accent` con contrastes verificados (R2, R3)
- [ ] T2 `tokens.css` y `base.css`: color, tipografía, espaciado, foco, reduced motion (R1, R3, R6, R7)
- [ ] T3 Fuentes autoalojadas con Fontsource y precarga (R4)
- [ ] T4 Layout `Base`, `Header` (logo + CTA) y `Footer` (R5, R8)
- [ ] T5 `Button`, `Section`, `NumberedList` (R5)
- [ ] T6 `Annotated` con lista accesible (R5, R8)
- [ ] T7 Página `/_estilos` y revisión visual con Victor (R9)
- [ ] T8 Favicon y variantes del logo en `public/brand/` (R5)

## Verificación

- [ ] Contrastes de cada par de tokens medidos y anotados en esta spec (acento/fondo, blanco/acento,
      muted/fondo, muted/surface).
- [ ] `grep` sin colores literales (`#`, `rgb(`, `oklch(`) fuera de `tokens.css`.
- [ ] `/_estilos` revisada a 360, 768 y 1280 px sin scroll horizontal.
- [ ] Navegación por teclado: el foco se ve en todos los elementos interactivos.
- [ ] Revisión anti-slop: ningún fondo morado de sección, ningún degradado, ninguna sombra difusa.

## Hallazgos


## Cierre
