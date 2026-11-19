# Specs: cómo trabajamos

Desarrollo guiado por especificaciones, en versión ligera: Markdown en el repo, sin herramientas externas.
Es la misma metodología del portfolio, adaptada a la landing de Visoria Medical.

## Flujo

```
draft ──► approved ──► in-progress ──► review ──► done
  │           │              │             │         │
  │           │              │             │         └─ commit único + push tras el OK de Victor
  │           │              │             └─ punto de control: revisión en local, Victor puede editar
  │           │              └─ tareas marcadas [x] una a una, sin commits
  │           └─ requisitos y tareas aceptados por Victor
  └─ propuesta escrita desde _templates/spec.md
```

1. **Propuesta.** Copiar `_templates/spec.md` a `NNN-nombre/spec.md` (número siguiente, nombre en kebab-case).
   Estado `draft`.
2. **Requisitos.** Cada requisito tiene un ID (`R1`, `R2`…) y se escribe en formato EARS:
   - Ubicuo: `EL SISTEMA DEBE <respuesta>.`
   - Por evento: `CUANDO <evento>, EL SISTEMA DEBE <respuesta>.`
   - Por estado: `MIENTRAS <estado>, EL SISTEMA DEBE <respuesta>.`
   - No deseado: `SI <condición>, ENTONCES EL SISTEMA DEBE <respuesta>.`
3. **Diseño.** Decisiones técnicas, alternativas descartadas en una línea y archivos afectados.
4. **Tareas.** Checklist `- [ ] T1 descripción (R1, R2)`. Cada requisito tiene que estar cubierto por al menos una
   tarea. Cuando Victor lo aprueba, el estado pasa a `approved`.
5. **Implementación.** Estado `in-progress`. Una tarea a la vez; al terminarla se marca `[x]`, **sin commit**.
   Si aparece algo no previsto, se anota en **Hallazgos** y, si cambia el alcance, se actualizan los requisitos antes
   de seguir.
6. **Verificación.** Se ejecuta lo que dice la sección, además de `npm run check` y `npm run build`.
7. **Punto de control.** Estado `review`. Claude se detiene, deja el servidor local corriendo y rellena la sección
   **Cierre**: qué se hizo, archivos, cómo verlo en local, desviaciones y el commit propuesto. Victor revisa y puede
   editar en directo; sus cambios entran en el mismo commit.
8. **Cierre.** Con el OK de Victor: un único commit `feat(NNN): <título>` (cuerpo con T1…Tn y los cambios de Victor)
   y push a `origin main`. Estado `done`.

Repositorio: https://github.com/Victorh1397/Visoria-Medical. Desde la spec 007, cada push a `main` despliega a
producción.

## Índice

| Spec | Estado | Bloqueos |
|---|---|---|
| [000 Constitution](000-constitution.md) | vigente | — |
| [001 Foundation](001-foundation/spec.md) | approved | — |
| [002 Design system](002-design-system/spec.md) | approved | logo SVG |
| [003 Home](003-home/spec.md) | approved | funciones, capturas, datos de seguridad |
| [004 Formulario de demo](004-demo-form/spec.md) | approved | — (se activa con 007) |
| [005 Páginas legales](005-legal/spec.md) | approved | revisión de un abogado antes de publicar |
| [006 SEO y analítica](006-seo-analytics/spec.md) | approved | — |
| [007 Despliegue](007-deploy/spec.md) | approved | migración de los nameservers del dominio |

**Orden de implementación:** 001 → 002 → 003 y 004 en paralelo → 005 → 006 → 007. Se puede desplegar a
`*.workers.dev` en cuanto termine 001.

## Insumos pendientes de Victor

- [ ] Logo en SVG (y PNG de respaldo), con el hex exacto del morado si se conoce.
- [ ] Nombre del dominio.
- [ ] Email público de contacto y dirección donde recibir las solicitudes de demo (`DEMO_INBOX`).
- [ ] Lista de funciones reales (máximo 5 para la v1) con una frase sobre el problema que resuelve cada una.
- [ ] Capturas de la app a resolución completa, **con pacientes ficticios**.
- [ ] Datos de seguridad: alojamiento de los datos, cifrado, roles, auditoría, backups y exportación.
- [ ] Respuestas a las preguntas frecuentes (borrador en la spec 003).
- [ ] Razón social y RIF del responsable, para las páginas legales.

## Cuándo NO hace falta spec

Erratas, ajustes de texto o sustitución de capturas existentes. Cualquier sección nueva, cambio de diseño o de
comportamiento sí requiere spec.
