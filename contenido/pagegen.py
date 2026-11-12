# -*- coding: utf-8 -*-
"""Genera el HTML de las diapositivas (pasos, materiales, antes de empezar) y el markdown del documento desde content.py."""
import html
import os
import json
import re

import content as C

B = os.path.dirname(os.path.abspath(__file__))


def inl(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`(.+?)`', r'<code>\1</code>', s)
    return s


def svg(name):
    return open(f'{B}/svg/{name}.svg', encoding='utf-8').read()


def media_html(st):
    if not st['media']:
        return ''
    tabs, panes = [], []
    for i, m in enumerate(st['media']):
        pid = f"{st['id']}m{i}"
        tabs.append(f'<button class="tab" role="tab" aria-selected="{"true" if i == 0 else "false"}" data-pane="{pid}">{inl(m[1])}</button>')
        hid = '' if i == 0 else ' hidden'
        if m[0] == 'img':
            extra = ' style="aspect-ratio:1/1;object-fit:contain"' if len(m) > 4 and m[4] == 'square' else ''
            bg = ' style="background:var(--surface)"' if extra else ''
            panes.append(f'<div class="pane" data-id="{pid}"{hid}{bg}><img src="{m[2]}" alt="{html.escape(m[3])}" loading="lazy" width="1600" height="1000"{extra}></div>')
        elif m[0] == 'svg':
            panes.append(f'<div class="pane draw" data-id="{pid}"{hid}>{svg(m[2])}</div>')
    row = []
    if st.get('pdf'):
        row.append('<button class="btn pri sm" type="button" data-dl="dl/tablero_60x60.pdf" data-name="tablero_60x60.pdf">Descargar PDF</button>')
    if st.get('ver3d'):
        row.append(f"<button class=\"btn sm\" type=\"button\" data-ver3d='{json.dumps(st['ver3d'])}'>Ver en 3D</button>")
    toast = '<p class="toast" data-toast></p>' if st.get('pdf') else ''
    return (f'<div class="media"><div class="tabs" role="tablist">{"".join(tabs)}</div>{"".join(panes)}'
            f'<div class="row">{"".join(row)}</div>{toast}</div>')


def ol_html(items):
    li = []
    for it in items:
        if isinstance(it, tuple):
            txt, sub = it
            subs = ''.join(f'<li>{inl(x)}</li>' for x in sub)
            li.append(f'<li><label><input type="checkbox"><span>{inl(txt)}<ul>{subs}</ul></span></label></li>')
        else:
            li.append(f'<li><label><input type="checkbox"><span>{inl(it)}</span></label></li>')
    return f'<ol class="check">{"".join(li)}</ol>'


def table_html(head, rows, cls=''):
    th = ''.join(f'<th>{inl(h)}</th>' for h in head)
    tr = ''.join('<tr>' + ''.join(f'<td>{inl(c)}</td>' for c in r) + '</tr>' for r in rows)
    return f'<div class="tw"><table class="{cls}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'


def blocks_html(blocks):
    out, cur_h = [], None
    for b in blocks:
        if b[0] == 'h':
            cur_h = b[1]
        elif b[0] == 'ol':
            h = f'<h3>{inl(cur_h)}</h3>' if cur_h else ''
            out.append(f'<div class="block">{h}{ol_html(b[1])}</div>')
            cur_h = None
        elif b[0] == 'note':
            cls = {'warn': 'callout warn', 'idea': 'callout idea'}.get(b[1], 'callout')
            out.append(f'<div class="{cls}"><p>{inl(b[2])}</p></div>')
        elif b[0] == 'table':
            out.append(table_html(b[1], b[2]))
    return '<div class="stack">' + ''.join(out) + '</div>'


def head_html(st):
    needs = ''
    if st.get('needs'):
        needs = ('<details class="needs card"><summary><b>Necesitas</b><span class="muted small"> · '
                 f'{len(st["needs"])} cosas</span></summary><ul>' + ''.join(f'<li>{inl(n)}</li>' for n in st['needs']) + '</ul></details>')
    return (f'<div class="head"><p class="eyebrow">Paso {st["n"]} de {C.TOTAL} <span class="t">{inl(st["tag"])}</span></p>'
            f'<h2>{inl(st["title"])}</h2><p class="lead">{inl(st["lead"])}</p>'
            f'<div class="meta"><span class="pill"><b>{inl(st["time"])}</b></span><span class="pill">{inl(st["tools"])}</span></div>{needs}</div>')


def section(st, body):
    title = f'Paso {st["n"]} · {st["title"]}'
    return (f'<!-- ============================================================ PASO {st["n"]} -->\n'
            f'<section class="slide" id="{st["id"]}" data-title="{html.escape(title)}" data-grupo="Construcción" hidden>'
            f'{head_html(st)}{body}</section>\n')


def paso_normal(st):
    return section(st, f'<div class="grid2">{media_html(st)}{blocks_html(st["blocks"])}</div>')


def lists_html(groups, numbered_title=True):
    return ''.join(f'<div class="block"><h3>{inl(t)}</h3>{ol_html(items)}</div>' for t, items in groups)


def pasos_html():
    return ''.join(paso_normal(st) for st in C.PASOS)


def materiales_html():
    tabs, panes = [], []
    groups = C.MATERIALES[:]
    for i, (name, rows) in enumerate(groups):
        pid = f'm{i}'
        tabs.append(f'<button class="tab" role="tab" aria-selected="{"true" if i == 0 else "false"}" data-pane="{pid}">{inl(name)}</button>')
        if name == 'Herramientas':
            body = '<div class="tw"><table class="mat"><thead><tr><th></th><th>Herramienta</th><th>Para qué</th></tr></thead><tbody>' + \
                   ''.join(f'<tr><td>{inl(r[0])}</td><td data-label="Para qué">{inl(r[3])}</td></tr>' for r in rows) + '</tbody></table></div>'
        else:
            body = '<div class="tw"><table class="mat"><thead><tr><th></th><th>Pieza</th><th>Cant.</th><th>Especificación</th><th>Para qué</th></tr></thead><tbody>' + \
                   ''.join(f'<tr><td>{inl(r[0])}</td><td class="n" data-label="Cant.">{inl(r[1])}</td><td data-label="Especificación">{inl(r[2])}</td><td data-label="Para qué">{inl(r[3])}</td></tr>' for r in rows) + '</tbody></table></div>'
        panes.append(f'<div class="mt" data-id="{pid}"{"" if i == 0 else " hidden"}>{body}</div>')
    i = len(groups)
    tabs.append(f'<button class="tab" role="tab" aria-selected="false" data-pane="m{i}">¿Con qué se pega?</button>')
    panes.append(f'<div class="mt" data-id="m{i}" hidden>{table_html(["Qué se pega", "Con qué", "Consejo"], C.PEGAMENTOS)}</div>')
    return f'''<!-- ============================================================ MATERIALES -->
<section class="slide" id="materiales" data-title="Materiales" data-grupo="Empezar" hidden>
  <div class="head">
    <p class="eyebrow">Lista de compras</p>
    <h2>Materiales y herramientas</h2>
    <p class="lead">Todo se consigue en maderería, ferretería y papelería; no lleva nada eléctrico. Pide los cortes de MDF en la maderería: salen exactos, y si no tienen taladro en la escuela, ahí mismo pueden hacer los agujeros grandes. Marca cada cosa cuando ya la tengas.</p>
  </div>
  <div class="mtabs tabs" role="tablist">{"".join(tabs)}</div>
  {"".join(panes)}
  <p class="total" id="matTotal"></p>
</section>
'''


def antes_html():
    glos = ''.join(f'<div class="gl"><dt>{inl(a)}</dt><dd>{inl(b)}</dd></div>' for a, b in C.GLOSARIO)
    return f'''<!-- ============================================================ ANTES DE EMPEZAR -->
<section class="slide" id="antes" data-title="Antes de empezar" data-grupo="Empezar" hidden>
  <div class="head">
    <p class="eyebrow">Para todo el equipo</p>
    <h2>Antes de empezar</h2>
    <p class="lead">Lean esto una vez todo el equipo. Explica cómo se miden las cosas, cómo repartir el trabajo, cómo cuidarse y qué significa cada palabra.</p>
  </div>
  <div class="grid2 even">
    <div class="stack">
      <div class="card pad"><h3>Cómo se mide todo</h3>
        <p>Todas las posiciones se dan como <b>(x, y)</b> en centímetros, desde la <b>esquina trasera izquierda</b> de la tapa: x crece hacia la derecha y y hacia el frente, donde está el público. El centro del ciclo, donde va la perilla, está en (30, 30).</p>
        <p style="margin-top:8px">El vagón se detiene en <b>8 paradas numeradas</b> (0 a 7) impresas en la orilla de la pista. La perilla siempre se gira en <b>sentido horario</b>, como las manecillas del reloj.</p>
        <p style="margin-top:8px">Las alturas se miden desde la mesa, salvo cuando dice "sobre la tapa".</p></div>
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
        <div class="row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn pri sm" type="button" data-dl="dl/tablero_60x60.pdf" data-name="tablero_60x60.pdf">Descargar PDF</button></div>
        <p class="toast" data-toast></p></div>
      <div class="card pad"><h3>Cómo repartir el trabajo (equipo de 3 o 4)</h3>
        <ul class="plain">
          <li><b>Carpintería:</b> Pasos 1 y 3 (caja, brazo y perilla).</li>
          <li><b>Tapa y vagón:</b> Pasos 2 y 4 (impresión, agujeros y vagón).</li>
          <li><b>Piezas:</b> Pasos 5, 6 y 7 (bloques, tarjetas, pinza, rampa y letreros). Si son 4, divídanse estos tres pasos.</li>
          <li><b>Todos:</b> Paso 8 (probar y ensayar la presentación).</li>
        </ul>
        <p class="small muted" style="margin-top:8px">Tiempo total: unas 8 horas de trabajo. La impresión del vinil y el secado del pegamento toman días: empiecen por ahí.</p></div>
    </div>
    <div class="stack">
      <div class="callout warn">
        <p><b>Seguridad.</b></p>
        <p><b>Cúter:</b> corta siempre alejando la navaja de tu mano y sobre una tabla de corte. <b>Taladro y caladora:</b> con un adulto o el maestro de taller; sujeta la pieza con prensa, nunca con la mano, y usa lentes.</p>
        <p><b>Silicón caliente:</b> aunque sea de baja temperatura, quema; no toques la punta ni la gota recién puesta. <b>Epóxico:</b> usa guantes y lávate las manos.</p>
        <p><b>Imanes de neodimio:</b> se pegan muy fuerte, pellizcan y se rompen si chocan. Guárdalos separados, lejos de celulares y tarjetas, y nunca al alcance de niños pequeños.</p>
      </div>
      <div class="card pad"><h3>Vocabulario</h3><dl class="glos">{glos}</dl></div>
    </div>
  </div>
</section>
'''


def funciona_lista():
    return ''.join(f'<li><span class="num" style="background:var(--{c})">{n}</span><div><b>{inl(t)}</b>{inl(x)}</div></li>' for c, n, t, x in C.VUELTA)


def papeles_html():
    return ''.join(f'<div class="card rol"><b>{inl(a)}</b><p>{inl(b)}</p><span class="pill">{inl(c)}</span></div>' for a, b, c in C.PAPELES)


def guion_html():
    out = []
    for c, n, t, quien, x in C.GUION:
        bg = 'background:var(--surface-2);border:1px solid var(--line)' if c == 'surface' else f'background:var(--{c})'
        out.append(f'<li><span class="num" style="{bg}">{n}</span><div><b>{inl(t)} <span class="quien">· {inl(quien)}</span></b>{inl(x)}</div></li>')
    return ''.join(out)


def problemas_html():
    tr = ''.join('<tr>' + ''.join(f'<td data-label="{h}">{inl(v)}</td>' for h, v in zip(('Lo que pasa', 'Causa probable', 'Qué hacer'), r)) + '</tr>' for r in C.PROBLEMAS)
    return f'<div class="tw"><table class="stack"><thead><tr><th>Lo que pasa</th><th>Causa probable</th><th>Qué hacer</th></tr></thead><tbody>{tr}</tbody></table></div>'


def coords_html():
    return ''.join(f'<tr><td>{inl(a)}</td><td class="n">{inl(b)}</td><td>{inl(c)}</td></tr>' for a, b, c in C.COORDS)


# ------------------------------------------------------------------ documento (markdown)
def md_inline(s):
    return s


def md_list(items, ordered=True):
    out = []
    for i, it in enumerate(items, 1):
        mark = f'{i}.' if ordered else '-'
        if isinstance(it, tuple):
            out.append(f'{mark} {it[0]}')
            for sub in it[1]:
                out.append(f'   - {sub}')
        else:
            out.append(f'{mark} {it}')
    return '\n'.join(out)


def md_table(head, rows):
    esc = lambda x: x.replace('|', '\\|')
    return '\n'.join(['| ' + ' | '.join(head) + ' |', '| ' + ' | '.join('---' for _ in head) + ' |'] +
                     ['| ' + ' | '.join(esc(c) for c in r) + ' |' for r in rows])


def md_paso(st):
    out = [f'## Paso {st["n"]}: {st["title"].lower() if False else st["title"]}', '', st['lead'], '',
           f'**Tiempo:** {st["time"]}. **Herramientas:** {st["tools"]}.', '']
    if st.get('needs'):
        out += ['**Necesitas:**', '', md_list(st['needs'], ordered=False), '']
    cur_h = None
    for b in st['blocks']:
        if b[0] == 'h':
            cur_h = b[1]
        elif b[0] == 'ol':
            if cur_h:
                out += [f'**{cur_h}**', '']
                cur_h = None
            out += [md_list(b[1]), '']
        elif b[0] == 'note':
            out += [b[2], '']
        elif b[0] == 'table':
            out += [md_table(b[1], b[2]), '']
    return '\n'.join(out)
