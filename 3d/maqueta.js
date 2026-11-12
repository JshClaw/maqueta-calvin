// Maqueta manual del ciclo de Calvin (con perilla) — modelo 3D (unidades: centímetros)
// Mundo: X = x_plano − 30 (derecha), Z = y_plano − 30 (hacia el frente), Y hacia arriba. La mesa está en Y = 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W = (x) => x - 30;
const Zp = (y) => y - 30;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const eio = (u) => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const prog = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));

function std(color, rough = 0.6, metal = 0, extra = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));
}
function cast(o, c = true, r = true) { o.traverse((m) => { if (m.isMesh) { m.castShadow = c; m.receiveShadow = r; } }); return o; }
function box(w, h, d, mat, x = 0, y = 0, z = 0, round = 0) {
  const g = round > 0 ? new RoundedBoxGeometry(w, h, d, 2, round) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  return m;
}
function cyl(r, h, mat, x = 0, y = 0, z = 0, seg = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.position.set(x, y, z);
  return m;
}
function planeTop(w, d, tex, y, extra = {}) {
  const g = new THREE.PlaneGeometry(w, d);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial(Object.assign({ map: tex, roughness: 0.85 }, extra)));
  m.position.y = y;
  m.receiveShadow = true;
  return m;
}
function tube(points, radius, color, rough = 0.5) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal');
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 8, false), std(color, rough));
  m.castShadow = true;
  return m;
}

// ------------------------------------------------------------------ línea de tiempo de una vuelta (todo se mueve a mano)
// Cada evento dice quién actúa (foco) y qué decir (txt). El vagón se mide en grados horarios desde RuBP.
export function crearLineaDeTiempo() {
  const ev = [];
  let t = 1.0;
  const mv = (a, b, d, stage, txt) => { ev.push({ k: 'move', t0: t, t1: t + d, a, b, stage, focus: 'perilla', txt }); t += d; };
  const act = (k, d, extra = {}) => { ev.push(Object.assign({ k, t0: t, t1: t + d }, extra)); t += d; };
  const wait = (d, stage, focus, txt) => { ev.push({ k: 'wait', t0: t, t1: t + d, stage, focus, txt }); t += d; };
  mv(0, 45, 2.2, 0, 'Gira la perilla: el vagón va a la parada 1');
  act('pinzaOut', 0.9, { stage: 0, focus: 'pinza', txt: 'RuBisCO: la pinza atrapa el CO₂' });
  wait(1.1, 0, 'pinza', 'El CO₂ se une a la RuBP');
  act('pinzaBack', 0.9, { stage: 0, focus: 'pinza', txt: 'La pinza regresa a su lugar' });
  mv(45, 90, 2.0, 0, 'Gira la perilla hasta la parada 2');
  wait(1.6, 0, 'pga', 'Se forman 6 moléculas de 3-PGA');
  mv(90, 135, 2.0, 1, 'Gira la perilla hasta la parada 3');
  act('flip0', 1.2, { stage: 1, focus: 'atp', txt: 'Voltea la tarjeta: 6 ATP → 6 ADP' });
  mv(135, 175, 1.8, 1, 'Gira la perilla hasta la parada 4');
  act('flip1', 1.2, { stage: 1, focus: 'nadph', txt: 'Voltea la tarjeta: 6 NADPH → 6 NADP⁺' });
  mv(175, 225, 2.0, 1, 'Gira la perilla hasta la parada 5');
  wait(0.7, 1, 'g3p', 'Ya hay 6 G3P');
  act('gateOpen', 0.5, { stage: 1, focus: 'gate', txt: 'Abre la compuerta' });
  act('slide', 1.5, { stage: 1, focus: 'glucosa', txt: 'Sale 1 G3P: media glucosa' });
  act('gateClose', 0.5, { stage: 1, focus: 'gate', txt: 'Cierra la compuerta' });
  mv(225, 303, 2.6, 2, 'Gira la perilla hasta la parada 6');
  wait(1.8, 2, 'regen', 'Los 5 G3P se rearman en 3 RuBP');
  mv(303, 335, 1.6, 2, 'Gira la perilla hasta la parada 7');
  act('flip2', 1.2, { stage: 2, focus: 'atp3', txt: 'Voltea la tarjeta: 3 ATP → 3 ADP' });
  mv(335, 360, 1.4, 2, 'Gira la perilla: el vagón regresa a RuBP');
  act('back0', 1.0, { stage: -1, focus: 'atp', txt: 'Fase luminosa: recarga el ATP' });
  act('back1', 1.0, { stage: -1, focus: 'nadph', txt: 'Fase luminosa: recarga el NADPH' });
  act('back2', 1.0, { stage: -1, focus: 'atp3', txt: 'Fase luminosa: recarga el ATP' });
  wait(1.2, -1, null, 'Vuelta completa: lista para otra');
  return { ev, total: t };
}

