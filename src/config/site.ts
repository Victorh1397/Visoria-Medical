/**
 * Datos globales del sitio: nombre, SEO por defecto, navegación y enlaces. Los textos de cada sección
 * viven en src/content/ (spec 003). Un campo vacío oculta su elemento.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const site = {
  name: 'Visoria Medical',
  description: 'Historias clínicas para consultorios y clínicas.',
  /** SEO de la home (spec 006 R1). El resto de páginas usa "<título> · Visoria Medical". */
  homeTitle: 'Visoria Medical · Historia clínica y agenda para consultorios y clínicas',
  homeDescription:
    'Software de historias clínicas para consultorios y clínicas: ficha del paciente, historia clínica, agenda de citas y reportes. Solicite una demo.',
  locale: 'es_VE',
  /** Imagen para compartir (spec 006 R2), generada con `npm run og`. */
  ogImage: { src: '/og.png', width: 1200, height: 630, alt: 'Visoria Medical: historia clínica, pacientes y agenda en un mismo sistema' },
  /** Logo estable para JSON-LD (no lleva hash). */
  logo: '/brand/visoria-medical.png',
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
