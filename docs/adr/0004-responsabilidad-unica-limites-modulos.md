# ADR-0004: Responsabilidad única y límites entre módulos

- Estado: Aceptada
- Fecha: 2026-09-05

## Contexto

En `misPelis/` la lógica creció en archivos monolíticos (`lib/latino.ts` con
TMDB + slugs + fetch + parsing + caché de dos providers; `lib/clientResolver.ts`
con 4 mirrors en un solo archivo). El propietario exige evitar grandes monolitos
ilegibles y difíciles de mantener.

## Decisión

1. **Un archivo = una responsabilidad** (una exportación principal, una razón de cambio).
2. Capas unidireccionales: `app/ → features/ → services/ → core/`. Ningún import hacia atrás.
3. Providers aislados: `services/hackstore/*` y `services/seriesmetro/*` no se conocen entre sí; un mirror por archivo en `services/mirrors/`; decoders puros en `services/mirrors/decoders/`.
4. Un único orquestador: `services/streams/resolver.ts` (fuentes, prioridad idioma/calidad, caché TTL).
5. Prohibido: `utils.ts` genéricos, singletons mutables (excepción única: `services/streams/cache.ts`), `throw new Error` crudo (usar `AppError` de `core/`).
6. Todo `services/*` testeable sin dispositivo, contra fixtures.

## Consecuencias

- ✅ Cada resolver/provider se puede testear y reemplazar de forma independiente; el cambio de un mirror no toca a los demás.
- ✅ Plan puede descomponer por módulo sin dependencias ocultas; Build tiene límites explícitos.
- ⚠️ Más archivos pequeños: aceptado deliberadamente como coste de mantenibilidad.
