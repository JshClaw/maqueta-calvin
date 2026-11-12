#!/usr/bin/env python3
"""Planos 2D (SVG) de la maqueta, generados desde layout.json. Colores por clases CSS de la página."""
import json, math, os

AQUI = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(AQUI, '..', '3d', 'layout.json'), encoding='utf-8'))
OUT = os.path.join(AQUI, 'svg')
os.makedirs(OUT, exist_ok=True)


def f(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def T(x, y, s, cls='t', anchor='middle', size=None, extra=''):
    sz = f' font-size="{f(size)}"' if size else ''
    return f'<text x="{f(x)}" y="{f(y)}" class="{cls}" text-anchor="{anchor}"{sz}{extra}>{esc(s)}</text>'


def dim_h(x0, x1, y, label, tick=6, cls='dim', above=True, size=12):
    o = [f'<g class="{cls}">',
         f'<line x1="{f(x0)}" y1="{f(y)}" x2="{f(x1)}" y2="{f(y)}"/>',
         f'<line x1="{f(x0)}" y1="{f(y - tick)}" x2="{f(x0)}" y2="{f(y + tick)}"/>',
         f'<line x1="{f(x1)}" y1="{f(y - tick)}" x2="{f(x1)}" y2="{f(y + tick)}"/>',
         f'<path d="M{f(x0)},{f(y)} l7,-3 v6 z M{f(x1)},{f(y)} l-7,-3 v6 z" class="arrow"/>',
         '</g>',
         T((x0 + x1) / 2, y - 6 if above else y + 15, label, 'dimt', size=size)]
    return ''.join(o)


def dim_v(y0, y1, x, label, tick=6, cls='dim', left=True, size=12):
    o = [f'<g class="{cls}">',
         f'<line x1="{f(x)}" y1="{f(y0)}" x2="{f(x)}" y2="{f(y1)}"/>',
         f'<line x1="{f(x - tick)}" y1="{f(y0)}" x2="{f(x + tick)}" y2="{f(y0)}"/>',
         f'<line x1="{f(x - tick)}" y1="{f(y1)}" x2="{f(x + tick)}" y2="{f(y1)}"/>',
         f'<path d="M{f(x)},{f(y0)} l-3,7 h6 z M{f(x)},{f(y1)} l-3,-7 h6 z" class="arrow"/>',
         '</g>']
    tx = x - 8 if left else x + 8
    o.append(f'<text x="{f(tx)}" y="{f((y0 + y1) / 2)}" class="dimt" text-anchor="middle" font-size="{size}" '
             f'transform="rotate(-90 {f(tx)} {f((y0 + y1) / 2)})">{esc(label)}</text>')
    return ''.join(o)


def save(name, vb, body, title, style=''):
    st = f' style="{style}"' if style else ''
    svg = (f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{esc(title)}" class="plano"{st}>'
           f'<title>{esc(title)}</title>{body}</svg>')
    open(f'{OUT}/{name}.svg', 'w', encoding='utf-8', newline='\n').write(svg)
    print(name, len(svg))


# ================================================================== 1. plano superior (interactivo)
S = 12.0  # px por cm
TR0, TR1 = 12.4, 16.4   # pista (centrada en el radio del vagón, 14.4)
CT = L['controls']
KN = L['knob']
AR = L['arm']


def ang_pt(deg, r):
    a = math.radians(L['homeAngle'] + deg)
    return 30 + r * math.cos(a), 30 + r * math.sin(a)


def ring_seg(r0, r1, d0, d1):
    xa, ya = ang_pt(d0, r1)
    xb, yb = ang_pt(d1, r1)
    xc, yc = ang_pt(d1, r0)
    xd, yd = ang_pt(d0, r0)
    large = 1 if (d1 - d0) % 360 > 180 else 0
    return (f'M{f(xa * S)},{f(ya * S)} A{f(r1 * S)},{f(r1 * S)} 0 {large} 1 {f(xb * S)},{f(yb * S)} '
            f'L{f(xc * S)},{f(yc * S)} A{f(r0 * S)},{f(r0 * S)} 0 {large} 0 {f(xd * S)},{f(yd * S)} Z')


def item(key, inner):
    return f'<g class="it" data-k="{key}" tabindex="0">{inner}</g>'


def rect_cm(x0, y0, x1, y1, cls, rx=0.0):
    return (f'<rect x="{f(x0 * S)}" y="{f(y0 * S)}" width="{f((x1 - x0) * S)}" height="{f((y1 - y0) * S)}" '
            f'rx="{f(rx * S)}" class="{cls}"/>')


def rect_c(cx, cy, w, h, cls, rx=0.0):
    return rect_cm(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, cls, rx)


def circ(cx, cy, r, cls):
    return f'<circle cx="{f(cx * S)}" cy="{f(cy * S)}" r="{f(r * S)}" class="{cls}"/>'


def cross(cx, cy, r, cls='axisx'):
    return (f'<path d="M{f((cx - r) * S)},{f(cy * S)} H{f((cx + r) * S)} M{f(cx * S)},{f((cy - r) * S)} V{f((cy + r) * S)}" class="{cls}"/>')


b = []
b.append(item('tapa', rect_cm(0, 0, 60, 60, 'board') + ''.join(circ(x, y, 0.3, 'screw') for x, y in L['screws'])))
b.append('<g class="under">')
b.append(item('giro', f'<circle cx="{f(30 * S)}" cy="{f(30 * S)}" r="{f(15.3 * S)}" class="sweep"/>'))
b.append(item('postes', ''.join(rect_c(px, py, 2, 2, 'hid') for px, py in L['posts'])))
b.append('</g>')
stage_rng = [(0, 90, 'st1'), (90, 225, 'st2'), (225, 360, 'st3')]
b.append(item('pista', ''.join(f'<path d="{ring_seg(TR0, TR1, d0, d1)}" class="{c} trk"/>' for d0, d1, c in stage_rng)))
order = ['rubp', 'fijacion', 'pga', 'atp', 'nadph', 'g3p', 'regen', 'atp3']
st = []
for n, k in enumerate(order):
    d = L['stops'][k]
    x0, y0 = ang_pt(d, TR1 - 0.9)
    x1, y1 = ang_pt(d, TR1 + 0.25)
    st.append(f'<line x1="{f(x0 * S)}" y1="{f(y0 * S)}" x2="{f(x1 * S)}" y2="{f(y1 * S)}" class="stop"/>')
    cx_, cy_ = ang_pt(d, L['stopR'])
    st.append(circ(cx_, cy_, 0.62, 'stopc') + T(cx_ * S, cy_ * S + 4.5, str(n), 'stopn', size=12.5))
b.append(item('paradas', ''.join(st)))
b.append(item('centro', circ(30, 30, KN['r'], 'knob') + circ(30, 30, KN['dowel'] / 2, 'shaft') +
              T(30 * S, (30 + KN['r']) * S + 18, 'perilla', 'tl', size=13)))
for k, pl in L['plates'].items():
    cx, cy = pl['c']
    b.append(item('pl_' + k, rect_c(cx, cy, 6.4, 6.4, 'plate', 0.2) + T(cx * S, cy * S + 5, pl['label'], 'tb', size=14.5)))
# piezas que se mueven a mano (en reposo)
px, py = CT['pinza']['c']
pz = rect_cm(px - 0.6 - 8.8, py - 0.5, px + 0.6, py + 0.5, 'stick', 0.5) + rect_cm(px - 8.6, py - 0.45, px - 1.6, py + 0.45, 'pinzaf', 0.12)
pz += rect_c(px, py, 2, 2, 'torre') + circ(px, py, 0.22, 'shaft')
pz += T((px + 1.6) * S, (py + 0.3) * S + 4, 'Pinza RuBisCO', 'tl', anchor='start', size=13)
b.append(item('ct_pinza', pz))
for k, lbl in (('atp', 'ATP'), ('nadph', 'NADPH'), ('atp3', 'ATP regen.')):
    cx, cy = CT[k]['c']
    g_ = rect_c(cx, cy, 6.0, 0.45, 'card') + rect_c(cx, cy, 2, 2, 'torre') + circ(cx, cy, 0.22, 'shaft')
    g_ += f'<circle cx="{f(cx * S)}" cy="{f(cy * S)}" r="{f(3.0 * S)}" class="swing"/>'
    g_ += T(cx * S, (cy + 3.0) * S + 16, 'Tarjeta ' + lbl, 'tl', size=13)
    b.append(item('ct_' + k, g_))
gx, gy = CT['gate']['c']
gg = rect_cm(gx - 0.9, gy - 1.0, gx + 0.9, gy + 7.0, 'stick', 0.9) + rect_c(gx, gy, 2, 2, 'torre') + circ(gx, gy, 0.22, 'shaft')
gg += T((gx - 1.4) * S, (gy - 1.4) * S, 'Compuerta', 'tl', anchor='end', size=13)
r = L['ramp']
hw = r['width'] / 2
rp = rect_cm(r['bottom'][0], r['top'][1] - hw, r['top'][0], r['top'][1] + hw, 'ramp')
rp += rect_cm(r['cut'][0], r['top'][1] - hw, r['cut'][1], r['top'][1] + hw, 'rampcut')
rp += ''.join(rect_c(px_, r['top'][1], 2, 2, 'hid') for px_ in r['pillars'])
rp += f'<path d="M{f((r["top"][0] - 1) * S)},{f(r["top"][1] * S)} L{f((r["bottom"][0] + 1.4) * S)},{f(r["top"][1] * S)}" class="rampdir"/>'
rp += T(16.2 * S, (r['top'][1] + 2.8) * S, 'rampa 15.5 cm', 'tl', size=13)
b.append(item('rampa', rp))
b.append(item('ct_gate', gg))
g = L['glucose']
b.append(item('glucosa', rect_cm(*g, 'gluc') + T((g[0] + g[2]) / 2 * S, (g[1] + g[3]) / 2 * S + 4, '½ glucosa', 'tl', size=13)))
b.append(item('titulo', rect_cm(*L['signTitle'], 'sign') + T(10.5 * S, 5 * S + 4, 'Letrero del título', 'tl', size=13)))
b.append(item('fase', rect_cm(*L['signSun'], 'sign') + T(49.5 * S, 5 * S + 4, 'Fase luminosa', 'tl', size=13)))
for i, fl in enumerate(L['flaps']):
    cx_, cy_ = (fl[0] + fl[2]) / 2 * S, (fl[1] + fl[3]) / 2 * S
    if i == 0:
        txt = T(cx_, cy_ + 4, '¿Dónde ocurre?', 'tl', size=13)
    else:   # la solapa mide 10 cm: el texto va en dos renglones
        txt = T(cx_, cy_ - 3, '¿Por qué le dicen', 'tl', size=11) + T(cx_, cy_ + 11, 'fase oscura?', 'tl', size=11)
    b.append(item(f'solapa{i + 1}', rect_cm(*fl, 'flap') + txt))
b.append(dim_h(0, 60 * S, -22, '60 cm', size=14))
b.append(dim_v(0, 60 * S, -24, '60 cm', size=14))
b.append(dim_h(0, 30 * S, 60 * S + 26, 'x = 30', above=False, size=12))
b.append(dim_v(0, 30 * S, 60 * S + 26, 'y = 30', left=False, size=12))
b.append(T(0, -48, 'ATRÁS', 'tl', anchor='start', size=13))
b.append(T(30 * S, 60 * S + 66, 'FRENTE · aquí se para el público', 'tl', size=13))
b.append(T(-6, -8, '(0, 0)', 'tl', anchor='end', size=12))
save('plano', f'-62 -68 {f(60 * S + 120)} {f(60 * S + 150)}', ''.join(b), 'Plano superior de la tapa con medidas en centímetros')

# ================================================================== 2. corte lateral por el centro (con números)
K = 15.0
HT = 19.0
T0 = 20.0
WALL = L['box']['wallH']
UND = 0.6 + WALL          # cara de abajo de la tapa
TOPc = UND + 0.6          # superficie de la tapa
ARM0 = UND - AR['pad'] - 0.6


def X(x):
    return x * K


def Y(y):
    return T0 + (HT - y) * K


def r_(x0, y0, x1, y1, cls, rx=0):
    return f'<rect x="{f(X(x0))}" y="{f(Y(y1))}" width="{f((x1 - x0) * K)}" height="{f((y1 - y0) * K)}" rx="{rx}" class="{cls}"/>'


c = []
c.append(f'<line x1="{f(X(-2))}" y1="{f(Y(0))}" x2="{f(X(62))}" y2="{f(Y(0))}" class="table"/>')
c.append(r_(0, 0, 60, 0.6, 'mdf'))
c.append(r_(0, 0.6, 0.6, UND, 'mdf') + r_(59.4, 0.6, 60, UND, 'mdf'))
c.append(r_(0, UND, 29.2, TOPc, 'mdf') + r_(30.8, UND, 60, TOPc, 'mdf'))        # tapa con el agujero de ⅝″
c.append(r_(0, TOPc, 29.2, TOPc + 0.06, 'vinyl') + r_(30.8, TOPc, 60, TOPc + 0.06, 'vinyl'))
c.append(r_(14.0 - 1, 0.6, 14.0 + 1, UND, 'pine ghost') + r_(46.0 - 1, 0.6, 46.0 + 1, UND, 'pine ghost'))   # postes (proyectados)
# palo, brazo, imanes y fieltros
c.append(r_(30 - AR['len'] / 2, ARM0, 30 + AR['len'] / 2, ARM0 + 0.6, 'mdf'))
c.append(r_(30 + AR['magR'] - 0.6, ARM0, 30 + AR['magR'] + 0.6, ARM0 + 0.6, 'magnet'))
for sx in (-1, 1):
    c.append(r_(30 + sx * AR['padC'] - 1, ARM0 + 0.6, 30 + sx * AR['padC'] + 1, UND, 'felt'))
c.append(r_(30 - KN['dowel'] / 2, ARM0, 30 + KN['dowel'] / 2, ARM0 + KN['dowelLen'], 'pine'))
c.append(r_(30 - KN['washerR'], TOPc + 0.06, 30 - KN['dowel'] / 2, TOPc + 0.06 + KN['washerT'], 'metal2'))
c.append(r_(30 + KN['dowel'] / 2, TOPc + 0.06, 30 + KN['washerR'], TOPc + 0.06 + KN['washerT'], 'metal2'))
k0 = TOPc + 0.06 + KN['washerT']
for i in range(KN['discs']):
    c.append(r_(30 - KN['r'], k0 + i * 0.6, 30 - KN['dowel'] / 2, k0 + (i + 1) * 0.6, 'mdf'))
    c.append(r_(30 + KN['dowel'] / 2, k0 + i * 0.6, 30 + KN['r'], k0 + (i + 1) * 0.6, 'mdf'))
# vagón sobre los imanes
vx = 30 + AR['magR']
vb = TOPc + 0.06
c.append(r_(vx - 2.25, vb, vx + 2.25, vb + 0.03, 'felt') + r_(vx - 2.25, vb + 0.03, vx + 2.25, vb + 0.63, 'mdf'))
c.append(r_(vx - 0.5, vb + 0.03, vx + 0.5, vb + 0.63, 'magnet'))
c.append(r_(vx - 1.6, vb + 0.63, vx + 1.6, vb + 0.95, 'plate2') + r_(vx - 1.2, vb + 0.95, vx - 0.4, vb + 1.91, 'green', 2))
# tarjeta ATP (el corte pasa justo por su base, en x = 52.5)
ax = CT['atp']['c'][0]
ah_ = CT['atp']['h']
c.append(r_(ax - 1, TOPc + 0.06, ax + 1, TOPc + 0.06 + ah_, 'pine'))
c.append(r_(ax - 3, TOPc + 0.06 + ah_ + 0.3, ax + 3, TOPc + 0.06 + ah_ + 8.3, 'cardc'))
c.append(r_(ax - 0.15, TOPc + 0.06 + ah_ - 1.2, ax + 0.15, TOPc + 0.06 + ah_ + 7.9, 'skewer'))


def num(n, x, y, tx, ty):
    o = ''
    if (tx, ty) != (x, y):
        o += f'<path d="M{f(X(x))},{f(Y(y))} L{f(X(tx))},{f(Y(ty))}" class="lead"/><circle cx="{f(X(x))}" cy="{f(Y(y))}" r="2.2" class="leaddot"/>'
    o += f'<circle cx="{f(X(tx))}" cy="{f(Y(ty))}" r="10" class="numc"/>' + T(X(tx), Y(ty) + 4.3, str(n), 'numt', size=12)
    return o


c.append(num(1, 31.6, k0 + 0.9, 36.0, 10.8))
c.append(num(2, 31.2, TOPc + 0.15, 35.0, 8.4))
c.append(num(3, 22.0, TOPc - 0.3, 20.0, 8.6))
c.append(num(4, 30.0, ARM0 + 1.5, 26.0, 3.2))
c.append(num(5, 22.0, ARM0 + 0.3, 20.0, 2.6))
c.append(num(6, 44.4, ARM0 + 0.3, 42.0, 2.6))
c.append(num(7, 16.2, UND - 0.1, 12.0, 8.6))
c.append(num(8, vx + 1.2, vb + 1.0, 46.6, 10.8))
c.append(num(9, ax + 3.0, TOPc + 6.0, 57.6, 13.4))
c.append(num(10, 46.0, 2.6, 50.0, 2.6))
c.append(num(11, 8.0, 0.3, 8.0, 2.4))
c.append(dim_v(Y(0.6), Y(UND), X(-1.3), f'{WALL:g} cm libres', size=11))
c.append(dim_v(Y(0), Y(TOPc), X(61.3), f'{TOPc:.1f} cm', left=False, size=11))
zx, zy, zs = X(64.0), Y(17.5), 64.0


def zy_(h):
    return 40 + (TOPc + 0.9 - h) * zs


z = [f'<g transform="translate({f(zx)},{f(zy)})">',
     f'<rect x="0" y="0" width="240" height="210" rx="10" class="zoombox"/>',
     T(120, 24, 'Acercamiento: la punta del brazo', 'tb', size=12.5)]
z.append(f'<rect x="18" y="{f(zy_(TOPc + 0.06))}" width="204" height="{f(0.06 * zs)}" class="vinyl"/>')
z.append(f'<rect x="18" y="{f(zy_(TOPc))}" width="204" height="{f(0.6 * zs)}" class="mdf"/>')
z.append(f'<rect x="40" y="{f(zy_(UND))}" width="{f(2.0 * zs)}" height="{f(AR["pad"] * zs)}" class="felt"/>')
z.append(f'<rect x="18" y="{f(zy_(ARM0 + 0.6))}" width="204" height="{f(0.6 * zs)}" class="mdf"/>')
z.append(f'<rect x="{f(40 + 0.4 * zs)}" y="{f(zy_(ARM0 + 0.6))}" width="{f(1.2 * zs)}" height="{f(0.6 * zs)}" class="magnet"/>')
z.append(f'<line x1="176" y1="{f(zy_(UND))}" x2="176" y2="{f(zy_(UND - AR["pad"]))}" class="gap"/>')
z.append(T(182, (zy_(UND) + zy_(UND - AR['pad'])) / 2 - 2, 'fieltro', 'tred', anchor='start', size=11.5))
z.append(T(182, (zy_(UND) + zy_(UND - AR['pad'])) / 2 + 12, '2 mm', 'tred', anchor='start', size=11.5))
z.append(T(120, 196, 'tapa 6 mm · fieltro · imanes en el brazo', 'tl', size=11))
z.append('</g>')
c.append(''.join(z))
save('corte', f'{f(X(-3.4))} 0 {f(X(64.0) + 250 - X(-3.4))} {f(Y(-0.6) + 6)}', ''.join(c), 'Corte lateral por el centro de la maqueta')

# ================================================================== 3. brazo y perilla (arriba y de lado)
A = 26.0
ox, oy = 30, 74


def AX(x):
    return ox + (x + 15) * A


d = []
aw = AR['w']
d.append(f'<rect x="{f(AX(-15))}" y="{oy}" width="{f(30 * A)}" height="{f(aw * A)}" rx="3" class="mdf"/>')
d.append(f'<line x1="{f(AX(0))}" y1="{oy - 14}" x2="{f(AX(0))}" y2="{f(oy + aw * A + 14)}" class="axis"/>')
d.append(f'<circle cx="{f(AX(0))}" cy="{f(oy + aw / 2 * A)}" r="{f(0.635 * A)}" class="shaft"/>')
d.append(f'<circle cx="{f(AX(14.4))}" cy="{f(oy + aw / 2 * A)}" r="{f(0.6 * A)}" class="magnet"/>')
for sx in (-1, 1):
    d.append(f'<rect x="{f(AX(sx * AR["padC"] - 1))}" y="{f(oy + (aw / 2 - 1) * A)}" width="{f(2 * A)}" height="{f(2 * A)}" class="felt dashed"/>')
d.append(dim_h(AX(-15), AX(15), oy - 34, '30 cm · tira de MDF de 6 mm, 2.5 cm de ancho', size=12))
d.append(dim_h(AX(0), AX(14.4), oy + aw * A + 34, '14.4 cm al centro de los imanes', above=False, size=11.5))
d.append(T(AX(15), oy + aw * A + 78, 'Derecha: 2 imanes de 12 × 3 mm encimados, al ras', 'tl', anchor='end', size=11))
d.append(T(AX(-15), oy + aw * A + 78, 'Sombreado: fieltro de 2 × 2 cm arriba, en las dos puntas', 'tl', anchor='start', size=11))
d.append(T(AX(0), oy + aw * A + 100, 'Al centro: agujero de ½″ donde entra el palo, al ras por abajo', 'tl', size=11))
# vista de lado (apilado)
sy = oy + aw * A + 150
sk = 40.0


def SY(h):
    return sy + (ARM0 + KN['dowelLen'] + 0.3 - h) * sk


d.append(T(AX(-15), sy - 6, 'De lado: así se apila', 'tb', anchor='start', size=12))
d.append(f'<rect x="{f(AX(-15))}" y="{f(SY(ARM0 + 0.6))}" width="{f(30 * A)}" height="{f(0.6 * sk)}" class="mdf"/>')
d.append(f'<rect x="{f(AX(13.8))}" y="{f(SY(ARM0 + 0.6))}" width="{f(1.2 * A)}" height="{f(0.6 * sk)}" class="magnet"/>')
for sx in (-1, 1):
    d.append(f'<rect x="{f(AX(sx * AR["padC"] - 1))}" y="{f(SY(UND))}" width="{f(2 * A)}" height="{f(AR["pad"] * sk)}" class="felt"/>')
d.append(f'<rect x="{f(AX(-15))}" y="{f(SY(TOPc))}" width="{f(30 * A)}" height="{f(0.6 * sk)}" class="mdf ghost"/>')
d.append(f'<rect x="{f(AX(-KN["washerR"]))}" y="{f(SY(TOPc + KN["washerT"]))}" width="{f(2 * KN["washerR"] * A)}" height="{f(KN["washerT"] * sk)}" class="metal2"/>')
for i in range(KN['discs']):
    yb_ = TOPc + KN['washerT'] + (i + 1) * 0.6
    d.append(f'<rect x="{f(AX(-KN["r"]))}" y="{f(SY(yb_))}" width="{f(2 * KN["r"] * A)}" height="{f(0.6 * sk)}" class="mdf"/>')
d.append(f'<rect x="{f(AX(-0.635))}" y="{f(SY(ARM0 + KN["dowelLen"]))}" width="{f(1.27 * A)}" height="{f(KN["dowelLen"] * sk)}" class="pine"/>')
lbls = [(0.3, ARM0 + KN['dowelLen'] - 0.4, 'palo de ½″, 4 cm (sobresale 1.2 cm)'), (KN['r'] - 0.4, TOPc + KN['washerT'] + 0.9, f'perilla: 2 discos de Ø {KN["r"] * 2:g} cm'),
        (KN['washerR'] - 0.3, TOPc + KN['washerT'] / 2, 'rondana de ½″ sobre la tapa'), (9.0, TOPc - 0.3, 'tapa de 6 mm (agujero de ⅝″)'),
        (AR['padC'], UND - AR['pad'] / 2, 'fieltro de 2 mm: toca la tapa'), (9.0, ARM0 + 0.3, 'brazo de MDF, imanes al ras')]
LX = AX(15) + 34
n_ = len(lbls)
for k, (hx, h, s_) in enumerate(lbls):
    yy = SY(h)
    ly = SY(ARM0 + KN['dowelLen']) + 6 + k * (SY(ARM0) - SY(ARM0 + KN['dowelLen']) - 6) / (n_ - 1)
    d.append(f'<path d="M{f(AX(hx))},{f(yy)} L{f(LX - 14)},{f(ly)} H{f(LX - 4)}" class="lead"/><circle cx="{f(AX(hx))}" cy="{f(yy)}" r="2.4" class="leaddot"/>')
    d.append(T(LX, ly + 4, s_, 'tl', anchor='start', size=11.5))
d.append(T(AX(14.4), SY(ARM0) + 18, 'imanes', 'tl', size=11))
save('brazo', f'0 -10 {f(AX(15) + 270)} {f(SY(ARM0) + 40)}', ''.join(d), 'Brazo, palo y perilla vistos desde arriba y de lado')

# ================================================================== 4. vagón en capas
V = 46.0
cx0 = 300


def lay(y, w, h, cls, label, sub=''):
    o = f'<rect x="{f(cx0 - w * V / 2)}" y="{f(y)}" width="{f(w * V)}" height="{f(h * V)}" rx="3" class="{cls}"/>'
    o += f'<path d="M{f(cx0 + w * V / 2 + 8)},{f(y + h * V / 2)} H{f(cx0 + 160)}" class="lead"/>'
    o += T(cx0 + 166, y + h * V / 2 + 4, label, 'tb', anchor='start', size=12.5)
    if sub:
        o += T(cx0 + 166, y + h * V / 2 + 20, sub, 'tl', anchor='start', size=11)
    return o


v = []
y = 20
v.append(f'<rect x="{f(cx0 - 0.4 * V - 0.39 * V)}" y="{y}" width="{f(0.78 * V)}" height="{f(0.96 * V)}" rx="3" class="green"/>')
v.append(f'<path d="M{f(cx0 - 0.4 * V + 0.39 * V + 8)},{f(y + 0.48 * V)} H{f(cx0 + 160)}" class="lead"/>')
v.append(T(cx0 + 166, y + 0.48 * V + 4, 'Bloque 1 × 1 verde', 'tb', anchor='start', size=12.5))
v.append(T(cx0 + 166, y + 0.48 * V + 20, 'el CO₂; va en fila 2, columna 2', 'tl', anchor='start', size=11))
y += 0.96 * V + 22
v.append(lay(y, 3.2, 0.32, 'plate2', 'Placa 4 × 4', 'pegamento de contacto o epóxico')); y += 0.32 * V + 30
y0m = y
v.append(lay(y, 4.5, 0.6, 'mdf', 'Disco de MDF de 6 mm, Ø 4.5 cm', 'agujero central de 10 mm')); y += 0.6 * V + 26
v.append(lay(y, 4.5, 0.06, 'felt', 'Cinta de teflón adhesiva', 'para que resbale (o fieltro delgado)')); y += 0.1 * V + 30
mx = cx0 - 4.5 * V / 2 - 120
v.append(f'<rect x="{f(mx)}" y="{f(y0m)}" width="{f(1.0 * V)}" height="{f(0.3 * V)}" class="magnet"/>')
v.append(f'<rect x="{f(mx)}" y="{f(y0m + 0.3 * V + 2)}" width="{f(1.0 * V)}" height="{f(0.3 * V)}" class="magnet"/>')
v.append(T(mx + 0.5 * V, y0m - 8, '▲ cara marcada arriba', 'tred', size=11))
v.append(T(mx + 0.5 * V, y0m + 0.6 * V + 18, '2 imanes 10 × 3 mm', 'tl', size=11))
v.append(f'<path d="M{f(mx + V + 6)},{f(y0m + 0.3 * V)} C{f(mx + V + 50)},{f(y0m + 0.3 * V)} {f(cx0 - 40)},{f(y0m + 0.3 * V)} {f(cx0 - 8)},{f(y0m + 0.3 * V)}" class="lead arrowhead"/>')
v.append(T(cx0, y + 4, 'Peso total: unos 15 g', 'tb', size=12))
save('vagon', f'0 0 760 {f(y + 20)}', ''.join(v), 'Vagón en capas')

# ================================================================== 5. tarjeta giratoria (de frente y desde arriba)
CK = 30.0
ck = []
bx, by = 70, 30
hb = CT['atp']['h']
fl = by + (hb + 0.3 + 8.0 + 0.6) * CK   # superficie de la tapa


def ty_(h):
    return fl - h * CK


ck.append(T(bx - 40, 20, 'De frente', 'tb', anchor='start', size=12.5))
ck.append(f'<rect x="{f(bx - 1.0 * CK)}" y="{f(fl)}" width="{f(8.0 * CK)}" height="{f(0.6 * CK)}" class="mdf"/>')
ck.append(T(bx + 6.8 * CK, fl + 0.45 * CK, 'tapa', 'tl', anchor='end', size=11))
cx_ = bx + 3.0 * CK
ck.append(f'<rect x="{f(cx_ - 1.0 * CK)}" y="{f(ty_(hb))}" width="{f(2.0 * CK)}" height="{f(hb * CK)}" class="pine"/>')
ck.append(f'<rect x="{f(cx_ - 0.175 * CK)}" y="{f(ty_(hb))}" width="{f(0.35 * CK)}" height="{f(1.2 * CK)}" class="holeb"/>')
ck.append(f'<rect x="{f(cx_ - 3.0 * CK)}" y="{f(ty_(hb + 0.3 + 8.0))}" width="{f(6.0 * CK)}" height="{f(8.0 * CK)}" rx="5" class="cardf"/>')
ck.append(T(cx_, ty_(hb + 0.3 + 4.6), '6 ATP', 'cardt', size=26))
ck.append(T(cx_, ty_(hb + 0.3 + 3.2), 'cargada', 'cardt2', size=12))
ck.append(f'<rect x="{f(cx_ - 0.15 * CK)}" y="{f(ty_(hb + 0.3 + 7.5))}" width="{f(0.3 * CK)}" height="{f((7.5 + 0.3 + 1.2) * CK)}" class="skewer dashed"/>')
ck.append(f'<rect x="{f(cx_ - 0.4 * CK)}" y="{f(fl + 0.6 * CK - 6)}" width="{f(0.8 * CK)}" height="6" class="metal2"/>')
ck.append(dim_v(ty_(0), ty_(hb), bx - 1.6 * CK, f'base {hb:g} cm', size=11))
ck.append(dim_v(ty_(hb + 0.3), ty_(hb + 8.3), bx + 7.4 * CK, '8 cm', left=False, size=11))
ck.append(dim_h(cx_ - 3.0 * CK, cx_ + 3.0 * CK, ty_(hb + 8.3) - 14, '6 cm', size=11))
tx = bx + 8.4 * CK
notes = [('Palito de brocheta de 9 cm', 'sin punta, entre los 2 cartones'), ('Entra 1.2 cm en la base', 'agujero de 3.5 mm: gira flojo'),
         ('3 mm de aire', 'entre la base y la tarjeta'), ('Tornillo por debajo', 'atraviesa la tapa y entra en la base')]
for i, (s1, s2) in enumerate(notes):
    yy = ty_(hb + 8.1) + i * 44
    ck.append(T(tx, yy, s1, 'tl', anchor='start', size=11.5))
    ck.append(T(tx, yy + 16, s2, 'tl', anchor='start', size=11))
# desde arriba: media vuelta
ux, uy = tx + 40, fl - 40
ck.append(T(tx, uy - 70, 'Desde arriba: media vuelta', 'tb', anchor='start', size=12))
ck.append(f'<rect x="{f(ux - 3.0 * 12)}" y="{f(uy - 3)}" width="{f(6.0 * 12)}" height="6" rx="2" class="cardf"/>')
ck.append(f'<circle cx="{f(ux)}" cy="{f(uy)}" r="4" class="shaft"/>')
ck.append(f'<path d="M{f(ux + 30)},{f(uy - 18)} A36,36 0 0 1 {f(ux - 30)},{f(uy + 18)}" class="lead arrowhead"/>')
ck.append(T(ux + 64, uy + 4, 'ATP → ADP', 'tl', anchor='start', size=11))
save('tarjeta', f'0 0 {f(tx + 250)} {f(fl + 0.6 * CK + 16)}', ''.join(ck), 'Tarjeta giratoria sobre su base')

# ================================================================== 8. rampa (de lado y desde arriba)
RK = 30.0
rr = L['ramp']
xb_, xt_ = rr['bottom'][0], rr['top'][0]
ln_ = xt_ - xb_
rx0 = 40
rbase = 30 + 9.5 * RK


def rX(x):
    return rx0 + (x - 1.0) * RK


def rY(h):
    return rbase - h * RK


def floor_h(x):
    return rr['hBottom'] + (x - xb_) / ln_ * (rr['hTop'] - rr['hBottom'])


ra = []
ra.append(T(rx0, 22, 'De lado (alturas sobre la tapa)', 'tb', anchor='start', size=12.5))
ra.append(f'<line x1="{rX(1.0)}" y1="{rbase}" x2="{rX(28)}" y2="{rbase}" class="table"/>')
ra.append(f'<path d="M{f(rX(xb_))},{f(rY(rr["hBottom"]))} L{f(rX(xt_))},{f(rY(rr["hTop"]))} L{f(rX(xt_))},{f(rY(rr["hTop"] - 0.5))} L{f(rX(xb_))},{f(rY(rr["hBottom"] - 0.5))} Z" class="foam"/>')
for x0_, x1_, hh in ((xb_, rr['cut'][0], rr['wallH']), (rr['cut'][0], rr['cut'][1], rr['cutH']), (rr['cut'][1], xt_, rr['wallH'])):
    ra.append(f'<path d="M{f(rX(x0_))},{f(rY(floor_h(x0_)))} L{f(rX(x1_))},{f(rY(floor_h(x1_)))} L{f(rX(x1_))},{f(rY(floor_h(x1_) + hh))} L{f(rX(x0_))},{f(rY(floor_h(x0_) + hh))} Z" class="foam ghost"/>')
for px_ in rr['pillars']:
    top_ = floor_h(px_) - 0.53
    ra.append(f'<rect x="{f(rX(px_ - 1))}" y="{f(rY(top_))}" width="{f(2 * RK)}" height="{f(top_ * RK)}" class="pine"/>')
    ra.append(T(rX(px_), rbase + 16, f'pilar {top_:.1f} cm', 'tl', size=11))
pz = 25.05
ang_ = math.atan2(6, ln_)
ra.append(f'<g transform="translate({f(rX(pz))},{f(rY(floor_h(pz)))}) rotate({f(-math.degrees(ang_))})"><rect x="{f(-1.2 * RK)}" y="{f(-1.28 * RK)}" width="{f(2.4 * RK)}" height="{f(1.28 * RK)}" class="brick"/></g>')
gx_ = L['controls']['gate']['c'][0]
gh_ = L['controls']['gate']['h']
ra.append(f'<rect x="{f(rX(gx_ - 1))}" y="{f(rY(gh_))}" width="{f(2 * RK)}" height="{f(gh_ * RK)}" class="pine ghost"/>')
ra.append(f'<rect x="{f(rX(gx_ - 0.9))}" y="{f(rY(gh_ + 0.3))}" width="{f(1.8 * RK)}" height="{f(0.2 * RK)}" class="stick"/>')
ra.append(f'<line x1="{f(rX(gx_))}" y1="{f(rY(9.3))}" x2="{f(rX(gx_))}" y2="{rbase}" class="axis"/>')
ra.append(T(rX(gx_), rY(9.6), 'eje de la compuerta (tornillo)', 'tred', size=11))
ra.append(T(rX(gx_ - 1.3), rY(3.0), f'torre de {gh_:g} cm', 'tl', anchor='end', size=11))
ra.append(T(rX(gx_ - 1.3), rY(2.55), '(detrás de la rampa)', 'tl', anchor='end', size=11))
ra.append(T(rX(xt_) + 8, rY(rr['hTop']) + 4, '8 cm', 'tl', anchor='start', size=11))
ra.append(T(rX(xb_) - 8, rY(rr['hBottom']) + 4, '2 cm', 'tl', anchor='end', size=11))
ra.append(T(rX(20.6), rY(4.5), 'tramo recortado', 'tl', size=11))
ra.append(T(rX(20.6), rY(4.0), '(paredes de 3 mm)', 'tl', size=11))
ra.append(T(rX(26.6), rY(10.2), 'pieza G3P', 'tl', size=11))
ra.append(T(rX(26.6), rY(9.75), 'esperando', 'tl', size=11))
ra.append(T(rX(6.5), rY(1.75) - 4, 'caja de glucosa', 'tl', size=11))
ra.append(f'<rect x="{f(rX(2))}" y="{f(rY(1.5))}" width="{f(9 * RK)}" height="{f(1.5 * RK)}" class="foam ghost"/>')
save('rampa', f'0 0 {f(rX(28.5))} {f(rbase + 30)}', ''.join(ra), 'Rampa y compuerta vistas de lado')

# ================================================================== 9. mapas de pivotes
GK = 18.0
lg = []


def gmap(x, y, n, cells, title, sub, green=()):
    o = [f'<rect x="{f(x)}" y="{f(y)}" width="{f(n * GK)}" height="{f(n * GK)}" rx="4" class="plate"/>']
    for rr_ in range(1, n + 1):
        for cc in range(1, n + 1):
            cx_, cy_ = x + (cc - 0.5) * GK, y + (rr_ - 0.5) * GK
            if [rr_, cc] in cells:
                o.append(f'<rect x="{f(cx_ - 8)}" y="{f(cy_ - 8)}" width="16" height="16" rx="2" class="brick"/>')
            elif (rr_, cc) in green:
                o.append(f'<rect x="{f(cx_ - 8)}" y="{f(cy_ - 8)}" width="16" height="16" rx="2" class="green"/>')
            else:
                o.append(f'<circle cx="{f(cx_)}" cy="{f(cy_)}" r="5" class="stud"/>')
    for k in range(1, n + 1):
        o.append(T(x + (k - 0.5) * GK, y - 5, str(k), 'tl', size=9.5))
        o.append(T(x - 8, y + (k - 0.5) * GK + 3.5, str(k), 'tl', size=9.5))
    o.append(T(x + n * GK / 2, y + n * GK + 18, title, 'tb', size=12))
    o.append(T(x + n * GK / 2, y + n * GK + 34, sub, 'tl', size=10.5))
    return ''.join(o)


P_ = L['plates']
lg.append(gmap(20, 20, 8, P_['rubp']['cells'], 'RuBP · 15', '3 filas de 5'))
lg.append(gmap(200, 20, 8, P_['pga']['cells'], '3-PGA · 18', '6 piezas de 3'))
lg.append(gmap(380, 20, 8, P_['g3p']['cells'], 'G3P · 15 + 3', '5 de 3 y un hueco'))
lg.append(gmap(560, 20, 8, P_['regA']['cells'], 'Regeneración: 5 G3P', 'igual que la de G3P'))
lg.append(gmap(740, 20, 8, P_['regB']['cells'], 'Regeneración: 3 RuBP', 'igual que la de RuBP'))
lg.append(T(20, 220, 'Fila 1 = atrás de la maqueta · columna 1 = izquierda, viendo desde el frente. Cada cuadro negro es un bloque 1 × 1 (un carbono).', 'tl', anchor='start', size=11.5))
save('lego', '0 0 900 232', ''.join(lg), 'Dónde va cada bloque en las placas')
