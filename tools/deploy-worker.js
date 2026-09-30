// Redeploy: paste into the browser console on dash.cloudflare.com (signed in).
// Pulls site/ from GitHub main and uploads it as the stacymorrow-study Worker.
(async () => {
  const A = '679c978427b96c7d05185cd70bdcfc01', NAME = 'stacymorrow-study';
  const base = 'https://raw.githubusercontent.com/stacymariemorrow/stacymorrow-study/main/site/';
  const js = 'text/javascript; charset=utf-8';
  const paths = { '/index.html': 'text/html; charset=utf-8', '/styles.css': 'text/css; charset=utf-8', '/app.js': js, '/config.js': js, '/data/fall-2026.js': js, '/data/bookshelf.js': js, '/favicon.svg': 'image/svg+xml' };
  const files = {};
  for (const p of Object.keys(paths)) { const r = await fetch(base + p.slice(1) + '?t=' + Date.now()); if (!r.ok) throw new Error(p + ' ' + r.status); files[p] = { t: paths[p], b: await r.text() }; }
  const worker = `const FILES = ${JSON.stringify(files)};
export default { async fetch(request) {
  const url = new URL(request.url);
  if (url.hostname === 'www.stacymorrow.study') { url.hostname = 'stacymorrow.study'; return Response.redirect(url.toString(), 301); }
  let p = url.pathname; if (p === '/' || p === '') p = '/index.html';
  const f = FILES[p];
  const h = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', 'x-frame-options': 'SAMEORIGIN' };
  if (!f) return new Response(FILES['/index.html'].b, { status: 404, headers: { ...h, 'content-type': FILES['/index.html'].t } });
  return new Response(f.b, { headers: { ...h, 'content-type': f.t, 'cache-control': p === '/index.html' ? 'public, max-age=300' : 'public, max-age=3600' } });
} };`;
  const fd = new FormData();
  fd.append('metadata', new Blob([JSON.stringify({ main_module: 'worker.js', compatibility_date: '2026-09-01' })], { type: 'application/json' }));
  fd.append('worker.js', new Blob([worker], { type: 'application/javascript+module' }), 'worker.js');
  const r = await fetch(`/api/v4/accounts/${A}/workers/scripts/${NAME}`, { method: 'PUT', credentials: 'include', body: fd });
  console.log('deploy', r.status, (await r.json()).success);
})();