export function estadoEn(TL, t) {
  const s = { angle: 0, stage: -1, moving: false, pinza: 0, cards: [0, 0, 0], gate: 0, slide: 0, idle: 0, phase: '', focus: null, txt: '' };
  for (const e of TL.ev) {
    if (t < e.t0) break;
    const u = prog(t, e.t0, e.t1);
    const active = t <= e.t1;
    switch (e.k) {
      case 'move': s.angle = e.a + (e.b - e.a) * eio(u); if (active) s.moving = true; break;
      case 'pinzaOut': s.pinza = eio(u); break;
      case 'pinzaBack': s.pinza = 1 - eio(u); break;
      case 'flip0': s.cards[0] = eio(u); break;
      case 'flip1': s.cards[1] = eio(u); break;
      case 'flip2': s.cards[2] = eio(u); break;
      case 'back0': s.cards[0] = 1 - eio(u); break;
      case 'back1': s.cards[1] = 1 - eio(u); break;
      case 'back2': s.cards[2] = 1 - eio(u); break;
      case 'gateOpen': s.gate = eio(u); break;
      case 'slide': s.gate = 1; break;
      case 'gateClose': s.gate = 1 - eio(u); break;
      default: break;
    }
    if (e.stage !== undefined) s.stage = e.stage;
    if (active) { s.phase = e.k; s.focus = e.focus ?? null; s.txt = e.txt ?? ''; }
  }
  if (t < TL.ev[0].t0) { s.idle = 1; s.focus = 'perilla'; s.txt = 'Listos: vagón en RuBP y tarjetas cargadas'; s.stage = -1; }
  if (t >= TL.ev.at(-1).t1) { s.stage = -1; s.focus = null; s.txt = 'Vuelta completa: lista para otra'; }
  // la pieza G3P regresa a su lugar solo al reiniciar la vuelta
  const slideEv = TL.ev.find((e) => e.k === 'slide');
  s.slide = t < slideEv.t0 ? 0 : clamp((t - slideEv.t0) / (slideEv.t1 - slideEv.t0));
  return s;
}

