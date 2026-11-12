# Maqueta del ciclo de Calvin: app sin internet (PWA)

Contexto completo para trabajar en este proyecto. Léelo antes de cambiar algo.

## 1. Qué es el proyecto

- Es un **proyecto escolar de biología** para alumnos de **1º de preparatoria (México)**. Se presenta en una **feria de ciencias** con el tema **"Ciclo de Calvin – fase oscura"**.
- Hay una **maqueta física**, hecha a mano:
  - Es una caja de MDF de 60 × 60 × 6.2 cm.
  - Al centro tiene una **perilla**. Al girarla, mueve un brazo con imanes que va escondido bajo la tapa.
  - El brazo arrastra un **vagón** con imanes por una pista circular impresa en vinil de 60 × 60 cm.
  - La pista tiene **8 paradas (0 a 7)**.
  - **No tiene electrónica, motores ni pilas.** Por eso se le llama "versión con perilla" o "manual".
  - En cada parada, un integrante del equipo hace su parte con la mano.
- **Esta app** es el **manual de construcción y presentación**, para que los alumnos lo consulten en su celular **sin internet**. Tiene:
  - 17 diapositivas.
  - Los 8 pasos de armado, con renders.
  - Planos con medidas.
  - Videos.
  - El guion de la clase.
  - Problemas comunes.
  - Un **modelo 3D/4D interactivo** de la maqueta.
- **Usuarios:** los alumnos (Android, iPhone y iPad) y el docente.
- **Idioma:** español de México, con tono claro y directo para prepa. Toda la interfaz y los textos están en español.
- **Privacidad:** **no agregar nombres** de alumnos, maestros ni del autor, ni ningún dato personal. Se pidió explícitamente.

## 2. La ciencia (contenido canónico: no cambiarlo sin verificar)

El ciclo de Calvin también se llama **fase oscura** o **fase independiente de la luz**. Ocurre en el **estroma del cloroplasto**. En la maqueta, **1 bloque = 1 átomo de carbono**.

Paradas de la pista. Coordenadas del plano en cm, con el origen en la esquina superior izquierda de la tapa y el centro en (30, 30):

| Parada | Qué pasa | Quién actúa |
|---|---|---|
| 0 · RuBP | Arranque y recarga: 3 RuBP (5 C c/u) | Conductor |
| 1 · Fijación | La **pinza RuBisCO** gira sobre el vagón y "atrapa" el CO₂ | RuBisCO |
| 2 · 3-PGA | Estación de 6 3-PGA (3 C c/u) | Conductor |
| 3 · ATP | La tarjeta ATP se gira y muestra su cara gastada (ADP) | Energía |
| 4 · NADPH | La tarjeta NADPH se gira (queda NADP⁺) | Energía |
| 5 · G3P | Se abre la **compuerta**: 1 G3P baja por la rampa a la caja de "½ glucosa" | Salida |
| 6 · Regeneración | Mesa 5 G3P → 3 RuBP | Salida |
| 7 · ATP (regeneración) | La tercera tarjeta muestra 3 ADP; al volver a 0 se recargan las 3 tarjetas (energía de la fase luminosa) | Energía |

- **Etapas y colores:**
  - Fijación: verde azulado `--st1 #5FB09E`.
  - Reducción: lila `--st2 #968AD2`.
  - Regeneración: rosa `--st3 #E2909F`.
  - Fase luminosa y recarga: amarillo `--sun #EFB12E`.
- **Roles del equipo (4) y sus colores:**
  - Conductor: azul `#3C6FB6`.
  - RuBisCO: naranja `#D9822B`.
  - Energía: rojo `#C8483C`.
  - Salida: morado `#7A55A8`.
- **Balance de una vuelta:** 3 CO₂ + 9 ATP + 6 NADPH → 1 G3P + 9 ADP + 8 Pᵢ + 6 NADP⁺.
  - Una glucosa (6 C) necesita dos vueltas: 6 CO₂, 18 ATP y 12 NADPH.
- **Simplificación que se dice en clase:** el vagón lleva **un solo bloque verde**, que representa los 3 CO₂ de cada vuelta. Las cantidades de las estaciones sí son las reales para 3 CO₂.
- **Solapas de la maqueta:**
  - "¿Dónde ocurre?" → En el estroma del cloroplasto, alrededor de los tilacoides.
  - "¿Por qué le dicen fase oscura?" → Porque no usa la luz directamente. **Pero no ocurre de noche:** usa el ATP y el NADPH de la fase luminosa, y enzimas como la RuBisCO solo se activan con luz.
