# ADR-0006: misPelis como referencia de solo lectura y ubicación del proyecto

- Estado: Aceptada
- Fecha: 2026-09-05

## Contexto

La raíz `AZ-MisPelis/` contiene la app anterior en la subcarpeta `misPelis/`
(Next.js + Electron). El propietario pidió que el proyecto nuevo viva en la
**raíz** y que `misPelis/` quede solo como muestra/inspiración temporal.

## Decisión

- El proyecto nuevo vive en la raíz `AZ-MisPelis/` (este `ARCHITECTURE.md`,
  `docs/adr/`, `app/`, `features/`, `services/`, `core/`).
- `misPelis/` se conserva **intacta y sin builds** como referencia de lógica
  (resolvers, mappers, contratos) durante el port.
- Se eliminará `misPelis/` cuando el propietario lo confirme explícitamente;
  no se borra por iniciativa de los agentes.

## Consecuencias

- ✅ Código nuevo no hereda dependencias muertas (Playwright, Next, Electron).
- ⚠️ Se debe evitar importar código desde `misPelis/` (rutas distintas, tsconfig propio). El port es manual y por módulo (ver §14 de `ARCHITECTURE.md`).
