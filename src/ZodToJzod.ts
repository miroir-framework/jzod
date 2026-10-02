import { JzodElement } from "@miroir-framework/jzod-ts";
import { ZodTypeAny } from "zod";

import { zodDef } from "./ZodToZodText.js";

const primitiveTypes = ["string", "number", "bigint", "boolean", "date"];
const constantTypes = ["undefined", "null", "void", "any", "unknown", "never"];

export const zodToJzod = (zod: ZodTypeAny, identifier: string): JzodElement => {
  const def = zodDef(zod);
  const type: string = def.type;
  if (primitiveTypes.includes(type)) {
    return (def.coerce ? { type, coerce: true } : { type }) as JzodElement;
  }
  if (constantTypes.includes(type)) {
    return { type } as JzodElement;
  }
  switch (type) {
    case "array": {
      return { type: "array", definition: zodToJzod(def.element, identifier) };
    }
    case "enum": {
      return { type: "enum", definition: Object.values(def.entries) as string[] };
    }
    case "lazy": {
      // it is impossible to determine what the lazy value is referring to
      // so we force the user to declare it
      return { type: "schemaReference", definition: { absolutePath: identifier } }; // TODO: how to restore absolutePath vs. relativePath vs. both?
    }
    case "literal": {
      return { type: "literal", definition: def.values[0] };
    }
    case "object": {
      const isStrict = def.catchall ? zodDef(def.catchall).type === "never" : false;
      const propertiesJzodSchema = Object.entries(def.shape as Record<string, ZodTypeAny>).map(([key, value]) => {
        const propertyJzodSchema = zodToJzod(value, identifier);
        const isOptional = value.isOptional();
        const isNullable = value.isNullable();
        const propertyJzodSchemaWithOptional =
          isOptional || (propertyJzodSchema as any)["optional"] != undefined
            ? { ...propertyJzodSchema, optional: isOptional }
            : propertyJzodSchema;
        const propertyJzodSchemaWithNullable =
          isNullable || (propertyJzodSchema as any)["nullable"] != undefined
            ? { ...propertyJzodSchemaWithOptional, nullable: isNullable }
            : propertyJzodSchemaWithOptional;
        return [key, propertyJzodSchemaWithNullable];
      });
      return isStrict
        ? { type: "object", definition: Object.fromEntries(propertiesJzodSchema) }
        : { type: "object", nonStrict: true, definition: Object.fromEntries(propertiesJzodSchema) };
    }
    case "optional": {
      return { ...zodToJzod(def.innerType, identifier), optional: true } as JzodElement;
    }
    case "nullable": {
      return { ...zodToJzod(def.innerType, identifier), nullable: true } as JzodElement;
    }
    case "union": {
      const jzodUnionElements: JzodElement[] = def.options.map((option: ZodTypeAny) => zodToJzod(option, identifier));
      return def.discriminator
        ? {
            type: "union",
            discriminator: { discriminatorType: "string", value: def.discriminator } as any,
            definition: jzodUnionElements,
          }
        : { type: "union", definition: jzodUnionElements };
    }
    case "pipe":
    case "transform": {
      console.warn("zodToJzod: Zod transforms and pipes are ignored.");
      return { type: "any" };
    }
    case "record": {
      // z.record(z.string(), z.number()) -> { [x: string]: number }
      return { type: "record", definition: zodToJzod(def.valueType, identifier) };
    }
    case "tuple": {
      return { type: "tuple", definition: def.items.map((item: ZodTypeAny) => zodToJzod(item, identifier)) };
    }
    case "intersection": {
      return {
        type: "intersection",
        definition: { left: zodToJzod(def.left, identifier), right: zodToJzod(def.right, identifier) },
      };
    }
    case "map": {
      return {
        type: "map",
        definition: [zodToJzod(def.keyType, identifier), zodToJzod(def.valueType, identifier)],
      };
    }
    case "set": {
      return { type: "set", definition: zodToJzod(def.valueType, identifier) };
    }
    case "promise": {
      return { type: "promise", definition: zodToJzod(def.innerType, identifier) };
    }
    case "function": {
      // the input is a tuple schema
      const inputs: ZodTypeAny[] = def.input ? (zodDef(def.input).items ?? []) : [];
      return {
        type: "function",
        definition: {
          args: inputs.map((input) => zodToJzod(input, identifier)),
          returns: def.output ? zodToJzod(def.output, identifier) : { type: "any" },
        },
      } as JzodElement;
    }
    default:
      return { type: "any" };
  }
};
