// ===================================================================== visor 3D / 4D de la maqueta
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { crearMaqueta, crearEscena } from './maqueta.js';

const $ = (s, r = document) => r.querySelector(s);
const wrap = $('#v3d');
const stage = $('#v3d-stage');
const estado = $('#v3d-status');

const INTERIOR = { brazo: 'transparente', postes: 'sinTapa' };
const ETAPAS = ['Fijación', 'Reducción', 'Regeneración'];
const CAM0 = [52, 58, 92], TGT0 = [0, 4, 2];
// Sensación al tocar (ajustables):
const GIRO_ANCHO = 240;    // grados que gira al deslizar el dedo de lado a lado del modelo, en cualquier pantalla
const SUAVE = 0.2;         // qué tanto alcanza la cámara al dedo en cada cuadro de 60 Hz (1 = sin suavizar)
const INERCIA = 0.28;      // segundos que tarda en frenar el giro al soltar un dedo en movimiento
const TORCER = 10 * Math.PI / 180;   // cuánto hay que torcer dos dedos para que empiece a girar (así pellizcar no la gira)
const reducirMov = matchMedia('(prefers-reduced-motion: reduce)');

let M, S, R, controls, raf = 0, activo = false;
let t = 0, playing = false, speed = 1, last = 0;
let modo = 'completa';
let armando = false;
let vuelo = null;
let impulso = null;        // giro que sigue solo después de soltar el dedo (rad/s)
let sucio = true;          // hay que volver a pintar
const marcadores = [];

function colorFondo() {
  return getComputedStyle(document.documentElement).getPropertyValue('--stage').trim() || '#DAE3EE';
}

export async function iniciar() {
  if (M) return;
  estado.textContent = 'Cargando la maqueta…';
  try {
    R = new THREE.WebGLRenderer({ antialias: true });
  } catch (e) {
    estado.textContent = 'Tu navegador no pudo abrir el visor 3D (WebGL). Mira los renders y videos de cada paso.';
    wrap.classList.add('sin3d');
    return;
  }
  const w = stage.clientWidth, h = stage.clientHeight;
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  R.setSize(w, h);
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.toneMapping = THREE.NeutralToneMapping;
  R.outputColorSpace = THREE.SRGBColorSpace;
  stage.prepend(R.domElement);
  S = crearEscena(R, w, h);
  if (w < 700) S.key.shadow.mapSize.set(1024, 1024);
  S.scene.background = new THREE.Color(colorFondo());
  const layout = window.__LAYOUT;
  M = await crearMaqueta({ layout, texBase: '3d/tex/', texExt: { vinil: '.jpg' }, texData: window.__TEX });
  S.scene.add(M.root);
  S.camera.position.set(...CAM0);
  controls = new OrbitControls(S.camera, R.domElement);
  controls.target.set(...TGT0);
  controls.enableDamping = true;
  // El suavizado de OrbitControls se aplica en cada llamada a update(), y la llama en cada movimiento del dedo y en
  // cada cuadro: se sentía distinto con el dedo quieto o moviéndose, y en un iPad de 120 Hz que en uno de 60 Hz.
  // Aquí se calcula con el tiempo real que pasó, así se siente igual en todos.
  const updateOrig = controls.update.bind(controls);
  let tUpd = performance.now();
  controls.update = (d) => {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - tUpd) / 1000));
    tUpd = now;
    controls.dampingFactor = 1 - Math.pow(1 - SUAVE, dt * 60);
    return updateOrig(d);
  };
  controls.minDistance = 3;
  controls.maxDistance = 230;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.zoomToCursor = true;          // el zoom va hacia donde apunta el mouse o los dedos
  controls.screenSpacePanning = true;
  controls.zoomSpeed = 1.15;
  controls.update();
  controls.addEventListener('start', () => { vuelo = null; impulso = null; ocultarAyuda(); });
  controls.addEventListener('change', () => kick());   // al girar, mover o hacer zoom con el dedo o el mouse
  armarNavegacion();
  armarDedos();
  armarPantallaCompleta();
  sensibilidad(w, h);
  estado.textContent = '';
  estado.hidden = true;
  armarUI();
  new ResizeObserver(() => ajustar()).observe(stage);
  const mo = new MutationObserver(() => { S.scene.background = new THREE.Color(colorFondo()); kick(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { S.scene.background = new THREE.Color(colorFondo()); kick(); });
  aplicarModo();
  pintar();
  if (activo) loop();
}

function ajustar() {
  if (!R) return;
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;      // diapositiva oculta
  R.setSize(w, h);
  sensibilidad(w, h);
  S.camera.aspect = w / h;
  S.camera.updateProjectionMatrix();
  kick();
}

function pendiente() {
  const d = controls._sphericalDelta, p = controls._panOffset;
  return Math.abs(d.theta) > 1e-4 || Math.abs(d.phi) > 1e-4 || p.lengthSq() > 1e-6;
}

// OrbitControls gira 360° por cada alto del recuadro: en un recuadro chico (o ancho) giraba de más.
// Así, deslizar de lado a lado del modelo gira siempre GIRO_ANCHO grados.
function sensibilidad(w, h) {
  if (controls && w && h) controls.rotateSpeed = (GIRO_ANCHO / 360) * (h / w);
}

export function camara() { return { pos: S.camera.position.toArray(), target: controls.target.toArray() }; }

export function activar(on) {
  activo = on;
  if (on && M) { last = performance.now(); sucio = true; loop(); }
  if (!on) { cancelAnimationFrame(raf); raf = 0; playing = false; syncPlay(); pantallaCompleta(false); }
}

// ------------------------------------------------------------------ pantalla completa
// Donde se puede (Android, iPad, computadora) se usa la pantalla completa del navegador; en iPhone no existe
// para algo que no sea un video, así que ahí la maqueta solo crece y tapa la app (que es lo mismo, menos la barra de Safari).
let grande = false, conHistoria = false;
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;
const fsSePuede = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) && !!(stage.requestFullscreen || stage.webkitRequestFullscreen);

