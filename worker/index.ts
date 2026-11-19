/**
 * Worker de Visoria Landing.
 *
 * Solo recibe peticiones a /api/* (ver `run_worker_first` en wrangler.jsonc); todo lo demás lo
 * sirven los static assets sin pasar por aquí. En la spec 001 no hay endpoints: cualquier ruta
 * de la API responde 404. La spec 004 añade POST /api/demo.
 */

export interface Env {
  ASSETS: Fetcher;
}

const json = (status: number, body: Record<string, unknown>): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-visoria-worker': '1',
    },
  });

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      return json(404, { error: 'not_found' });
    }

    // Red de seguridad: si por configuración llegara aquí otra ruta, se delega en los assets.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
