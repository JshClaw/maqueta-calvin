# -*- coding: utf-8 -*-
"""Convierte content.py en el HTML de las pantallas de la app (pasos, lista de Armar, materiales, ayuda...)."""
import html
import json
import os
import re

import content as C

B = os.path.dirname(os.path.abspath(__file__))
esc = lambda s: html.escape(s, quote=True)


def inl(s):
    """Texto con **negritas**, `código` y [enlaces](#pantalla) a otra pantalla de la app."""
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`(.+?)`', r'<code>\1</code>', s)
    s = re.sub(r'\[(.+?)\]\(#([\w-]+)\)', r'<a href="#\2" class="lnk" data-go="\2">\1</a>', s)
    return s


def svg(name):
    return open(f'{B}/svg/{name}.svg', encoding='utf-8').read()


def svg_label(name):
    m = re.search(r'aria-label="([^"]+)"', svg(name))
    return m.group(1) if m else ''


# ------------------------------------------------------------------ íconos (trazo de 24 × 24)
ICON = {
    'casa': '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    'llave': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    'pizarron': '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    'cubo': '<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
    'ayuda': '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'libro': '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    'lista': '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>',
    'regla': '<path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="m7.5 10.5 2-2M10.5 13.5l2-2M13.5 16.5l2-2"/>',
    'capas': '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    'play': '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>',
    'pdf': '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M12 12v6M9 15l3 3 3-3"/>',
    'reloj': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'meta': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    'zoom': '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    'cel': '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    'chev': '<path d="m9 6 6 6-6 6"/>',
    'atras': '<path d="m15 6-6 6 6 6"/>',
}


def icon(name, cls='i'):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>')


# ------------------------------------------------------------------ galería (en lugar de pestañas)
def galeria(items, acciones=''):
    """items: ('img', título, src, descripción[, 'square']) o ('svg', título, nombre)."""
    n = len(items)
    figs, thumbs = [], []
    for i, m in enumerate(items):
        if m[0] == 'img':
            sq = ' class="sq"' if len(m) > 4 and m[4] == 'square' else ''
            desc = m[3]
            inner = f'<img src="{m[2]}" alt="{esc(desc)}" loading="lazy" width="1600" height="1000"{sq}>'
            th = f'<img src="{m[2]}" alt="" loading="lazy" width="1600" height="1000">'
        else:
            desc = svg_label(m[2])
            inner = f'<div class="gsvg">{svg(m[2])}</div>'
            th = f'<span class="gti">{icon("regla")}<em>Plano</em></span>'
        figs.append(f'<figure class="gs" data-t="{esc(m[1])}" data-d="{esc(desc)}" aria-label="{i + 1} de {n}: {esc(m[1])}">{inner}</figure>')
        thumbs.append(f'<button class="gt" type="button" aria-current="{"true" if i == 0 else "false"}" aria-label="Ver {esc(m[1])}">{th}<span>{inl(m[1])}</span></button>')
    nav = ''
    if n > 1:
        nav = ('<button class="gnav prev" type="button" aria-label="Imagen anterior" disabled>' + icon('atras') + '</button>'
               '<button class="gnav next" type="button" aria-label="Imagen siguiente">' + icon('chev') + '</button>'
               f'<span class="gcount">1 / {n}</span>')
    first = items[0]
    cap = f'<b>{inl(first[1])}</b> · {html.escape(first[3] if first[0] == "img" else svg_label(first[2]))}'
    return (f'<div class="gal" data-gal><div class="gview"><div class="gtrack">{"".join(figs)}</div>{nav}'
            f'<button class="gzoom" type="button" aria-label="Ver en grande">{icon("zoom")}</button></div>'
            f'<p class="gcap">{cap}</p>'
            + (f'<div class="gthumbs">{"".join(thumbs)}</div>' if n > 1 else '')
            + (f'<div class="gact">{acciones}</div>' if acciones else '') + '</div>')


PDF_BTN = ('<a class="btn" href="dl/tablero_60x60.pdf" download="tablero_60x60.pdf" target="_blank" rel="noopener">'
           + icon('pdf') + 'Descargar el PDF</a>')


