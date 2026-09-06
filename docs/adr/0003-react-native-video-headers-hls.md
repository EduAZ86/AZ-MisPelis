# ADR-0003: Reproducción HLS con react-native-video v7 (headers custom nativos)

- Estado: Aceptada
- Fecha: 2026-09-05

## Contexto

Los mirrors HLS exigen headers HTTP custom (`Referer`, `Origin`, `User-Agent`)
en la descarga del manifiesto y de los segmentos. En la app anterior esto se
resolvía con un proxy HLS server-side (`app/api/hlsproxy/route.ts`) — inviable
sin backend.

## Decisión

Usar **react-native-video v7** como reproductor. Verificado en su documentación
actual que la fuente acepta un objeto `headers` que el player nativo aplica en
cada petición (AVPlayer en iOS, ExoPlayer en Android), y que soporta
subtítulos side-car (`externalSubtitles`, VTT en iOS) y configuración de buffer.

```ts
useVideoPlayer({
  uri: source.url,
  headers: source.headers,
  externalSubtitles: [...],
  bufferConfig: { minBufferMs: 5000, maxBufferMs: 30000, bufferForPlaybackMs: 2000 },
});
```

## Consecuencias

- ✅ Elimina el proxy HLS y el servidor por completo.
- ✅ Subtítulos VTT de los mirrors se pasan directo como `externalSubtitles` (no requiere el endpoint `subfile` anterior).
- ⚠️ Comportamiento de headers es responsabilidad del player nativo; verificar por plataforma en integración (riesgo bajo, documentado por la librería).
- `expo-video` se descarta: no expone headers por petición con el mismo control.
