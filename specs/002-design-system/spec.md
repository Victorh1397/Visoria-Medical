# 002 — Design system

- **Estado:** done
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

**Paleta final** (implementada en `src/styles/tokens.css`):

| Token | Uso | Valor | OKLCH (L, C) |
|---|---|---|---|
| `--c-bg` | fondo | `#fcfbfd` | 98.9 %, 0.003 |
| `--c-surface` | bandas alternas, fondo de capturas | `#f5f3f7` | 96.7 %, 0.006 |
| `--c-line` | separadores de 1 px | `#e4e1e8` | 91.4 %, 0.010 |
| `--c-line-strong` | borde del botón secundario | `#c8c5cc` | 82.8 %, 0.010 |
| `--c-text-muted` | texto secundario, metadatos | `#5c5a61` | 47 %, 0.011 |
| `--c-text` | texto principal | `#1c1a1f` | 22 %, 0.010 |
| `--c-accent` | botón primario, enlaces, foco, marcadores | `#4a0361` (texto "visoria" del logo) | 30.8 %, 0.148 |
| `--c-accent-hover` | hover del acento | `#5f1678` | — |
| `--c-accent-weak` | fondo de los números de anotación (solo ahí) | `#f3eef6` | — |
| `--c-on-accent` | texto sobre el acento | `#ffffff` | — |
| `--c-error` | errores de formulario | `#a32a2a` | — |
| `--c-placeholder` | bloques PENDIENTE | `#ece9ef` | — |

**Contrastes medidos (WCAG 2.x):**

| Par | Ratio | AA texto normal |
|---|---|---|
| texto / fondo | 16.7:1 | sí |
| texto / superficie | 15.7:1 | sí |
| muted / fondo | 6.6:1 | sí |
| muted / superficie | 6.2:1 | sí |
| acento / fondo | 13.8:1 | sí |
| acento / superficie | 12.9:1 | sí |
| blanco / acento (botón) | 14.2:1 | sí |
| blanco / acento hover | 11.2:1 | sí |
| acento / acento-weak (números) | 12.4:1 | sí |
| error / fondo | 7.0:1 | sí |
| acento / texto | 1.2:1 | no se distinguen: **los enlaces van siempre subrayados** |

Reglas de uso del morado:

1. El morado aparece en puntos, no en áreas: un botón, un enlace, un número. Nunca como fondo de sección.
2. Nada de degradados, tampoco morado→morado.
3. Los colores de estado (error en el formulario) son tokens propios y neutros: rojo apagado para errores; el éxito
   se comunica con texto, no con verde.

**Tipografía:** escala modular 1.2 con `clamp()`. `h1` en Plex Sans 600 con `letter-spacing: -0.02em`. Etiquetas y
numeración en Plex Mono 500, en mayúsculas pequeñas con `letter-spacing: 0.06em`. Ancho de línea máximo de 68 ch.

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
- `src/components/*.astro`: `Logo`, `Header`, `Footer`, `Button`, `Section`, `NumberedList`, `Annotated`.
- `src/layouts/Base.astro`: estructura HTML, fuentes, precarga, favicons, skip link.
- `src/config/site.ts`: nombre, navegación, CTA y enlaces legales.
- `src/pages/[estilos].astro`: página de referencia `/_estilos`, solo en desarrollo.
- `src/assets/brand/`: logo e isotipo en PNG transparente (los procesa `astro:assets`).
- `public/`: `favicon.ico`, `favicon-32.png`, `icon-192.png`, `apple-touch-icon.png`.

## Tareas

- [x] T1 Recibir el logo, extraer su hex y calcular `--c-accent` con contrastes verificados (R2, R3)
- [x] T2 `tokens.css` y `base.css`: color, tipografía, espaciado, foco, reduced motion (R1, R3, R6, R7)
- [x] T3 Fuentes autoalojadas con Fontsource y precarga (R4)
- [x] T4 Layout `Base`, `Header` (logo + CTA) y `Footer` (R5, R8)
- [x] T5 `Button`, `Section`, `NumberedList` (R5)
- [x] T6 `Annotated` con lista accesible (R5, R8)
- [x] T7 Página `/_estilos` y revisión visual con Victor (R9). La revisión es este punto de control.
- [x] T8 Favicon y variantes del logo (R5). En `src/assets/brand/` y `public/`; ver Hallazgos.

## Verificación

- [x] Contrastes de cada par de tokens medidos y anotados en esta spec (tabla de Diseño).
- [x] `grep` sin colores literales (`#`, `rgb(`, `oklch(`) fuera de `tokens.css`.
- [x] `/_estilos` revisada a 360, 768 y 1280 px sin scroll horizontal (capturas con Chrome headless; 360 px
      medido dentro de un iframe porque Chrome no permite ventanas tan estrechas).
- [ ] Navegación por teclado: el foco se ve en todos los elementos interactivos. **Pendiente de Victor** en
      `/_estilos` (la regla `:focus-visible` está en `base.css`, pero no la he probado con teclado real).
