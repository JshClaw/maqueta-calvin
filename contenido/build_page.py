#!/usr/bin/env python3
"""Arma build/page.html: las 17 diapositivas del manual (estilos + HTML + app.js), sin <head>.

Lo llama scripts/build.mjs (npm run build). Solo usa la librería estándar de Python 3.
Los textos y datos salen de content.py; el esqueleto de las diapositivas está en body.html
con marcadores {{...}} que se llenan con las funciones de pagegen.py.
"""
import os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
import content as C   # noqa: E402
import pagegen as P   # noqa: E402


def leer(*p):
    return open(os.path.join(AQUI, *p), encoding='utf-8').read()


def main():
    body = leer('body.html')
    body = body.replace('{{ANTES}}', P.antes_html()).replace('{{MATERIALES}}', P.materiales_html()).replace('{{PASOS}}', P.pasos_html())
    body = body.replace('{{FUNCIONA}}', P.funciona_lista()).replace('{{PAPELES}}', P.papeles_html()).replace('{{GUION}}', P.guion_html())
    body = body.replace('{{PROBLEMAS}}', P.problemas_html()).replace('{{COORDS}}', P.coords_html())
    body = body.replace('{{BALANCE}}', P.inl(C.BALANCE)).replace('{{SIMPLIFICACION}}', P.inl(C.SIMPLIFICACION))
    body = body.replace('{{SOLAPAS}}', ''.join(f'<div class="card pad"><h3>Solapa “{P.inl(q)}”</h3><p>{P.inl(a)}</p></div>' for q, a in C.SOLAPAS))
    for name in ('plano', 'corte', 'brazo', 'vagon', 'tarjeta', 'rampa', 'lego'):
        body = body.replace('{{SVG:%s}}' % name, leer('svg', f'{name}.svg'))
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
