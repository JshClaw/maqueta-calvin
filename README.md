# Maqueta del ciclo de Calvin: app para el celular

Es el manual de la maqueta del ciclo de Calvin (fase oscura): pasos, fotos, videos, guion y modelo 3D. Se instala desde un link y después funciona **sin internet** en Android, iPhone e iPad.

- **`dist/`** es la app lista para subir. Pesa unos 18 MB.
- **`CLAUDE.md`** tiene el contexto completo del proyecto: la ciencia, cómo está hecha y las reglas que no se deben romper. Claude Code lo lee solo al abrir esta carpeta.

## Publicarla (una vez)

Necesita un sitio con **https**. Abrir `index.html` directo en el celular o mandarlo por WhatsApp **no funciona**.

- **Netlify:**
  1. Entra a app.netlify.com/drop y arrastra la carpeta `dist`.
  2. Te da un link `https://algo.netlify.app`.
  3. Crea tu cuenta gratis y "reclama" el sitio para que no se borre.
- **GitHub Pages:**
  1. Sube este repo.
  2. Ve a Settings → Pages → Source: **GitHub Actions**.
  3. El workflow incluido publica `dist/`.
- **Cloudflare Pages:** Workers & Pages → Create → Pages → Upload assets → arrastra `dist`.

## Instalarla (cada alumno, una vez, con internet)

- **Android (Chrome):** abre el link, espera el aviso y toca **Instalar app**. Si no sale el botón: menú ⋮ → Instalar app.
- **iPhone / iPad (Safari):**
  1. Abre el link.
  2. Toca **Compartir**. Si no lo ves, está en el menú ⋯.
  3. Elige **Agregar a Inicio**.
  4. Abre la app desde el ícono **una vez con internet** y espera el aviso **«Lista»**.

## Modificarla

Requisitos: Node 18 o más nuevo y Python 3.

```bash
npm install
npm run build      # vuelve a generar dist/
npm run serve      # pruébala en http://localhost:8080
npx playwright install chromium   # una vez
npm test           # prueba sin internet en celulares simulados
```

Después vuelve a subir `dist/` al mismo sitio. Las apps ya instaladas se actualizan solas la próxima vez que se abran con internet.
