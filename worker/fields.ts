/**
 * Definición única de los campos del formulario de demo (spec 004 R1).
 * La usan el Worker (validación de servidor), la página /demo (atributos HTML) y el JS de
 * cliente (mensajes de error). Código puro, sin APIs de Workers ni del navegador.
 */

export const ROLES = {
  medico: 'Médico o médica',
  administracion: 'Administración',
  direccion: 'Dirección',
  otro: 'Otro',
} as const;

export const TEAM_SIZES = {
  '1': '1 profesional',
  '2-5': '2 a 5 profesionales',
  '6-20': '6 a 20 profesionales',
  '20+': 'Más de 20 profesionales',
} as const;

export type Role = keyof typeof ROLES;
export type TeamSize = keyof typeof TEAM_SIZES;

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { max: 30 },
  institution: { min: 2, max: 150 },
  message: { max: 1000 },
} as const;

/** Teléfono o WhatsApp: dígitos, espacios y + ( ) . - */
export const PHONE_PATTERN = '[+()0-9 .\\-]{7,30}';

/** Tiempo mínimo entre la carga de la página y el envío (spec 004 R5). */
export const MIN_ELAPSED_MS = 3000;

/** Nombres de los campos en el formulario y en el FormData. */
export const FIELD = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  institution: 'institution',
  role: 'role',
  team: 'team',
  message: 'message',
  privacy: 'privacy',
  honeypot: 'website',
  elapsed: 'elapsed',
  turnstile: 'cf-turnstile-response',
} as const;

export type UserField = 'name' | 'email' | 'phone' | 'institution' | 'role' | 'team' | 'message' | 'privacy';

export const MESSAGES = {
  required: 'Este campo es obligatorio.',
  tooShort: (min: number) => `Escriba al menos ${min} caracteres.`,
  tooLong: (max: number) => `Escriba como máximo ${max} caracteres.`,
  email: 'Escriba un email válido, por ejemplo nombre@consultorio.com.',
  phone: 'Use solo números, espacios y los signos + ( ) -.',
  choice: 'Elija una opción de la lista.',
  privacy: 'Debe aceptar la política de privacidad para continuar.',
  singleLine: 'Este campo no admite saltos de línea.',
} as const;