async function pantallaCompleta(on, porAtras = false) {
  if (on === grande) return;
  grande = on;
  stage.classList.toggle('full', on);
  document.documentElement.classList.toggle('v3d-full', on);
  const b = $('#v3d-full');
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  b.setAttribute('aria-label', on ? 'Salir de pantalla completa' : 'Ver en pantalla completa');
  b.title = on ? 'Salir de pantalla completa' : 'Pantalla completa';
  b.querySelector('.t').textContent = on ? 'Salir' : 'Pantalla completa';
  if (on) {
    // el botón «atrás» de Android (o el gesto) sale de la pantalla completa en lugar de cerrar la app
    try { history.pushState({ v3dFull: 1 }, ''); conHistoria = true; } catch (e) { conHistoria = false; }
    if (fsSePuede() && !fsEl()) {
      try { await (stage.requestFullscreen ? stage.requestFullscreen({ navigationUI: 'hide' }) : stage.webkitRequestFullscreen()); } catch (e) { /* se queda la versión que tapa la app */ }
    }
  } else {
    if (fsEl() === stage) {
      try { await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen()); } catch (e) { /* nada */ }
    }
    if (conHistoria && !porAtras) { conHistoria = false; history.back(); }
    conHistoria = false;
  }
  ajustar();
  kick();
}

function armarPantallaCompleta() {
  $('#v3d-full').addEventListener('click', () => pantallaCompleta(!grande));
  const alSalirDelNavegador = () => { if (grande && fsEl() !== stage) pantallaCompleta(false); };
  document.addEventListener('fullscreenchange', alSalirDelNavegador);
  document.addEventListener('webkitfullscreenchange', alSalirDelNavegador);
  window.addEventListener('popstate', () => { if (grande) pantallaCompleta(false, true); });
  // Esc sale de la pantalla completa (antes de que la app lo use para regresar)
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && grande) { e.preventDefault(); pantallaCompleta(false); } }, true);
}

