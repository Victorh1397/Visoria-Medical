/**
 * Datos globales del sitio: nombre, navegación y enlaces. Los textos de cada sección viven en
 * src/content/ (spec 003). Un campo vacío oculta su elemento.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const site = {
  name: 'Visoria Medical',
  description: 'Historias clínicas para consultorios y clínicas.',
  /** Email público de contacto. PENDIENTE: lo entrega Victor. Vacío = no se muestra. */
  contactEmail: '',
  nav: [
    { label: 'Funciones', href: '/#funciones' },
    { label: 'Seguridad', href: '/#seguridad' },
    { label: 'Preguntas', href: '/#preguntas' },
  ] satisfies NavLink[],
  cta: { label: 'Solicitar demo', href: '/demo' } satisfies NavLink,
  legal: [
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Términos', href: '/terminos' },
  ] satisfies NavLink[],
} as const;