# ------------------------------------------------------------------ listas con casilla
def ol_html(items):
    li = []
    for k, it in enumerate(items, 1):
        txt, sub = it if isinstance(it, tuple) else (it, None)
        subs = f'<ul>{"".join(f"<li>{inl(x)}</li>" for x in sub)}</ul>' if sub else ''
        li.append(f'<li><label class="ck"><input type="checkbox"><span class="ckbox" aria-hidden="true">{k}</span>'
                  f'<span class="ckt">{inl(txt)}{subs}</span></label></li>')
    return f'<ol class="check">{"".join(li)}</ol>'


def table_html(head, rows, cls=''):
    th = ''.join(f'<th>{inl(h)}</th>' for h in head)
    tr = ''.join('<tr>' + ''.join(f'<td data-label="{esc(h)}">{inl(c)}</td>' for h, c in zip(head, r)) + '</tr>' for r in rows)
    return f'<div class="tw"><table class="{cls}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'


def note_html(kind, txt):
    cls = {'warn': 'callout warn', 'idea': 'callout idea'}.get(kind, 'callout')
    return f'<div class="{cls}"><p>{inl(txt)}</p></div>'


def blocks_html(blocks):
    out, cur_h = [], None
    for b in blocks:
        if b[0] == 'h':
            cur_h = b[1]
        elif b[0] == 'ol':
            h = cur_h or 'Instrucciones'
            m = re.match(r'(\d+)\.\s*(.+)', h)
            badge, name = (m.group(1), m.group(2)) if m else ('', h)
            sn = f'<span class="sn">{badge}</span>' if badge else ''
            out.append(f'<section class="block"><h2 class="sec">{sn}<span>{inl(name)}</span><em class="scnt"></em></h2>{ol_html(b[1])}</section>')
            cur_h = None
        elif b[0] == 'note':
            out.append(note_html(b[1], b[2]))
        elif b[0] == 'table':
            out.append(table_html(b[1], b[2], 'stack'))
    return ''.join(out)


def herramientas(s):
    parts = [p.strip() for p in s.split(', ') if p.strip()]
    return [p[0].upper() + p[1:] for p in parts]


# ------------------------------------------------------------------ pantalla de un paso
def paso_html(st):
    n, total = st['n'], C.TOTAL
    prev_id = f'paso{n - 1}' if n > 1 else 'armar'
    prev_lbl = f'Paso {n - 1}' if n > 1 else 'Armar'
    if n < total:
        nx = C.PASOS[n]
        sig = f'<button class="btn pri big" type="button" data-go="paso{n + 1}">Siguiente: Paso {n + 1} · {inl(nx["title"])}{icon("chev")}</button>'
    else:
        sig = f'<button class="btn pri big" type="button" data-abrir="clase">Ir a Presentar{icon("chev")}</button>'
    acciones = ''
    if st.get('ver3d'):
        acciones += f"<button class=\"btn\" type=\"button\" data-ver3d='{html.escape(json.dumps(st['ver3d']), quote=True)}'>{icon('cubo')}Ver esta parte en 3D</button>"
    if st.get('pdf'):
        acciones += PDF_BTN
    needs = ''
    tools = herramientas(st['tools'])
    cols = []
    if st.get('needs'):
        cols.append('<div><h3>Necesitas</h3><ul class="dots">' + ''.join(f'<li>{inl(x)}</li>' for x in st['needs']) + '</ul></div>')
    cols.append('<div><h3>Herramientas</h3><ul class="dots">' + ''.join(f'<li>{inl(x)}</li>' for x in tools) + '</ul></div>')
    needs = f'<div class="card needs">{"".join(cols)}</div>'
    title = f'Paso {n} · {st["title"]}'
    return f'''<!-- ============================================================ PASO {n} -->
<section class="screen paso" id="{st["id"]}" data-tab="armar" data-parent="armar" data-title="{esc(title)}" data-short="Paso {n}" hidden>
  <header class="phead">
    <p class="eyebrow">Paso {n} de {total} <span class="t">{inl(st["tag"])}</span></p>
    <h1 class="title">{inl(st["title"])}</h1>
    <p class="lead">{inl(st["lead"])}</p>
    <div class="meta"><span class="chip">{icon("reloj")}{inl(st["time"])}</span></div>
    <div class="goal">{icon("meta")}<p><b>Al terminar tendrás:</b> {inl(st["result"])}</p></div>
    <div class="pstat"><span class="bar"><i></i></span><span class="pstat-t" data-prog-t>0 hechas</span></div>
  </header>
  <div class="pgrid">
    <div class="pmedia">{galeria(st["media"], acciones)}</div>
    <div class="pbody">
      {needs}
      {blocks_html(st["blocks"])}
      <div class="card fin">
        <p class="fin-t"><b>¿Ya está?</b> Revisa que tengas esto: {inl(st["result"])}</p>
        <p class="fin-ok"><b>¡Paso {n} listo!</b> Marcaste todo.</p>
        <div class="fin-nav"><button class="btn big" type="button" data-go="{prev_id}">{icon("atras")}{prev_lbl}</button>{sig}</div>
      </div>
    </div>
  </div>
</section>
'''