function loop() {
  cancelAnimationFrame(raf);
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (playing) {
      t += dt * speed;
      if (t >= M.duracion) { t = M.duracion; playing = false; syncPlay(); }
      syncTiempo();
    }
    if (armando) {
      M.view.armado = Math.min(M.partes.length, M.view.armado + dt * 1.6);
      syncArmado();
      if (M.view.armado >= M.partes.length) { armando = false; $('#v3d-armar').textContent = 'Armar pieza por pieza'; }
    }
    if (impulso) {
      controls._rotateLeft(impulso.x * dt);
      controls._rotateUp(impulso.y * dt);
      const f = Math.exp(-dt / INERCIA);
      impulso.x *= f; impulso.y *= f;
      if (Math.hypot(impulso.x, impulso.y) < 0.03) impulso = null;
    }
    let enVuelo = false;
    if (vuelo) {
      enVuelo = true;
      vuelo.u = Math.min(1, vuelo.u + dt / 0.9);
      const k = vuelo.u < 0.5 ? 4 * vuelo.u ** 3 : 1 - (-2 * vuelo.u + 2) ** 3 / 2;
      S.camera.position.lerpVectors(vuelo.p0, vuelo.p1, k);
      controls.target.lerpVectors(vuelo.t0, vuelo.t1, k);
      if (vuelo.u >= 1) vuelo = null;
    }
    controls.target.clamp(LIM_MIN, LIM_MAX);  // que la maqueta nunca se pierda de vista
    // true mientras la cámara sigue moviéndose (inercia). Si en este cuadro no avanzó (dos update() en el mismo
    // milisegundo) pero todavía le falta giro o desplazamiento, también hay que seguir: si no, se quedaba a medias
    const movio = controls.update() || pendiente();
    const sigue = playing || armando || enVuelo || movio || !!impulso;
    // solo se pinta cuando algo cambió: quieta, la maqueta no gasta batería
    if (sucio || sigue) pintar();
    sucio = false;
    raf = activo && sigue ? requestAnimationFrame(tick) : 0;
  };
  last = performance.now();
  raf = requestAnimationFrame(tick);
}

function pintar() {
  const s = M.aplicar(t);
  R.render(S.scene, S.camera);
  // qué pasa ahora (lo dice la línea de tiempo del modelo)
  $('#v3d-fase').textContent = s.txt || '';
  const et = s.stage >= 0 ? ETAPAS[s.stage] : ((s.phase || '').startsWith('back') ? 'Recarga' : 'En espera');
  const chip = $('#v3d-etapa');
  chip.textContent = et;
  chip.dataset.s = s.stage >= 0 ? String(s.stage) : (et === 'Recarga' ? 'r' : '');
  // marcadores
  const v = new THREE.Vector3();
  const w = stage.clientWidth, h = stage.clientHeight;
  for (const m of marcadores) {
    const o = m.hs.obj;
    if (!o.visible || !visibleArbol(o)) { m.el.hidden = true; continue; }
    o.getWorldPosition(v);
    v.add(new THREE.Vector3(...m.hs.offset));
    const dist = v.distanceTo(S.camera.position);
    v.project(S.camera);
    const fuera = v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05;
    m.el.hidden = fuera || !$('#v3d-puntos').checked || (modo === 'completa' && M.view.explode < 0.3 && !!INTERIOR[m.hs.id]);
    if (!fuera) {
      m.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
      m.el.style.zIndex = String(1000 - Math.round(dist));
    }
  }
}

function visibleArbol(o) {
  for (let p = o; p; p = p.parent) if (!p.visible) return false;
  return true;
}

