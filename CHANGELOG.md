# Changelog - misPelis

## 1.5.3 — 13 de septiembre de 2026

### Favoritos — Estado compartido entre pantallas
- Nuevo store `features/favorites/store.ts` basado en `useSyncExternalStore`: favoritos y "Continuar viendo" ahora comparten un único estado global en lugar de `useState` por instancia del hook
- Corregido: al marcar/desmarcar un favorito en el detalle de película o serie, la tab Biblioteca se actualiza al instante (antes requería reiniciar la app)
- Corregido: el botón ★/☆ de favoritos queda sincronizado entre todas las pantallas
- Hidratación única desde `AsyncStorage` con merge seguro si ocurre una mutación durante la carga; se mantienen las claves `@mispelis:favorites:v1` y `@mispelis:continueWatching:v1` (sin migración de datos)

### Continuar viendo — Datos reales y conexión con el reproductor
- `usePlaybackProgress` ahora persiste `title`, `poster` y `meta_score` reales (antes guardaba cadenas vacías) y almacena el progreso como fracción de la duración
- `VideoPlayerView` se conecta a los eventos `onLoad`, `onProgress` (guardado cada ~5 s) y `onEnd`, y reanuda la reproducción desde la posición guardada
- Las pantallas `movie/[id].tsx` y `series/[id].tsx` pasan la metadata de reproducción al reproductor
- Al finalizar un video se limpia su entrada de "Continuar viendo"

## 1.5.2 — 6 de septiembre de 2026

### Icono de aplicación — Logo pelusito
- Regenerados los iconos nativos con el logo `pelusito.png`
- iOS: reemplazado `App-Icon-1024x1024@1x.png` en `Images.xcassets/AppIcon.appiconset` (1024×1024, RGB opaco)
- Android: regenerados los mipmaps como PNG en 5 densidades (`mdpi`→`xxxhdpi`): `ic_launcher`, `ic_launcher_round`, `ic_launcher_foreground`, `ic_launcher_background` y `ic_launcher_monochrome` (reemplazando los `.webp` del prebuild original)
- El icono ahora se aplica al **reconstruir** la app nativa (el build previo conservaba el icono por defecto del prebuild inicial)

## 1.5.1 — 6 de septiembre de 2026

### Navbar iPadOS — Corrección de navegación bloqueada
- Corregido: en Películas/Series los botones de navegación desaparecían (el modo filtro reemplazaba los tabs), dejando al usuario sin forma de salir de la sección
- Los tabs ahora **siempre son visibles** en la fila principal (logo + tabs + settings); los chips de filtro se muestran en una segunda fila debajo
- Corregido: en Buscar el input reemplazaba los tabs; ahora el input de búsqueda va en una segunda fila y los tabs permanecen accesibles
- Corregido: en Settings no había forma de salir en tablet (NavHeader retorna `null` en tablet); agregado botón flotante "back" reutilizando el patrón de las pantallas de detalle

## 1.5.0 — 6 de septiembre de 2026

### Navbar iPadOS — Filtros integrados en Películas/Series
- Nuevo store `core/navFilterChips` (`navFilterStore.ts`): las pantallas registran sus chips de filtro y la navbar los consume
- En tablet, al estar en los tabs Películas o Series, los chips de orden/filtro (⇅ orden, género activo ✕, año ✕, Filtrar…) se muestran **dentro de la navbar**, ensanchándola
- Los tabs se ocultan mientras el modo filtro está activo (mismo patrón que el modo búsqueda)
- Tocar un chip activo (género/año) lo limpia; tocar "⇅ orden" o "Filtrar…" abre el FilterModal existente
- Eliminada la barra de filtros flotante duplicada en tablet (en phone se mantiene igual)
- Limpieza: removidos `useSafeAreaInsets`/`insets` sin uso en `peliculas.tsx` y `series.tsx`

## 1.4.1 — 6 de septiembre de 2026

### Reproductor — Carga al seleccionar fuente, sin botón "Reproducir"
- Eliminado el botón manual "Reproducir" de `movie/[id].tsx` y `series/[id].tsx`
- Al seleccionar un servidor/fuente se resuelve y carga el reproductor automáticamente con el contenido listo
- El reproductor **no** se reproduce solo: queda en pausa hasta que el usuario presiona play dentro del reproductor
- Al cambiar de fuente dentro del `SourcePicker`, el reproductor se recarga con la nueva fuente (también sin autoplay)

### Reproductor — Corrección de recorte en iPadOS
- `VideoPlayerView`: eliminado `aspectRatio` en favor de altura explícita calculada (`width × 9/16` con margen de 32px) para que el reproductor no se recorte dentro del ScrollView en iPad
- Eliminado autoplay (`player.play()` en `useEffect`) del reproductor

## 1.4.0 — 6 de septiembre de 2026

