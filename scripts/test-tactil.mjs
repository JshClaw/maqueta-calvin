#!/usr/bin/env node
// npm run test:tactil → prueba el visor 3D con gestos de dedo reales en celulares y tabletas simulados:
// girar con un dedo, pellizcar, mover con dos dedos, doble toque, botones, números, y que quieto no gaste batería.
//
// La primera vez instala el navegador de prueba:  npx playwright install chromium
// Opcional: CHROME_PATH=ruta/a/chrome; DEVICES="iPhone 13,iPad Pro 11 landscape".
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8898;
const BASE = `http://localhost:${PORT}/`;
const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((ok) => setTimeout(ok, 800));
const EQUIPOS = (process.env.DEVICES || 'iPhone 13,Pixel 7,iPad (gen 11),iPad Pro 11 landscape').split(',');
const opts = { args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', ...(process.env.CHROME_ARGS || '').split(' ').filter(Boolean)] };
if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(opts);
let fallas = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fallas++; };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

for (const nombre of EQUIPOS) {
  console.log('\n' + nombre);
  const ctx = await browser.newContext({ ...devices[nombre] });
  // cuenta cuadros dibujados por WebGL
  await ctx.addInitScript(() => {
    window.__draws = 0;
    for (const P of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
      if (!P) continue;
      for (const f of ['drawElements', 'drawArrays']) {
        const o = P.prototype[f];
        P.prototype[f] = function (...a) { window.__draws++; return o.apply(this, a); };
      }
    }
  });
  const pg = await ctx.newPage();
  const errores = [];
  pg.on('pageerror', (e) => errores.push(String(e)));
  // entra DIRECTO al 3D (era el caso que fallaba)
  await pg.goto(BASE + '#maqueta3d', { waitUntil: 'load' });
  await pg.waitForFunction(() => document.querySelector('#v3d canvas') && document.getElementById('v3d-status').hidden, null, { timeout: 30000 }).catch(() => {});
  const carga = await pg.evaluate(() => [!!document.querySelector('#v3d canvas'), document.getElementById('v3d-status').hidden, document.getElementById('v3d-status').innerText]);
  ok(carga[0] && carga[1], 'abre el 3D entrando directo a #maqueta3d' + (carga[1] ? '' : ` (${carga[2]})`));
  if (!carga[0]) { await ctx.close(); continue; }
  const coarse = await pg.evaluate(() => matchMedia('(pointer: coarse)').matches);
  ok(coarse, 'el navegador se presenta como pantalla táctil (pointer: coarse)');

  const cdp = await ctx.newCDPSession(pg);
  // pon el modelo en pantalla (en el teléfono queda abajo del texto), sin tapar con la barra de arriba ni la de abajo
  await pg.evaluate(() => { const s = document.getElementById('v3d-stage'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 64); });
  await espera(500);
  const vista = await pg.evaluate(() => innerHeight);
  const c0 = await pg.locator('#v3d-stage canvas').boundingBox();
  const caja = { x: c0.x, y: Math.max(c0.y, 64), width: c0.width, height: Math.min(c0.y + c0.height, vista - 72) - Math.max(c0.y, 64) };
  console.log(`  · zona del modelo visible para tocar: ${Math.round(caja.width)}×${Math.round(caja.height)} px`);
  // centro de la zona libre (lejos de los botones de la derecha y de los chips de arriba)
  // ¿cuánto del modelo tapan los números? (rejilla de puntos: qué elemento recibe el toque)
  const tapado = await pg.evaluate(([x0, y0, w, h]) => {
    let n = 0, m = 0;
    for (let i = 1; i < 20; i++) for (let j = 1; j < 20; j++) {
      const el = document.elementFromPoint(x0 + (w * i) / 20, y0 + (h * j) / 20);
      n++; if (el && el.classList.contains('mk')) m++;
    }
    return Math.round((m / n) * 100);
  }, [caja.x, caja.y, caja.width, caja.height]);
  console.log(`  · los números cubren ${tapado} % del área del modelo (ahí el dedo toca el número, no gira)`);
  // para los gestos se apagan los números («Números» en el panel) y los dedos se quedan lejos de los botones de la derecha
  await pg.evaluate(() => { const c = document.getElementById('v3d-puntos'); c.checked = false; c.dispatchEvent(new Event('change')); });
  await espera(300);
  const libreW = caja.width - 100;
  const cx = caja.x + libreW * 0.5, cy = caja.y + caja.height * 0.55;
  const toque = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i, radiusX: 4, radiusY: 4, force: 1 })) });
  async function gesto(ini, fin, pasos = 14) {
    await toque('touchStart', ini);
    for (let k = 1; k <= pasos; k++) {
      const u = k / pasos;
      await toque('touchMove', ini.map(([x, y], i) => [x + (fin[i][0] - x) * u, y + (fin[i][1] - y) * u]));
      await espera(16);
    }
    await toque('touchEnd', []);
    await espera(900);   // deja terminar la inercia
  }
  const cam = () => pg.evaluate(() => window.Visor.camara());
  const dist = (c) => Math.hypot(c.pos[0] - c.target[0], c.pos[1] - c.target[1], c.pos[2] - c.target[2]);
  const mov = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  await espera(1200);

  // 0. estando quieto no dibuja
  await espera(1500);
  let d0 = await pg.evaluate(() => window.__draws);
  await espera(2000);
  let d1 = await pg.evaluate(() => window.__draws);
  ok(d1 - d0 === 0, `quieto no dibuja (${d1 - d0} llamadas de dibujo en 2 s)`);

  // 1. un dedo: girar
  let a = await cam();
  await gesto([[cx, cy]], [[cx + caja.width * 0.25, cy + 30]]);
  let b = await cam();
  ok(mov(a.pos, b.pos) > 3 && mov(a.target, b.target) < 0.5, `un dedo gira (la cámara se movió ${mov(a.pos, b.pos).toFixed(1)} cm, el centro ${mov(a.target, b.target).toFixed(2)})`);
  await espera(2500);
  d0 = await pg.evaluate(() => window.__draws);
  await espera(1500);
  d1 = await pg.evaluate(() => window.__draws);
  ok(d1 - d0 === 0, `después de girar, la inercia termina y deja de dibujar (${d1 - d0} llamadas 3.4 s después)`);

  // 2. pellizco para acercar
  a = await cam();
  const s0 = Math.min(libreW, caja.height) * 0.1, s1 = Math.min(libreW, caja.height) * 0.42;
  await gesto([[cx - s0, cy], [cx + s0, cy]], [[cx - s1, cy], [cx + s1, cy]]);
  b = await cam();
  ok(dist(b) < dist(a) * 0.85, `pellizco abriendo acerca (distancia ${dist(a).toFixed(0)} → ${dist(b).toFixed(0)} cm)`);
  // 3. pellizco para alejar
  a = b;
  await gesto([[cx - s1, cy], [cx + s1, cy]], [[cx - s0, cy], [cx + s0, cy]]);
  b = await cam();
  ok(dist(b) > dist(a) * 1.15, `pellizco cerrando aleja (distancia ${dist(a).toFixed(0)} → ${dist(b).toFixed(0)} cm)`);

  // 4. dos dedos juntos: mover (desplazar)
  a = await cam();
  await gesto([[cx - 70, cy], [cx - 10, cy]], [[cx - 70 + 90, cy + 40], [cx - 10 + 90, cy + 40]]);
  b = await cam();
  ok(mov(a.target, b.target) > 2, `dos dedos mueven la vista (el centro se movió ${mov(a.target, b.target).toFixed(1)} cm)`);

  // 4b. torcer dos dedos gira la maqueta sobre la mesa; pellizcar (aunque se tuerza un poquito) no la gira
  const azim = (c) => Math.atan2(c.pos[0] - c.target[0], c.pos[2] - c.target[2]);
  const difAng = (x, y) => { let d = y - x; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  const arco = (r, g) => [cx + r * Math.cos(g), cy + r * Math.sin(g)];
  const torcer = async (r0, r1, g) => {   // dos dedos frente a frente; giran g radianes (positivo = como las manecillas)
    const pasos = 14;
    await toque('touchStart', [arco(r0, Math.PI), arco(r0, 0)]);
    for (let k = 1; k <= pasos; k++) {
      const u = k / pasos, r = r0 + (r1 - r0) * u;
      await toque('touchMove', [arco(r, Math.PI + g * u), arco(r, g * u)]);
      await espera(16);
    }
    await toque('touchEnd', []);
    await espera(900);
  };
  const rt = Math.min(libreW, caja.height) * 0.22;
  a = await cam();
  await torcer(rt, rt, Math.PI / 4);
  b = await cam();
  const giro = difAng(azim(a), azim(b)) * 180 / Math.PI;   // 45° menos los 10° que hay que torcer para que arranque
  ok(Math.abs(giro - 35) < 1.5, `torcer dos dedos 45° gira la maqueta 35° (los primeros 10° no cuentan, para que pellizcar no la gire): ${giro.toFixed(1)}°`);
  a = await cam();
  await torcer(rt * 0.7, rt * 1.4, 6 * Math.PI / 180);
  b = await cam();
  const giroP = Math.abs(difAng(azim(a), azim(b)) * 180 / Math.PI);
  ok(giroP < 1 && dist(b) < dist(a) * 0.85, `un pellizco algo chueco (6°) acerca sin girar (giro ${giroP.toFixed(1)}°, distancia ${dist(a).toFixed(0)} → ${dist(b).toFixed(0)} cm)`);
  await pg.locator('#v3d-centro').tap(); await espera(1300);

  // 4c. inercia: un deslizón rápido sigue girando al soltarlo; uno lento se queda donde lo dejas
  const deslizar = async (pasos) => {
    const a0 = azim(await cam());
    await gesto([[cx - caja.width * 0.12, cy]], [[cx + caja.width * 0.12, cy]], pasos);
    await espera(1500);
    return Math.abs(difAng(a0, azim(await cam())) * 180 / Math.PI);
  };
  const lento = await deslizar(70);
  await pg.locator('#v3d-centro').tap(); await espera(1300);
  const rapido = await deslizar(6);
  ok(rapido > lento * 1.3, `al soltar un deslizón rápido sigue girando (lento ${lento.toFixed(0)}°, rápido ${rapido.toFixed(0)}° con la misma distancia)`);
  await pg.locator('#v3d-centro').tap(); await espera(1300);

  // 5. botón Mover + un dedo
  await pg.locator('#v3d-mover').tap();
  a = await cam();
  await gesto([[cx, cy]], [[cx - 80, cy - 40]]);
  b = await cam();
  ok(mov(a.target, b.target) > 2, `con «Mover», un dedo desplaza (${mov(a.target, b.target).toFixed(1)} cm)`);
  await pg.locator('#v3d-girar').tap();

  // 6. botón ⌂, luego doble toque sobre la maqueta
  await pg.locator('#v3d-centro').tap();
  await espera(1300);
  a = await cam();
  const px = caja.x + caja.width * 0.45, py = caja.y + caja.height * 0.6;
  for (let k = 0; k < 2; k++) { await toque('touchStart', [[px, py]]); await espera(40); await toque('touchEnd', []); await espera(120); }
  await espera(1400);
  b = await cam();
  ok(dist(b) < dist(a) * 0.7, `doble toque acerca a ese punto (distancia ${dist(a).toFixed(0)} → ${dist(b).toFixed(0)} cm)`);

  // 7. botones + y −
  await pg.locator('#v3d-centro').tap(); await espera(1300);
  a = await cam();
  await pg.locator('#v3d-mas').tap(); await espera(1300);
  b = await cam();
  ok(dist(b) < dist(a), `botón + acerca (${dist(a).toFixed(0)} → ${dist(b).toFixed(0)})`);
  await pg.locator('#v3d-menos').tap(); await espera(1300);
  const c = await cam();
  ok(dist(c) > dist(b), `botón − aleja (${dist(b).toFixed(0)} → ${dist(c).toFixed(0)})`);

  // 8. tocar un número sobre el modelo abre su tarjeta
  await pg.evaluate(() => { const c = document.getElementById('v3d-puntos'); c.checked = true; c.dispatchEvent(new Event('change')); });
  await pg.locator('#v3d-centro').tap(); await espera(1300);
  const mk = pg.locator('#v3d-marks .mk:not([hidden])').first();
  const txt = await mk.textContent();
  await mk.tap({ force: true });
  await espera(1300);
  const tarjeta = await pg.evaluate(() => [!document.getElementById('v3d-card').hidden, document.getElementById('v3d-card-t').textContent]);
  ok(tarjeta[0], `tocar el número ${txt} abre su tarjeta («${tarjeta[1]}»)`);
  await pg.locator('#v3d-card-x').tap();

  // 9. reproducir: ahora sí dibuja, y para al pausar
  await pg.locator('#v3d-play').tap();
  d0 = await pg.evaluate(() => window.__draws);
  await espera(1500);
  d1 = await pg.evaluate(() => window.__draws);
  const t1 = await pg.evaluate(() => document.getElementById('v3d-tl').textContent);
  ok(d1 - d0 > 20, `al reproducir anima (${d1 - d0} llamadas en 1.5 s, tiempo ${t1})`);
  await pg.locator('#v3d-play').tap();
  await espera(600);
  d0 = await pg.evaluate(() => window.__draws);
  await espera(1500);
  d1 = await pg.evaluate(() => window.__draws);
  ok(d1 - d0 === 0, `en pausa deja de dibujar (${d1 - d0})`);

  // 10. vistas y despiece
  await pg.locator('label:has(input[value="sinTapa"])').tap(); await espera(400);
  await pg.locator('label:has(input[value="completa"])').tap(); await espera(400);
  ok(await pg.evaluate(() => document.querySelector('[name="v3d-modo"][value="completa"]').checked), 'cambiar de vista (Sin tapa → Completa) con toques');

  // 11. tamaños táctiles dentro del 3D
  const chicos = await pg.evaluate(() => {
    const out = [];
    document.querySelectorAll('#v3d button, #v3d .seg label, #v3d .mk, .tabbar .tb, #back').forEach((el) => {
      if (el.closest('[hidden]') || el.offsetParent === null) return;
      const r = el.getBoundingClientRect();
      let h = r.height, w = r.width;
      if (el.classList.contains('mk')) { const s = getComputedStyle(el, '::after'); if (s.content !== 'none') { h += 14; w += 14; } }
      if (h < 39.5 || w < 39.5) out.push(`${el.id || el.textContent.trim().slice(0, 14) || el.className} ${Math.round(w)}×${Math.round(h)}`);
    });
    return out;
  });
  ok(chicos.length === 0, chicos.length ? `botones de menos de 40 px: ${chicos.join(', ')}` : 'todos los botones del 3D miden 40 px o más');

  // 11b. pantalla completa: la maqueta tapa toda la pantalla, los controles siguen ahí, y se sale con el botón o con «atrás»
  const pc = async () => pg.evaluate(() => {
    const s = document.getElementById('v3d-stage').getBoundingClientRect();
    const c = document.querySelector('#v3d-stage canvas').getBoundingClientRect();
    const tapado = (el) => { const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !el.contains(top); };
    return { w: Math.round(s.width), h: Math.round(s.height), cw: Math.round(c.width), ch: Math.round(c.height), vw: innerWidth, vh: innerHeight,
      boton: document.getElementById('v3d-full').textContent.trim(), tapados: ['#v3d-full', '#v3d-mas', '#v3d-centro'].filter((q) => tapado(document.querySelector(q))) };
  });
  await pg.locator('#v3d-full').tap(); await espera(700);
  let f = await pc();
  ok(f.w === f.vw && f.h === f.vh && f.cw === f.vw && f.ch === f.vh && f.tapados.length === 0,
    `pantalla completa: la maqueta mide ${f.w}×${f.h} de ${f.vw}×${f.vh} (dibujo ${f.cw}×${f.ch})${f.tapados.length ? ', tapados: ' + f.tapados.join(' ') : ''}`);
  ok(f.boton === 'Salir', `en pantalla completa el botón dice «Salir» («${f.boton}»)`);
  const c1 = await pg.locator('#v3d-stage canvas').boundingBox();
  const a1 = await pg.evaluate(() => Visor.camara().pos.join());
  await gesto([[c1.x + c1.width * 0.4, c1.y + c1.height * 0.5]], [[c1.x + c1.width * 0.6, c1.y + c1.height * 0.5]], 10);
  await espera(600);
  ok(a1 !== await pg.evaluate(() => Visor.camara().pos.join()), 'en pantalla completa se sigue girando con el dedo');
  await pg.locator('#v3d-full').tap(); await espera(700);
  f = await pc();
  ok(f.h < f.vh && f.boton === 'Pantalla completa', `«Salir» la regresa a su tamaño (${f.w}×${f.h})`);
  await pg.locator('#v3d-full').tap(); await espera(500);
  await pg.goBack(); await espera(700);
  f = await pc();
  ok(f.h < f.vh && (await pg.evaluate(() => location.hash)) === '#maqueta3d', `«atrás» sale de la pantalla completa sin salir de la app (${f.w}×${f.h}, ${await pg.evaluate(() => location.hash)})`);

  // 12. ¿se puede seguir bajando por la página?
  const lugar = await pg.evaluate(() => {
    const s = document.getElementById('v3d-stage').getBoundingClientRect();
    return { stage: Math.round(s.height), vh: innerHeight, pct: Math.round((s.height / innerHeight) * 100) };
  });
  console.log(`  · el área 3D mide ${lugar.stage} px de ${lugar.vh} px de alto (${lugar.pct} % de la pantalla)`);
  await pg.evaluate(() => window.scrollTo(0, 0));
  await espera(300);
  const y0 = await pg.evaluate(() => scrollY);
  const lead = await pg.locator('#maqueta3d .lead').boundingBox();
  await gesto([[lead.x + 20, lead.y + lead.height - 5]], [[lead.x + 20, lead.y + lead.height - 5 - 220]], 10);
  const y1 = await pg.evaluate(() => scrollY);
  ok(y1 - y0 > 60, `deslizar fuera del modelo baja la página (${y1 - y0} px)`);

  ok(errores.length === 0, errores.length ? 'errores: ' + errores.join(' | ') : 'sin errores en la página');
  await ctx.close();
}
await browser.close();
srv.kill();
console.log(fallas ? `\n${fallas} falla(s)` : '\nTodo bien');
process.exit(fallas ? 1 : 0);
