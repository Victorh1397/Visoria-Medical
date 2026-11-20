/**
 * robots.txt (spec 006 R3). Se genera en el build para que la URL del sitemap use SITE_URL.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).href;
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /demo/gracias', 'Disallow: /demo/error', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