### Navbar iPadOS — Áreas táctiles reparadas
- Tabs ahora usan `TouchableOpacity` que envuelve todo el área con padding (antes el `onPress` estaba solo en ícono/texto, el padding no era clicable)
- Botón settings: ahora es `TouchableOpacity` navegable a `/settings` (antes no tenía handler)
- Settings agrandado de 36×36 a 44×44 (mínimo recomendado por Apple)
- `minHeight: 44` en áreas táctiles de tabs (phone y tablet)

### Navbar iPadOS — Búsqueda integrada
- Nuevo store `core/searchStore.ts` (`useSyncExternalStore`) para compartir el texto de búsqueda entre pantalla y navbar
- Al escribir en el tab Buscar: los tabs desaparecen y el input ocupa la navbar completa (solo logo + barra de búsqueda con botón ✕ + settings)
- Al borrar el texto, los tabs reaparecen automáticamente
- Input duplicado de la pantalla oculto en tablet mientras el de la navbar está activo

## 1.3.1 — 6 de septiembre de 2026

### Detalle de película/serie — Correcciones
- Corregida imagen de fondo cortada: `backdropContainer` de `height: 300` fijo a `minHeight: 360` con `resizeMode: "cover"`
- `headerContent` ya no se recorta (eliminado `flex: 1` que truncaba el contenido)
- Navbar invisible en tablet: agregado botón flotante "back" en `movie/[id].tsx` y `series/[id].tsx` (ya que `NavHeader` retorna `null` en tablet)
- Limpieza de código muerto: eliminados `useEffect` de autoplay obsoleto, `lastPlayedKeyRef` e `isResolving` no usados

### Reproductor — Reversión de autoplay
- Se restaura el botón manual **"Reproducir"** en `movie/[id].tsx` y `series/[id].tsx`
- El reproductor carga el contenido solo al presionar "Reproducir", sin autoplay al seleccionar fuente
- El video queda listo con la fuente seleccionada pero no se reproduce automáticamente

## 1.3.0 — 6 de septiembre de 2026

### Metascore — Información de puntuación
- `TmdbMedia` tipo: agregado campo `meta_score?: number`
- `CatalogSortBy`: nuevos `meta_score.desc` y `meta_score.asc` para ordenar por Metascore
- `MediaGrid` (grid): muestra `MS {meta_score}` junto a la estrella de puntuación
- `MediaRow` (lista horizontal): muestra `MS {meta_score}` en badge de rating
- `search.tsx`: muestra `MS {meta_score}` en resultados de búsqueda
- `discover.ts`: filtro `vote_count.gte: 300` aplicado al ordenar por Metascore
- `CatalogGrid` FilterModal: nuevas opciones "Metascore ↑" y "Metascore ↓"

### Reproductor — Autoplay al seleccionar fuente
- Eliminado botón "Reproducir" en `movie/[id].tsx` y `series/[id].tsx`
- El reproductor se reproduce automáticamente al seleccionar un servidor
- Al cambiar de fuente, el video se reproduce automáticamente con la nueva fuente
- Se utiliza `lastPlayedKeyRef` para rastrear la fuente actual y evitar re-disparos

### VideoPlayerView — Corrección de desbordamiento en iPadOS
- `container`: cambiado `flex: 1` → `width: "100%"` para evitar desbordamiento en ScrollView
- El reproductor ahora se ajusta correctamente al contenido sin desbordarse en iPadOS

### Navbar — Botones de mayor tamaño
- `GlassTabBar.tsx`: `touch.paddingVertical` aumentado de 2 a 12
- `bar.minHeight` aumentado de 58 a 68
- `row.paddingVertical` ajustado de 8 a 10
- `tabletTouch.paddingVertical` aumentado de 6 a 12
- `tabletActions`: tamaño aumentado de 32×32 a 36×36
- Más fácil de activar los botones táctiles en la navbar

## 1.2.0 — 6 de septiembre de 2026

### Biblioteca — Reescritura completa
- Eliminado `NavHeader` de la pantalla de biblioteca (ya es tab, la navbar global maneja navegación)
- Corregido desbordamiento horizontal: se reemplazó `FlatList` con `numColumns` por `ScrollView` con secciones `FlatList` horizontales
- Separación de favoritos: "Películas favoritas" y "Series favoritas" en secciones independientes
- Reordenamiento: "Continuar viendo" se muestra primero, luego películas favoritas, luego series favoritas
- Tarjetas con ancho calculado dinámicamente según el ancho de pantalla

## 1.1.1 — 6 de septiembre de 2026

### Navbar iPad — Corrección de ancho
- Navbar centrada en iPad, ocupa solo el ancho necesario de su contenido
- Eliminado `flex: 1` y `left: 0, right: 0` que forzaban ancho completo

## 1.1.0 — 6 de septiembre de 2026

