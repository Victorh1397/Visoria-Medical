/**
 * Tests del formulario de demo (spec 004 T7): validación, señales de bot, Turnstile, envío y
 * fallos. Corren dentro de workerd.
 */
import { SELF } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleDemo, type DemoDeps, type DemoEnv } from './demo';
import type { DemoEmail } from './email';

const ENV: DemoEnv = {
  FORM_ENABLED: 'true',
  DEMO_INBOX: 'inbox@example.com',
  DEMO_FROM: 'demo@example.com',
  TURNSTILE_SECRET: 'secret',
  DEMO_EMAIL: { send: async () => ({ messageId: 'x' }) } as unknown as SendEmail,
};

const VALID: Record<string, string> = {
  name: 'Ana Pérez',
  email: 'ana@consultorio.com',
  phone: '+58 412 555 0101',
  institution: 'Consultorio Ávila',
  role: 'medico',
  team: '2-5',
  message: 'Quisiera ver la agenda de citas.',
  privacy: 'on',
  website: '',
  elapsed: '5000',
  'cf-turnstile-response': 'token-de-prueba',
};

function makeRequest(fields: Record<string, string> = VALID, accept = 'application/json'): Request {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return new Request('https://visoria.test/api/demo', { method: 'POST', body: fd, headers: { accept } });
}

function makeDeps(overrides: Partial<DemoDeps> = {}) {
  const sent: DemoEmail[] = [];
  const deps: DemoDeps = {
    verify: vi.fn(async () => true),
    send: vi.fn(async (email: DemoEmail) => {
      sent.push(email);
    }),
    now: () => new Date('2026-11-20T12:00:00Z'),
    ...overrides,
  };
  return { deps, sent };
}

afterEach(() => vi.restoreAllMocks());

describe('POST /api/demo', () => {
  it('envía el email con todos los campos, asunto y Reply-To (R6)', async () => {
    const { deps, sent } = makeDeps();
    const res = await handleDemo(makeRequest(), ENV, deps);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    const [email] = sent;
    expect(email.to).toBe('inbox@example.com');
    expect(email.from.email).toBe('demo@example.com');
    expect(email.replyTo).toBe('ana@consultorio.com');
    expect(email.subject).toBe('Demo: Consultorio Ávila (2 a 5 profesionales)');
    for (const piece of ['Ana Pérez', 'ana@consultorio.com', '+58 412 555 0101', 'Consultorio Ávila', 'Médico o médica', 'Quisiera ver la agenda']) {
      expect(email.text).toContain(piece);
    }
  });

  it('devuelve 422 con errores por campo y no envía nada (R3)', async () => {
    const { deps, sent } = makeDeps();
    const res = await handleDemo(
      makeRequest({ ...VALID, name: 'A', email: 'no-es-email', role: 'piloto', privacy: '' }),
      ENV,
      deps,
    );
    const body = (await res.json()) as { error: string; fields: Record<string, string> };

    expect(res.status).toBe(422);
    expect(body.error).toBe('invalid');
    expect(Object.keys(body.fields).sort()).toEqual(['email', 'name', 'privacy', 'role']);
    expect(sent).toHaveLength(0);
  });

  it('rechaza saltos de línea en campos que van a cabeceras', async () => {
    const { deps, sent } = makeDeps();
    const res = await handleDemo(makeRequest({ ...VALID, institution: 'Clínica\r\nBcc: spam@example.com' }), ENV, deps);
    const body = (await res.json()) as { fields: Record<string, string> };

    expect(res.status).toBe(422);
    expect(body.fields.institution).toBeDefined();
    expect(sent).toHaveLength(0);
  });

  it('rechaza el honeypot relleno sin consultar Turnstile ni enviar (R5)', async () => {
    const { deps, sent } = makeDeps();
    const res = await handleDemo(makeRequest({ ...VALID, website: 'https://spam.example' }), ENV, deps);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'rejected' });
    expect(deps.verify).not.toHaveBeenCalled();
    expect(sent).toHaveLength(0);
  });

  it('rechaza envíos en menos de 3 s o sin tiempo medido (R5)', async () => {
    for (const elapsed of ['1200', '', 'abc']) {
      const { deps, sent } = makeDeps();
      const res = await handleDemo(makeRequest({ ...VALID, elapsed }), ENV, deps);
      expect(res.status).toBe(400);
      expect(sent).toHaveLength(0);
    }
  });

  it('rechaza un token de Turnstile inválido (R4, R5)', async () => {
    const { deps, sent } = makeDeps({ verify: vi.fn(async () => false) });
    const res = await handleDemo(makeRequest(), ENV, deps);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'rejected' });
    expect(sent).toHaveLength(0);
  });

  it('responde 502 si el envío del email falla (R8)', async () => {
    const { deps } = makeDeps({
      send: vi.fn(async () => {
        throw new Error('smtp down');
      }),
    });
    const res = await handleDemo(makeRequest(), ENV, deps);

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'send_failed' });
  });

  it('responde 503 mientras FORM_ENABLED no sea "true" o falte la configuración (R10)', async () => {
    for (const env of [
      { ...ENV, FORM_ENABLED: 'false' },
      { ...ENV, DEMO_INBOX: '' },
      { ...ENV, DEMO_FROM: '' },
      { ...ENV, DEMO_EMAIL: undefined },
    ]) {
      const { deps, sent } = makeDeps();
      const res = await handleDemo(makeRequest(), env, deps);
      expect(res.status).toBe(503);
      expect(sent).toHaveLength(0);
    }
  });

  it('sin Accept JSON redirige con 303 a /demo/gracias o /demo/error (R7)', async () => {
    const ok = await handleDemo(makeRequest(VALID, 'text/html'), ENV, makeDeps().deps);
    expect(ok.status).toBe(303);
    expect(ok.headers.get('location')).toBe('/demo/gracias');

    const bad = await handleDemo(makeRequest({ ...VALID, email: 'x' }, 'text/html'), ENV, makeDeps().deps);
    expect(bad.status).toBe(303);
    expect(bad.headers.get('location')).toBe('/demo/error');
  });

  it('no escribe datos personales en los logs (R9)', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handleDemo(makeRequest(), ENV, makeDeps().deps);
    await handleDemo(makeRequest({ ...VALID, email: 'x' }), ENV, makeDeps().deps);

    const output = log.mock.calls.flat().join('\n');
    expect(output).toContain('demo_request');
    for (const pii of ['Ana', 'consultorio.com', '412', 'Ávila', 'agenda']) {
      expect(output).not.toContain(pii);
    }
  });
});

describe('router del Worker', () => {
  it('GET /api/demo → 405', async () => {
    const res = await SELF.fetch('https://visoria.test/api/demo');
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });

  it('otra ruta de /api → 404 JSON', async () => {
    const res = await SELF.fetch('https://visoria.test/api/otra');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });

  it('POST /api/demo llega al handler (Turnstile de prueba siempre falla → 400)', async () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(VALID)) fd.set(k, v);
    const res = await SELF.fetch('https://visoria.test/api/demo', {
      method: 'POST',
      body: fd,
      headers: { accept: 'application/json' },
    });
    // Sin binding DEMO_EMAIL en el entorno de test el formulario está desactivado (503).
    expect([400, 503]).toContain(res.status);
  });
});