// ------------------------------------------------------------------ construcción
export async function crearMaqueta(opts = {}) {
  const base = opts.texBase ?? 'tex/';
  const L = opts.layout;
  const loader = new THREE.TextureLoader();
  const loadT = async (n, srgb = true) => {
    const t = await loader.loadAsync((opts.texData && opts.texData[n]) || base + n);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const names = ['vinil', 'mdf', 'card_atp', 'card_adp', 'card_nadph', 'card_nadp', 'card_atp3', 'card_adp3', 'sign_title',
    'sign_sun', 'flap1', 'flap2', 'ans1', 'ans2', 'glucose', 'perilla'];
  const T = {};
  const ext = opts.texExt ?? {};
  await Promise.all(names.map(async (n) => { T[n] = await loadT(n + (ext[n] ?? '.png')); }));
  T.mdf.wrapS = T.mdf.wrapT = THREE.RepeatWrapping;
  T.mdf.repeat.set(3, 3);

  const WALL = L.box.wallH;            // alto de las paredes
  const UNDER = 0.6 + WALL;            // cara de abajo de la tapa
  const TOP = UNDER + 0.6;             // superficie de la tapa
  const KN = L.knob, AR = L.arm;
  const VAGON_R = AR.magR;

  const root = new THREE.Group();
  const caja = new THREE.Group();       // fondo, paredes y postes
  const tapa = new THREE.Group();       // tapa con todo lo que lleva encima
  const mec = new THREE.Group();        // palo + brazo + perilla: una sola pieza que gira
  root.add(caja, tapa, mec);
  const MDF = std('#FFFFFF', 0.78, 0, { map: T.mdf });
  const PINO = std('#E3C996', 0.72);
  const WHITE = std('#FAFAF7', 0.85);
  const DARKBRICK = std('#3E444B', 0.38);
  const PLATE = std('#D3D8DE', 0.55);
  const NICKEL = std('#C9CDD2', 0.28, 0.4);
  const ZINC = std('#B7BCC2', 0.32, 0.75);
  const FIELTRO = std('#5E5852', 0.95);
  const BAMBU = std('#D8BE85', 0.6);
  const hotspots = [];
  const hs = (id, titulo, texto, obj, offset = [0, 0, 0]) => hotspots.push({ id, titulo, texto, obj, offset });
  const torre = (h) => cast(box(2, h, 2, PINO, 0, h / 2, 0, 0.04));
  const cabeza = () => {        // cabeza de tornillo de cruz
    const g = new THREE.Group();
    g.add(cast(cyl(0.34, 0.1, ZINC, 0, 0.05, 0, 18)));
    g.add(box(0.42, 0.012, 0.07, std('#6E747A', 0.5, 0.6), 0, 0.105, 0), box(0.07, 0.012, 0.42, std('#6E747A', 0.5, 0.6), 0, 0.105, 0));
    return g;
  };

  // ---------------- caja (paredes de WALL cm)
  const fondo = box(60, 0.6, 60, MDF, 0, 0.3, 0);
  caja.add(cast(fondo));
  const paredes = [];
  const yW = 0.6 + WALL / 2;
  const pf = box(60, WALL, 0.6, MDF, 0, yW, 29.7);
  const pt = box(60, WALL, 0.6, MDF, 0, yW, -29.7);
  const pi = box(0.6, WALL, 58.8, MDF, -29.7, yW, 0);
  const pd = box(0.6, WALL, 58.8, MDF, 29.7, yW, 0);
  for (const [p, dx, dz] of [[pf, 0, 1], [pt, 0, -1], [pi, -1, 0], [pd, 1, 0]]) {
    p.userData.dir = [dx, dz];
    paredes.push(p);
    caja.add(cast(p));
  }
  const esquineros = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const e = box(2, WALL, 2, PINO, sx * 28.4, yW, sz * 28.4);
    e.userData.dir = [sx, sz];
    esquineros.push(e);
    caja.add(cast(e));
  }
  const postes = [];
  for (const [px, py] of L.posts) {
    const pp = box(2, WALL, 2, PINO, W(px), yW, Zp(py));
    const n = Math.hypot(W(px), Zp(py));
    pp.userData.dir = [W(px) / n, Zp(py) / n];
    postes.push(pp);
    caja.add(cast(pp));
  }
  hs('postes', 'Postes de apoyo', `4 postes de listón de 2 × 2 × ${WALL} cm, pegados y atornillados al fondo, lejos del giro del brazo. Sostienen la tapa para que no se hunda cuando los imanes se jalan.`, postes[3], [0, 3, 0]);

  // ---------------- palo, brazo y perilla (una sola pieza)
  const armY0 = UNDER - AR.pad - 0.6;          // cara de abajo del brazo
  const brazoW = new THREE.Group();             // envoltorio: despiece y giro
  const brazoG = new THREE.Group();             // contenido: armado
  brazoW.add(brazoG);
  brazoG.add(cast(box(AR.len, 0.6, AR.w, MDF, 0, armY0 + 0.3, 0, 0.06)));
  const imanes = cast(cyl(0.6, 0.62, NICKEL, VAGON_R, armY0 + 0.3, 0, 28));
  brazoG.add(imanes);
  for (const sx of [-1, 1]) brazoG.add(cast(box(AR.padSize, AR.pad, AR.padSize, FIELTRO, sx * AR.padC, UNDER - AR.pad / 2, 0, 0.03)));
  const palo = cast(cyl(KN.dowel / 2, KN.dowelLen, PINO, 0, armY0 + KN.dowelLen / 2, 0, 28));
  brazoG.add(palo);
  const perillaW = new THREE.Group();
  const perillaG = new THREE.Group();
  perillaW.add(perillaG);
  const yRond = TOP + KN.washerT / 2;
  perillaG.add(cast(cyl(KN.washerR, KN.washerT, ZINC, 0, yRond, 0, 32)));
  const yK0 = TOP + KN.washerT;
  for (let i = 0; i < KN.discs; i++) perillaG.add(cast(cyl(KN.r, 0.6, MDF, 0, yK0 + 0.3 + i * 0.6, 0, 48)));
  const kTop = new THREE.Mesh(new THREE.CircleGeometry(KN.r - 0.02, 48).rotateX(-Math.PI / 2), std('#FFFFFF', 0.7, 0, { map: T.perilla, transparent: true }));
  kTop.position.y = yK0 + KN.discs * 0.6 + 0.004;
  perillaG.add(kTop);
  mec.add(brazoW, perillaW);
  hs('perilla', 'Perilla', `Dos discos de MDF de ${(KN.r * 2).toFixed(1)} cm pegados al palo redondo de ½″, sobre una rondana. Al girarla en sentido horario, el brazo de abajo gira con ella y arrastra al vagón por la pista.`, perillaG, [0, 2.6, 0]);
  hs('brazo', 'Brazo con imanes (bajo la tapa)', `Tira de MDF de ${AR.len} × ${AR.w} cm pegada al palo. En una punta, 2 imanes de 12 × 3 mm encimados en un agujero de 12 mm, a ${VAGON_R} cm del centro: justo debajo del vagón. Las dos puntas llevan fieltro de 2 mm que roza la tapa sin rayarla.`, imanes, [0, 0.4, 0]);

  // ---------------- tapa
  const tapaSlab = box(60, 0.6, 60, MDF.clone(), 0, UNDER + 0.3, 0);
  tapa.add(cast(tapaSlab));
  const vinil = planeTop(60, 60, T.vinil, TOP + 0.005, { roughness: 0.92 });
  tapa.add(vinil);
  const tornillos = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tornillos.push(cyl(0.3, 0.05, NICKEL, sx * 28.4, TOP + 0.03, sz * 28.4, 12));
  tapa.add(...tornillos);
  const paradas = new THREE.Object3D();
  { const a = THREE.MathUtils.degToRad(L.homeAngle + L.stops.atp); paradas.position.set(L.stopR * Math.cos(a), TOP, L.stopR * Math.sin(a)); }
  tapa.add(paradas);
  hs('paradas', 'Paradas numeradas', 'Las rayitas negras con número, en la orilla de la pista, marcan dónde se detiene el vagón: 0 RuBP, 1 fijación, 2 3-PGA, 3 ATP, 4 NADPH, 5 G3P, 6 regeneración y 7 ATP de regeneración.', paradas, [0, 1.2, 0]);

  // placas con bloques (cada bloque en su pivote: fila 1 = atrás, columna 1 = izquierda)
  const studGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.17, 14);
  const brickGeo = new RoundedBoxGeometry(0.78, 0.96, 0.78, 2, 0.06);
  const brickStudGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.17, 14);
  const studPos = (k) => -2.8 + (k - 1) * 0.8;
  const placas = {};
  for (const [key, pl] of Object.entries(L.plates)) {
    const g = new THREE.Group();
    g.position.set(W(pl.c[0]), TOP, Zp(pl.c[1]));
    g.add(cast(box(6.4, 0.32, 6.4, PLATE, 0, 0.16, 0, 0.05)));
    const studs = new THREE.InstancedMesh(studGeo, PLATE, 64);
    const mtx = new THREE.Matrix4();
    let k = 0;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { mtx.makeTranslation(-2.8 + i * 0.8, 0.405, -2.8 + j * 0.8); studs.setMatrixAt(k++, mtx); }
    g.add(cast(studs));
    const cells = pl.cells;
    const bodies = new THREE.InstancedMesh(brickGeo, DARKBRICK, cells.length);
    const tops = new THREE.InstancedMesh(brickStudGeo, DARKBRICK, cells.length);
    cells.forEach(([r, c], i) => {
      mtx.makeTranslation(studPos(c), 0.32 + 0.48, studPos(r)); bodies.setMatrixAt(i, mtx);
      mtx.makeTranslation(studPos(c), 0.32 + 0.96 + 0.085, studPos(r)); tops.setMatrixAt(i, mtx);
    });
    g.add(cast(bodies), cast(tops));
    tapa.add(g);
    placas[key] = g;
  }
  hs('rubp', 'Estación RuBP (parada 0)', 'Placa 8 × 8 con 3 filas de 5 bloques (filas 2, 4 y 6; columnas 2 a 6): 3 RuBP, 15 carbonos. Aquí empieza y termina cada vuelta.', placas.rubp, [0, 1.5, 0]);
  hs('pga', 'Estación 3-PGA (parada 2)', '6 piezas de 3 bloques (18 carbonos), en las filas 2, 4 y 6, columnas 1–3 y 5–7: lo que se forma al fijar los 3 CO₂.', placas.pga, [0, 1.5, 0]);
  hs('g3p', 'Estación G3P (parada 5)', '5 piezas de 3 bloques y un hueco (fila 6, columnas 5–7): la sexta G3P es la que sale por la rampa.', placas.g3p, [0, 1.5, 0]);
  hs('regen', 'Mesa de regeneración (parada 6)', 'Dos placas: 5 G3P (igual que la estación G3P) y 3 RuBP (igual que la estación RuBP). Los mismos 15 carbonos, reacomodados.', placas.regA, [0, 1.5, 4.25]);

  // ---------------- piezas que se mueven a mano, cada una sobre su torre de listón
  const CT = L.controls;
  const torres = {};
  const enTorre = (key) => {
    const ct = CT[key];
    const g = new THREE.Group();
    g.position.set(W(ct.c[0]), TOP, Zp(ct.c[1]));
    g.add(torre(ct.h));
    tapa.add(g);
    torres[key] = g;
    return g;
  };
  // tarjetas giratorias: 2 cartones de 6 × 8 con un palito de brocheta en medio, metido en su base
  const tarjeta = (key, front, back) => {
    const g = enTorre(key);
    const h = CT[key].h;
    g.add(cast(cyl(0.15, 1.2 + 0.3 + 7.6, BAMBU, 0, h - 1.2 + (1.2 + 0.3 + 7.6) / 2, 0, 10)));
    const card = new THREE.Group();
    card.position.y = h + 0.3;
    card.add(cast(box(6, 8, 0.4, std('#C9C3B6', 0.9), 0, 4.0, 0, 0.03)));
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(6, 8), std('#FFFFFF', 0.7, 0, { map: T[front] }));
    fp.position.set(0, 4.0, 0.205);
    const bp = new THREE.Mesh(new THREE.PlaneGeometry(6, 8), std('#FFFFFF', 0.7, 0, { map: T[back] }));
    bp.position.set(0, 4.0, -0.205); bp.rotation.y = Math.PI;
    card.add(fp, bp);
    g.add(card);
    return card;
  };
  const cards = [tarjeta('atp', 'card_atp', 'card_adp'), tarjeta('nadph', 'card_nadph', 'card_nadp'), tarjeta('atp3', 'card_atp3', 'card_adp3')];
  hs('atp', 'Tarjeta ATP (parada 3)', `Tarjeta de 6 × 8 cm hecha con 2 cartones y un palito de brocheta en medio, metido en una base de ${CT.atp.h} cm. Se gira con los dedos media vuelta: de "6 ATP" (cargada) a "6 ADP" (gastada).`, torres.atp, [0, 12, 0]);
  hs('nadph', 'Tarjeta NADPH (parada 4)', 'Igual que la de ATP. Al girarla muestra "6 NADP⁺": la reducción gastó el NADPH.', torres.nadph, [0, 12, 0]);
  hs('atp3', 'Tarjeta ATP de regeneración (parada 7)', 'Muestra "3 ADP" al girarla: los 3 ATP que cuesta rearmar las RuBP.', torres.atp3, [0, 12, 0]);
  // pinza RuBisCO: palito de paleta que gira en un tornillo sobre su torre; la pinza de ropa va encima
  const tp = enTorre('pinza');
  const pinza = new THREE.Group();
  pinza.position.y = CT.pinza.h + 0.08;
  tp.add(cast(cyl(0.45, 0.08, ZINC, 0, CT.pinza.h + 0.04, 0, 20)));
  pinza.add(cast(box(9.4, 0.2, 1.0, std('#E2C99A', 0.7), 4.1, 0.1, 0, 0.08)));
  const amarillo = std('#F2C94C', 0.42);
  pinza.add(cast(box(7.0, 0.5, 0.95, amarillo, 5.1, 0.45, 0, 0.12)));
  const quijada = cast(box(5.0, 0.5, 0.95, amarillo, 0, 0, 0, 0.12));
  quijada.position.set(6.1, 1.0, 0); quijada.rotation.z = 0.05;
  pinza.add(quijada);
  const resorte = cyl(0.2, 1.05, std('#A3ACB4', 0.3, 0.4), 4.0, 0.73, 0, 14); resorte.rotation.x = Math.PI / 2;
  pinza.add(cast(resorte));
  const cabP = cabeza(); cabP.position.y = 0.2; pinza.add(cabP);
  pinza.rotation.y = Math.PI;  // en reposo apunta a la izquierda (paralela a la pista)
  tp.add(pinza);
  hs('pinza', 'Pinza RuBisCO (parada 1)', `Pinza de ropa amarilla pegada a un palito de paleta que gira en un tornillo, sobre una torre de ${CT.pinza.h} cm. En reposo apunta a la izquierda; en la parada 1 se gira con la mano hasta quedar encima del CO₂.`, tp, [0, 5.2, 0]);
  // compuerta: abatelenguas que gira en un tornillo sobre una torre de 7 cm
  const tg = enTorre('gate');
  tg.add(cast(cyl(0.45, 0.08, ZINC, 0, CT.gate.h + 0.04, 0, 20)));
  const palitoG = new THREE.Group();
  palitoG.position.y = CT.gate.h + 0.08;
  palitoG.add(cast(box(1.8, 0.2, 8.0, std('#E8D2A8', 0.7), 0, 0.1, 3.0, 0.08)));
  const cabG = cabeza(); cabG.position.y = 0.2; palitoG.add(cabG);
  tg.add(palitoG);
  // rampa y caja de glucosa
  const R_ = L.ramp;
  const len = R_.top[0] - R_.bottom[0];
  const rise = R_.hTop - R_.hBottom;
  const angR = Math.atan2(rise, len);
  const rampY = (x) => R_.hBottom + (x - R_.bottom[0]) / len * rise;
  const rampa = new THREE.Group();
  const rlen = Math.hypot(len, rise);
  const xmid = (R_.top[0] + R_.bottom[0]) / 2;
  const sOf = (x) => (x - xmid) / Math.cos(angR);
  const canal = new THREE.Group();
  canal.add(cast(box(rlen, R_.floorT, R_.width, WHITE, 0, -R_.floorT / 2, 0)));
  const zW = R_.inner / 2 + (R_.width - R_.inner) / 4;
  const tW = (R_.width - R_.inner) / 2;
  const s0 = -rlen / 2, s1 = sOf(R_.cut[0]), s2 = sOf(R_.cut[1]), s3 = rlen / 2;
  for (const sz of [-1, 1]) {
    for (const [a0, a1, hh] of [[s0, s1, R_.wallH], [s1, s2, R_.cutH], [s2, s3, R_.wallH]]) {
      canal.add(cast(box(a1 - a0, hh, tW, WHITE, (a0 + a1) / 2, hh / 2, sz * zW)));
    }
  }
  canal.add(cast(box(0.5, R_.wallH, R_.inner, WHITE, s3 - 0.25, R_.wallH / 2, 0)));
  canal.add(box(rlen - 0.8, 0.02, R_.inner, std('#E8F0F4', 0.15, 0, { transparent: true, opacity: 0.6 }), -0.15, 0.01, 0));
  canal.rotation.z = angR;
  canal.position.set(W(xmid), TOP + (R_.hTop + R_.hBottom) / 2, Zp(R_.top[1]));
  rampa.add(canal);
  for (const px of R_.pillars) {
    const hp = rampY(px) - R_.floorT / Math.cos(angR);
    rampa.add(cast(box(2, hp, 2, PINO, W(px), TOP + hp / 2, Zp(R_.top[1]))));
  }
  tapa.add(rampa);
  const [g0x, g0y, g1x, g1y] = L.glucose;
  const glu = new THREE.Group();
  glu.position.set(W((g0x + g1x) / 2), TOP, Zp((g0y + g1y) / 2));
  const gw = g1x - g0x, gd = g1y - g0y;
  glu.add(cast(box(gw, 0.5, gd, WHITE, 0, 0.25, 0)));
  glu.add(planeTop(gw - 1.0, gd - 1.0, T.glucose, 0.51));
  for (const [w, d, x, z] of [[gw, 0.5, 0, gd / 2 - 0.25], [gw, 0.5, 0, -gd / 2 + 0.25], [0.5, gd - 1, gw / 2 - 0.25, 0], [0.5, gd - 1, -gw / 2 + 0.25, 0]]) {
    glu.add(cast(box(w, 1.5, d, WHITE, x, 0.5 + 0.75, z)));
  }
  tapa.add(glu);
  // pieza G3P de salida: 3 bloques sobre una placa 1 × 3
  const pieza = new THREE.Group();
  pieza.add(cast(box(2.4, 0.32, 0.8, DARKBRICK, 0, 0.16, 0, 0.04)));
  for (let b = 0; b < 3; b++) {
    pieza.add(cast(new THREE.Mesh(brickGeo, DARKBRICK)).translateX((b - 1) * 0.8).translateY(0.32 + 0.48));
    const st = new THREE.Mesh(brickStudGeo, DARKBRICK); st.position.set((b - 1) * 0.8, 0.32 + 0.96 + 0.085, 0); pieza.add(cast(st));
  }
  tapa.add(pieza);
  hs('compuerta', 'Compuerta y rampa (parada 5)', `Abatelenguas de 8 cm que gira en un tornillo sobre una torre de ${CT.gate.h} cm. Cruza el canal 5 mm arriba del piso y detiene la pieza G3P. Al girarlo hacia la caja de glucosa, la pieza baja sola. Canal de 15.5 cm que baja de 8 a 2 cm.`, tg, [0, 8.6, 0]);
  hs('glucosa', 'Caja de glucosa', 'Caja de 9 × 8 cm con paredes de 1.5 cm. En el fondo, un hexágono a la mitad: 1 G3P es media glucosa.', glu, [0, 2, 0]);

  // letreros y solapas
  const letreros = [];
  const letrero = (rect, tex) => {
    const [x0, y0, x1, y1] = rect;
    const g = new THREE.Group();
    g.position.set(W((x0 + x1) / 2), TOP, Zp((y0 + y1) / 2));
    g.add(cast(box(x1 - x0, 0.5, y1 - y0, WHITE, 0, 0.25, 0, 0.05)));
    g.add(planeTop(x1 - x0 - 0.02, y1 - y0 - 0.02, tex, 0.505));
    tapa.add(g);
    letreros.push(g);
    return g;
  };
  letrero(L.signTitle, T.sign_title);
  letrero(L.signSun, T.sign_sun);
  const solapas = [];
  const solapaGrupos = [];
  L.flaps.forEach((rect, i) => {
    const [x0, y0, x1, y1] = rect;
    const g = new THREE.Group();
    g.position.set(W((x0 + x1) / 2), TOP, Zp((y0 + y1) / 2));
    const w = x1 - x0, d = y1 - y0;
    g.add(cast(box(w, 0.3, d, std('#FFF1BD', 0.8), 0, 0.15, 0)));
    g.add(planeTop(w - 0.02, d - 0.02, T['ans' + (i + 1)], 0.305));
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.32, -d / 2);
    const leaf = new THREE.Group();
    leaf.position.z = d / 2;
    leaf.add(cast(box(w, 0.4, d, WHITE, 0, 0.2, 0)));
    leaf.add(planeTop(w - 0.02, d - 0.02, T['flap' + (i + 1)], 0.405));
    hinge.add(leaf);
    g.add(hinge);
    tapa.add(g);
    solapaGrupos.push(g);
    solapas.push(hinge);
  });

  // vagón: disco de MDF de 6 mm con 2 imanes, cinta de teflón abajo y placa 4 × 4 arriba
  const vagon = new THREE.Group();
  vagon.add(cast(cyl(2.25, 0.02, std('#EDEDE8', 0.3), 0, 0.01, 0, 40)));
  vagon.add(cast(cyl(2.25, 0.6, MDF, 0, 0.32, 0, 40)));
  vagon.add(cyl(0.5, 0.605, NICKEL, 0, 0.32, 0, 20));
  const vp = new THREE.Group();
  vp.add(cast(box(3.2, 0.32, 3.2, std('#F2F2F2', 0.5), 0, 0.16, 0, 0.05)));
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    if (i === 1 && j === 1) continue;
    vp.add(cast(cyl(0.24, 0.17, std('#F2F2F2', 0.5), -1.2 + i * 0.8, 0.405, -1.2 + j * 0.8, 14)));
  }
  const verde = std('#3BAA54', 0.38);
  const vb = cast(new THREE.Mesh(brickGeo, verde)); vb.position.set(-0.4, 0.32 + 0.48, -0.4); vp.add(vb);
  vp.add(cast(cyl(0.24, 0.17, verde, -0.4, 0.32 + 0.96 + 0.085, -0.4, 14)));
  vp.position.y = 0.62;
  vagon.add(vp);
  root.add(vagon);
  hs('vagon', 'Vagón con el CO₂', 'Disco de MDF de 4.5 cm con 2 imanes de 10 × 3 mm al centro, cinta de teflón abajo y una placa 4 × 4 con el bloque verde (el carbono del CO₂). Los imanes del brazo lo jalan a través de la tapa.', vagon, [0, 3, 0]);

  // ---------------- resalte: anillo que marca qué se mueve con la mano en cada momento
  const ringMat = new THREE.MeshBasicMaterial({ color: '#F2B23A', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 64).rotateX(-Math.PI / 2), ringMat);
  ring.renderOrder = 5;
  tapa.add(ring);
  const focoPos = (k) => {
    const c = (xy) => [W(xy[0]), Zp(xy[1])];
    switch (k) {
      case 'perilla': return { p: [0, 0], r: 3.3 };
      case 'pinza': return { p: c(CT.pinza.c), r: 2.4 };
      case 'atp': case 'nadph': case 'atp3': return { p: c(CT[k].c), r: 3.6 };
      case 'gate': return { p: c(CT.gate.c), r: 2.4 };
      case 'glucosa': return { p: [W((g0x + g1x) / 2), Zp((g0y + g1y) / 2)], r: 6.4 };
      case 'pga': return { p: c(L.plates.pga.c), r: 4.9 };
      case 'g3p': return { p: c(L.plates.g3p.c), r: 4.9 };
      case 'regen': return { p: [W(7.0), Zp(35.25)], r: 7.6 };
      default: return null;
    }
  };

  // ---------------- estado y animación
  const TL = crearLineaDeTiempo();
  const view = { tapaLift: 0, tapaAlpha: 1, explode: 0, flaps: [0, 0], sinTapa: false, armado: 99, resalte: true };
  // orden de armado (para ver la maqueta construirse pieza por pieza)
  const partes = [
    { nombre: 'Fondo de MDF 6 mm', paso: 1, objs: [fondo] },
    { nombre: 'Paredes, esquineros y postes', paso: 1, objs: paredes.concat(esquineros, postes) },
    { nombre: 'Brazo con imanes y palo', paso: 3, objs: [brazoG] },
    { nombre: 'Tapa con el vinil impreso', paso: 2, objs: [tapaSlab, vinil, ...tornillos] },
    { nombre: 'Rondana y perilla', paso: 3, objs: [perillaG] },
    { nombre: 'Placas con bloques', paso: 5, objs: Object.values(placas) },
    { nombre: 'Tarjetas giratorias', paso: 6, objs: ['atp', 'nadph', 'atp3'].map((k) => torres[k]) },
    { nombre: 'Pinza RuBisCO', paso: 6, objs: [torres.pinza] },
    { nombre: 'Compuerta, rampa y caja de glucosa', paso: 7, objs: [torres.gate, rampa, glu, pieza] },
    { nombre: 'Letreros y solapas', paso: 7, objs: letreros.concat(solapaGrupos) },
    { nombre: 'Vagón con el CO₂', paso: 4, objs: [vagon] },
  ];
  const seReinicia = new Set([...paredes, ...esquineros, ...postes, vagon, pieza]);
  const aplicarArmado = () => {
    const a = view.armado;
    partes.forEach((pt, k) => {
      const p = clamp(a - k);
      const off = (1 - eio(p)) * 16;
      for (const o of pt.objs) {
        if (seReinicia.has(o)) o.position.y += off;
        else { o.position.y += off - (o.userData.armOff ?? 0); o.userData.armOff = off; }
        if (p <= 0.001) o.visible = false;
        else if (o !== vagon) o.visible = true;
      }
    });
  };
  const tapaMats = [tapaSlab.material, vinil.material];
  const setTapaAlpha = (a) => {
    for (const m of tapaMats) { m.transparent = a < 0.999; m.opacity = a; m.depthWrite = a > 0.6; m.needsUpdate = true; }
  };

  function aplicar(t) { return aplicarEstado(estadoEn(TL, t), t); }

  // aplica un estado dado (para videos con su propia coreografía)
  function aplicarEstado(s, t) {
    const e = view.explode;
    const lift = view.tapaLift + e * 22;
    tapa.position.y = lift;
    tapa.visible = !view.sinTapa;
    // despiece de paredes
    for (const p of paredes.concat(esquineros, postes)) {
      const [dx, dz] = p.userData.dir;
      if (!p.userData.base) p.userData.base = p.position.clone();
      p.position.set(p.userData.base.x + dx * e * 9, p.userData.base.y, p.userData.base.z + dz * e * 9);
    }
    // palo, brazo y perilla giran juntos; en el despiece el brazo queda abajo de la tapa y la perilla arriba
    const ang = THREE.MathUtils.degToRad(L.homeAngle + s.angle);
    brazoW.position.y = view.tapaLift + e * 10;
    perillaW.position.y = lift + e * 9;
    brazoW.rotation.y = perillaW.rotation.y = -ang;
    // vagón
    vagon.position.set(VAGON_R * Math.cos(ang), TOP + lift + e * 6, VAGON_R * Math.sin(ang));
    vagon.rotation.y = -ang;
    vagon.visible = !view.sinTapa && view.armado > partes.length - 1 + 0.001;
    // piezas a mano
    pinza.rotation.y = Math.PI + s.pinza * (Math.PI / 2);
    cards.forEach((c, i) => { c.rotation.y = s.cards[i] * Math.PI; });
    palitoG.rotation.y = -s.gate * Math.PI / 2;
    // pieza G3P: espera arriba, baja por la rampa y cae en la caja
    const u = s.slide;
    const x0p = CT.gate.c[0] + 0.95 + 1.2, x1p = R_.bottom[0] + 0.6;
    let px, py, rotZ;
    if (u < 0.7) {
      const v = eio(u / 0.7) * 0.9 + (u / 0.7) * 0.1;
      px = x0p + (x1p - x0p) * Math.min(1, v);
      py = rampY(px);
      rotZ = angR;
    } else {
      const v = smooth((u - 0.7) / 0.3);
      const xb = 6.5;
      px = x1p + (xb - x1p) * v;
      py = rampY(x1p) * (1 - v) + 0.55 * v + Math.sin(v * Math.PI) * 0.4;
      rotZ = angR * (1 - v);
    }
    pieza.position.set(W(px), TOP + py + 0.03, Zp(R_.top[1]));
    pieza.rotation.z = rotZ;
    if (s.pieza) { pieza.position.set(s.pieza[0], s.pieza[1] + lift, s.pieza[2]); pieza.rotation.z = s.pieza[3] ?? 0; }
    // resalte
    const f = view.resalte && e < 0.05 && !view.sinTapa && view.armado >= partes.length ? focoPos(s.focus) : null;
    if (f) {
      ring.visible = true;
      ring.position.set(f.p[0], TOP + 0.06, f.p[1]);
      ring.scale.setScalar(f.r * (1 + 0.04 * Math.sin(t * 6)));
      ringMat.opacity = 0.55 + 0.25 * Math.sin(t * 6);
    } else {
      ring.visible = false;
    }
    solapas.forEach((h, i) => { h.rotation.x = -view.flaps[i] * 1.9; });
    aplicarArmado();
    return s;
  }

  // orden de los puntos para verificar: igual que los pasos del manual
  const ORDEN = ['perilla', 'brazo', 'postes', 'vagon', 'paradas', 'rubp', 'pga', 'g3p', 'regen', 'atp', 'nadph', 'atp3', 'pinza', 'compuerta', 'glucosa'];
  hotspots.sort((a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id));

  return {
    root, tapa, caja, mec, vagon, hotspots, TL, view, partes,
    setTapaAlpha,
    aplicar,
    aplicarEstado,
    obj: { cards, pinza, palitoG, pieza, perillaG, brazoW, torres },
    medidas: { TOP, UNDER, angR, rampY: (x) => rampY(x) },
    duracion: TL.total,
  };
}

export function crearEscena(renderer, W_, H_) {
  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight('#ffffff', '#c9d2c4', 1.05);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff4e6', 2.4);
  key.position.set(-40, 90, -30);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 10, far: 220 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.04;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#ffffff', 0.75);
  fill.position.set(40, 50, 80);
  scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.2 }));
  ground.receiveShadow = true;
  scene.add(ground);
  const camera = new THREE.PerspectiveCamera(32, W_ / H_, 1, 1200);
  return { scene, camera, key };
}