// ---------------------------------------------------------------- interfaz
function armarUI() {
  const tl = $('#v3d-t');
  tl.max = String(M.duracion);
  tl.step = '0.01';
  tl.addEventListener('input', () => { t = +tl.value; playing = false; syncPlay(); syncTiempo(); kick(); });
  $('#v3d-play').addEventListener('click', () => {
    if (t >= M.duracion - 0.01) t = 0;
    playing = !playing; syncPlay(); kick();
  });
  $('#v3d-vel').addEventListener('click', (e) => {
    speed = speed === 1 ? 0.5 : speed === 0.5 ? 2 : 1;
    e.currentTarget.textContent = `${speed}×`;
  });
  document.querySelectorAll('[data-saltar]').forEach((b) => b.addEventListener('click', () => {
    t = +b.dataset.saltar; playing = true; syncPlay(); syncTiempo(); kick();
  }));
  document.querySelectorAll('[name="v3d-modo"]').forEach((r) => r.addEventListener('change', () => { modo = r.value; aplicarModo(); kick(); }));
  $('#v3d-desp').addEventListener('input', (e) => {
    const antes = M.view.explode;
    M.view.explode = +e.target.value;
    if (antes < 0.05 && M.view.explode >= 0.05 && S.camera.position.distanceTo(controls.target) < 120) {
      $('#v3d-card').hidden = true;
      volarA(new THREE.Vector3(96, 88, 128), new THREE.Vector3(0, 12, 2));
    }
    kick();
  });
  const arm = $('#v3d-arm');
  arm.max = String(M.partes.length);
  arm.value = String(M.partes.length);
  arm.addEventListener('input', () => { armando = false; M.view.armado = +arm.value; syncArmado(); kick(); });
  $('#v3d-armar').addEventListener('click', (e) => {
    if (armando) { armando = false; e.currentTarget.textContent = 'Armar pieza por pieza'; return; }
    M.view.armado = 0; armando = true; e.currentTarget.textContent = 'Detener';
    t = 0; playing = false; syncPlay(); syncTiempo();
    M.view.explode = 0; $('#v3d-desp').value = '0';
    volarA(new THREE.Vector3(70, 68, 104), new THREE.Vector3(0, 3, 0));
    kick();
  });
  $('#v3d-solapas').addEventListener('change', (e) => { M.view.flaps = e.target.checked ? [1, 1] : [0, 0]; kick(); });
  $('#v3d-resalte').addEventListener('change', (e) => { M.view.resalte = e.target.checked; kick(); });
  $('#v3d-puntos').addEventListener('change', () => kick());
  $('#v3d-reset').addEventListener('click', () => { volarA(new THREE.Vector3(...CAM0), new THREE.Vector3(...TGT0)); kick(); });
  syncArmado();
  syncTiempo();
  // puntos de verificación
  const lista = $('#v3d-lista');
  const KEY = 'calvin-manual-verificado';
  let ok = {};
  try { ok = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { ok = {}; }
  const contar = () => { $('#v3d-ok').textContent = `${M.hotspots.filter((h) => ok[h.id]).length} de ${M.hotspots.length} revisados`; };
  M.hotspots.forEach((hs, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mk';
    b.textContent = String(i + 1);
    b.setAttribute('aria-label', hs.titulo);
    b.addEventListener('click', () => enfocar(i));
    $('#v3d-marks').appendChild(b);
    marcadores.push({ hs, el: b });
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = !!ok[hs.id];
    cb.setAttribute('aria-label', 'Revisado: ' + hs.titulo);
    cb.addEventListener('change', () => { ok[hs.id] = cb.checked; try { localStorage.setItem(KEY, JSON.stringify(ok)); } catch (e) { /* nada */ } contar(); });
    const bt = document.createElement('button');
    bt.type = 'button';
    bt.innerHTML = `<span class="n">${i + 1}</span><span></span>`;
    bt.lastChild.textContent = hs.titulo;
    bt.addEventListener('click', () => enfocar(i));
    li.append(cb, bt);
    lista.appendChild(li);
  });
  contar();
  $('#v3d-card-x').addEventListener('click', () => { $('#v3d-card').hidden = true; });
}

function enfocar(i) {
  const hs = M.hotspots[i];
  // cada punto se ve en su modo: los de abajo de la tapa sin tapa o transparente; los de arriba, con la tapa normal
  ponerModo(INTERIOR[hs.id] || 'completa');
  M.view.armado = M.partes.length; $('#v3d-arm').value = String(M.partes.length); syncArmado();
  M.view.explode = 0; $('#v3d-desp').value = '0';
  M.aplicar(t);
  const p = new THREE.Vector3();
  hs.obj.getWorldPosition(p);
  const dir = S.camera.position.clone().sub(controls.target).normalize();
  if (dir.y < 0.45) { dir.y = 0.45; dir.normalize(); }
  const dist = ['regen', 'paradas'].includes(hs.id) ? 46 : hs.id === 'perilla' ? 24 : 34;
  volarA(p.clone().add(dir.multiplyScalar(dist)), p);
  const card = $('#v3d-card');
  card.hidden = false;
  ocultarAyuda();
  $('#v3d-card-n').textContent = String(i + 1);
  $('#v3d-card-t').textContent = hs.titulo;
  $('#v3d-card-p').textContent = hs.texto;
  document.querySelectorAll('#v3d-lista li').forEach((li, k) => li.classList.toggle('cur', k === i));
  kick();
}

// ------------------------------------------------------------------ navegación: girar / mover, zoom, doble clic
const LIM_MIN = new THREE.Vector3(-48, -4, -48);
const LIM_MAX = new THREE.Vector3(48, 34, 48);
const tactil = matchMedia('(pointer: coarse)').matches;
let mover = false;

function ocultarAyuda() {
  const h = $('#v3d-help');
  if (h && !h.hidden) { h.classList.add('fuera'); setTimeout(() => { h.hidden = true; }, 400); }
}

function setMover(on) {
  mover = on;
  controls.mouseButtons.LEFT = on ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  controls.touches.ONE = on ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  $('#v3d-girar').setAttribute('aria-pressed', on ? 'false' : 'true');
  $('#v3d-mover').setAttribute('aria-pressed', on ? 'true' : 'false');
}

function zoomPaso(f) {
  const off = S.camera.position.clone().sub(controls.target);
  const d = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance);
  volarA(controls.target.clone().add(off.setLength(d)), controls.target.clone());
  kick();
}

