# Release notes

Changelog for [`@miroir-framework/jzod`](https://www.npmjs.com/package/@miroir-framework/jzod), compiled from [npm publish history](https://www.npmjs.com/package/@miroir-framework/jzod?activeTab=versions), [Git tags](https://github.com/miroir-framework/jzod/tags), [GitHub releases](https://github.com/miroir-framework/jzod/releases), and [closed issues](https://github.com/miroir-framework/jzod/issues).

[← Back to documentation home](./README.md)

---

## Unreleased — 0.8.4

**Status:** in development (`package.json` version `0.8.4`; not yet on npm)

### Changes

- **Non-strict objects → `passthrough()`** — `nonStrict` Jzod objects now produce Zod schemas using `.passthrough()` instead of stripping unknown keys silently.
- License file corrections.

---

## 0.8.3

**Published:** 2026-05-05 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.8.3) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.8.3) · [tag `0.8.3`](https://github.com/miroir-framework/jzod/releases/tag/0.8.3))

### Refactors

- **Removed runtime dependencies on `typescript`, `fs`, and `zod-to-ts`** — the library no longer pulls these in at runtime; they remain available for dev/test only. TypeScript lazy-reference conversion is now injected via an optional callback parameter instead of calling `zod-to-ts` internally.
- **Decoupled `JzodInterface` from `@miroir-framework/jzod-ts` at runtime** — avoids a hard runtime import of the companion types package.
- **Package exports: ESM only** — removed the `"require"` entry from `package.json` exports (CommonJS artifact was already dropped in 0.8.2).

### Fixes

- Added a guard when `jzodWithCarryOnToZodTextAndZodSchema` is called with a missing element.

### Dev dependencies

- Bumped `@miroir-framework/jzod-ts` from 0.8.0 to 0.8.2.
- Added `@types/node`.
- Aligned on TypeScript 5.8.2.

[Full changelog 0.8.2…0.8.3](https://github.com/miroir-framework/jzod/compare/0.8.2...0.8.3)

---

## 0.8.2

**Published:** 2026-01-29 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.8.2) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.8.2))

### Features

