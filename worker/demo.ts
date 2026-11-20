/**
 * POST /api/demo (spec 004).
 *
 * Orden: ¿activo? → content-type → señales de bot → Turnstile → validación → email.
 * Responde JSON si la petición trae `Accept: application/json` (envío con JS) y redirige con
 * 303 en caso contrario (envío nativo del formulario).
 *
 * R9: nada de datos personales en logs; solo el resultado.
 */
import { FIELD, MIN_ELAPSED_MS, type UserField } from './fields';
import { validateDemo, looksAutomated } from './validate';
import { verifyTurnstile } from './turnstile';
import { buildDemoEmail, type DemoEmail } from './email';

export interface DemoEnv {
  FORM_ENABLED?: string;
  DEMO_INBOX?: string;
  DEMO_FROM?: string;
  TURNSTILE_SECRET?: string;
  DEMO_EMAIL?: SendEmail;
}

export interface DemoDeps {
  verify: (token: string, ip: string | null) => Promise<boolean>;
  send: (email: DemoEmail) => Promise<void>;
  now: () => Date;
}

type Outcome =
  | { kind: 'ok' }
  | { kind: 'invalid'; fields: Partial<Record<UserField, string>> }
  | { kind: 'rejected'; reason: 'bot' | 'turnstile' | 'content_type' }
  | { kind: 'send_failed' }
  | { kind: 'disabled' };

const STATUS: Record<Outcome['kind'], number> = {
  ok: 200,
  invalid: 422,
  rejected: 400,
  send_failed: 502,
  disabled: 503,
};

export function defaultDeps(env: DemoEnv): DemoDeps {
  return {
    verify: (token, ip) => verifyTurnstile(token, env.TURNSTILE_SECRET ?? '', ip),
    send: async (email) => {
      if (!env.DEMO_EMAIL) throw new Error('send_email binding missing');
      await env.DEMO_EMAIL.send(email);
    },
    now: () => new Date(),
  };
}

export function isEnabled(env: DemoEnv): boolean {
  return env.FORM_ENABLED === 'true' && Boolean(env.DEMO_INBOX) && Boolean(env.DEMO_FROM) && Boolean(env.DEMO_EMAIL);
}

async function evaluate(request: Request, env: DemoEnv, deps: DemoDeps): Promise<Outcome> {
  if (!isEnabled(env)) return { kind: 'disabled' };

  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/x-www-form-urlencoded') && !type.includes('multipart/form-data')) {
    return { kind: 'rejected', reason: 'content_type' };
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return { kind: 'rejected', reason: 'content_type' };
  }

  if (looksAutomated(fd, MIN_ELAPSED_MS)) return { kind: 'rejected', reason: 'bot' };

  const token = fd.get(FIELD.turnstile);
  const ip = request.headers.get('cf-connecting-ip');
  if (typeof token !== 'string' || !(await deps.verify(token, ip))) {
    return { kind: 'rejected', reason: 'turnstile' };
  }

  const result = validateDemo(fd);
  if (!result.ok) return { kind: 'invalid', fields: result.errors };

  const email = buildDemoEmail(result.data, { from: env.DEMO_FROM!, to: env.DEMO_INBOX!, now: deps.now() });
  try {
    await deps.send(email);
  } catch {
    return { kind: 'send_failed' };
  }
  return { kind: 'ok' };
}

export async function handleDemo(request: Request, env: DemoEnv, deps: DemoDeps = defaultDeps(env)): Promise<Response> {
  const outcome = await evaluate(request, env, deps);

  // R9: solo el resultado, nunca datos del formulario.
  console.log(
    JSON.stringify({ event: 'demo_request', result: outcome.kind, ...('reason' in outcome ? { reason: outcome.reason } : {}) }),
  );

  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (!wantsJson) {
    const location = outcome.kind === 'ok' ? '/demo/gracias' : '/demo/error';
    return new Response(null, { status: 303, headers: { location, 'cache-control': 'no-store' } });
  }

  const body =
    outcome.kind === 'ok'
      ? { ok: true }
      : { ok: false, error: outcome.kind, ...(outcome.kind === 'invalid' ? { fields: outcome.fields } : {}) };

  return new Response(JSON.stringify(body), {
    status: STATUS[outcome.kind],
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
