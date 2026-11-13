// Serves the Cloudflare Web Analytics beacon script from our own domain.
// Blocklists (EasyPrivacy, AdGuard, uBlock) cover static.cloudflareinsights.com
// by domain and /beacon.min.js by path; this proxy keeps measurement working
// for visitors whose browser or network filter blocks the original URL.
const UPSTREAM = 'https://static.cloudflareinsights.com/beacon.min.js';

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(UPSTREAM);
  let res = await cache.match(cacheKey);
  if (!res) {
    const upstream = await fetch(UPSTREAM, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!upstream.ok) return new Response('beacon unavailable', { status: 502 });
    res = new Response(upstream.body, upstream);
    res.headers.set('Cache-Control', 'public, max-age=3600');
    context.waitUntil(cache.put(cacheKey, res.clone()));
  }
  const body = await res.arrayBuffer();
  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