- **Infer Jzod schema from JSON value** ([#20](https://github.com/miroir-framework/jzod/issues/20)) — new `valueToJzod()` function.
- **Opt-in discriminated unions** ([#21](https://github.com/miroir-framework/jzod/issues/21)) — interface support added; Zod schema generation for discriminated unions not yet implemented.

### Refactors & cleanup

- **Build & test toolchain** ([#18](https://github.com/miroir-framework/jzod/issues/18)) — migrated to `tsup` for builds and `vitest` for tests.
- **Package cleanup** ([#22](https://github.com/miroir-framework/jzod/issues/22)) — removed unused CommonJS artifact from the published package; removed `applyCarryOnSchema`.

[Full changelog 0.8.1…0.8.2](https://github.com/miroir-framework/jzod/compare/0.8.1...0.8.2)

---

## 0.8.1

**Published:** 2025-03-25 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.8.1) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.8.1))

### Improvements

- Improved Jzod → TypeScript type conversion speed ([#8](https://github.com/miroir-framework/jzod/issues/8)).

[Full changelog 0.8.0…0.8.1](https://github.com/miroir-framework/jzod/compare/0.8.0...0.8.1)

---

## 0.8.0

**Published:** 2025-03-25 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.8.0) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.8.0))

### Breaking changes & migrations

> **Migration from 0.7.x:** The `"simpleType"` wrapper is **removed**. Replace `{ type: "simpleType", definition: "string" }` with `{ type: "string" }`. The internal `"subDiscriminator"` field for discriminated unions is also removed — it had no effect on generated Zod schemas.

- **De-released `"simpleType"` definitions** ([#10](https://github.com/miroir-framework/jzod/issues/10)).
- Replaced incorrect `"lazy"` type with proper `schemaReference` ([#11](https://github.com/miroir-framework/jzod/issues/11)).

### Features

- **Carry-on types and manyfold object unions** ([#8](https://github.com/miroir-framework/jzod/issues/8)) — heteronomous unions; carry-on attribute interpretation on objects, unions, and schema references.
- **Multiple object inheritance** (interface inheritance) ([#13](https://github.com/miroir-framework/jzod/issues/13)).
- Renamed bootstrap extension attribute from `"extra"` to `"tag"` ([#12](https://github.com/miroir-framework/jzod/issues/12)).

### Refactors

- Jzod → Zod translation now squashes inheritance to plain Zod schemas without `z.merge()` ([#14](https://github.com/miroir-framework/jzod/issues/14)).
- Reduced build size; removed unnecessary bundled libraries ([#17](https://github.com/miroir-framework/jzod/issues/17)).
- CarryOn schema reference suffix handling ([#16](https://github.com/miroir-framework/jzod/issues/16)).
- Switched tests to vitest; fixed tsup build for ES5 library targets.

[Full changelog 0.7.0…0.8.0](https://github.com/miroir-framework/jzod/compare/0.7.0...0.8.0)

---

## 0.7.0

**Published:** 2024-06-01 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.7.0) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.7.0))

### Features

- Added top-level `"string"`, `"number"`, and `"date"` types for Jzod attributes; **`"simpleType"` deprecated** ([#7](https://github.com/miroir-framework/jzod/issues/7)).
- Partial objects support ([#5](https://github.com/miroir-framework/jzod/issues/5)).
- Reduced package size ([#6](https://github.com/miroir-framework/jzod/issues/6)).

> **Note:** From 0.7.0 onward, prefer `{ type: "string" }` over `{ type: "simpleType", definition: "string" }`. The old form is removed in 0.8.0.

[Full changelog 0.6.2…0.7.0](https://github.com/miroir-framework/jzod/compare/0.6.2...0.7.0)

---

## 0.6.3

**Published:** 2024-03-24 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.6.3))  
**Git tag:** not present in repository  
**GitHub release:** not published

Patch release published to npm between 0.6.2 and 0.7.0. No detailed changelog available in the repository.

---

## 0.6.2

**Published:** 2024-02-11 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.6.2) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.6.2))

### Features

- Partial objects and number, bigint, and boolean literals (in addition to string literals) ([#4](https://github.com/miroir-framework/jzod/issues/4)).

[Full changelog 0.6.1…0.6.2](https://github.com/miroir-framework/jzod/compare/0.6.1...0.6.2)

---

## 0.6.1

**Published:** 2023-12-19 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.6.1) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.6.1))

### Features

- `coerce` support on dates, numbers, and strings ([#3](https://github.com/miroir-framework/jzod/issues/3)).

[Full changelog 0.6.0…0.6.1](https://github.com/miroir-framework/jzod/compare/0.6.0...0.6.1)

---

## 0.6.0

**Published:** 2023-11-27 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.6.0) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.6.0))

### Changes

- TypeScript conversion: object attributes correctly become optional for optional Jzod attributes ([#1](https://github.com/miroir-framework/jzod/issues/1)).
- Renamed bootstrap Zod schema constants (`jzodArraySchema` → `jzodArray`, etc.) ([#2](https://github.com/miroir-framework/jzod/issues/2)).

---

## 0.5.4

**Published:** 2023-11-22 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.5.4) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.5.4))

- Exported `jzodToZod` and `zodToJzod` from package entry point (`index.ts`).
- Fixed image links in README.

---

## 0.5.3

**Published:** 2023-09-26 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.5.3) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.5.3))

- Renamed bootstrap schemas: `jzodObjectSchema` → `jzodObject`, and similar renames across bootstrap constants.

[Full changelog 0.5.2…0.5.3](https://github.com/miroir-framework/jzod/compare/0.5.2...0.5.3)

---

## 0.5.2

**Published:** 2023-09-13 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.5.2))

- Added tests for Jzod → Zod conversion of eager schema references.

---

## 0.5.1

**Published:** 2023-09-09 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.5.1) · [GitHub release](https://github.com/miroir-framework/jzod/releases/tag/0.5.1))

- Fixed relative reference resolution in `jzodElementSchemaToZodSchemaAndDescription`.

[Full changelog 0.5.0…0.5.1](https://github.com/miroir-framework/jzod/compare/0.5.0...0.5.1)

---

## 0.5.0

**Published:** 2023-09-03 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.5.0))

Major feature release building on the initial prototype:

- Strict / non-strict object support.
- `coerce` on primitive types.
- Object `extend` clause with eager reference resolution.
- Validations for numbers and dates.
- Missing Zod types: intersection, map, promise, set, tuple.
- `nullable` property.
- `zodToJzod` conversion function.
- Context section on JzodObject schemas.
- Schema references with `relativePath`.
- Text-based Zod schema description generation.
- `"extra"` attribute for free extension of types.
- UUID added to attribute type enum.
- Moved hard-coded bootstrap constants to `@miroir-framework/jzod-ts`.

---

## 0.1.1 / 0.1.0

**Published:** 2023-07-02 ([npm](https://www.npmjs.com/package/@miroir-framework/jzod/v/0.1.1))

Initial release of the Jzod JSON-to-Zod bootstrapper.

---

## Version matrix

| Version | npm publish | Git tag | GitHub release |
|---------|-------------|---------|----------------|
| 0.8.4 | — | — | — |
| 0.8.3 | 2026-05-05 | ✓ | ✓ |
| 0.8.2 | 2026-01-29 | ✓ | ✓ |
| 0.8.1 | 2025-03-25 | ✓ | ✓ |
| 0.8.0 | 2025-03-25 | ✓ | ✓ |
| 0.7.0 | 2024-06-01 | ✓ | ✓ |
| 0.6.3 | 2024-03-24 | — | — |
| 0.6.2 | 2024-02-11 | ✓ | ✓ |
| 0.6.1 | 2023-12-19 | ✓ | ✓ |
| 0.6.0 | 2023-11-27 | ✓ | ✓ |
| 0.5.4 | 2023-11-22 | ✓ | ✓ |
| 0.5.3 | 2023-09-26 | ✓ | ✓ |
| 0.5.2 | 2023-09-13 | ✓ | — |
| 0.5.1 | 2023-09-09 | ✓ | ✓ |
| 0.5.0 | 2023-09-03 | ✓ | — |
| 0.1.1 | 2023-07-02 | ✓ | — |
| 0.1.0 | 2023-07-02 | ✓ | — |

---

## Migration guide summary

| Upgrade path | Action required |
|--------------|-----------------|
| **→ 0.8.0+** | Replace all `{ type: "simpleType", definition: "…" }` with `{ type: "…" }`. Remove `"subDiscriminator"` if present. |
| **→ 0.7.0+** | Start migrating away from `"simpleType"` (deprecated; removed in 0.8.0). |
| **→ 0.6.x** | Review optional attribute handling in generated TypeScript types. |
| **→ 0.5.x** | Bootstrap constant renames (`jzodObjectSchema` → `jzodObject`); use package exports for `jzodToZod` / `zodToJzod`. |