- [x] Revisión anti-slop: ningún fondo morado de sección, ningún degradado (salvo el del propio logo), ninguna sombra
      difusa (el único `box-shadow` es un anillo sólido de 2 px alrededor de los marcadores).

## Hallazgos

- **Color del logo:** no hay hex documentado. El manual (`manual-visoria.pdf`) es de la marca madre Visoria
  Consulting (verde y amarillo, tipografía Sansation) y no incluye la variante Medical. Se muestreó `medical.png`:
  texto "visoria" `#4A0361` (el acento elegido por Victor) e isotipo en degradado de `#B58DE5` a `#640579`.
- **Acento más oscuro de lo previsto:** la spec proponía L≈42 %; el color real del logo tiene L≈31 %. Se usa el del
  logo, y por eso los enlaces van siempre subrayados (contraste de solo 1.2:1 con el texto).
- **Neutros:** el primer intento superaba el croma de 0.012 en el texto; se ajustaron hasta quedar en ≤ 0.011.
- **Tracking de etiquetas:** 0.06em en lugar de 0.04em; en Plex Mono a 14 px se leía apretado.
- **Logo en PNG, no SVG:** decisión de Victor. Se generó un PNG transparente ("color a alfa" contra blanco) y
  recortado de 1200 px de ancho, y desde él el isotipo y los favicons. El script quedó fuera del repo, porque se
  sustituirá cuando llegue el SVG; el único punto de cambio es `src/components/Logo.astro`. En `dist/` el logo sale
  como WebP 1x/2x. Están en `src/assets/brand/` y no en `public/brand/` para que los optimice `astro:assets`.
- **`/_estilos` como ruta dinámica:** Astro ignora los archivos que empiezan por `_` en `src/pages/`, así que es
  `[estilos].astro` con `getStaticPaths` que solo devuelve la ruta en desarrollo. Comprobado: no está en `dist/`.
- **Puerto de desarrollo 4330:** el portfolio ya ocupa el 4321 (y había otra instancia en el 4322); el servidor de
  Visoria acababa en el 4323 sin avisar. **En el cierre de la 001 di la URL `localhost:4321`, que en realidad
  mostraba el portfolio.** Corregido con `server.port: 4330` en `astro.config.mjs`, y actualizados README y CLAUDE.md.
- **Enlaces que aún no funcionan:** Funciones, Seguridad y Preguntas (llegan con la 003), "Solicitar demo" (004) y
  Privacidad/Términos (005) llevan hoy a la 404 o a la portada. Se resuelven en sus specs.

## Cierre

- **Qué se hizo:**
  - T1: color del logo extraído (`#4A0361`) y paleta completa con contrastes medidos.
  - T2: `tokens.css` (color, tipografía, espaciado, retícula, foco, movimiento) y `base.css` (reset, títulos,
    enlaces subrayados, `:focus-visible`, skip link, `prefers-reduced-motion`).
  - T3: IBM Plex Sans 400/500/600 y Plex Mono 400/500, subset latino, con precarga de Plex Sans 600.
  - T4: `Base` (layout con favicons y skip link), `Header` (logo, navegación y CTA; en móvil solo logo y CTA, sin
    JS) y `Footer`.
  - T5: `Button` (primario/secundario, md/sm), `Section` (etiqueta numerada + h2) y `NumberedList`.
  - T6: `Annotated` (marcadores en % sobre la captura, lista accesible debajo, bloque PENDIENTE sin imagen).
  - T7: página `/_estilos`, solo en desarrollo.
  - T8: logo transparente, isotipo, `favicon.ico`, `favicon-32.png`, `icon-192.png` y `apple-touch-icon.png`.
  - Portada y 404 pasan a usar el layout.
- **Verificación ejecutada:** check (0 errores), build (2 páginas, `/_estilos` fuera), `grep` de colores y
  anti-slop limpios, capturas a 360/768/1280 sin scroll horizontal. Pendiente: foco con teclado (Victor).
- **Archivos:** `astro.config.mjs`, `package.json`, `package-lock.json`, `README.md`, `CLAUDE.md`,
  `src/styles/{tokens,base}.css`, `src/config/site.ts`, `src/layouts/Base.astro`, `src/components/*.astro` (7),
  `src/pages/{index,404,[estilos]}.astro`, `src/assets/brand/*.png`, `public/*` (4 iconos),
  `specs/002-design-system/spec.md`, `specs/README.md`. Se eliminan los `.gitkeep` de `src/{components,layouts,styles}`.
- **Cómo verlo en local:** `npm run dev` → http://localhost:4330 (portada con cabecera, CTA y pie) y
  http://localhost:4330/_estilos (paleta, tipografía, botones, lista y captura anotada). Pulse Tab para revisar el
  foco. Probar también el ancho de móvil con las DevTools (Ctrl+Shift+M).
- **Cambios de Victor:** —
- **Commit:** `feat(002): design system`. Aprobado el 2026-11-19. La prueba de foco con teclado quedó sin confirmar explícitamente; se repite en la verificación de la 003.
