/**
 * Worker de Visoria Landing.
 *
 * Solo recibe peticiones a /api/* (ver `run_worker_first` en wrangler.jsonc); todo lo demás lo
 * sirven los static assets sin pasar por aquí.
 *
 * Rutas:
 * - POST /api/demo → solicitud de demo (spec 004).
 */
import { handleDemo, type DemoEnv } from './demo';

export interface Env extends DemoEnv {
  ASSETS: Fetcher;
}

/** Cabeceras de seguridad de las respuestas de la API (spec 007 R5); los assets usan public/_headers. */
const SECURITY_HEADERS: Record<string, string> = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
};

const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-visoria-worker': '1',
      ...headers,
    },
  });

function withSecurityHeaders(response: Response): Response {
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) secured.headers.set(name, value);
  return secured;
}

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname === '/api/demo') {
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { allow: 'POST' });
    return handleDemo(request, env);
  }

  return json(404, { error: 'not_found' });
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    // Red de seguridad: si por configuración llegara aquí una ruta que no es de la API, se delega en los assets.
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    return withSecurityHeaders(await route(request, env));
  },
} satisfies ExportedHandler<Env>;
