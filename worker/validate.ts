/**
 * Validación de servidor del formulario de demo (spec 004 R3). Es la que manda: la del
 * navegador solo mejora la experiencia.
 */
import {
  FIELD,
  LIMITS,
  MESSAGES,
  PHONE_PATTERN,
  ROLES,
  TEAM_SIZES,
  type Role,
  type TeamSize,
  type UserField,
} from './fields';

export interface DemoRequest {
  name: string;
  email: string;
  phone: string;
  institution: string;
  role: Role;
  team: TeamSize;
  message: string;
}

export type ValidationResult =
  | { ok: true; data: DemoRequest }
  | { ok: false; errors: Partial<Record<UserField, string>> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = new RegExp(`^${PHONE_PATTERN}$`);
const LINE_BREAK_RE = /[\r\n]/;

const text = (fd: FormData, key: string): string => {
  const value = fd.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

const isKey = <T extends object>(obj: T, key: string): key is Extract<keyof T, string> =>
  Object.prototype.hasOwnProperty.call(obj, key);

export function validateDemo(fd: FormData): ValidationResult {
  const errors: Partial<Record<UserField, string>> = {};

  const name = text(fd, FIELD.name);
  const email = text(fd, FIELD.email);
  const phone = text(fd, FIELD.phone);
  const institution = text(fd, FIELD.institution);
  const role = text(fd, FIELD.role);
  const team = text(fd, FIELD.team);
  const message = text(fd, FIELD.message);
  const privacy = text(fd, FIELD.privacy);

  // Campos que acaban en cabeceras del email: sin saltos de línea (evita inyección de cabeceras).
  const singleLine = (field: UserField, value: string): boolean => {
    if (LINE_BREAK_RE.test(value)) {
      errors[field] = MESSAGES.singleLine;
      return false;
    }
    return true;
  };

  if (!name) errors.name = MESSAGES.required;
  else if (singleLine('name', name)) {
    if (name.length < LIMITS.name.min) errors.name = MESSAGES.tooShort(LIMITS.name.min);
    else if (name.length > LIMITS.name.max) errors.name = MESSAGES.tooLong(LIMITS.name.max);
  }

  if (!email) errors.email = MESSAGES.required;
  else if (singleLine('email', email)) {
    if (email.length > LIMITS.email.max || !EMAIL_RE.test(email)) errors.email = MESSAGES.email;
  }

  if (phone && singleLine('phone', phone)) {
    if (!PHONE_RE.test(phone)) errors.phone = MESSAGES.phone;
  }

  if (!institution) errors.institution = MESSAGES.required;
  else if (singleLine('institution', institution)) {
    if (institution.length < LIMITS.institution.min) errors.institution = MESSAGES.tooShort(LIMITS.institution.min);
    else if (institution.length > LIMITS.institution.max) errors.institution = MESSAGES.tooLong(LIMITS.institution.max);
  }

  if (!role) errors.role = MESSAGES.required;
  else if (!isKey(ROLES, role)) errors.role = MESSAGES.choice;

  if (!team) errors.team = MESSAGES.required;
  else if (!isKey(TEAM_SIZES, team)) errors.team = MESSAGES.choice;

  if (message.length > LIMITS.message.max) errors.message = MESSAGES.tooLong(LIMITS.message.max);

  if (!['on', 'true', '1'].includes(privacy)) errors.privacy = MESSAGES.privacy;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      institution,
      role: role as Role,
      team: team as TeamSize,
      message,
    },
  };
}

/** Señales de bot (spec 004 R5): honeypot relleno o envío demasiado rápido. */
export function looksAutomated(fd: FormData, minElapsedMs: number): boolean {
  if (text(fd, FIELD.honeypot) !== '') return true;
  const elapsed = Number(text(fd, FIELD.elapsed));
  return !Number.isFinite(elapsed) || elapsed < minElapsedMs;
}
