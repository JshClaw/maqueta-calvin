#!/usr/bin/env node
// npm run build → dist/: la app lista para subir (Netlify, GitHub Pages, Cloudflare Pages o un servidor con https).
//
// 1. contenido/build_page.py arma las diapositivas            → build/page.html
// 2. esbuild empaqueta el visor 3D (three.js + 3d/*.js)        → un solo <script>
// 3. layout.json y las texturas van incrustadas (data URI)
// 4. public/ se copia tal cual (fotos, videos, PDF, fuentes, íconos)
// 5. se agregan manifest, service worker y el aviso de instalación (pwa/)
//    La versión del caché sale de un hash del contenido: si cambias algo, la app instalada se actualiza sola.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const r = (...p) => path.join(ROOT, ...p);
const leer = (p) => fs.readFileSync(p, 'utf8');
// Mismo formato que json.dumps de Python (", " y ": "), para que el resultado sea idéntico al de la versión probada.
const pyList = (a) => '[' + a.map((x) => JSON.stringify(x)).join(', ') + ']';
const pyDict = (o) => '{' + Object.entries(o).map(([k, v]) => JSON.stringify(k) + ': ' + JSON.stringify(v)).join(', ') + '}';

// ------------------------------------------------------------------ 1. página (Python 3, solo librería estándar)
function python() {
  for (const [cmd, args] of [['python3', []], ['python', []], ['py', ['-3']]]) {
    const t = spawnSync(cmd, [...args, '--version'], { encoding: 'utf8' });
    if (t.status === 0 && /Python 3/.test((t.stdout || '') + (t.stderr || ''))) return [cmd, args];
  }
  throw new Error('No encontré Python 3 (python3, python o py -3). Instálalo desde python.org.');
}
const [py, pyArgs] = python();
const gen = spawnSync(py, [...pyArgs, r('contenido', 'build_page.py')], { stdio: 'inherit', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } });
if (gen.status !== 0) process.exit(gen.status || 1);
const pagina = leer(r('build', 'page.html'));

// ------------------------------------------------------------------ 2. visor 3D empaquetado
const res = await esbuild.build({
  entryPoints: [r('3d', 'entry.js')], bundle: true, minify: true, format: 'iife', target: 'es2020',
  write: false, logLevel: 'warning',
});
const bundle = res.outputFiles[0].text;
if (bundle.toLowerCase().includes('</script')) throw new Error('el paquete del visor contiene </script>');

// ------------------------------------------------------------------ 3. datos incrustados
const layout = leer(r('3d', 'layout.json'));
const tex = {};
for (const f of fs.readdirSync(r('3d', 'tex')).sort()) {
  const mime = f.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  tex[f] = `data:${mime};base64,` + fs.readFileSync(r('3d', 'tex', f)).toString('base64');
}
const datos = 'window.__LAYOUT=' + layout.trim() + ';\nwindow.__TEX=' + pyDict(tex) + ';';

// ------------------------------------------------------------------ 4. carpeta dist
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(r('public'), DIST, { recursive: true });
const BG = '#EEF2EC';
const manifest = {
  name: 'Maqueta del ciclo de Calvin',
  short_name: 'Ciclo Calvin',
  description: 'Manual para construir la maqueta del ciclo de Calvin (fase oscura), con modelo 3D. Funciona sin internet.',
  lang: 'es-MX',
  id: './',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: BG,
  theme_color: BG,
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

// ------------------------------------------------------------------ 5. página completa
const RESET = ':root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}'
  + 'body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}';
const DESC = '<meta name="description" content="Manual interactivo para construir, en equipo, una maqueta del ciclo de Calvin que se mueve a mano con una perilla: planos, plantillas, paso a paso, guion para la clase y modelo 3D.">\n';
const HEAD = '<title>Ciclo de Calvin · maqueta</title>\n' + DESC
  + '<link rel="stylesheet" href="fonts/fonts.css">\n'
  + '<link rel="manifest" href="manifest.webmanifest">\n'
  + '<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">\n'
  + '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
  + '<meta name="theme-color" content="#EEF2EC" media="(prefers-color-scheme: light)">\n'
  + '<meta name="theme-color" content="#111714" media="(prefers-color-scheme: dark)">\n'
  + '<meta name="mobile-web-app-capable" content="yes">\n'
  + '<meta name="apple-mobile-web-app-capable" content="yes">\n'
  + '<meta name="apple-mobile-web-app-title" content="Ciclo Calvin">\n'
  + '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n';
let page = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
  + '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  + `<style>${RESET}</style>\n` + HEAD + '</head>\n<body>\n'
  + pagina + '\n'
  + `<script>\n${datos}\n</script>\n<script>\n${bundle}\n</script>\n`
  + '</body>\n</html>\n';

// lista de archivos que se guardan en el celular: index primero, los videos al final
function walk(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}
const llave = (p) => [p !== 'index.html' ? 1 : 0, p.startsWith('vid/') ? 1 : 0, p];
const cmp = (a, b) => { const x = llave(a), y = llave(b); for (let i = 0; i < 3; i++) { if (x[i] < y[i]) return -1; if (x[i] > y[i]) return 1; } return 0; };
const files = [...new Set(['index.html', ...walk(DIST)])].sort(cmp);

const UI = leer(r('pwa', 'ui.html'));
const SW = leer(r('pwa', 'sw.template.js'));
const h = createHash('sha256');
for (const rel of [...files].sort()) {
  if (rel === 'index.html') continue;
  h.update(Buffer.from(rel, 'utf8'));
  h.update(fs.readFileSync(path.join(DIST, rel)));
}
h.update(Buffer.from(page + UI + SW, 'utf8'));
const ver = h.digest('hex').slice(0, 10);
const cache = `calvin-${ver}`;
const sizes = files.map((f) => (f === 'index.html' ? Buffer.byteLength(page) + Buffer.byteLength(UI) : fs.statSync(path.join(DIST, f)).size));
const mb = String(Math.round(sizes.reduce((a, b) => a + b, 0) / 1e6));
// replaceAll con función: el texto de reemplazo se pone tal cual (sin interpretar $&, $1…)
const ui = UI.replaceAll('__CACHE__', () => cache).replaceAll('__FILES__', () => pyList(files))
  .replaceAll('__SIZES__', () => pyList(sizes)).replaceAll("'__MB__'", () => `'${mb}'`);
if (page.split('</body>').length !== 2) throw new Error('se esperaba un solo </body>');
page = page.replace('</body>', () => ui + '</body>');
fs.writeFileSync(path.join(DIST, 'index.html'), page);
fs.writeFileSync(path.join(DIST, 'sw.js'), SW.replaceAll('__CACHE__', () => cache).replaceAll('__FILES__', () => JSON.stringify(files, null, 1)));

const total = files.reduce((a, f) => a + fs.statSync(path.join(DIST, f)).size, 0);
console.log(`versión ${ver} · ${files.length} archivos · ${(total / 1e6).toFixed(1)} MB → dist/`);
