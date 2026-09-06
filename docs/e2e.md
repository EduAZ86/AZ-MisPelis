# Tests E2E con Maestro

Los flujos E2E viven en `.maestro/` y se ejecutan contra la app real (dev client
de Expo) en iOS Simulator o emulador Android.

## Requisitos

1. **Maestro CLI:**

```bash
brew tap mobile-devops/tap
brew install mobile-devops-cli
```

2. **Dev client instalado en el simulador** (el `appId` de los flujos es
   `com.mispelis.app`, definido en `app.json`):

```bash
npx expo run:ios          # iOS Simulator
npx expo run:android      # emulador Android
```

Deja corriendo Metro (`npx expo start`) durante los tests.

## Ejecución

```bash
npm run e2e                        # todos los flujos
npm run e2e -- .maestro/01-home.yaml   # un flujo específico
```

## Flujos

| Archivo | Qué valida | Requiere red |
|---|---|---|
| `01-home.yaml` | Home carga secciones TMDB ("Tendencias esta semana") | TMDB |
| `02-search.yaml` | Búsqueda "Coco" devuelve resultados | TMDB |
| `03-movie-detail.yaml` | Deep link `mispelis:///movie/354912` (Coco) muestra detalle | TMDB |
| `04-tv-detail.yaml` | Deep link serie (Breaking Bad), cambio de temporada | TMDB |
| `05-favorites.yaml` | Toggle favorito + persistencia en biblioteca ("Favoritos (1)") | TMDB |
| `06-playback.yaml` | Resolución de fuentes real (HackStore/SeriesMetro/mirrors) + reproductor | TMDB + fuentes |

## Notas

- Los flujos 03–06 usan **deep links** (`scheme: mispelis` en `app.json`), lo que
  hace los tests independientes del estado de navegación.
- `clearState: true` reinicia AsyncStorage (favoritos empiezan vacíos).
- El flujo 06 toca servicios de terceros en vivo: puede fallar por cambios en
  HackStore/SeriesMetro o mirrors; si falla, distinguir entre fallo de UI
  (bug de la app) y fallo de fuente (log de `AppError`).
- Los tests unitarios/integración (`npm run test`, 57 casos con fixtures)
  cubren la lógica sin red; Maestro complementa con la validación de UI real.
