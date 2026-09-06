# ADR-0002: Arquitectura sin backend — toda la lógica dentro de la app

- Estado: Aceptada
- Fecha: 2026-09-05

## Contexto

La app anterior resolvió streams con un servidor Next.js standalone embebido en
Electron, incluyendo scraping con Playwright (`lib/servers.ts`, fuente vsembed.ru).

La verificación del código demostró que el scraping fue provisional y ya no es
necesario:

- **HackStore** usa su API REST JSON (`/api/rest/single`, `/api/rest/player`).
- **SeriesMetro** se resuelve con fetch HTML + `wp-admin/admin-ajax.php` (HTTP puro).
- **Todos los mirrors** (goodstream, vimeos, voe, streamwish) se resuelven con `fetch` + transformaciones de texto (`unpackPacked`, `voeDecode`), sin navegador.

## Decisión

Eliminar el backend. La app implementa directamente:

- Cliente TMDB.
- Resolvers de HackStore y SeriesMetro.
- Resolvers de mirrors (HTTP + decoders JS puros).

Playwright / Chromium quedan fuera del stack. La fuente vsembed.ru se descarta.

## Consecuencias

- ✅ Sin servidores que mantener, sin coste de infraestructura, sin proxy.
- ✅ El empaquetado móvil es viable (no hay Node ni Chromium embebidos).
- ⚠️ Los cambios en HTML/API de terceros rompen la app hasta un update (mitigado por decoders aislados + fixtures de regresión + expo-updates OTA).
- ⚠️ El token TMDB vive en el dispositivo (aceptado: API pública de lectura).
- `misPelis/` queda como referencia de solo lectura hasta su eliminación.
