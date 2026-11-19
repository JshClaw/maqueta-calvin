// Guarda todo el manual en el celular para que funcione sin internet.
const CACHE = 'calvin-c47df45ee3';
const FILES = [
 "index.html",
 "dl/tablero_60x60.pdf",
 "fonts/fonts.css",
 "fonts/inter-latin-400-normal.woff2",
 "fonts/inter-latin-500-normal.woff2",
 "fonts/inter-latin-600-normal.woff2",
 "fonts/inter-latin-700-normal.woff2",
 "fonts/inter-latin-ext-400-normal.woff2",
 "fonts/inter-latin-ext-500-normal.woff2",
 "fonts/inter-latin-ext-600-normal.woff2",
 "fonts/inter-latin-ext-700-normal.woff2",
 "fonts/jetbrains-mono-latin-400-normal.woff2",
 "fonts/jetbrains-mono-latin-500-normal.woff2",
 "fonts/jetbrains-mono-latin-ext-400-normal.woff2",
 "fonts/jetbrains-mono-latin-ext-500-normal.woff2",
 "fonts/lora-latin-500-italic.woff2",
 "fonts/lora-latin-600-italic.woff2",
 "fonts/lora-latin-ext-500-italic.woff2",
 "fonts/lora-latin-ext-600-italic.woff2",
 "icons/apple-touch-icon.png",
 "icons/favicon-32.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/maskable-512.png",
 "img/arm_brazo.jpg",
 "img/arm_caja.jpg",
 "img/arm_mid.jpg",
 "img/arm_tapa.jpg",
 "img/brazo_det.jpg",
 "img/compuerta.jpg",
 "img/despiece.jpg",
 "img/estaciones.jpg",
 "img/hero.jpg",
 "img/interior.jpg",
 "img/perilla_det.jpg",
 "img/pinza_det.jpg",
 "img/rampa_det.jpg",
 "img/regen_det.jpg",
 "img/tarjetas.jpg",
 "img/top.jpg",
 "img/transparente.jpg",
 "img/vagon_det.jpg",
 "img/vagon_pinza.jpg",
 "img/vinil.jpg",
 "manifest.webmanifest",
 "vid/ciclo_2d.jpg",
 "vid/ciclo_2d.mp4",
 "vid/mecanismo.jpg",
 "vid/mecanismo.mp4"
];
const HUELLAS = {
 "index.html": "b59989e9e83fcbb6",
 "dl/tablero_60x60.pdf": "20046f9747cc9a76",
 "fonts/fonts.css": "f5d519683d66aac7",
 "fonts/inter-latin-400-normal.woff2": "dd05e326cf8eac3b",
 "fonts/inter-latin-500-normal.woff2": "b0e7558f4710a1e2",
 "fonts/inter-latin-600-normal.woff2": "62553d159189834a",
 "fonts/inter-latin-700-normal.woff2": "aac638f7503cebb0",
 "fonts/inter-latin-ext-400-normal.woff2": "941e03c632d7b1d8",
 "fonts/inter-latin-ext-500-normal.woff2": "f2a063e5054e5a44",
 "fonts/inter-latin-ext-600-normal.woff2": "656a3e303ed0dc46",
 "fonts/inter-latin-ext-700-normal.woff2": "bf1b9f734ed117e7",
 "fonts/jetbrains-mono-latin-400-normal.woff2": "7c53386f55c866c1",
 "fonts/jetbrains-mono-latin-500-normal.woff2": "4765dee1c0be507c",
 "fonts/jetbrains-mono-latin-ext-400-normal.woff2": "a6e389bf81345633",
 "fonts/jetbrains-mono-latin-ext-500-normal.woff2": "75a484756797e02d",
 "fonts/lora-latin-500-italic.woff2": "fb04ddb44e3183be",
 "fonts/lora-latin-600-italic.woff2": "fe04b59261d41534",
 "fonts/lora-latin-ext-500-italic.woff2": "189299ec8938fcc5",
 "fonts/lora-latin-ext-600-italic.woff2": "52f30c4de21c099d",
 "icons/apple-touch-icon.png": "aae4973dade5d07c",
 "icons/favicon-32.png": "7a025808e068d36f",
 "icons/icon-192.png": "58f809e0439f6bcd",
 "icons/icon-512.png": "80c35af21bda3747",
 "icons/maskable-512.png": "316afc08298ff406",
 "img/arm_brazo.jpg": "d75876e356c6e140",
 "img/arm_caja.jpg": "17b8ac52246c2f1d",
 "img/arm_mid.jpg": "e772f4a063c24580",
 "img/arm_tapa.jpg": "56a87aeafd13f1dc",
 "img/brazo_det.jpg": "adf23f95755fa889",
 "img/compuerta.jpg": "a5b2af9e10a7e1a4",
 "img/despiece.jpg": "34ccb73a6d46b48d",
 "img/estaciones.jpg": "bc7228d9c03e36cf",
 "img/hero.jpg": "405b69008188308a",
 "img/interior.jpg": "dc38bd2334d118a7",
 "img/perilla_det.jpg": "aa0f729b672b86c3",
 "img/pinza_det.jpg": "79fc1d15ad27c556",
 "img/rampa_det.jpg": "0dd600563b6fe38e",
 "img/regen_det.jpg": "1426995ed7b56969",
 "img/tarjetas.jpg": "816cb9e20c39bb67",
 "img/top.jpg": "53dd28513b7ec318",
 "img/transparente.jpg": "376c9f6ab565a361",
 "img/vagon_det.jpg": "a2cf0970328d3a85",
 "img/vagon_pinza.jpg": "aea685adaa181a6e",
 "img/vinil.jpg": "88cdb7521899e795",
 "manifest.webmanifest": "3e27bf02fa1292ff",
 "vid/ciclo_2d.jpg": "643b7a7b3a179c7c",
 "vid/ciclo_2d.mp4": "3936220fcabf2c27",
 "vid/mecanismo.jpg": "52ec840bc9f5a25b",
 "vid/mecanismo.mp4": "674f41f713d33dc1"
};   // archivo → huella de su contenido
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
