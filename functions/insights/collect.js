// First-party ingest for Cloudflare Web Analytics: the blocklists also cover
// the /cdn-cgi/rum path itself, so the beacon posts here and the report is
// forwarded server-side to Cloudflare's collector.
// Notes:
// - With send.to, the beacon posts WITHOUT its usual ?version&token query
//   (that only goes to the default collector URL), so the query is appended.
// - The collector rejects (404) posts without Origin+Referer; both are
//   forwarded here.
// - In "JS Snippet installation" (manual) mode the collector validates the
//   token and payload and only answers on cloudflareinsights.com - the
//   zone-level /cdn-cgi/rum path 404s manual-site tokens there (it serves the
//   automatic-injection site). Verified 2026-09-20: same real payload + this
//   token -> 204 via cloudflareinsights.com, 404 via any zone hostname.
const COLLECTOR = 'https://cloudflareinsights.com/cdn-cgi/rum';
const QUERY = '?version=2024.11.0&token=394249e1ec744d0280ff408489510ffd';

export async function onRequestPost(context) {
  const headers = new Headers();
  headers.set('Content-Type', context.request.headers.get('Content-Type') || 'text/plain;charset=UTF-8');
  const ip = context.request.headers.get('cf-connecting-ip');
  if (ip) headers.set('cf-connecting-ip', ip);
  const ua = context.request.headers.get('user-agent');
  if (ua) headers.set('user-agent', ua);
  const origin = context.request.headers.get('origin');
  if (origin) headers.set('origin', origin);
  const referer = context.request.headers.get('referer');
  if (referer) headers.set('referer', referer);
  const res = await fetch(COLLECTOR + QUERY, { method: 'POST', headers, body: context.request.body });
  return new Response(null, { status: res.status });
}
