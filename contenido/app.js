// ===================================================================== presentación: navegación, casillas, plano, descargas
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const slides = $$('.slide');
  const ids = slides.map((s) => s.id);
  let cur = 0;
  const vistos = new Set();
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };

  // ---------------------------------------------------------------- casillas de cada paso
  const checks = store.get('calvin-manual-pasos', {});
  slides.forEach((s) => {
    $$('.check > li', s).forEach((li, i) => {
      const id = `${s.id}-${i}`;
      const cb = $('input[type="checkbox"]', li);
      if (!cb) return;
      cb.checked = !!checks[id];
      li.classList.toggle('done', cb.checked);
      cb.addEventListener('change', () => { checks[id] = cb.checked; li.classList.toggle('done', cb.checked); store.set('calvin-manual-pasos', checks); pintarIndice(); });
    });
  });
  // tablas de materiales con casilla
  const mats = store.get('calvin-manual-materiales', {});
  let nMat = 0;
  $$('table.mat').forEach((t, ti) => {
    $$('tbody tr', t).forEach((tr, i) => {
      const id = `${ti}-${i}`;
      const td = document.createElement('td');
      td.className = 'ck';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.setAttribute('aria-label', 'Ya lo tengo: ' + tr.cells[0].textContent);
      cb.checked = !!mats[id];
      tr.classList.toggle('done', cb.checked);
      cb.addEventListener('change', () => { mats[id] = cb.checked; tr.classList.toggle('done', cb.checked); store.set('calvin-manual-materiales', mats); totalMat(); });
      td.appendChild(cb);
      tr.prepend(td);
      nMat++;
    });
  });
  function totalMat() {
    const n = Object.values(mats).filter(Boolean).length;
    const el = $('#matTotal');
    if (el) el.textContent = `Tienes ${n} de ${nMat} cosas de la lista.`;
  }
  totalMat();

  // ---------------------------------------------------------------- pestañas
  $$('.tabs').forEach((tabs) => {
    const scope = tabs.closest('.media') || tabs.closest('.slide');
    const btns = $$('.tab', tabs);
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
      const ids_ = btns.map((x) => x.dataset.pane);
      ids_.forEach((pid) => {
        const p = scope.querySelector(`[data-id="${pid}"]`);
        if (!p) return;
        p.hidden = pid !== b.dataset.pane;
        if (p.hidden) $$('video', p).forEach((v) => v.pause());
      });
    }));
  });

  // ---------------------------------------------------------------- navegación
  const prog = $('#prog');
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', s.dataset.title);
    b.title = s.dataset.title;
    b.addEventListener('click', () => ir(i));
    prog.appendChild(b);
  });
  let visor = null;
  // El visor 3D va en un <script> que está DESPUÉS de este. Si la página se abre o se recarga ya en #maqueta3d,
  // este código corre antes de que exista window.Visor: hay que esperar a que el navegador termine de leer la página.
  function esperarVisor() {
    if (window.Visor) return Promise.resolve(window.Visor);
    return new Promise((ok, no) => {
      const listo = () => (window.Visor ? ok(window.Visor) : no(new Error('No se encontró el visor 3D (window.Visor)')));
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo, { once: true });
      else listo();
    });
  }
  async function cargarVisor() {
    if (!visor) {
      visor = esperarVisor().then(async (m) => { await m.iniciar(); $('#v3d').classList.remove('sin3d'); return m; }).catch((e) => {
        const st = $('#v3d-status');
        if (st) { st.hidden = false; st.textContent = 'No se pudo cargar el visor 3D en esta vista. Los renders y videos de cada paso muestran lo mismo.'; }
        $('#v3d').classList.add('sin3d');
        console.error(e);
        visor = null;          // la próxima vez que entres al 3D lo vuelve a intentar
        return null;
      });
    }
    return visor;
  }
  function ir(i, opts = {}) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const prev = cur;
    slides[prev].hidden = true;
    $$('video', slides[prev]).forEach((v) => v.pause());
    cur = i;
    vistos.add(i);
    const s = slides[i];
    s.hidden = false;
    $('#topTitle').innerHTML = '';
    const b = document.createElement('b');
    b.textContent = s.dataset.title;
    $('#topTitle').append(b);
    $('#count').textContent = `${i + 1} / ${slides.length}`;
    $$('#prog button').forEach((x, k) => { x.classList.toggle('cur', k === i); x.classList.toggle('seen', vistos.has(k)); });
    $('#prev').disabled = i === 0;
    $('#next').disabled = i === slides.length - 1;
    if (!opts.noScroll) window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + s.id); } catch (e) { /* nada */ }
    if (s.id === 'maqueta3d') {
      cargarVisor().then((m) => { if (m && slides[cur].id === 'maqueta3d') { m.activar(true); if (opts.preset) m.preset(opts.preset); } });
    } else if (visor) {
      visor.then((m) => m && m.activar(false));
    }
    pintarIndice();
  }
  $('#prev').addEventListener('click', () => ir(cur - 1));
  $('#next').addEventListener('click', () => ir(cur + 1));
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => ir(ids.indexOf(b.dataset.go))));
  $$('[data-ver3d]').forEach((b) => b.addEventListener('click', () => {
    let p = {};
    try { p = JSON.parse(b.dataset.ver3d); } catch (e) { p = {}; }
    ir(ids.indexOf('maqueta3d'), { preset: p });
  }));
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (!$('#idx').hidden) { if (e.key === 'Escape') cerrarIndice(); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { ir(cur + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { ir(cur - 1); e.preventDefault(); }
  });

  // ---------------------------------------------------------------- índice
  function avance(s) {
    const items = $$('.check > li', s);
    if (!items.length) return '';
    const n = items.filter((li) => li.classList.contains('done')).length;
    return `${n}/${items.length}`;
  }
  function pintarIndice() {
    const box = $('#idxList');
    box.innerHTML = '';
    let grupo = null, ol = null;
    slides.forEach((s, i) => {
      if (s.dataset.grupo !== grupo) {
        grupo = s.dataset.grupo;
        const h = document.createElement('h5');
        h.textContent = grupo;
        ol = document.createElement('ol');
        box.append(h, ol);
      }
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      if (i === cur) b.classList.add('cur');
      const k = document.createElement('span'); k.className = 'k'; k.textContent = String(i + 1).padStart(2, '0');
      const t = document.createElement('span'); t.textContent = s.dataset.title;
      b.append(k, t);
      const a = avance(s);
      if (a) {
        const pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = a;
        const [x, y] = a.split('/');
        if (x === y) pr.classList.add('full');
        b.append(pr);
      }
      b.addEventListener('click', () => { cerrarIndice(); ir(i); });
      li.append(b);
      ol.append(li);
    });
  }
  function abrirIndice() { pintarIndice(); $('#idx').hidden = false; $('#closeIdx').focus(); }
  function cerrarIndice() { $('#idx').hidden = true; $('#openIdx').focus(); }
  $('#openIdx').addEventListener('click', abrirIndice);
  $('#closeIdx').addEventListener('click', cerrarIndice);
  $('#idx').addEventListener('click', (e) => { if (e.target.id === 'idx') cerrarIndice(); });

  // ---------------------------------------------------------------- plano interactivo
  const INFO = {
    tapa: ['Tapa de MDF de 6 mm', '60 × 60 cm', 'Apoya en paredes, esquineros y 4 postes. 4 tornillos, uno por esquina, a 1.6 cm de cada orilla. Lleva encima el vinil impreso y un agujero de ⅝″ al centro.'],
    giro: ['Giro del brazo (bajo la tapa)', 'r 15.3 cm', 'Por aquí gira el brazo con imanes. Dentro de este círculo no puede haber nada bajo la tapa.'],
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
    rampa: ['Rampa', '(26.5, 54) → (11, 54)', 'Canal de 15.5 cm, piso de 3 cm y bordes de 1 cm. Baja de 8 a 2 cm. Pilares de 7.1 y 1.9 cm.'],
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

  // ---------------------------------------------------------------- descargas (PDF)
  let dlApi;
  const getDl = () => {
    if (dlApi === undefined) dlApi = Promise.resolve({ save: async ({ filename, data, href }) => {
      const a = document.createElement('a'); const url = href || URL.createObjectURL(data);
      a.href = url; a.download = filename; if (href) { a.target = '_blank'; a.rel = 'noopener'; } document.body.appendChild(a); a.click(); a.remove();
      if (!href) setTimeout(() => URL.revokeObjectURL(url), 4000);
    } });
    return dlApi;
  };
  $$('[data-dl]').forEach((b) => b.addEventListener('click', async () => {
    const toast = b.closest('.card, .media, .slide').querySelector('[data-toast]');
    const say = (s) => { if (toast) toast.textContent = s; };
    say('Preparando…');
    try {
      const api = await getDl();
      if (!api) { say('No se pudo descargar. Vuelve a intentarlo.'); return; }
      await api.save({ filename: b.dataset.name, href: b.dataset.dl });
      say('Listo: ' + b.dataset.name);
    } catch (e) {
      const c = e && e.code;
      say(c === 'declined' ? 'Descarga cancelada.' : c === 'rate_limited' ? 'Espera un momento y vuelve a intentar.' : 'No se pudo descargar en esta vista.');
    }
  }));

  // ---------------------------------------------------------------- inicio
  window.addEventListener('hashchange', () => { const k = ids.indexOf(location.hash.slice(1)); if (k >= 0 && k !== cur) ir(k); });
  const h = (location.hash || '').slice(1);
  const start = ids.indexOf(h);
  ir(start >= 0 ? start : 0, { noScroll: true });
  requestAnimationFrame(() => window.scrollTo(0, 0));
  setTimeout(() => window.scrollTo(0, 0), 60);
})();
