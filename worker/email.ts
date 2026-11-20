/**
 * Composición del email de solicitud de demo (spec 004 R6). Texto plano, todos los campos y
 * Reply-To con el email del solicitante. Se envía con el binding `send_email` sin construir
 * MIME a mano.
 */
import { ROLES, TEAM_SIZES } from './fields';
import type { DemoRequest } from './validate';

export interface DemoEmail {
  from: { name: string; email: string };
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

export function buildDemoEmail(data: DemoRequest, opts: { from: string; to: string; now: Date }): DemoEmail {
  const team = TEAM_SIZES[data.team];
  const lines = [
    'Nueva solicitud de demo desde la landing de Visoria Medical.',
    '',
    `Nombre: ${data.name}`,
    `Email: ${data.email}`,
    `Teléfono / WhatsApp: ${data.phone || '—'}`,
    `Consultorio o clínica: ${data.institution}`,
    `Rol: ${ROLES[data.role]}`,
    `Profesionales: ${team}`,
    '',
    'Mensaje:',
    data.message || '—',
    '',
    'Aceptó la política de privacidad: sí',
    `Recibido: ${opts.now.toISOString()}`,
    '',
    'Responda a este email para escribir directamente al solicitante.',
  ];

  return {
    from: { name: 'Visoria Medical · Landing', email: opts.from },
    to: opts.to,
    replyTo: data.email,
    subject: `Demo: ${data.institution} (${team})`,
    text: lines.join('\n'),
  };
}