def pasos_html():
    return ''.join(paso_html(st) for st in C.PASOS)


# ------------------------------------------------------------------ Armar: la lista
PREP = [
    ('antes', 'libro', 'Antes de empezar', 'Léanlo juntos: cómo se mide, quién hace qué y seguridad'),
    ('materiales', 'lista', 'Materiales', 'Lista de compras con casillas'),
    ('plano', 'regla', 'Plano de la tapa', 'Dónde va cada pieza, con medidas'),
    ('dentro', 'capas', 'Por dentro', 'Cómo funciona el mecanismo escondido'),
]


def armar_html():
    prep = ''.join(f'<button class="row" type="button" data-go="{i}"><span class="ricon">{icon(ic)}</span>'
                   f'<span class="rtext"><b>{t}</b><small>{d}</small></span>'
                   + ('<span class="rprog" data-mat-total></span>' if i == 'materiales' else '')
                   + f'{icon("chev", "chev")}</button>' for i, ic, t, d in PREP)
    cards = []
    for st in C.PASOS:
        img = next(m[2] for m in st['media'] if m[0] == 'img')
        cards.append(f'<button class="scard" type="button" data-go="{st["id"]}" data-card="{st["id"]}">'
                     f'<span class="sc-img"><img src="{img}" alt="" loading="lazy" width="1600" height="1000"><span class="sc-n">{st["n"]}</span></span>'
                     f'<span class="sc-b"><small>Paso {st["n"]} · {inl(st["tag"])}</small><b>{inl(st["title"])}</b>'
                     f'<span class="sc-m">{inl(st["time"])}</span>'
                     f'<span class="sc-p"><span class="bar"><i></i></span><em>0/0</em></span></span></button>')
    return f'''<!-- ============================================================ ARMAR -->
<section class="screen" id="armar" data-tab="armar" data-title="Armar" hidden>
  <header class="shead">
    <h1 class="title">Armar la maqueta</h1>
    <p class="lead">8 pasos, unas 8 horas de trabajo en equipo. Toca un paso para ver qué hacer; marca cada cosa cuando la terminen y aquí verán cuánto llevan. Pidan la impresión del vinil desde el principio: tarda días.</p>
  </header>
  <div class="card resumen" id="resumen">
    <div class="res-t"><b id="resTxt">Todavía no marcan nada.</b><span class="bar"><i></i></span></div>
    <button class="btn pri big" type="button" id="resGo" data-go="antes">Empezar{icon("chev")}</button>
  </div>
  <h2 class="hsec">1 · Antes de empezar</h2>
  <div class="list prep">{prep}</div>
  <h2 class="hsec">2 · Los 8 pasos</h2>
  <div class="scards">{"".join(cards)}</div>
  <p class="foot muted">Cuando terminen el Paso 8, sigue <a href="#clase" class="lnk" data-abrir="clase">Presentar</a>: ahí están los 4 papeles y el guion.</p>
</section>
'''


