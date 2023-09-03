# Jzod

Provides a straightforward JSON interface to [Zod](https://github.com/colinhacks/zod) schema.

## Installation

Plain js use:

```sh
npm install @miroir-framework/jzod
```

Typescript use:

```sh
npm install @miroir-framework/jzod-ts
```

Package `jzod-ts` provides Typescript types for Jzod schemas, and conversion functions from Jzod Schemas to Typescript types.

## Principle

Instead of writing [Zod](https://github.com/colinhacks/zod) schemas:

```js
import { z } from "zod";

const myZodSchema = z.object({a:z.number().optional(), b: z.array(z.string())})
```

One may write, to get the equivalent result:

```js
import { jzodToZod } from "@miroir-framework/jzod";

const myJzodSchema = {
  type: "object",
  definition: { 
    a: { type: "simpleType", definition: "number", optional: true },
    b: { type:"array", definition: { type:"simpleType", definition:"boolean" } }
  }
}
const myZodSchema = jzodToZod(myJzodSchema);
```

Which requires to type undeniably more characters, but provides a plain JSON structure that can be serialized, transformed, and reused. Transparency is furthermore gained, as two Jzod schemas can be easily compared with each other, which is not the case of Zod Schemas (up to my knowledge).

## Usage

![usage](doc/usage.drawio.png)

Using the features of Zod, one may obtain, in a single movement:

- a form validator, usable in any webapp,
- the corresponding Typescript types, for the Typescript-inclined, (try it, maybe!)
- a JSON schema, standardized way of describing data structures,
- plenty of other things, see [Zod Ecosystem](https://zod.dev/?id=zod-to-x)

Jzod provides a description of the format of Jzod schemas, a converter to Zod schemas, and a converter from Zod Schemas to Jzod Schemas. The schema describing the format of Jzod Schemas is itself a Jzod Schema (bootstrap).

Jzod depends on [zod-to-ts](https://www.npmjs.com/package/zod-to-ts) for direct Typescript type generation from Jzod Schemas, and also provides a Zod schema code generator.

Here is a simple example of Jzod Schema featuring `union` and `object` types, and some simple type validations:

```ts
const union: JzodElement = {
  type: "union",
  definition: [
    {
      type: "object",
      definition: { a: { type: "simpleType", definition: "string" } },
      , validations:[{ type: "min", parameter: 5 }, { type:"includes", parameter:"#"}] // string must be at least 5 characters long and contain '#'
    },
    {
      type: "object",
      definition: { b: { type: "simpleType", definition: "number", validations:[ { type: "gte", parameter: 0 }, { type:"lte", parameter:"100"} ] } }, // comprised between 0 and 100
    },
  ],
};
```

## Caveat

Jzod to Zod conversion has not been optimized yet. It should already fit most usages, but it may become a performance bottleneck in case of trigger-happy, fire-and-forget conversions. Kind advice: once a Jzod schema has been converted to Zod, please hang on to that Zod schema for repeated validations (parse)!

## Features

All "primitive" Zod types are supported (`literal`, `enum`, `number`, `string`, `date`, see [Zod Primitives](https://zod.dev/?id=primitives)), with validations (`min`, `max`, etc.), and data structures (`object`, `union`, `array`, `tuple`, `record`, etc.).

Jzod allows defining and referencing Jzod schemas within Jzod Schemas, which fosters type reuse, enables direct definition of recursive types, and allows one to avoid relying on js-level constant definition / referencing for such purposes, that can be quite cumbersome.

For details about the (yet) unsupported Zod features, see [Limitations and Drawbacks](#limitations-and-drawbacks).

### References and Recursive types

Jzod enables references
```ts
const referencedType: JzodElement = {
  type: "schemaReference",
  context: {
    myString: {
      type: "simpleType", definition: "string" 
    },
    myObject: {
      type: "object",
      definition: {
        a: { type: "schemaReference", definition: { relativePath: "myString" } }
      }
    }
  },
  definition: { relativePath: "myObject" },
};
jzodToZod(referencedType).parse( { a: "test" } ); //success
```

Jzod Schema References are lazy-evaluated, allowing the definition of recursive types:

```ts
const recursiveType: JzodElement = {
  type: "schemaReference", 
  context: {
    "myObject": {
      type: "object",
      definition: {
        a: {
          type: "union",
          definition: [
            {
              type: "simpleType",
              definition: "string",
            },
            {
              type: "schemaReference",
              definition: { relativePath: "myObject"}
            }
          ]
        }
      }
    }
  },
  definition: { relativePath: "myObject" }
};
jzodToZod(recursiveType).parse( { a: { a: { a: "test" } } } ); //success
```

### Typescipt Use

Jzod provides Typescript Types for Jzod Schemas. One thus benefits from completion when creating Jzod Schemas, at least on modern IDEs:

![Completion](doc/ts-completion.png)


### Conversion to Zod
The function

```ts
import { jzodToZod } from "jzod"
jzodToZod(schema: JzodElement)
```

returns a Zod Schema corresponding to a Jzod Schema.

### Conversion From Zod
The function

```ts
import { zodToJzod } from "jzod"
zodToJzod(schema: ZodTypeAny, identifier:string)
```
returns a Jzod Schema corresponding to a Zod Schema. The `identifier` parameter gives the name of the reference to be used in case a `z.lazy()` occurs in the type.

For example:

```ts
const JzodSchema = zodToJzod(z.lazy(()=>z.any()),"test")); // equivalent to JzodSchema = {"type":"schemaReference","definition":{"relativePath":"test"}}
```
One thus has to ensure that any lazy-referenced Zod schema is available as a context. The most simple solution is to make any internal definition of a `lazy` call available as a js `const`, and use that name as context reference.

### Conversion to Typescript

In the separate [Jzod-ts](https://www.npmjs.com/package/jzod-ts) package, the function
```ts
import { jzodToZod } from "jzod-ts"
jzodToTsCode({ type: "simpleType", definition: "string" }, true/*export declaration*/, "testJzodSchema1")

// /* returns: */
// import { ZodType, ZodTypeAny, z } from "zod";
// export type testJzodSchema1 = string;
// export const testJzodSchema1 = z.string();

```

The function

```ts
jzodToTsTypeAliasesAndZodText(
  element: JzodElement,
  typeName?: string,
): TsTypeAliasesAndZodText
```

returns the Typescript Type Abstract Syntax Tree (AST) and the textual form of the Zod definition corresponding to:

- the context of the defined schema (which is non-empty whenever some schema reference defines such a context whithin the definition),
- the defined schema itself.

### Bootstrap

The `jzodBootstrapSetSchema` constant contains the bootstrapped defintion of Jzod Schemas. It has the property of self-parsing:

```ts
import { jzodBootstrapElementSchema, jzodToZod } from "@miroir-framework/jzod";

jzodToZod(jzodBootstrapElementSchema).parse(jzodBootstrapElementSchema); // succeeds!
```

This constant thus constitutes the full definition and reference for Jzod Schemas, and is accessible at any time (including runtime).

## Advantages compared to plain Zod schemas

When using `z.lazy` in Zod, the Typescript type cannot be inferred from the Zod Schema (which in any other situation can be accomplished using `z.infer<typeof schema>`). In these cases however, one has to write both the Typescript type and the Zod Schema, revealing some burden.

Jzod references allow to generate both the Typescript type and the Zod Schema from the Jzod Schema. However, a notorious drawback then persists: benefiting from the Typescript type requires some sort of pre-processing / type generation phase, to produce source files containing the wanted TS types. This pre-processing shall be triggered before / upon any build or reloading of the project at hand.

### Extensibility

TBC

### Support for Generic / Parametered Types

TBC

### Flexible Interpretation

TBC

## Limitations and Drawbacks

Jzod does not currently check for adequate use of validation contraint parameters with the employed Zod schema type; for example, it is allowed to pass a parameter to the number `int` constraint, which does not make sense, since this contraint only checks that the given number is an integer. The type of the parameter is not checked, either. Finally, Jzod does not allow yet to pass a custom error message (second parameter) to validators (TBD).

_Are not supported yet_: Native enums, effects, most object methods (`pick`, `omit`, `partial`, `deepPartial`, and `merge`, but `extend` is supported), other methods (`readonly`, `brand`, `pipe`) and transforms.

