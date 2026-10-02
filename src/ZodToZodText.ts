import { ZodTypeAny } from "zod";

/** The definition of a zod 4 schema: `type` names the schema kind ("string", "object", ...). */
export const zodDef = (zod: ZodTypeAny): any => (zod as any)._zod.def;

const primitiveTypes = ["string", "number", "bigint", "boolean", "date"];
const constantTypes = ["undefined", "null", "void", "any", "unknown", "never"];

export const zodToZodText = (zod: ZodTypeAny, identifier: string): string => {
  const def = zodDef(zod);
  const type: string = def.type;
  if (primitiveTypes.includes(type)) {
    return def.coerce ? `z.coerce.z.${type}()` : `z.${type}()`;
  }
  if (constantTypes.includes(type)) {
    return `z.${type}()`;
  }
  switch (type) {
    case "array": {
      return `z.array(${zodToZodText(def.element, identifier)})`;
    }
    case "enum": {
      return `z.enum(${JSON.stringify(Object.values(def.entries))})`;
    }
    case "lazy": {
      // it is impossible to determine what the lazy value is referring to
      // so we force the user to declare it
      return `z.lazy(()=>${identifier})`;
    }
    case "literal": {
      return `z.literal(${def.values[0]})`;
    }
    case "object": {
      const isStrict = def.catchall ? zodDef(def.catchall).type === "never" : false;
      const propertiesText = Object.entries(def.shape as Record<string, ZodTypeAny>)
        .map(([key, value]) => {
          const propertyText = zodToZodText(value, identifier);
          // kept from 0.8: optional and nullable properties get a suffix on top of their z.optional / z.nullable text
          if (value.isNullable()) {
            return `${key}: ${propertyText}.nullable()`;
          }
          return value.isOptional() ? `${key}: ${propertyText}.optional()` : `${key}: ${propertyText}`;
        })
        .join(", ");
      return isStrict ? `z.object(${propertiesText}).strict()` : `z.object(${propertiesText})`;
    }
    case "optional": {
      return `z.optional(${zodToZodText(def.innerType, identifier)})`;
    }
    case "nullable": {
      return `z.nullable(${zodToZodText(def.innerType, identifier)})`;
    }
    case "union": {
      if (def.discriminator) {
        console.warn(
          "zodToZodText: Zod discriminated unions are converted to plain unions, not discriminated unions as the original Zod Schema."
        );
      }
      const propertiesText = def.options.map((option: ZodTypeAny) => zodToZodText(option, identifier)).join(", ");
      return `z.union([${propertiesText}])`;
    }
    case "pipe":
    case "transform": {
      console.warn("zodToZodText: Zod transforms and pipes are ignored.");
      return "z.any()";
    }
    case "record": {
      return `z.record(${zodToZodText(def.keyType, identifier)}, ${zodToZodText(def.valueType, identifier)})`;
    }
    case "tuple": {
      const propertiesText = def.items.map((item: ZodTypeAny) => zodToZodText(item, identifier)).join(", ");
      return `z.tuple([${propertiesText}])`;
    }
    case "intersection": {
      return `z.intersection(${zodToZodText(def.left, identifier)}, ${zodToZodText(def.right, identifier)})`;
    }
    case "map": {
      return `z.map(${zodToZodText(def.keyType, identifier)}, ${zodToZodText(def.valueType, identifier)})`;
    }
    case "set": {
      return `z.set(${zodToZodText(def.valueType, identifier)})`;
    }
    case "promise": {
      return `z.promise(${zodToZodText(def.innerType, identifier)})`;
    }
    case "function": {
      // the input is a tuple schema
      const inputs: ZodTypeAny[] = def.input ? (zodDef(def.input).items ?? []) : [];
      const inputText = inputs.map((input) => zodToZodText(input, identifier)).join(", ");
      const outputText = def.output ? zodToZodText(def.output, identifier) : "z.any()";
      return `z.function({ input: [${inputText}], output: ${outputText} })`;
    }
    case "default": {
      return "z.default()";
    }
    default:
      return "z.any()";
  }
};