# ------------------------------------------------------------------ materiales en una sola lista
def materiales_html():
    jumps, secs = [], []
    for ti, (name, rows) in enumerate(C.MATERIALES):
        jumps.append(f'<button class="chip" type="button" data-jump="mat-{ti}">{inl(name)}</button>')
        lis = []
        for i, r in enumerate(rows):
            qty = f'<span class="qty">{inl(r[1])}</span>' if r[1] else ''
            sub = ' · '.join(x for x in (inl(r[2]) if r[2] and r[2] != '—' else '', inl(r[3])) if x)
            lis.append(f'<li><label class="mrow"><input type="checkbox" data-mat="{ti}-{i}" aria-label="Ya lo tengo: {esc(r[0])}">'
                       f'<span class="ckbox" aria-hidden="true"></span><span class="mt"><b>{inl(r[0])}</b><small>{sub}</small></span>{qty}</label></li>')
        secs.append(f'<section class="card matg" id="mat-{ti}"><h2 class="sec"><span>{inl(name)}</span><em class="scnt" data-matcnt="{ti}"></em></h2>'
                    f'<ul class="mlist">{"".join(lis)}</ul></section>')
    jumps.append('<button class="chip" type="button" data-jump="mat-peg">¿Con qué se pega?</button>')
    peg = ''.join(f'<li><b>{inl(a)}</b><span>{inl(b)}</span><small>{inl(c)}</small></li>' for a, b, c in C.PEGAMENTOS)
    secs.append(f'<section class="card matg" id="mat-peg"><h2 class="sec"><span>¿Con qué se pega cada cosa?</span></h2><ul class="peg">{peg}</ul></section>')
    return f'''<!-- ============================================================ MATERIALES -->
<section class="screen" id="materiales" data-tab="armar" data-parent="armar" data-title="Materiales" hidden>
  <header class="shead">
    <p class="eyebrow">Lista de compras</p>
    <h1 class="title">Materiales y herramientas</h1>
    <p class="lead">Todo se consigue en maderería, ferretería y papelería; no lleva nada eléctrico. Pidan los cortes de MDF en la maderería: salen exactos, y si no hay taladro en la escuela, ahí mismo pueden hacer los agujeros grandes. Marquen cada cosa cuando ya la tengan.</p>
    <div class="pstat"><span class="bar"><i></i></span><span class="pstat-t" data-mat-total></span></div>
  </header>
  <nav class="jump" aria-label="Ir a un grupo">{"".join(jumps)}</nav>
  <div class="mats">{"".join(secs)}</div>
</section>
'''


# ------------------------------------------------------------------ antes de empezar
def antes_html():
    return f'''<!-- ============================================================ ANTES DE EMPEZAR -->
<section class="screen" id="antes" data-tab="armar" data-parent="armar" data-title="Antes de empezar" hidden>
  <header class="shead">
    <p class="eyebrow">Para todo el equipo</p>
    <h1 class="title">Antes de empezar</h1>
    <p class="lead">Léanlo una vez todo el equipo: cómo se miden las cosas, qué trae el PDF, cómo repartir el trabajo y cómo cuidarse.</p>
  </header>
  <div class="grid2 even">
    <div class="stack">
      <div class="card pad"><h3>Cómo se mide todo</h3>
        <p>Todas las posiciones se dan como <b>(x, y)</b> en centímetros, desde la <b>esquina trasera izquierda</b> de la tapa: x crece hacia la derecha y y hacia el frente, donde está el público. El centro del ciclo, donde va la perilla, está en (30, 30).</p>
        <p style="margin-top:8px">El vagón se detiene en <b>8 paradas numeradas</b> (0 a 7) impresas en la orilla de la pista. La perilla siempre se gira en <b>sentido horario</b>, como las manecillas del reloj.</p>
        <p style="margin-top:8px">Las alturas se miden desde la mesa, salvo cuando dice "sobre la tapa".</p>
        <div class="gact"><button class="btn" type="button" data-go="plano">{icon("regla")}Ver el plano de la tapa</button></div></div>
      <div class="card pad"><h3>Cómo repartir el trabajo (equipo de 3 o 4)</h3>
        <ul class="dots">
          <li><b>Carpintería:</b> Pasos 1 y 3 (caja, brazo y perilla).</li>
          <li><b>Tapa y vagón:</b> Pasos 2 y 4 (impresión, agujeros y vagón).</li>
          <li><b>Piezas:</b> Pasos 5, 6 y 7 (bloques, tarjetas, pinza, rampa y letreros). Si son 4, divídanse estos tres pasos.</li>
          <li><b>Todos:</b> Paso 8 (probar y ensayar la presentación).</li>
        </ul>
        <p class="small muted" style="margin-top:8px">Tiempo total: unas 8 horas de trabajo. La impresión del vinil y el secado del pegamento toman días: empiecen por ahí.</p></div>
      <div class="card pad"><h3>El PDF de 7 páginas</h3>
        <ol class="plainol">
          <li><b>Tablero 60 × 60 cm</b>: se imprime en plotter, en vinil.</li>
          <li><b>Tarjetas</b> de ATP, ADP, NADPH y NADP⁺.</li>
          <li><b>Letreros</b> y la solapa "¿Dónde ocurre?".</li>
          <li>Solapa <b>"¿Por qué le dicen fase oscura?"</b>, fondo de la <b>caja de glucosa</b> y calcomanía de la <b>perilla</b>.</li>
          <li><b>Plantillas</b>: discos, brazo, pinza, compuerta y torres.</li>
          <li><b>Rampa</b>: piezas y vista de lado a tamaño real.</li>
          <li><b>Mapas de bloques</b> de cada placa, a tamaño real.</li>
        </ol>
        <p class="small muted" style="margin-top:8px">Las páginas 2 a 7 van en hojas tamaño carta, siempre al 100 % (tamaño real).</p>
        <div class="gact">{PDF_BTN}</div></div>
    </div>
    <div class="stack">
      <div class="callout warn">
        <p><b>Seguridad.</b></p>
        <p><b>Cúter:</b> corta siempre alejando la navaja de tu mano y sobre una tabla de corte. <b>Taladro y caladora:</b> con un adulto o el maestro de taller; sujeta la pieza con prensa, nunca con la mano, y usa lentes.</p>
        <p><b>Silicón caliente:</b> aunque sea de baja temperatura, quema; no toques la punta ni la gota recién puesta. <b>Epóxico:</b> usa guantes y lávate las manos.</p>
        <p><b>Imanes de neodimio:</b> se pegan muy fuerte, pellizcan y se rompen si chocan. Guárdalos separados, lejos de celulares y tarjetas, y nunca al alcance de niños pequeños.</p>
      </div>
      <button class="row card" type="button" data-go="problemas"><span class="ricon">{icon("ayuda")}</span><span class="rtext"><b>¿Una palabra que no conoces?</b><small>El vocabulario está en Ayuda: MDF, avellanar, rondana, pivote…</small></span>{icon("chev", "chev")}</button>
      <div class="card pad"><h3>Orden recomendado</h3>
        <ol class="plainol">
          <li>Lean esta pantalla y la de <a href="#dentro" class="lnk" data-go="dentro">Por dentro</a>.</li>
          <li>Compren lo de <a href="#materiales" class="lnk" data-go="materiales">Materiales</a> y manden imprimir el vinil.</li>
          <li>Sigan los pasos del 1 al 8. Cada uno dice al inicio qué tendrán al terminarlo.</li>
        </ol>
        <div class="gact"><button class="btn pri" type="button" data-go="paso1">Ir al Paso 1{icon("chev")}</button></div></div>
    </div>
  </div>
</section>
'''


