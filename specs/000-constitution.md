# 000 — Constitution

Principios no negociables de la landing de Visoria Medical. Cuando dos decisiones chocan, se resuelve con este
documento. Cambiarlo requiere una spec propia.

## P1. Una sola tarea: que una clínica pida una demo

La landing existe para que un médico o el administrador de un consultorio o una clínica entienda, en menos de un
minuto, **qué hace Visoria con sus historias clínicas, por qué es seguro y cómo pedir una demo**. Cada elemento
tiene que ayudar a eso o desaparece.

- El CTA "Solicitar demo" está siempre a un clic: en la cabecera, al final del hero y al cierre de la página.
- Las afirmaciones son verificables y describen funciones reales de la app. Si una función no existe hoy, no se
  menciona (ni con "próximamente").
- **Prohibido inventar** testimonios, logos de clientes, cifras de usuarios, certificaciones o sellos de cumplimiento.
- Tono: directo, en segunda persona de cortesía ("usted") o impersonal, con vocabulario clínico correcto.
  Prohibido: "revoluciona la salud", "el futuro de la medicina", "potenciado por IA", "solución integral
  innovadora", "lleva tu práctica al siguiente nivel" y similares.

## P2. Estilo clínico preciso

La página se siente como un instrumento médico bien hecho: sobria, exacta y legible.

- **Tipografía:** IBM Plex Sans para títulos y texto, IBM Plex Mono para datos, etiquetas y numeración.
  Autoalojadas con Fontsource.
- **Color:** blanco y grises fríos con un matiz violeta casi imperceptible, tinta casi negra y **un único acento**
  derivado del morado del logo, en versión profunda y poco saturada.
  - El acento se usa solo en: botón primario, enlaces, foco, marcadores numerados de las capturas y el logo.
    Ocupa menos del 5 % de la superficie visible de cualquier pantalla.
  - No hay fondos morados ni lavanda en secciones completas, ni morados "por defecto" tipo `#8B5CF6`/`#A855F7`.
  - Todos los colores son tokens en `src/styles/tokens.css`. Ningún componente escribe un color literal.
- **Estructura:** retícula estricta, filas separadas por líneas finas de 1 px y listas numeradas (`01`, `02`…).
  No hay grids de tarjetas con icono, título y párrafo.
- **Imágenes como evidencia:** solo capturas reales de Visoria, anotadas con marcadores numerados en HTML/CSS.
  **Todas las capturas usan datos de pacientes ficticios.** Fuera: fotos de stock (médicos sonriendo, estetoscopios),
  ilustraciones 3D, mockups de dispositivos flotando y rejillas de logos.
- **Prohibido:** gradientes decorativos, glassmorphism, blobs, glow, sombras difusas grandes, emojis, iconos
  genéricos (corazones, cruces, ADN, chispas de IA), contadores animados, animaciones al hacer scroll, texto con
  efecto máquina de escribir y carruseles automáticos.
- **Movimiento:** solo transiciones de hover y focus (≤ 150 ms), desactivadas con `prefers-reduced-motion: reduce`.

## P3. Rendimiento

- Sitio estático (Astro, `output: 'static'`). El único código de servidor es el Worker que recibe el formulario.
- JavaScript propio: solo la mejora progresiva del formulario, en vanilla. Presupuesto **< 10 KB** de JS propio.
  El script de Turnstile se carga solo en la página del formulario.
- **Lighthouse ≥ 95** en las cuatro categorías (móvil) y LCP < 2 s en 4G simulado.
- Sin frameworks de UI, sin librerías CSS y sin scripts de terceros, salvo Cloudflare Turnstile y Cloudflare Web
  Analytics.

## P4. Accesibilidad

- Contraste WCAG 2.2 AA (texto normal ≥ 4.5:1), también para el acento sobre blanco y para el texto sobre el acento.
- Navegación completa por teclado, foco visible y un enlace para saltar al contenido.
- HTML semántico: un `h1` por página, landmarks y `lang="es"`.
- Cada captura tiene `alt` y sus anotaciones están también como lista de texto, no solo dibujadas.
- La página se lee completa sin JavaScript. Si no hay JS, el formulario ofrece un email de contacto alternativo.

## P5. Privacidad primero

Vendemos software que custodia datos de salud: la landing tiene que ser coherente con eso.

- Sin cookies de seguimiento ni píxeles publicitarios. La analítica es Cloudflare Web Analytics, que no usa cookies.
- El formulario pide solo los datos necesarios para contactar y avisa de forma explícita: **"No incluya datos de
  pacientes."**
- Las solicitudes de demo no se almacenan en una base de datos en la v1: se envían por email y nada más.
- Las páginas legales se redactan con el marco venezolano como referencia y llevan la marca
  **"pendiente de revisión legal"** hasta que un abogado las apruebe. No afirmamos cumplir una norma que nadie ha
  verificado.

## P6. Build robusto

- `npm run check` y `npm run build` sin errores son condición para hacer commit.
- Si falta un insumo (logo, captura, texto), el build no falla: se usa un placeholder visible marcado `PENDIENTE`,
  y el despliegue a producción queda bloqueado mientras exista alguno (comprobación en `npm run check:content`).

## P7. Simplicidad

- Una página principal, una página de solicitud de demo y las páginas legales. Nada más en la v1.
- Los textos viven en archivos de contenido (`src/content/`), no repartidos por los componentes.
- Se prefiere borrar código a añadir configuración.
