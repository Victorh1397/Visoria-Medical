# Visoria Landing — instrucciones para Claude

Landing page de **Visoria Medical**, software de historias clínicas para consultorios y clínicas en Venezuela.
Público: profesionales de la salud (B2B). Conversión: solicitud de demo. Solo en español.
Astro 7 estático + un Worker de Cloudflare para el formulario, desplegado en Cloudflare Workers (plan gratuito).

## Repositorio

- GitHub: https://github.com/Victorh1397/Visoria-Medical (remote `origin`, rama `main`).
- Desde que se conecte Workers Builds (spec 007), **cada push a `main` despliega a producción**.

## Metodología: SDD ligero

Este repositorio sigue el flujo de [specs/README.md](specs/README.md):
`draft → approved → in-progress → review → done`. Reglas:

1. **Antes de tocar código**, lee [specs/000-constitution.md](specs/000-constitution.md) y la spec activa.
2. **Ningún cambio de comportamiento sin una spec `approved`.** Si se pide una feature nueva, primero se redacta
   `specs/NNN-nombre/spec.md` desde `specs/_templates/spec.md` y se pide aprobación.
3. Se implementa **tarea por tarea** y se marca `[x]` en la spec al terminar cada una, **sin hacer commits**.
   Al terminar la última tarea, la spec pasa a `review` y se hace el **punto de control** (ver abajo).
4. **Un commit por spec**, solo después del OK de Victor: `feat(NNN): <título>` (o `fix`, `docs`, `chore`), con
   el cuerpo listando T1…Tn y los cambios que haya hecho Victor. El push a `origin main` va en el mismo paso.
   Entonces la spec pasa a `done`.
5. Una spec solo puede cerrarse si su sección **Verificación** se ha cumplido de verdad.
6. Excepciones sin spec: erratas, ajustes de texto y sustitución de capturas. También se commitean solo con el OK
   de Victor.

## Punto de control (al terminar cada spec)

Me detengo y no sigo con la siguiente spec hasta tener respuesta.

1. Ejecuto `npm run check`, `npm run build` y la sección Verificación de la spec.
2. Dejo `npm run dev` corriendo en segundo plano y paso la URL local (http://localhost:4330) con lo que conviene
   mirar.
3. Escribo el resumen en la sección **Cierre** de la spec y lo repito en el chat:
   - **Qué se hizo**, tarea por tarea.
   - **Archivos** creados o modificados.
   - **Cómo verlo en local**: rutas y qué comprobar.
   - **Desviaciones y hallazgos** respecto a la spec.
   - **Commit propuesto**: mensaje completo (título + cuerpo).
4. Espero. Victor puede editar archivos en directo. Antes de commitear reviso `git status` y `git diff`, incluyo sus
   cambios y los describo en el cuerpo del commit. Si alguno contradice la spec o la constitution, se lo señalo y lo
   anoto en **Hallazgos**.
5. Con su OK: commit + `git push`, y la spec pasa a `done`.

## Reglas que no se negocian

- **Nunca inventar** funciones, cifras, testimonios, clientes ni certificaciones. Si falta un dato, se marca
  `PENDIENTE` y se pregunta.
- Las capturas solo con **datos de pacientes ficticios**.
- El morado del logo es un acento puntual (CTA, enlaces, foco, marcadores). Nunca fondos morados ni lavanda, nunca
  degradados.
- Sin gradientes, sombras difusas, emojis, iconos decorativos ni librerías de UI/CSS. Todo color nuevo es un token en
  `src/styles/tokens.css`.
- Los textos legales no afirman cumplir normas sin revisión de un abogado.

## Comandos

```bash
npm run dev            # http://localhost:4330, recarga en vivo (sin Worker)
npm run check          # tipos de Astro + Worker
npm run check:content  # PENDIENTE visibles → falla (bloquea producción)
npm test               # tests del Worker en workerd
npm run og             # regenera public/og.png si cambia el título del hero o la marca
npm run build          # dist/
npm run preview        # build + wrangler dev en http://localhost:8787 (sitio + Worker)
npm run preview:form   # igual, con el formulario activo (.env.formtest + claves de prueba de Turnstile)
```

Antes de cada commit: `npm run check`, `npm test` y `npm run build` sin errores.
Tras crear o renombrar colecciones en `src/content.config.ts`, reiniciar `npm run dev`.