### UI iPad — Estilo Apple TV
- `TabScreen`: eliminado padding superior en tablet, contenido edge-to-edge
- `GlassTabBar`: barra unificada en tablet (logo + "Mis Pelis" + tabs + settings), ancho contenido centrado, 52px altura
- `NavHeader`: retorna `null` en tablet (la navbar global maneja todo)
- Home: contenido full-width en tablet, eliminado `maxRowWidth: 720`
- Películas/Series: barra de filtros con safe area padding en tablet
- Search: barra de búsqueda adaptable a tablet con safe area
- Biblioteca: 6 columnas en tablet, tab selector con safe area

### Icono de aplicación
- Nuevo icono basado en `pelusito.png` (1254×1254)
- Generados assets: `icon.png` (1024×1024), `android-icon-foreground.png` (512×512), `android-icon-background.png` (512×512, #E6F4FE), `android-icon-monochrome.png` (512×512), `favicon.png` (48×48)

### Tema claro/oscuro
- `ThemeProvider` con persistencia en AsyncStorage (`@mispelis/theme-mode`)
- `ThemeTokens` type ampliado para soporte dinámico de colores
- Conversión de 19+ archivos a `useTheme()` con colores inline
- `app.json`: `userInterfaceStyle: "automatic"`
- Settings: toggle Nocturno/Diurno con chips

### Limpieza de código
- Eliminados imports duplicados en 3 archivos
- Eliminadas variables sin usar (`radius`, `TmdbMedia`, `isError`) en 6 archivos
- 0 errores ESLint, 0 warnings

## 1.0.0 — 6 de septiembre de 2026

### Versión inicial
- **Stack**: Expo SDK 57, React Native 0.86.3, React 19.2.3, expo-router
- **Gestión de datos**: TanStack Query v5.102.8 + persist-client + async-storage-persister
- **Toasts**: sonner-native v0.27, hook `useApiErrors` reutilizable
- **Error handling**: global `ErrorBoundary`, `AppError("SOURCE_NOT_FOUND")`
- ** Tema**: sistema de colores dark/light en `core/theme.ts`, `themes` export

### UI Líquida tipo Apple TV
- `Glass.tsx`: panel de vidrio simulado (rgba bg + border light + sheen, sin expo-blur)
- `GlassTabBar.tsx`: tab bar flotante tipo pastilla, bottom en phone, top en tablet
- `TabScreen.tsx`: wrapper con header flotante absolute y manejo de safe areas
- `NavHeader.tsx`: navegación simplificada (back, logo, título, heart, settings)
- `GlassPanel`: componente base reutilizable para elementos con efecto vidrio

### Navegación
- Root Stack → `(tabs)` + `movie/[id]` + `series/[id]` + `settings`
- 5 tabs: Inicio, Películas, Series, Buscar, Biblioteca
- Color activo dorado (`#E9B44C`)
- Tab bar adaptativa: bottom en phone, top flotante en tablet ≥768px

### Pantallas
- **Home** (`app/(tabs)/index.tsx`): hero carousel trending (5 items, auto-rotate 6s), secciones `SectionHeader` + "Ver todo ›", `GenreChips` con Ionicons, `CatalogSectionRow`, logo "AZ"/"Mis Pelis", botón settings ⚙
- **Películas** (`app/(tabs)/peliculas.tsx`): `MediaGrid` adaptativo (3/4/6 columnas), `FilterModal` (genre/year/sort), chips de filtros
- **Series** (`app/(tabs)/series.tsx`): mismo patrón que películas, lee `?genre=` param
- **Buscar** (`app/(tabs)/search.tsx`): búsqueda con debounce, resultados con poster/título/tipo
- **Biblioteca** (`app/(tabs)/favorites.tsx`): favoritos + continuar viendo con progreso
- **Película** (`app/movie/[id].tsx`): detalle con fuente, casting, info
- **Serie** (`app/series/[id].tsx`): detalle con temporadas/episodios
- **Ajustes** (`app/settings.tsx`): toggle tema, versión, fecha, desarrollador

### Catálogo (TMDB)
- `services/tmdb/discover.ts`: `fetchMovieGenres`, `fetchTVGenres`, `fetchDiscoverMovies/TV`
- `features/catalog/hooks/useDiscover.ts`: infinite queries por género/año/orden
- `features/catalog/hooks/useCatalogFilters.ts`: estado de filtros
- `features/catalog/components/MediaGrid.tsx`: grid adaptativo + `FilterModal`
- `features/catalog/components/MediaRow.tsx`: `MediaCard`, `SectionHeader`, `MediaRow`
- `features/catalog/components/HeroCard.tsx`: carrusel hero con auto-rotate
- `features/catalog/components/GenreChips.tsx`: chips de género con Ionicons

### Fuentes de video
- `services/streamguide/index.ts`: Perses API (fuente primaria)
- `resolveStreams`: lanza `AppError("SOURCE_NOT_FOUND")` si vacío
- `features/player/components/VideoPlayerView.tsx`: nunca crear player sin source

### Build
- Android: emulator `New_Medium_Android` (API 37.0)
- iPad Release: `xcodebuild` + `xcrun devicectl` (workaround bug expo)
- `app.json`: `newArchEnabled: true`, `userInterfaceStyle: "automatic"`