- Los textos completos están en `contenido/content.py`: `VUELTA`, `PAPELES`, `GUION`, `BALANCE`, `SOLAPAS` y `GLOSARIO`. **No inventes cifras.** Si cambias algo científico, revísalo contra fuentes de biología de nivel bachillerato.

## 3. Estructura del repositorio

```
contenido/            Fuente del manual (Python 3, solo librería estándar)
  content.py          TODOS los textos y datos: pasos, materiales, guion, problemas, coordenadas, glosario
  pagegen.py          Convierte content.py en fragmentos HTML
  body.html           Esqueleto de las 17 diapositivas con marcadores {{...}}
  style.css           Estilos (tokens de color, tema claro y oscuro)
  app.js              Navegación, índice, casillas, pestañas, descargas, arranque del visor 3D
  svg/*.svg           Planos con medidas (los genera drawings.py desde 3d/layout.json)
  drawings.py         Regenera svg/ (correr si cambia layout.json)
  build_page.py       Arma build/page.html (lo llama npm run build)
3d/
  maqueta.js          Modelo three.js de la maqueta + línea de tiempo 4D
  visor.js            Visor 3D/4D (controles, modos, armado, puntos de verificación)
  entry.js            Expone window.Visor
  layout.json         Medidas del modelo (cm)
  tex/                Texturas: vinil, tarjetas, letreros, solapas, perilla, MDF...
pwa/
  sw.template.js      Service worker (se llena con la lista de archivos y la versión)
  ui.html             Aviso de instalación, progreso de descarga y registro del service worker
public/               Se copia tal cual a dist/
  img/                Renders de cada paso (JPG 1600 × 1000)
  vid/                mecanismo.mp4 (8.4 MB) y ciclo_2d.mp4 (3.9 MB), H.264, con su póster .jpg
  dl/                 tablero_60x60.pdf (7 páginas: vinil 60 × 60 + 6 hojas carta)
  fonts/              Inter, JetBrains Mono y Lora (woff2 latín y latín extendido, de @fontsource)
  icons/              Íconos de la app (anillo de 3 colores con la perilla)
scripts/
  build.mjs           npm run build → dist/
  serve.mjs           npm run serve → http://localhost:8080 (con Range; https opcional)
  test-offline.mjs    npm test → prueba sin internet en iPhone, Android y iPad simulados
  test-tactil.mjs     npm run test:tactil → gestos de dedo en el visor 3D
dist/                 LA APP LISTA PARA SUBIR (generada; no se edita a mano)
.github/workflows/pages.yml   Publica dist/ en GitHub Pages (opcional)
```

## 4. Comandos

Requisitos: **Node 18 o más nuevo** y **Python 3** (solo librería estándar).

```bash
npm install                     # una vez
npm run build                   # genera dist/
npm run serve                   # http://localhost:8080
npm run dev                     # build + serve
npx playwright install chromium # una vez, para las pruebas
npm test                        # prueba sin internet (iPhone 13, Pixel 7, iPad gen 11)
npm run test:tactil             # prueba el 3D con gestos de dedo (girar, pellizcar, doble toque, botones)
python contenido/drawings.py    # solo si cambias 3d/layout.json (regenera los planos)
```

- `npm test` acepta estas variables:
  - `DEVICES="iPhone 13,iPad Pro 11 landscape"`: los equipos que simula.
  - `CHROME_PATH=...`: usa un Chrome instalado.
  - `CHROME_ARGS="--use-angle=gl-egl"`: da WebGL en Linux sin GPU.