# ------------------------------------------------------------------ bloques chicos de otras pantallas
def funciona_lista():
    return ''.join(f'<li><span class="num" style="background:var(--{c})">{n}</span><div><b>{inl(t)}</b>{inl(x)}</div></li>' for c, n, t, x in C.VUELTA)


def papeles_html():
    colores = {'Conductor': '#3C6FB6', 'RuBisCO': '#D9822B', 'Energía': '#C8483C', 'Salida': '#7A55A8'}
    return ''.join(f'<div class="card rol" style="--rol:{colores.get(a, "var(--accent)")}"><b>{inl(a)}</b><p>{inl(b)}</p><span class="pill">{inl(c)}</span></div>' for a, b, c in C.PAPELES)


def guion_html():
    out = []
    for c, n, t, quien, x in C.GUION:
        bg = 'background:var(--surface-2);border:1px solid var(--line)' if c == 'surface' else f'background:var(--{c})'
        out.append(f'<li><span class="num" style="{bg}">{n}</span><div><b>{inl(t)} <span class="quien">· {inl(quien)}</span></b>{inl(x)}</div></li>')
    return ''.join(out)


def problemas_html():
    return '<div class="probs">' + ''.join(
        f'<div class="card prob"><b>{inl(a)}</b><p class="causa"><span>Por qué pasa:</span> {inl(b)}</p><p><span>Qué hacer:</span> {inl(c)}</p></div>'
        for a, b, c in C.PROBLEMAS) + '</div>'


def glosario_html():
    return ''.join(f'<div class="gl"><dt>{inl(a)}</dt><dd>{inl(b)}</dd></div>' for a, b in C.GLOSARIO)


def coords_html():
    return ''.join(f'<tr><td>{inl(a)}</td><td class="n">{inl(b)}</td><td>{inl(c)}</td></tr>' for a, b, c in C.COORDS)
