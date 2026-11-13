#!/usr/bin/env python3
"""Arma build/page.html: las pantallas de la app (estilos + HTML + app.js), sin <head>.

Lo llama scripts/build.mjs (npm run build). Solo usa la librería estándar de Python 3.
Los textos y datos salen de content.py; el esqueleto de la app está en body.html
con marcadores {{...}} que se llenan con las funciones de pagegen.py.
"""
import os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
import content as C   # noqa: E402
import pagegen as P   # noqa: E402

GAL_DENTRO = [
    ('img', 'Tapa transparente', 'img/transparente.jpg', 'Con la tapa transparente se ve el brazo justo debajo del vagón'),
    ('img', 'Sin tapa', 'img/interior.jpg', 'Interior de la caja sin tapa: el brazo con imanes, la perilla y los postes de apoyo'),
    ('img', 'Despiece', 'img/despiece.jpg', 'Despiece: paredes separadas, brazo, tapa levantada y perilla'),
]


def leer(*p):
    return open(os.path.join(AQUI, *p), encoding='utf-8').read()


def main():
    body = leer('body.html')
    rep = {
        'ARMAR': P.armar_html(), 'ANTES': P.antes_html(), 'MATERIALES': P.materiales_html(), 'PASOS': P.pasos_html(),
        'FUNCIONA': P.funciona_lista(), 'PAPELES': P.papeles_html(), 'GUION': P.guion_html(),
        'PROBLEMAS': P.problemas_html(), 'COORDS': P.coords_html(), 'GLOSARIO': P.glosario_html(),
        'BALANCE': P.inl(C.BALANCE), 'SIMPLIFICACION': P.inl(C.SIMPLIFICACION),
        'SOLAPAS': ''.join(f'<div class="card pad solapa"><h3>Solapa “{P.inl(q)}”</h3><p>{P.inl(a)}</p></div>' for q, a in C.SOLAPAS),
        'PDF': P.PDF_BTN, 'GAL:dentro': P.galeria(GAL_DENTRO, ''), 'ICON_CHEV': P.icon('chev', 'chev'),
    }
    for k, v in rep.items():
        body = body.replace('{{%s}}' % k, v)
    body = re.sub(r'\{\{ICON:(\w+)(?:\.(\w+))?\}\}', lambda m: P.icon(m.group(1), 'i ' + (m.group(2) or '')), body)
    body = re.sub(r'\{\{SVG:(\w+)\}\}', lambda m: leer('svg', f'{m.group(1)}.svg'), body)
    falta = re.findall(r'\{\{[^}]+\}\}', body)
    assert not falta, f'marcadores sin llenar: {falta}'
    page = f'<style>\n{leer("style.css")}\n</style>\n{body}\n<script>\n{leer("app.js")}\n</script>\n'
    out = os.path.join(RAIZ, 'build')
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, 'page.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(page)
    print(f'página: {len(page) // 1024} KB')


if __name__ == '__main__':
    main()
