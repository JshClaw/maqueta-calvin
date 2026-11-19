#!/usr/bin/env node
// npm test → prueba dist/ en un iPhone, un Android y un iPad simulados:
// primera visita con internet (se guarda todo), luego sin internet (todo debe abrir, incluido el 3D).
//
// La primera vez instala el navegador de prueba:  npx playwright install chromium
// Opcional: CHROME_PATH=ruta/a/chrome para usar tu Chrome; CHROME_ARGS="--use-angle=gl-egl" para WebGL en Linux sin GPU.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8899;
const BASE = process.env.BASE_URL || `http://localhost:${PORT}/`;   // BASE_URL=https://… prueba el sitio publicado
const sw = fs.readFileSync(path.join(ROOT, 'dist', 'sw.js'), 'utf8');
const CACHE = /const CACHE = '([^']+)'/.exec(sw)[1];
const FILES = JSON.parse(/const FILES = (\[[\s\S]*?\]);/.exec(sw)[1]);
const EQUIPOS = (process.env.DEVICES || 'iPhone 13,Pixel 7,iPad (gen 11)').split(',');

const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((ok) => setTimeout(ok, 800));

const opts = { args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', ...(process.env.CHROME_ARGS || '').split(' ').filter(Boolean)] };
if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(opts);
let fallas = 0;
const mal = (msg) => { fallas++; console.log('  ✗ ' + msg); };
const bien = (msg) => console.log('  ✓ ' + msg);

try {
  for (const nombre of EQUIPOS) {
    console.log(`\n${nombre}`);
    const ctx = await browser.newContext({ ...devices[nombre] });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', (e) => errores.push(String(e)));
    await pg.goto(BASE, { waitUntil: 'load' });
    let n = 0;
    for (let i = 0; i < 240 && n < FILES.length; i++) {
      n = await pg.evaluate((c) => caches.has(c).then((si) => (si ? caches.open(c).then((x) => x.keys()).then((k) => k.length) : 0)), CACHE);
      if (n < FILES.length) await pg.waitForTimeout(500);
    }
    n === FILES.length ? bien(`guardó ${n} de ${FILES.length} archivos`) : mal(`solo guardó ${n} de ${FILES.length} archivos`);
    let aviso = '';
    for (let i = 0; i < 20 && !/Instálala/.test(aviso); i++) {
      await pg.waitForTimeout(300);
      aviso = await pg.evaluate(() => { const b = document.getElementById('pwa'); return b.hidden ? '' : b.innerText.split('\n')[0]; });
    }
    /Instálala/.test(aviso) ? bien(`aviso: «${aviso}»`) : mal(`no apareció el aviso de instalación (${aviso || 'vacío'})`);

    await ctx.setOffline(true);
    await pg.goto(BASE, { waitUntil: 'load' });
    const estados = await pg.evaluate(async (files) => Promise.all(files.map((f) => fetch(f).then((r) => r.status).catch(() => 'error'))), FILES);
    const caidos = FILES.filter((f, i) => estados[i] !== 200);
    caidos.length ? mal(`sin internet no abren: ${caidos.join(', ')}`) : bien('sin internet abren todos los archivos');
    const rango = await pg.evaluate(async () => {
      const r = await fetch('vid/mecanismo.mp4', { headers: { Range: 'bytes=0-1' } });
      return [r.status, r.headers.get('content-range'), (await r.arrayBuffer()).byteLength];
    });
    rango[0] === 206 && rango[2] === 2 ? bien(`video por pedazos (lo que pide iPhone): ${rango[1]}`) : mal(`video por pedazos: ${JSON.stringify(rango)}`);

    await pg.goto(BASE + '#maqueta3d', { waitUntil: 'load' });
    await pg.waitForTimeout(5000);
    const v = await pg.evaluate(() => [!!document.querySelector('#v3d canvas'), (document.getElementById('v3d-status') || {}).innerText || '']);
    if (v[0] && !v[1]) bien('modelo 3D sin internet');
    else if (/WebGL/.test(v[1])) console.log('  ! este navegador de prueba no tiene WebGL; el 3D no se pudo comprobar (prueba con CHROME_PATH)');
    else mal(`modelo 3D: ${JSON.stringify(v)}`);
    errores.length ? mal('errores en la página: ' + errores.join(' | ')) : bien('sin errores en la página');
    await ctx.close();
  }
} finally {
  await browser.close();
  srv.kill();
}
console.log(fallas ? `\n${fallas} falla(s)` : '\nTodo bien');
process.exit(fallas ? 1 : 0);
