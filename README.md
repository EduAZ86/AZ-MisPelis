<div align="center">

# 🎬 misPelis

![Plataformas](https://img.shields.io/badge/plataformas-iOS%20%7C%20iPadOS%20%7C%20Android-34d399?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo%20SDK-57-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6+-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

**Aplicación multiplataforma para descubrir y reproducir películas y series**, catalogadas en TMDB, con fuentes de video en español latino.

</div>

---

## ✨ Descripción

misPelis te permite explorar el catálogo completo de **TMDB** (tendencias, descubrimiento, géneros, detalle de películas y series) y reproducir sus contenidos resolviendo **fuentes de streaming en español latino** de manera transparente, sin necesidad de un backend propio.

Todo el motor de resolución de fuentes (`mirrors`) corre **dentro de la app**, y el reproductor nativo inyecta los encabezados HTTP (`Referer`, `Origin`, `User-Agent`) que exigen cada uno de los mirrors — sin proxies ni scraping.

## 📱 Funcionalidades

- **Catálogo TMDB**: tendencias, descubrimiento, búsqueda, géneros y detalle con pósters, fondos y títulos multi-idioma.
- **Reproductor nativo HLS**: `react-native-video` con subtítulos VTT side-car y soporte de encabezados por fuente.
- **Resolución de fuentes**: orquestador `resolver.ts` que consulta HackStore y SeriesMetro, decodifica URLs de mirrors (`goodstream`, `vimeos`, `voe`, `streamwish`) y prioriza por idioma (Latino → Español → Subtitulado) y calidad (1080p → 720p → resto).
- **Source picker**: selección manual de servidor, idioma y calidad.
- **Favoritos y Continuar viendo**: persistencia local con AsyncStorage.
- **Seguridad de tokens**: token TMDB guardado en el **Keychain/Keystore** vía `expo-secure-store`.
- **UI adaptativa**: navegación y diseño con soporte diferenciado para teléfono y iPadOS.

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| [Expo SDK](https://expo.dev/) | 57 | Toolchain unificada iOS/Android, router file-based |
| [React Native](https://reactnative.dev/) | 0.86 | Runtime nativo |
| [React](https://react.dev/) | 19 | Modelo de UI |
| [expo-router](https://docs.expo.dev/router/introduction/) | — | Navegación basada en archivos |
| [react-native-video](https://github.com/TheWidlarzGroup/react-native-video) | v7 | HLS nativo + encabezados custom + subtítulos VTT |
| [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) | — | Token TMDB en Keychain/Keystore |
| [AsyncStorage](https://github.com/react-native-async-storage/async-storage) | — | Favoritos y "continuar viendo" |
| [TanStack Query](https://tanstack.com/query) | v5 | Cache y estado de datos en el cliente |
| TypeScript | 6+ | Contratos tipados entre capas |

## 🏗️ Arquitectura

La app sigue una arquitectura por capas con **responsabilidad única** y dependencias unidireccionales:

```
app/ → features/ → services/ → core/
```

- `app/` — solo pantallas y layouts (expo-router).
- `features/` — casos de uso de UI (catálogo, reproductor, favoritos).
- `services/` — I/O externo y transformación sin UI (TMDB, HackStore, SeriesMetro, mirrors, streams).
- `core/` — tipos compartidos, errores, utilidades base y stores.

Detalles completos en [ARCHITECTURE.md](./ARCHITECTURE.md) y decisiones de diseño en [docs/adr](./docs/adr/).

## 🚀 Empezando

### Requisitos

- Node ≥ 20.19
- Xcode ≥ 26.4 (para iOS, iOS 16.4+)
- Android SDK 36 (para Android)
- [Bun](https://bun.sh/) o npm

### Instalación

```bash
git clone https://github.com/EduAZ86/AZ-MisPelis.git
cd AZ-MisPelis
npm install   # o: bun install
```

### Variables de entorno

Copia `.env.local.example` a `.env.local` y define tu token de TMDB:

```env
EXPO_PUBLIC_TMDB_API_TOKEN=tu_token_aqui
```

> El token se guarda en el SecureStore durante el primer arranque.

### Ejecutar

```bash
npm start          # Expo dev server
npm run ios        # Build y ejecuta en simulador iOS
npm run android    # Build y ejecuta en emulador Android
npm run web        # Versión web
```

## ✅ Calidad

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # Vitest (unit tests)
npm run e2e         # Maestro E2E (opcional)
```

- **Unit tests**: decodificadores de mirrors, detección de calidad, generación de slugs, extracción de embeds (lógica pura sin red).
- **Integración**: resolvers y mappers contra fixtures HTML/JSON guardados en `__fixtures__/` (sin llamadas reales en CI).
- **E2E**: flujos críticos con [Maestro](https://maestro.mobile.dev/) (`buscar → reproducir`).

## 📂 Estructura del repositorio

```
AZ-MisPelis/
├── app/                # Pantallas y layouts (expo-router)
├── features/           # Casos de uso de UI (catalog, player, favorites)
├── services/           # I/O externo: tmdb, hackstore, seriesmetro, mirrors, streams
├── core/               # Tipos, errores, base64, stores (useSyncExternalStore)
├── docs/adr/           # Registro de decisiones de arquitectura
├── __fixtures__/       # HTML/JSON de prueba para integración
├── tests/              # Tests (unit / e2e / maestro)
└── ARCHITECTURE.md     # Arquitectura detallada
```

## 📜 Changelog

Visita [CHANGELOG.md](./CHANGELOG.md) para el historial completo de versiones.

## ⚠️ Aviso legal

Este proyecto se ofrece con fines educativos y de uso personal. El contenido reproducido proviene de fuentes de terceros (mirrors) no controladas por el proyecto. Respeta la legislación aplicable y los términos de servicio de los proveedores en tu región.

---

<div align="center">

Hecho con ❤️ para el disfrute del cine y las series.

</div>
