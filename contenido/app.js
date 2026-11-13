// ===================================================================== la app: pestañas, pantallas, casillas, galerías, plano
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };
  const screens = $$('.screen');
  const byId = Object.fromEntries(screens.map((s) => [s.id, s]));
  // cada pestaña de la barra y la pantalla con la que empieza
  const RAIZ = { inicio: 'inicio', armar: 'armar', presentar: 'clase', ver3d: 'maqueta3d', ayuda: 'problemas' };
  const ALIAS = { portada: 'inicio' };   // enlaces viejos
  const tabDe = (id) => byId[id].dataset.tab;
  const esRaiz = (id) => RAIZ[tabDe(id)] === id;
  const padre = (id) => byId[id].dataset.parent || RAIZ[tabDe(id)];
  const corto = (id) => byId[id].dataset.short || byId[id].dataset.title;
  const PASOS = screens.filter((s) => s.classList.contains('paso')).map((s) => s.id);

  // ---------------------------------------------------------------- casillas de cada paso (misma llave que antes: «paso3-4»)
  const checks = store.get('calvin-manual-pasos', {});
  screens.forEach((s) => {
    $$('.check > li', s).forEach((li, i) => {
      const id = `${s.id}-${i}`;
      const cb = $('input[type="checkbox"]', li);
      if (!cb) return;
      cb.checked = !!checks[id];
      li.classList.toggle('done', cb.checked);
      cb.addEventListener('change', () => {
        checks[id] = cb.checked; li.classList.toggle('done', cb.checked);
        store.set('calvin-manual-pasos', checks); progreso();
      });
    });
  });
  // un enlace dentro del texto de una casilla abre su pantalla, sin marcar la casilla
  $$('.ck .lnk').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); ir(a.dataset.go); }));

  // materiales (llave «grupo-fila», igual que antes)
  const mats = store.get('calvin-manual-materiales', {});
  const matCbs = $$('[data-mat]');
  matCbs.forEach((cb) => {
    const id = cb.dataset.mat;
    cb.checked = !!mats[id];
    cb.closest('li').classList.toggle('done', cb.checked);
    cb.addEventListener('change', () => { mats[id] = cb.checked; cb.closest('li').classList.toggle('done', cb.checked); store.set('calvin-manual-materiales', mats); progreso(); });
  });

  // ---------------------------------------------------------------- avance: barra de cada paso, lista de Armar, inicio
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0) + '%';
  function cuenta(id) {
    const items = $$('.check > li', byId[id]);
    return [items.filter((li) => li.classList.contains('done')).length, items.length];
  }
  function progreso() {
    let hechas = 0, total = 0, siguiente = null;
    PASOS.forEach((id) => {
      const s = byId[id];
      const [n, t] = cuenta(id);
      hechas += n; total += t;
      if (!siguiente && n < t) siguiente = id;
      const lleno = t && n === t;
      $('.phead .bar i', s).style.width = pct(n, t);
      $('[data-prog-t]', s).textContent = lleno ? `Listo: ${t} de ${t} hechas` : `${n} de ${t} hechas`;
      s.classList.toggle('completo', !!lleno);
      $$('.block', s).forEach((b) => {
        const lis = $$('.check > li', b);
        const k = lis.filter((li) => li.classList.contains('done')).length;
        $('.scnt', b).textContent = `${k}/${lis.length}`;
        b.classList.toggle('completo', k === lis.length);
      });
      const card = $(`[data-card="${id}"]`);
      if (card) {
        $('.bar i', card).style.width = pct(n, t);
        $('em', card).textContent = lleno ? 'Listo' : `${n}/${t}`;
        card.classList.toggle('completo', !!lleno);
      }
    });
    // materiales
    const nm = matCbs.filter((c) => c.checked).length;
    $$('[data-mat-total]').forEach((el) => { el.textContent = `${nm} de ${matCbs.length}`; });
    const mb = $('#materiales .pstat .bar i'); if (mb) mb.style.width = pct(nm, matCbs.length);
    $$('[data-matcnt]').forEach((el) => {
      const g = el.dataset.matcnt;
      const cbs = matCbs.filter((c) => c.dataset.mat.startsWith(g + '-'));
      el.textContent = `${cbs.filter((c) => c.checked).length}/${cbs.length}`;
    });
    // resumen en Armar e Inicio
    const empezo = hechas > 0;
    const dest = siguiente || 'clase';
    const txt = !empezo ? 'Todavía no marcan nada. Empiecen por «Antes de empezar».'
      : siguiente ? `Llevan ${hechas} de ${total} cosas. Sigue: ${byId[siguiente].dataset.title}.`
        : `¡Terminaron los 8 pasos! Ahora a ensayar la presentación.`;
    $('#resTxt').textContent = txt;
    $('#resumen .bar i').style.width = pct(hechas, total);
    const rg = $('#resGo');
    rg.dataset.go = empezo ? dest : 'antes';
    rg.firstChild.textContent = !empezo ? 'Empezar' : siguiente ? `Seguir con el ${corto(siguiente)}` : 'Ir a Presentar';
    const ip = $('#inicioProg');
    ip.hidden = !empezo;
    if (empezo) {
      $('#inicioTxt').textContent = txt;
      $('.bar i', ip).style.width = pct(hechas, total);
      const ig = $('#inicioGo');
      ig.dataset.abrir = dest;
      ig.firstChild.textContent = siguiente ? `Seguir con el ${corto(siguiente)}` : 'Ir a Presentar';
    }
    $('#continuar').firstChild.textContent = empezo ? 'Ver mi avance' : 'Empezar a armar';
  }

  // ---------------------------------------------------------------- navegación tipo app
  let cur = null;
  let pila = [];                 // de dónde venías, para el botón «‹»
  const ultimaDe = {};           // última pantalla abierta en cada pestaña
  const scrollDe = {};           // dónde ibas en cada pantalla
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabbar = $('#tabbar');

  function mostrar(id, op = {}) {
    id = ALIAS[id] || id;
    if (!byId[id]) id = 'inicio';
    if (cur && cur !== id) {
      scrollDe[cur] = window.scrollY;
      byId[cur].hidden = true;
      $$('video', byId[cur]).forEach((v) => v.pause());
    }
    const antes = cur;
    cur = id;
    const s = byId[id];
    // una sola pantalla a la vista (Inicio viene visible en el HTML por si no corre el JavaScript)
    screens.forEach((x) => { if (x !== s) x.hidden = true; });
    s.hidden = false;
    s.classList.remove('in-push', 'in-back');
    if (op.anim && !reducido) { void s.offsetWidth; s.classList.add(op.anim); }
    ultimaDe[tabDe(id)] = id;
    $$('.tb', tabbar).forEach((b) => b.setAttribute('aria-current', b.dataset.tabbtn === tabDe(id) ? 'page' : 'false'));
    // barra de arriba
    const atras = pila.length ? pila[pila.length - 1] : (esRaiz(id) ? null : padre(id));
    $('#back').hidden = !atras;
    if (atras) $('#backLbl').textContent = corto(atras);
    $('#brand').hidden = !!atras;
    $('#topTitle').textContent = id === 'inicio' ? '' : s.dataset.title;
    document.title = id === 'inicio' ? 'Ciclo de Calvin · maqueta' : `${s.dataset.title} · Ciclo de Calvin`;
    // galerías: recoloca la imagen elegida (las pantallas ocultas no tienen ancho)
    $$('[data-gal]', s).forEach((g) => g._sync && g._sync());
    window.scrollTo(0, op.y || 0);
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* nada */ }
    // visor 3D: solo vive mientras su pantalla está abierta
    if (id === 'maqueta3d') {
      cargarVisor().then((m) => { if (m && cur === 'maqueta3d') { m.activar(true); if (op.preset) m.preset(op.preset); } });
    } else if (visor && antes === 'maqueta3d') {
      visor.then((m) => m && m.activar(false));
    }
    document.dispatchEvent(new CustomEvent('pantalla', { detail: id }));
  }
  // abrir otra pantalla «encima» (con botón para volver a esta)
  function ir(id, op = {}) {
    id = ALIAS[id] || id;
    if (!byId[id] || id === cur) { if (op.preset && id === 'maqueta3d' && visor) visor.then((m) => m && m.preset(op.preset)); return; }
    // la lista de tu misma pestaña: es regresar, no abrir algo nuevo
    if (esRaiz(id) && tabDe(id) === tabDe(cur)) { pila = []; mostrar(id, { anim: 'in-back', y: scrollDe[id] || 0 }); return; }
    // de un paso al siguiente (o al anterior): se cambia el paso, el botón «‹» sigue llevando a donde estabas antes
    const entrePasos = PASOS.includes(id) && PASOS.includes(cur);
    if (!entrePasos) pila.push(cur);
    mostrar(id, { anim: entrePasos ? (PASOS.indexOf(id) > PASOS.indexOf(cur) ? 'in-push' : 'in-back') : 'in-push', ...op });
  }
  // abrir una pantalla dentro de su propia pestaña (al volver, llegas a la lista de esa pestaña)
  function abrir(id) {
    id = ALIAS[id] || id;
    if (!byId[id]) return;
    pila = esRaiz(id) ? [] : [RAIZ[tabDe(id)]];
    mostrar(id, { anim: 'in-push' });
  }
  function volver() {
    const dest = pila.length ? pila.pop() : padre(cur);
    mostrar(dest, { anim: 'in-back', y: scrollDe[dest] || 0 });
  }
  function pestana(t) {
    const raiz = RAIZ[t];
    pila = [];
    // tocar la pestaña en la que ya estás te regresa a su inicio; cambiar de pestaña te deja donde ibas
    const dest = tabDe(cur) === t ? raiz : (ultimaDe[t] || raiz);
    mostrar(dest, { y: dest === cur ? 0 : (scrollDe[dest] || 0) });
  }
  $('#back').addEventListener('click', volver);
  $$('.tb', tabbar).forEach((b) => b.addEventListener('click', () => pestana(b.dataset.tabbtn)));
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go],[data-abrir],[data-tabgo],[data-ver3d],[data-jump]');
    if (!t || t.classList.contains('tb')) return;
    if (t.tagName === 'A') e.preventDefault();
    if (t.dataset.ver3d) {
      let p = {};
      try { p = JSON.parse(t.dataset.ver3d); } catch (err) { p = {}; }
      ir('maqueta3d', { preset: p });
    } else if (t.dataset.jump) {
      const el = document.getElementById(t.dataset.jump);
      if (el) el.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
    } else if (t.dataset.go) ir(t.dataset.go);
    else if (t.dataset.abrir) abrir(t.dataset.abrir);
    else if (t.dataset.tabgo) pestana(t.dataset.tabgo);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (!$('#viewer').hidden) cerrarVisorImg();
    else if (!$('#back').hidden && !/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) volver();
  });

  // ---------------------------------------------------------------- visor 3D
  let visor = null;
  // El visor 3D va en un <script> que está DESPUÉS de este. Si la app se abre o se recarga ya en #maqueta3d,
  // este código corre antes de que exista window.Visor: hay que esperar a que el navegador termine de leer la página.
  function esperarVisor() {
    if (window.Visor) return Promise.resolve(window.Visor);
    return new Promise((ok, no) => {
      const listo = () => (window.Visor ? ok(window.Visor) : no(new Error('No se encontró el visor 3D (window.Visor)')));
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo, { once: true });
      else listo();
    });
  }
  function cargarVisor() {
    if (!visor) {
      visor = esperarVisor().then(async (m) => { await m.iniciar(); $('#v3d').classList.remove('sin3d'); return m; }).catch((e) => {
        const st = $('#v3d-status');
        if (st) { st.hidden = false; st.textContent = 'No se pudo cargar el visor 3D en esta vista. Las fotos y videos de cada paso muestran lo mismo.'; }
        $('#v3d').classList.add('sin3d');
        console.error(e);
        visor = null;          // la próxima vez que entres al 3D lo vuelve a intentar
        return null;
      });
    }
    return visor;
  }

  // ---------------------------------------------------------------- galerías: deslizar, flechas, miniaturas
  $$('[data-gal]').forEach((g) => {
    const track = $('.gtrack', g), figs = $$('.gs', track), thumbs = $$('.gt', g);
    const prev = $('.gnav.prev', g), next = $('.gnav.next', g), cnt = $('.gcount', g), cap = $('.gcap', g);
    let i = 0;
    const marcar = (k) => {
      i = k;
      thumbs.forEach((t, j) => t.setAttribute('aria-current', j === k ? 'true' : 'false'));
      if (thumbs[k]) { const box = thumbs[k].parentNode; box.scrollTo({ left: thumbs[k].offsetLeft - box.clientWidth / 2 + thumbs[k].clientWidth / 2, behavior: 'smooth' }); }
      if (cnt) cnt.textContent = `${k + 1} / ${figs.length}`;
      if (prev) prev.disabled = k === 0;
      if (next) next.disabled = k === figs.length - 1;
      cap.innerHTML = '';
      const b = document.createElement('b'); b.textContent = figs[k].dataset.t;
      cap.append(b, ' · ' + figs[k].dataset.d);
    };
    const irA = (k, suave = true) => {
      k = Math.max(0, Math.min(figs.length - 1, k));
      track.scrollTo({ left: figs[k].offsetLeft, behavior: suave && !reducido ? 'smooth' : 'auto' });
      marcar(k);
    };
    let tm = 0;
    track.addEventListener('scroll', () => {
      clearTimeout(tm);
      tm = setTimeout(() => { if (!track.clientWidth) return; const k = Math.round(track.scrollLeft / track.clientWidth); if (k !== i) marcar(k); }, 60);
    }, { passive: true });
    thumbs.forEach((t, k) => t.addEventListener('click', () => irA(k)));
    if (prev) prev.addEventListener('click', () => irA(i - 1));
    if (next) next.addEventListener('click', () => irA(i + 1));
    $('.gzoom', g).addEventListener('click', () => abrirVisorImg(figs[i]));
    figs.forEach((f) => f.addEventListener('click', () => abrirVisorImg(f)));
    g._sync = () => { track.scrollLeft = figs[i].offsetLeft; };
  });

  // ---------------------------------------------------------------- imagen en grande
  const viewer = $('#viewer'), vIn = $('#viewerIn');
  let regresoFoco = null;
  function abrirVisorImg(fig) {
    regresoFoco = document.activeElement;
    vIn.innerHTML = fig.innerHTML;
    vIn.classList.remove('z2');
    $('#viewerZ').textContent = 'Acercar';
    $('#viewerT').textContent = fig.dataset.t;
    viewer.hidden = false;
    document.documentElement.classList.add('sin-scroll');
    $('#viewerX').focus();
  }
  function cerrarVisorImg() {
    viewer.hidden = true; vIn.innerHTML = '';
    document.documentElement.classList.remove('sin-scroll');
    if (regresoFoco) regresoFoco.focus();
  }
  $('#viewerX').addEventListener('click', cerrarVisorImg);
  $('#viewerZ').addEventListener('click', () => {
    const z = vIn.classList.toggle('z2');
    $('#viewerZ').textContent = z ? 'Alejar' : 'Acercar';
  });

  // ---------------------------------------------------------------- plano interactivo
  const INFO = {
    tapa: ['Tapa de MDF de 6 mm', '60 × 60 cm', 'Apoya en paredes, esquineros y 4 postes. 4 tornillos, uno por esquina, a 1.6 cm de cada orilla. Lleva encima el vinil impreso y un agujero de ⅝″ al centro.'],
    giro: ['Giro del brazo (bajo la tapa)', 'r 15.6 cm', 'Por aquí gira el brazo con imanes. Dentro de este círculo no puede haber nada bajo la tapa.'],
    postes: ['Postes de apoyo (bajo la tapa)', '(14, 15) · (46, 15) · (15, 45) · (44, 46)', 'Listón de 2 × 2 × 5 cm, pegado y atornillado al fondo. Evitan que la tapa se hunda. Quedan fuera del giro del brazo.'],
    pista: ['Pista', 'r 12.4 a 16.4 cm', 'Impresa en el vinil. Verde: fijación. Morado: reducción. Rosa: regeneración. Nada se pega encima.'],
    paradas: ['Paradas numeradas', 'r 17.45 cm', '0 RuBP · 1 fijación · 2 3-PGA · 3 ATP · 4 NADPH · 5 G3P · 6 regeneración · 7 ATP de regeneración. Ahí se detiene el vagón.'],
    centro: ['Perilla', '(30, 30) · Ø 4.5 cm', '2 discos de MDF pegados al palo de ½″, sobre una rondana. Abajo de la tapa, el mismo palo sostiene el brazo con imanes. Se gira en sentido horario.'],
    pl_rubp: ['Placa RuBP · parada 0', '(12.7, 12.7) · 6.4 × 6.4 cm', '3 filas de 5 bloques: 3 RuBP. Aquí empieza y termina la vuelta.'],
    pl_pga: ['Placa 3-PGA · parada 2', '(47.3, 12.7) · 6.4 × 6.4 cm', '6 piezas de 3 bloques, en 3 filas de 2.'],
    pl_g3p: ['Placa G3P · parada 5', '(30, 54.5) · 6.4 × 6.4 cm', '5 piezas de 3 y un hueco: la sexta espera en la rampa.'],
    pl_regA: ['Regeneración: 5 G3P · parada 6', '(7, 31) · 6.4 × 6.4 cm', '5 piezas de 3 bloques (15 carbonos), en 2 columnas.'],
    pl_regB: ['Regeneración: 3 RuBP', '(7, 39.5) · 6.4 × 6.4 cm', '3 filas de 5 bloques: los mismos 15 carbonos, reacomodados.'],
    ct_pinza: ['Pinza RuBisCO · parada 1', 'torre en (30, 7.5)', 'Torre de 2 × 2 × 2.5 cm. El palito gira en un tornillo; la boca de la pinza queda a 8 cm del eje. En reposo apunta a la izquierda.'],
    ct_atp: ['Tarjeta ATP · parada 3', 'torre en (52.5, 30)', 'Torre de 2 × 2 × 3 cm con un agujero de 3.5 mm arriba. La tarjeta de 6 × 8 cm gira sobre un palito de brocheta.'],
    ct_nadph: ['Tarjeta NADPH · parada 4', 'torre en (47.2, 44.5)', 'Igual que la de ATP. Muestra NADPH (cargada) o NADP⁺ (gastada).'],
    ct_atp3: ['Tarjeta ATP de regeneración · parada 7', 'torre en (8.9, 22.3)', 'Igual que la de ATP. Muestra 3 ATP o 3 ADP.'],
    ct_gate: ['Compuerta · parada 5', 'torre en (22.9, 50.3)', 'Torre de 2 × 2 × 7 cm. El abatelenguas de 8 cm gira en un tornillo y cruza el canal 5 mm arriba del piso.'],
    rampa: ['Rampa', '(26.5, 54) → (11, 54)', 'Canal de 15.5 cm, piso de 3 cm y bordes de 1 cm. Baja de 8 a 2 cm sobre la tapa. Pilares de 7.1 y 1.9 cm.'],
    glucosa: ['Caja de glucosa', '(2, 50) → (11, 58)', '9 × 8 cm con paredes de 1.5 cm.'],
    titulo: ['Letrero del título', '(2, 2) → (19, 8)', 'Foamboard con la impresión de la página 3.'],
    fase: ['Letrero de la fase luminosa', '(41, 2) → (58, 8)', 'Recuerda de dónde viene la energía.'],
    solapa1: ['Solapa “¿Dónde ocurre?”', '(40, 51) → (54, 57)', 'Al levantarla: en el estroma del cloroplasto.'],
    solapa2: ['Solapa “¿Por qué le dicen fase oscura?”', '(2, 43.5) → (12, 48.5)', 'Al levantarla: porque no usa la luz directamente; pero ocurre de día, con el ATP y el NADPH de la fase luminosa, y sus enzimas se activan con luz.'],
  };
  const pinfo = $('#planoInfo');
  $$('#planoSvg .it').forEach((g) => {
    const k = g.dataset.k;
    const act = () => {
      $$('#planoSvg .it.sel').forEach((x) => x.classList.remove('sel'));
      g.classList.add('sel');
      const d = INFO[k];
      if (!d) return;
      pinfo.innerHTML = '<h4></h4><p class="coord"></p><p></p>';
      pinfo.children[0].textContent = d[0];
      pinfo.children[1].textContent = d[1];
      pinfo.children[2].textContent = d[2];
    };
    g.addEventListener('click', act);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { act(); e.preventDefault(); } });
  });

  // ---------------------------------------------------------------- modo claro / oscuro (sigue al equipo hasta que lo cambies)
  const temaBtn = $('#tema');
  const oscuroSistema = matchMedia('(prefers-color-scheme: dark)');
  const temaActual = () => document.documentElement.getAttribute('data-theme') || (oscuroSistema.matches ? 'dark' : 'light');
  function pintarTema() {
    const osc = temaActual() === 'dark';
    temaBtn.setAttribute('aria-label', osc ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));
  }
  temaBtn.addEventListener('click', () => {
    const nuevo = temaActual() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevo);
    try { localStorage.setItem('calvin-tema', nuevo); } catch (e) { /* nada */ }
    pintarTema();
  });
  if (oscuroSistema.addEventListener) oscuroSistema.addEventListener('change', pintarTema);
  pintarTema();

  // ---------------------------------------------------------------- inicio
  progreso();
  window.addEventListener('hashchange', () => { const id = ALIAS[location.hash.slice(1)] || location.hash.slice(1); if (byId[id] && id !== cur) abrir(id); });
  mostrar((location.hash || '').slice(1) || 'inicio');
  requestAnimationFrame(() => window.scrollTo(0, 0));
})();
