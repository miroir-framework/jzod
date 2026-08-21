# Jzod Documentation

Welcome to the documentation for [**Jzod**](https://github.com/miroir-framework/jzod) — a JSON interface to [Zod](https://github.com/colinhacks/zod) schemas.

## What is Jzod?

Jzod lets you describe data structures as plain JSON instead of TypeScript/Zod code. That makes schemas easy to serialize, compare, store, and transform — while still converting them to full Zod validators at runtime.

```js
import { jzodToZod } from "@miroir-framework/jzod";

const myJzodSchema = {
  type: "object",
  definition: {
    a: { type: "number", optional: true },
    b: { type: "array", definition: { type: "string" } },
  },
};

const myZodSchema = jzodToZod(myJzodSchema);
```

## Package

| | |
|---|---|
| **npm** | [`@miroir-framework/jzod`](https://www.npmjs.com/package/@miroir-framework/jzod) |
| **Repository** | [github.com/miroir-framework/jzod](https://github.com/miroir-framework/jzod) |
| **License** | MIT |
| **Latest npm release** | 0.8.3 |
| **Current development version** | 0.8.4 (see [Release notes](./release-notes.md)) |

## Installation

```sh
npm install @miroir-framework/jzod
```

For TypeScript type generation from Jzod schemas, use the companion package:

```sh
npm install @miroir-framework/jzod-ts
```

## Documentation pages

| Page | Description |
|------|-------------|
| [Release notes](./release-notes.md) | Version history, migration notes, and links to GitHub releases |
| [Project README](../README.md) | Full usage guide, examples, and feature reference |

## Core concepts

### JSON-first schemas

Jzod schemas are plain JSON objects with a `type` field and a `definition` (shape depends on the type). They can be persisted, diffed, and bootstrapped — the meta-schema for Jzod itself is a Jzod schema.

### Conversions

| Function | Direction |
|----------|-----------|
| `jzodToZod(schema)` | Jzod → Zod validator |
| `zodToJzod(schema, identifier)` | Zod → Jzod |
| `valueToJzod(value)` | JSON value → inferred Jzod schema *(since 0.8.2)* |

TypeScript code generation lives in the separate [`@miroir-framework/jzod-ts`](https://www.npmjs.com/package/@miroir-framework/jzod-ts) package (`jzodToTsCode`, `jzodToZodTextAndTsTypeAliases`).

### Schema references and recursion

References (`type: "schemaReference"`) enable type reuse and recursive definitions via a lazy-evaluated `context` map.

### Bootstrap

The constant `jzodBootstrapElementSchema` is the self-describing Jzod schema for all Jzod schemas — it validates itself:

```ts
import { jzodBootstrapElementSchema, jzodToZod } from "@miroir-framework/jzod";

jzodToZod(jzodBootstrapElementSchema).parse(jzodBootstrapElementSchema); // succeeds
```

## Architecture overview

```
JSON Jzod schema
      │
      ├─► jzodToZod() ──► Zod validator (runtime parse/safeParse)
      │
      └─► jzod-ts ──────► TypeScript types + Zod source text
```

See the [usage diagram](../doc/usage.drawio.png) in the repository for the full pipeline.

## Getting help

- **Issues & feature requests:** [github.com/miroir-framework/jzod/issues](https://github.com/miroir-framework/jzod/issues)
- **Release history & migrations:** [Release notes](./release-notes.md)

## Related projects

| Package | Role |
|---------|------|
| [`@miroir-framework/jzod`](https://www.npmjs.com/package/@miroir-framework/jzod) | JSON ↔ Zod conversion, bootstrap schema |
| [`@miroir-framework/jzod-ts`](https://www.npmjs.com/package/@miroir-framework/jzod-ts) | Jzod → TypeScript types and Zod text |
| [Miroir Framework](https://github.com/miroir-framework/miroir-app-dev) | Application framework that uses Jzod as its meta-language (MML) |
