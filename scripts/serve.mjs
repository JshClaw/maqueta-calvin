#!/usr/bin/env node
// npm run serve → sirve dist/ en http://localhost:8080 para probar.
//
// Ojo: el service worker (lo que permite usarla sin internet) solo funciona en https o en localhost.
// Desde otro equipo por http://IP-de-tu-PC:8080 la página se ve, pero NO se instala ni queda guardada.
// Para servirla en tu red con https: PORT=443 CERT=ruta/fullchain.pem KEY=ruta/privkey.pem npm run serve
// (con un certificado válido para un nombre que apunte a la IP de esta PC; ver CLAUDE.md).
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || 8080);
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('No existe dist/index.html. Corre primero: npm run build');
  process.exit(1);
}

function responder(req, res) {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('No encontrado');
  }
  const size = fs.statSync(file).size;
  const head = {
    'Content-Type': TIPOS[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    // sw.js nunca se guarda en caché del navegador, para que las actualizaciones lleguen
    'Cache-Control': rel.endsWith('/sw.js') ? 'no-cache' : 'public, max-age=300',
  };
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (m) {
    let start = m[1] === '' ? Math.max(0, size - Number(m[2])) : Number(m[1]);
    let end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end(); }
    res.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...head, 'Content-Length': size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

const seguro = process.env.CERT && process.env.KEY;
const srv = seguro
  ? https.createServer({ cert: fs.readFileSync(process.env.CERT), key: fs.readFileSync(process.env.KEY) }, responder)
  : http.createServer(responder);
srv.listen(PORT, '0.0.0.0', () => {
  const proto = seguro ? 'https' : 'http';
  console.log(`Sirviendo dist/ en ${proto}://localhost:${PORT}/`);
  for (const ifs of Object.values(os.networkInterfaces())) {
    for (const a of ifs || []) if (a.family === 'IPv4' && !a.internal) console.log(`  en tu red: ${proto}://${a.address}:${PORT}/` + (seguro ? '' : '  (solo para ver; sin https no se instala)'));
  }
});
