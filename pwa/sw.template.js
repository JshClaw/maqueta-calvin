// Guarda todo el manual en el celular para que funcione sin internet.
const CACHE = '__CACHE__';
const FILES = __FILES__;
const HUELLAS = __HUELLAS__;   // archivo → huella de su contenido
const SCOPE = self.registration.scope;
const abs = (f) => new URL(f, SCOPE).href;
const META = abs('calvin-huellas.json');   // cada versión guarda aquí las huellas de lo que tiene

// Archivos que ya están guardados de una versión anterior y no cambiaron: se copian en lugar de bajarlos otra vez.
// Así una actualización baja unos cientos de KB y no los ~18 MB completos (en iPad, si la app se suspende a media
// descarga, el aviso de «Actualizar» tardaba en salir).
async function anteriores() {
  const out = new Map();
  for (const k of await caches.keys()) {
    if (!k.startsWith('calvin-') || k === CACHE) continue;
    try {
      const c = await caches.open(k);
      const m = await c.match(META);
      if (!m) continue;
      const h = await m.json();
      for (const f of FILES) if (!out.has(f) && h[f] && h[f] === HUELLAS[f]) out.set(f, c);
    } catch (err) { /* esa versión no sirve para copiar: se baja */ }
  }
  return out;
}

// Safari no acepta respuestas que vienen de una redirección (pasa en algunos hostings): se guardan "limpias".
async function limpia(r) {
  if (!r.redirected) return r;
  return new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: r.headers });
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const viejos = await anteriores();
    for (const f of FILES) {
      const url = abs(f);
      if (await c.match(url)) continue;            // si una instalación anterior se cortó, sigue donde se quedó
      const v = viejos.get(f);
      if (v) {
        try { const r = await v.match(url); if (r) { await c.put(url, r); continue; } } catch (err) { /* se baja */ }
      }
      for (let i = 0; ; i++) {
        try {
          const r = await fetch(url, { cache: 'reload' });
          if (!r.ok) throw new Error(f + ': ' + r.status);
          await c.put(url, await limpia(r));
          break;
        } catch (err) {
          if (i >= 2) throw err;
          await new Promise((ok) => setTimeout(ok, 1000 * (i + 1)));
        }
      }
    }
    await c.put(META, new Response(JSON.stringify(HUELLAS), { headers: { 'Content-Type': 'application/json' } }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('calvin-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Los videos se piden por pedazos (Range). iPhone no los reproduce si no se le contesta así.
const buffers = new Map();
async function pedazo(res, url, range) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m) return res;
  let buf = buffers.get(url);
  if (!buf) { buf = await res.arrayBuffer(); buffers.clear(); buffers.set(url, buf); }
  const size = buf.byteLength;
  let start, end;
  if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size || start > end) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(buf.slice(start, end + 1), {
    status: 206, statusText: 'Partial Content',
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'video/mp4',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    let hit = await c.match(req, { ignoreSearch: true, ignoreVary: true });
    if (!hit && req.mode === 'navigate') hit = await c.match(abs('index.html'));
    if (hit) {
      const range = req.headers.get('range');
      return range ? pedazo(hit, hit.url || req.url, range) : hit;
    }
    try {
      return await fetch(req);
    } catch (err) {
      return new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
