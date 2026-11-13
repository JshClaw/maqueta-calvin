#!/usr/bin/env node
// npm run test:app → recorre la app con el dedo en iPad y celular simulados:
// pestañas, abrir un paso y regresar, galería, casillas y avance, «Ver en 3D» y su regreso,
// paso siguiente, enlaces dentro del texto, que nada se salga de lado y que todo lo que se toca mida 40 px o más.
//
// La primera vez instala el navegador de prueba:  npx playwright install chromium
// Opcional: CHROME_PATH=ruta/a/chrome; DEVICES="iPad (gen 11),iPhone 13".
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8897;
const BASE = `http://localhost:${PORT}/`;
const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((ok) => setTimeout(ok, 800));
const EQUIPOS = (process.env.DEVICES || 'iPad (gen 11),iPad Pro 11 landscape,iPhone 13').split(',');
const opts = { args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', ...(process.env.CHROME_ARGS || '').split(' ').filter(Boolean)] };
if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(opts);
let fallas = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fallas++; };
const PANTALLAS = ['inicio', 'funciona', 'armar', 'antes', 'materiales', 'plano', 'dentro', 'paso1', 'paso2', 'paso3', 'paso4', 'paso5', 'paso6', 'paso7', 'paso8', 'clase', 'problemas', 'maqueta3d'];