- Si el navegador de prueba no tiene WebGL, la prueba lo avisa y no cuenta como falla.
- Si ya tienes un Chromium de Playwright descargado (en `%LOCALAPPDATA%\ms-playwright\`), pásalo con `CHROME_PATH` y no hace falta `npx playwright install`.
- `npm run test:tactil` acepta las mismas variables (`DEVICES`, `CHROME_PATH`, `CHROME_ARGS`).
- **Flujo normal después de cualquier cambio:** `npm run build` → `npm test`. Luego abre la app en un celular real en **modo avión** para confirmar.

## 5. Cómo está hecha

### Página (`contenido/` → `build/page.html` → `dist/index.html`)

- Hay 17 diapositivas, cada una es `<section class="slide" id="…" data-title="…" data-grupo="…">`. Sus ids, en orden:
  - `portada`, `funciona`, `dentro`, `antes`, `materiales`, `plano`.
  - `paso1` a `paso8`.
  - `clase`, `problemas`, `maqueta3d`.
- **Navegación:** se usa el hash (`#paso3`), los botones Anterior/Siguiente de la barra inferior (`nav.nav`) y el diálogo **Índice** (`#idx`, botón `#openIdx`).
- Cada paso trae:
  - Una lista "Necesitas".
  - Casillas de avance, que se guardan en `localStorage` con las llaves `calvin-manual-pasos` y `calvin-manual-materiales`.
  - Pestañas de imágenes (`.tab` / `.pane`).
  - Botones `data-ver3d` que abren el 3D en un estado dado, por ejemplo `{"armado": 2}`.
- **Temas claro y oscuro:**
  - Todos los colores son tokens en `:root`: `--bg`, `--surface`, `--ink`, `--accent #2D5DA6` (azul; hasta 2026-11-12 era verde #2A7663), `--stage` y otros.
  - Se redefinen en `@media (prefers-color-scheme: dark)` (con `:root:not([data-theme="light"])`) y en `:root[data-theme="dark"]`.
  - **Mantén siempre los dos temas.**
- **Diseño responsive:** debe verse bien desde 390 px (teléfono) hasta un iPad en horizontal.
- **Descargas:** se hacen con un enlace normal (`<a download>`) a `dl/…`.

### Visor 3D/4D (`3d/`)

- **three.js 0.170.0** se empaqueta con **esbuild** en un solo `<script>` IIFE, dentro del `index.html`. `entry.js` deja disponible `window.Visor` con `iniciar()`, `activar(bool)`, `camara()` y `preset(p)`.
- `layout.json` y las texturas van **incrustadas como data URI** (`window.__LAYOUT` y `window.__TEX`), así no hacen falta peticiones extra.
- **`maqueta.js`** arma el modelo:
  - Las unidades son centímetros. Ejes del mundo: X = x_plano − 30, Z = y_plano − 30, Y hacia arriba. La mesa está en Y = 0.
  - Funciones principales: `crearMaqueta()`, `crearEscena()`, `crearLineaDeTiempo()`, `estadoEn()` y `aplicarEstado()`.
- **`visor.js`** maneja:
  - OrbitControls: girar y mover, con doble toque para acercar.
  - Modos Completa, Transparente y Sin tapa.
  - Despiece, armado pieza por pieza y solapas.
  - Anillo amarillo que marca qué se mueve.
  - Puntos de verificación numerados del 1 al 15, que se guardan en `calvin-manual-verificado`.
  - Reproducción de una vuelta en el tiempo ("4D").
- **En celular:** el pixel ratio máximo es 2 y el mapa de sombras es de 1024 cuando el ancho es menor a 700 px.

### PWA (`pwa/`, armada por `scripts/build.mjs`)

- **`manifest.webmanifest`:**
  - Nombre "Maqueta del ciclo de Calvin" y nombre corto "Ciclo Calvin".
  - `start_url` y `scope` son `./`, para que funcione en una subcarpeta.
  - `display: standalone` y color `#EDF1F7`.
- **`sw.js`** (sale de `sw.template.js`):
  - **Precarga TODOS los archivos** de `dist/` al instalarse: uno por uno, con reintentos, y si se corta sigue donde se quedó.
  - Responde **primero desde la caché**. Si alguien navega a una ruta desconocida, entrega `index.html`.
  - Contesta **peticiones con Range (206)** desde la caché. **iPhone lo necesita para reproducir video sin internet.**
  - "Limpia" las respuestas que vienen de una redirección, porque Safari las rechaza al navegar.
  - Borra las cachés `calvin-*` viejas y usa `skipWaiting` + `clients.claim`.
- **Versión:** el nombre de la caché es `calvin-<hash del contenido>`. Cualquier cambio da una versión nueva, y la app instalada se actualiza sola la siguiente vez que se abre con internet. Ahí aparece el aviso "Hay una versión nueva · Actualizar".
- **`ui.html`:**
  - Registra el service worker.
  - Mide el avance de la descarga (por bytes) leyendo la Cache API.
  - Muestra el aviso "Instálala en tu celular / iPad / tableta", con pasos según el equipo:
    - iPhone/iPad: Safari, Compartir, "Agregar a Inicio".
    - Android con `beforeinstallprompt`: botón "Instalar app".
    - Android sin ese evento: menú ⋮.
  - El aviso **solo sale en la portada**, o cuando se pide desde Índice → "Usar sin internet en el celular" (`#pwaIdx`). Así no tapa los pasos ni el 3D.
  - Dentro de la app instalada: muestra el progreso y luego "Lista: ya funciona sin internet".
  - Llaves de `localStorage`: `pwa-cerrado` y `pwa-ok`. Pide `navigator.storage.persist()`.
- El iPad se detecta por "iPad" en el agente de usuario, o por `MacIntel` + pantalla táctil, porque Safari en iPadOS se presenta como Mac.

## 6. Reglas que no se deben romper

1. **Nada externo:** sin CDN, sin Google Fonts, sin `fetch` a otros dominios. Lo que no esté en `dist/` no existe sin internet.
2. **Solo rutas relativas.** La app debe funcionar en una subcarpeta, por ejemplo `usuario.github.io/repo/`.
3. **Necesita https o localhost.** Por `http://IP` la página se ve, pero el service worker no se registra: ni se instala ni queda guardada.
4. **Los archivos nuevos van en `public/`.** El build los agrega solo a la lista de precarga. **Nunca edites `dist/` a mano.**
5. **Cuida el tamaño:** hoy pesa unos 18 MB. Mantenlo por debajo de ~50 MB.
   - Videos: H.264 MP4, `yuv420p`, `-movflags +faststart`, 720p o 1080p con bitrate moderado. iPhone no reproduce WebM: usa MP4.
   - Imágenes: JPG de alrededor de 1600 px.
6. **Los videos llevan `playsinline`**, para que en iPhone no se abran en pantalla completa. Para que arranquen solos, también `muted`.
7. **Detalles de iOS:**
   - La app agregada a Inicio tiene **su propio almacenamiento**, separado de Safari. Hay que abrirla **una vez con internet** desde el ícono.
   - Safari sin instalar puede borrar los datos tras 7 días sin uso. La app instalada no.
8. **Código Python:** archivos UTF-8 con fin de línea LF (ya está en `.gitattributes`). Al abrir un archivo, pasa siempre `encoding='utf-8'`, porque en Windows la codificación por defecto rompe los acentos.
9. **Accesibilidad y diseño:**
   - Botones de al menos 40 px y contraste suficiente en los dos temas.
   - Márgenes laterales de 16 px o más.
   - Que no haya scroll horizontal en el teléfono.
10. **Prueba sin internet** después de cada cambio (sección 4).

## 7. Publicar

La app necesita un sitio con **https**. Cualquiera de estos sirve y todos son gratis:

- **Netlify:** entra a app.netlify.com/drop y arrastra la carpeta `dist/`. Luego crea una cuenta y "reclama" el sitio para que no se borre.
- **GitHub Pages:**
  1. Haz push de este repo.
  2. Ve a Settings → Pages → Source: **GitHub Actions**.
  3. El workflow `.github/workflows/pages.yml` publica `dist/` cada vez que cambia. Si GitHub avisa que una acción está desactualizada, súbele la versión.
  4. Otra opción: "Deploy from a branch" con una rama que tenga `dist/` como raíz.
- **Cloudflare Pages:** Upload assets, con la carpeta `dist/`.
- **En la red local, desde una PC:** hace falta https con un certificado válido.
  1. Usa un dominio propio con un subdominio que apunte a la IP local de la PC, por ejemplo `calvin.midominio.com → 192.168.1.50`.
  2. Saca un certificado de Let's Encrypt **validando por DNS**. No hace falta abrir puertos. Sirve Caddy, win-acme o certbot.
  3. Corre: `PORT=443 CERT=fullchain.pem KEY=privkey.pem npm run serve`.
  4. Los celulares necesitan poder resolver ese nombre: la red con internet, o una entrada DNS local en el router.
  5. Algunos módems bloquean nombres públicos que apuntan a IPs privadas (protección contra *DNS rebinding*). Se arregla con una entrada DNS local.
  6. Un certificado autofirmado **no sirve en la práctica**: habría que instalarlo y darle confianza en cada celular.

## 8. Instalarla en los celulares (lo que hace cada alumno, una vez, con internet)

- **Android (Chrome):** abrir el link, esperar el aviso y tocar "Instalar app". Si no aparece el botón: menú ⋮ → "Instalar app" o "Agregar a la pantalla principal".
- **iPhone / iPad (Safari):**
  1. Abrir el link.
  2. Tocar Compartir. Si no se ve, está en el menú ⋯.
  3. Elegir "Agregar a Inicio".
  4. **Abrir la app desde el ícono una vez con internet** y esperar el aviso "Lista".
- Después se abre desde el ícono sin internet. Si borran la app o los datos del navegador, solo hay que volver a abrir el link.

## 9. Qué existe fuera de este repo

El proyecto se hizo con Claude, con un sistema más grande en Python (skia para PDFs y texturas) y en three.js con Playwright (para renders y videos). Ese sistema **no está incluido**. En este repo esas piezas ya son archivos finales:

- **Renders** (`public/img`) y **texturas del 3D** (`3d/tex`): son imágenes generadas. Para cambiarlas, edita los PNG/JPG directamente o pide imágenes nuevas.
- **Impresiones para la maqueta y la feria** (PDF a tamaño real):
  - Vinil del tablero de 60 × 60 cm.
  - Hojas carta con tarjetas, letreros, solapas, plantillas, rampa y mapas de bloques.
  - Tríptico de 120 × 90 cm (centro de 60 × 90 y lados de 30 × 90).
  - Base de "cloroplasto": óvalo de 98 × 78 cm.
  - Extras: letrero de mesa "¡Gira la perilla!" y discos de tilacoides.
  - Hoja de medidas.
  - En la app solo va `tablero_60x60.pdf`.
- **Guion de la presentación** (quién dice qué, incluida la versión para la feria) y **lista de materiales**: están en PDF/Doc aparte. El guion de clase resumido está en `content.py → GUION`.
- **Video "cómo se usa"**: 107 s, 1080p, 48 MB, sin audio y con letreros, pensado para la tablet en la feria. **No está en la app.** Tiene detalles viejos que se decidió dejar así: la solapa dice "¿Ocurre de noche?" y la portada no dice "fase oscura".
- **Montaje en la feria:**
  - Mesa con la maqueta sobre una base ovalada verde (el cloroplasto) con 3 pilas de tilacoides.
  - El tríptico detrás.
  - El letrero de mesa al frente.
  - La tablet con el video en repetición.
  - En la feria, los presentadores van a los lados de la mesa: a la derecha Conductor y Energía; a la izquierda RuBisCO y Salida. Energía se pasa a la izquierda en la parada 6, para voltear la tarjeta de la parada 7.

## 10. Estado y pruebas hechas

- Se probó en Chrome simulando iPhone 13, Pixel 7, iPad (gen 11) e iPad Pro 11 en horizontal, también como app instalada.
  - Sin internet abren los 49 de 49 archivos, el 3D, las fotos y las fuentes.
  - El video responde por pedazos (206).
  - La reproducción y el salto en el video se verificaron con una copia en WebM. El Chrome de prueba no traía H.264.
- **No se ha probado en Safari real de iPhone ni de iPad.** Es lo primero que conviene confirmar, en modo avión.
- 2026-11-12: corregido que el 3D no cargaba al abrir o recargar la página ya en `#maqueta3d` (`app.js` corría antes que el script del visor).
  El visor ahora pinta solo cuando algo cambia (antes 60 cuadros/s sin parar). Los controles del 3D quedan encima de los números.
  En pantallas táctiles todo lo que se toca mide 40 px o más. Materiales sale en tarjetas en el teléfono.
  `npm test` y `npm run test:tactil` pasan en iPhone 13, Pixel 7, iPad (gen 11) e iPad Pro 11 en horizontal.
- `dist/` está construida y lista para subir.
- **Publicada** el 2026-11-12 en GitHub Pages: **https://jshclaw.github.io/maqueta-calvin/** (repo público `JshClaw/maqueta-calvin`).
  - Cada push a `main` que cambie `dist/` la vuelve a publicar. El primer push, el que creó la rama, no disparó el flujo: se lanzó a mano con `gh workflow run pages.yml`.
  - La prueba sin internet pasó contra el link real en los 4 equipos simulados.
  - Si el sitio desaparece (todo da 404), la app ya guardada sigue abriendo: el service worker no se borra cuando falla su actualización. Probado en Chromium, no en Safari.
  - No usar Netlify Drop sin cuenta: borra el sitio a la hora, le pone contraseña y Malwarebytes bloqueó el link por phishing.
  - Los commits van firmados como `JshClaw` con el correo noreply de GitHub, sin nombres reales.

## 11. Ideas posibles (nada de esto está hecho)

- Una hoja con un **código QR** del link publicado, para el salón o la feria.
- Agregar el video "cómo se usa" comprimido (720p, ~8–10 MB) como diapositiva o pestaña. Cuidar el tamaño total.
- Servirla en la red local con https (sección 7).
- Una app nativa (por ejemplo con Capacitor) solo si de verdad hace falta. En iPhone requiere una cuenta de desarrollador de Apple. La PWA ya cubre Android, iPhone e iPad.