function visibleDeVerdad(o) {
  for (let x = o; x; x = x.parent) if (!x.visible) return false;
  const m = Array.isArray(o.material) ? o.material[0] : o.material;
  return !(m && m.transparent && m.opacity < 0.5);
}

const ray = new THREE.Raycaster();
function acercarA(cx, cy) {
  const r = R.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), S.camera);
  const hit = ray.intersectObject(M.root, true).find((h) => visibleDeVerdad(h.object));
  if (!hit) return;
  const p = hit.point;
  const off = S.camera.position.clone().sub(controls.target);
  const d = THREE.MathUtils.clamp(off.length() * 0.4, 8, 35);
  volarA(p.clone().add(off.setLength(d)), p.clone());
  ocultarAyuda();
  kick();
}

function armarNavegacion() {
  const help = $('#v3d-help');
  help.textContent = tactil
    ? 'Un dedo: girar · dos dedos: mover, zoom o torcer para girar · doble toque: acercarte ahí'
    : 'Arrastra: girar · clic derecho o Shift + arrastrar: mover · rueda: zoom hacia el mouse · doble clic: acercarte ahí';
  $('#v3d-girar').addEventListener('click', () => setMover(false));
  $('#v3d-mover').addEventListener('click', () => setMover(true));
  $('#v3d-mas').addEventListener('click', () => zoomPaso(0.7));
  $('#v3d-menos').addEventListener('click', () => zoomPaso(1.45));
  $('#v3d-centro').addEventListener('click', () => { volarA(new THREE.Vector3(...CAM0), new THREE.Vector3(...TGT0)); kick(); });
  // doble clic o doble toque: acercarse a ese punto
  let ultimo = { t: 0, x: 0, y: 0 }, abajo = null;
  R.domElement.addEventListener('pointerdown', (e) => { abajo = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  R.domElement.addEventListener('pointerup', (e) => {
    if (!abajo || Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 8 || performance.now() - abajo.t > 350) { abajo = null; return; }
    const now = performance.now();
    if (now - ultimo.t < 380 && Math.hypot(e.clientX - ultimo.x, e.clientY - ultimo.y) < 30) { acercarA(e.clientX, e.clientY); ultimo.t = 0; }
    else ultimo = { t: now, x: e.clientX, y: e.clientY };
    abajo = null;
  });
  setMover(false);
}

// ------------------------------------------------------------------ dedos: torcer para girar, e inercia al soltar
function armarDedos() {
  const el = R.domElement;
  const dedos = new Map();      // pointerId → { x, y }
  let ang = null, acum = 0, torciendo = false;
  let huella = [];              // últimas posiciones de un solo dedo, para medir qué tan rápido iba al soltarlo
  const angulo = () => { const [a, b] = [...dedos.values()]; return Math.atan2(b.y - a.y, b.x - a.x); };
  const reiniciar = () => { ang = dedos.size === 2 ? angulo() : null; acum = 0; torciendo = false; huella = []; controls.zoomToCursor = true; };
  el.addEventListener('pointerdown', (e) => {
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    impulso = null;
    reiniciar();
    if (dedos.size === 1) huella.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
  });
  el.addEventListener('pointermove', (e) => {
    if (!dedos.has(e.pointerId)) return;
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dedos.size === 1) {
      huella.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
      while (huella.length > 2 && e.timeStamp - huella[0].t > 100) huella.shift();
      return;
    }
    if (dedos.size !== 2 || ang === null) return;
    // torcer dos dedos, como en Mapas o Fotos: la maqueta gira sobre la mesa hacia donde giran los dedos
    const a = angulo();
    let d = a - ang;
    ang = a;
    if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
    if (!torciendo) {
      acum += d;
      if (Math.abs(acum) < TORCER) return;
      torciendo = true;
      // mientras se tuerce, el zoom va al centro: «acercar hacia los dedos» empujaba la vista de lado en cada
      // movimiento de un solo dedo (Safari los manda por separado) y la maqueta se iba moviendo al girarla
      controls.zoomToCursor = false;
      d = acum - Math.sign(acum) * TORCER;
    }
    controls._rotateLeft(-d);
    kick();
  });
  const soltar = (e) => {
    if (!dedos.has(e.pointerId)) return;
    const solo = dedos.size === 1 && e.type === 'pointerup';
    dedos.delete(e.pointerId);
    // se soltó el único dedo mientras iba girando (no en modo Mover): la maqueta sigue un poco y frena sola
    if (solo && !mover && !reducirMov.matches && huella.length >= 2 && e.timeStamp - huella[huella.length - 1].t < 80) {
      const p0 = huella[0], p1 = huella[huella.length - 1];
      const dt = (p1.t - p0.t) / 1000;
      if (dt >= 0.01) {
        const vx = (p1.x - p0.x) / dt, vy = (p1.y - p0.y) / dt;
        if (Math.hypot(vx, vy) > 350) {
          // mismo cálculo que OrbitControls al arrastrar, pero por segundo
          const k = (2 * Math.PI * controls.rotateSpeed) / el.clientHeight;
          impulso = { x: vx * k, y: vy * k };
          kick();
        }
      }
    }
    reiniciar();
  };
  el.addEventListener('pointerup', soltar);
  el.addEventListener('pointercancel', soltar);
  // Safari: que pellizcar sobre el modelo no haga zoom a toda la página
  for (const g of ['gesturestart', 'gesturechange', 'gestureend']) stage.addEventListener(g, (e) => e.preventDefault(), { passive: false });
}

function volarA(p1, t1) {
  vuelo = { u: 0, p0: S.camera.position.clone(), p1, t0: controls.target.clone(), t1 };
}

function ponerModo(m) {
  modo = m;
  const r = document.querySelector(`[name="v3d-modo"][value="${m}"]`);
  if (r) r.checked = true;
  aplicarModo();
}

function aplicarModo() {
  if (!M) return;
  M.view.sinTapa = modo === 'sinTapa';
  M.setTapaAlpha(modo === 'transparente' ? 0.18 : 1);
}

function syncPlay() {
  const b = $('#v3d-play');
  if (!b) return;
  b.textContent = playing ? 'Pausa' : (t >= (M?.duracion ?? 1) - 0.01 ? 'Repetir' : 'Reproducir');
  b.setAttribute('aria-pressed', playing ? 'true' : 'false');
}
function syncTiempo() {
  $('#v3d-t').value = String(t);
  $('#v3d-tl').textContent = `${t.toFixed(1)} s / ${M.duracion.toFixed(0)} s`;
}
function syncArmado() {
  const a = M.view.armado;
  const n = M.partes.length;
  const k = Math.min(n - 1, Math.max(0, Math.ceil(a) - 1));
  $('#v3d-arm').value = String(a);
  $('#v3d-arml').textContent = a >= n ? `Completa (${n} de ${n} piezas)` : `${M.partes[k].nombre} · Paso ${M.partes[k].paso} (${Math.ceil(a)} de ${n})`;
}

function kick() {
  sucio = true;
  if (activo && !raf) loop();
}

// atajos desde otras diapositivas: ver3d({ armado, punto })
export function preset(p) {
  if (!M) return;
  if (p.punto) {
    const i = M.hotspots.findIndex((h) => h.id === p.punto);
    if (i >= 0) setTimeout(() => enfocar(i), 60);
  }
  if (p.armado != null) {
    M.view.armado = p.armado; armando = false; syncArmado();
    M.view.explode = 0; $('#v3d-desp').value = '0';
    $('#v3d-card').hidden = true;
    if (!p.modo) ponerModo('completa');
    volarA(new THREE.Vector3(...CAM0), new THREE.Vector3(...TGT0));
  }
  if (p.t != null) { t = p.t; syncTiempo(); }
  if (p.modo) {
    modo = p.modo;
    const r = document.querySelector(`[name="v3d-modo"][value="${p.modo}"]`);
    if (r) r.checked = true;
    aplicarModo();
  }
  kick();
}