try {
  for (const nombre of EQUIPOS) {
    console.log('\n' + nombre);
    const ctx = await browser.newContext({ ...devices[nombre], serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', (e) => errores.push(String(e)));
    const espera = (ms) => pg.waitForTimeout(ms);
    const hash = () => pg.evaluate(() => location.hash.slice(1));
    const atras = () => pg.evaluate(() => (document.getElementById('back').hidden ? '' : document.getElementById('backLbl').textContent));
    await pg.goto(BASE, { waitUntil: 'load' });
    await espera(500);

    // 1. pestañas
    const tabs = { armar: 'armar', presentar: 'clase', ver3d: 'maqueta3d', ayuda: 'problemas', inicio: 'inicio' };
    let bienTabs = true;
    for (const [t, id] of Object.entries(tabs)) {
      await pg.tap(`.tb[data-tabbtn="${t}"]`); await espera(350);
      if ((await hash()) !== id || (await atras())) bienTabs = false;
    }
    ok(bienTabs, 'las 5 pestañas abren su pantalla, sin botón de regresar');

    // 1b. botón de modo claro / oscuro
    const tema = () => pg.evaluate(() => [document.documentElement.getAttribute('data-theme'), getComputedStyle(document.body).backgroundColor]);
    const [m0, bg0] = await tema();
    await pg.tap('#tema'); await espera(200);
    const [m1, bg1] = await tema();
    await pg.reload({ waitUntil: 'load' }); await espera(400);
    const [m2] = await tema();
    await pg.tap('#tema'); await espera(200);
    const [m3, bg3] = await tema();
    ok(m0 === null && m1 === 'dark' && bg1 !== bg0 && m2 === 'dark' && m3 === 'light' && bg3 === bg0,
      `botón de tema: claro → ${m1} (fondo ${bg1}), se queda al recargar, y regresa a ${m3}`);

    // 2. Armar → Paso 3 → regresar
    await pg.tap('.tb[data-tabbtn="armar"]'); await espera(350);
    await pg.tap('[data-card="paso3"]'); await espera(450);
    ok((await hash()) === 'paso3' && (await atras()) === 'Armar', `tocar el Paso 3 lo abre, con «‹ ${await atras()}»`);
    await pg.tap('#back'); await espera(450);
    ok((await hash()) === 'armar', 'el botón ‹ regresa a la lista de Armar');
    await pg.tap('[data-card="paso3"]'); await espera(450);

    // 3. galería
    const cnt = () => pg.$eval('#paso3 .gcount', (e) => e.textContent);
    await pg.tap('#paso3 .gnav.next'); await espera(700);
    const c2 = await cnt();
    await pg.tap('#paso3 .gt:nth-child(4)'); await espera(700);
    const c4 = await cnt();
    ok(c2 === '2 / 4' && c4 === '4 / 4', `galería: flecha → ${c2}, miniatura 4 → ${c4}`);
    await pg.tap('#paso3 .gzoom'); await espera(300);
    const abierto = await pg.evaluate(() => !document.getElementById('viewer').hidden && !!document.querySelector('#viewerIn img, #viewerIn svg'));
    await pg.tap('#viewerX'); await espera(200);
    ok(abierto && await pg.evaluate(() => document.getElementById('viewer').hidden), 'la imagen se abre en grande y se cierra');

    // 4. casillas → avance
    await pg.tap('#paso3 .check > li:first-child .ck'); await espera(250);
    const t1 = await pg.$eval('#paso3 [data-prog-t]', (e) => e.textContent);
    const card = await pg.$eval('[data-card="paso3"] em', (e) => e.textContent);
    const marcado = await pg.evaluate(() => JSON.parse(localStorage.getItem('calvin-manual-pasos') || '{}')['paso3-0'] === true);
    ok(t1 === '1 de 17 hechas' && card === '1/17' && marcado, `marcar una casilla: «${t1}», tarjeta en Armar «${card}», se guarda`);
    await pg.tap('#paso3 .check > li:first-child .ck'); await espera(250);

    // 5. Ver en 3D y regresar al paso
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.tap('#paso3 [data-ver3d]'); await espera(1500);
    ok((await hash()) === 'maqueta3d' && (await atras()) === 'Paso 3', `«Ver en 3D» abre el 3D con «‹ ${await atras()}»`);
    await pg.tap('#back'); await espera(450);
    ok((await hash()) === 'paso3', 'y el botón ‹ regresa al Paso 3');

    // 6. paso siguiente (el botón ‹ sigue llevando a Armar)
    await pg.tap('#paso3 .fin .btn.pri'); await espera(450);
    ok((await hash()) === 'paso4' && (await atras()) === 'Armar', `«Siguiente» abre el Paso 4 y ‹ sigue diciendo «${await atras()}»`);

    // 7. enlace dentro del texto de una casilla
    await pg.evaluate(() => { location.hash = 'paso1'; }); await espera(450);
    await pg.tap('#paso1 .ck .lnk'); await espera(450);
    const sinMarcar = await pg.evaluate(() => !document.querySelector('#paso1 .check > li:first-child input').checked);
    ok((await hash()) === 'materiales' && sinMarcar, 'un enlace dentro de una casilla abre su pantalla sin marcar la casilla');

    // 8. último paso → Presentar
    await pg.evaluate(() => { location.hash = 'paso8'; }); await espera(450);
    await pg.tap('#paso8 .fin .btn.pri'); await espera(450);
    const tabAct = await pg.$eval('.tb[aria-current="page"]', (e) => e.dataset.tabbtn);
    ok((await hash()) === 'clase' && tabAct === 'presentar', 'al terminar el Paso 8, el botón lleva a Presentar');

    // 9. cada pantalla: nada se sale de lado y todo lo que se toca mide 40 px o más
    const anchas = [], chicos = [];
    for (const id of PANTALLAS) {
      await pg.evaluate((id) => { location.hash = id; }, id);
      await espera(id === 'maqueta3d' ? 1500 : 450);
      const r = await pg.evaluate((id) => {
        const W = document.documentElement.clientWidth;
        const s = document.getElementById(id);
        const peq = [];
        s.querySelectorAll('button, a.btn, a.lnk, .ck, .mrow, .seg label, .sw, summary').forEach((el) => {
          if (el.closest('[hidden]') || el.offsetParent === null || el.closest('.gtrack') || el.classList.contains('mk')) return;
          const b = el.getBoundingClientRect();
          if (el.classList.contains('lnk')) return;   // enlaces dentro de un párrafo
          if (b.height < 39.5 || b.width < 39.5) peq.push(`${(el.id || el.textContent.trim().slice(0, 18) || el.className)} ${Math.round(b.width)}×${Math.round(b.height)}`);
        });
        return { ancho: document.documentElement.scrollWidth - W, peq };
      }, id);
      if (r.ancho > 0) anchas.push(`${id} (+${r.ancho} px)`);
      chicos.push(...r.peq.map((x) => `${id}: ${x}`));
    }
    ok(!anchas.length, anchas.length ? `scroll de lado en: ${anchas.join(', ')}` : `ninguna de las ${PANTALLAS.length} pantallas se sale de lado`);
    ok(!chicos.length, chicos.length ? `cosas de menos de 40 px: ${chicos.slice(0, 8).join(' · ')}` : 'todo lo que se toca mide 40 px o más');

    ok(errores.length === 0, errores.length ? 'errores: ' + errores.join(' | ') : 'sin errores en la página');
    await ctx.close();
  }
} finally {
  await browser.close();
  srv.kill();
}
console.log(fallas ? `\n${fallas} falla(s)` : '\nTodo bien');
process.exit(fallas ? 1 : 0);
