import { JzodElement } from "@miroir-framework/jzod-ts";
import { ZodTypeAny } from "zod";

const a: null = null;

export const zodToJzod = (zod: ZodTypeAny, identifier: string): JzodElement => {
  const typeName = zod._def.typeName;
  switch (typeName) {
    // primitive types
    case "ZodString": {
      // console.log("zodToJzod ZodString",JSON.stringify(zod));
      return zod._def.coerce?{ type: "string", coerce: true }:{ type: "string"};
    }
    case "ZodNumber": {
      return zod._def.coerce? { type: "number", coerce: true }: { type: "number" };
    }
    case "ZodBigInt": {
      return zod._def.coerce? { type: "bigint", coerce: true } : { type: "bigint" };
    }
    case "ZodBoolean": {
      return zod._def.coerce? { type: "boolean", coerce: true } : { type: "boolean" };
    }
    case "ZodDate": {
      return zod._def.coerce? { type: "date", coerce: true } : { type: "date" };
    }
    case "ZodUndefined": {
      return { type: "undefined" };
    }
    case "ZodNull": {
      return { type:"null" };
    }
    case "ZodVoid": {
      return { type: "void" };
    }
    case "ZodAny": {
      return { type: "any" };
    }
    case "ZodUnknown": {
      return { type: "unknown" };
    }
    case "ZodNever": {
      return { type: "never" };
    }
    // ############################################################################################
    // other types
    case "ZodArray": {
      const jzodDefinition = zodToJzod(zod._def.type, identifier);
      return { type: "array", definition: jzodDefinition };
      break;
    }
    case "ZodEnum": {
      const enumValues = zod._def.values;
      return { type: "enum", definition: enumValues };
      break;
    }
    case "ZodLazy": {
      // it is impossible to determine what the lazy value is referring to
      // so we force the user to declare it
      // if (!getTypeType) return createTypeReferenceFromString(identifier)
      return { type: "schemaReference", definition: { absolutePath: identifier } }; // TODO: how to restore absolutePath vs. relativePath vs. both?
      break;
    }
    case "ZodLiteral": {
      const literalValue = zod._def.value;
      return { type: "literal", definition: literalValue };
    }
    case "ZodObject": {
      const properties = Object.entries(zod._def.shape());

      const isStrict = zod._def["unknownKeys"] === "strict";

      // console.log("parsing ZodObject", JSON.stringify(zod));
      
      const propertiesJzodSchema = properties.map(([key, value]) => {

        const nextZodNode = value as ZodTypeAny;
        const propertyJzodSchema = zodToJzod(nextZodNode, identifier);
        const { typeName: nextZodNodeTypeName } = nextZodNode._def;
        const isOptional = nextZodNodeTypeName === "ZodOptional" || nextZodNode.isOptional(); // still useful? see the ZodOptional case
        const isNullable = nextZodNodeTypeName === "ZodNullable" || nextZodNode.isNullable(); // still useful? see the ZodNullable case
        // console.log(
        //   "zodToJzod",
        //   typeName,
        //   key,
        //   '(propertyJzodSchema as any)["optional"]',
        //   (propertyJzodSchema as any)["optional"],
        //   "isOptional",
        //   isOptional,
        //   "nextZodNodeTypeName === 'ZodOptional'",
        //   nextZodNodeTypeName === 'ZodOptional',
        //   "nextZodNode.isOptional()",
        //   nextZodNode.isOptional(),
        //   "nextZodNode.isNullable()",
        //   nextZodNode.isNullable(),
        //   "nextZodNode",JSON.stringify(nextZodNode),
        //   "propertyJzodSchema",
        //   JSON.stringify(propertyJzodSchema)
        // );
        const propertyJzodSchemaWithOptional = isOptional || (propertyJzodSchema as any)["optional"] != undefined?{ ...propertyJzodSchema, optional: isOptional }:propertyJzodSchema;
        const propertyJzodSchemaWithNullable = isNullable || (propertyJzodSchema as any)["nullable"] != undefined?{ ...propertyJzodSchemaWithOptional, nullable: isNullable }:propertyJzodSchemaWithOptional;
        return [key, propertyJzodSchemaWithNullable];
      });
      return isStrict
        ? { type: "object", definition: Object.fromEntries(propertiesJzodSchema) }
        : { type: "object", nonStrict: true, definition: Object.fromEntries(propertiesJzodSchema) };
      break;
    }
    case "ZodOptional": {
      // console.log("zodToJzod ZodOptional", typeName, JSON.stringify(zod));

      const jzodDefinition = { ...zodToJzod(zod._def.innerType, identifier), optional: true };
      return jzodDefinition;
      break;
    }
    case "ZodNullable": {
      const jzodDefinition = { ...zodToJzod(zod._def.innerType, identifier), nullable: true };
      return jzodDefinition;
      break;
    }
    case "ZodUnion": {
      // console.log("zodToJzod converting ZodUnion", JSON.stringify(zod));

      const jzodUnionElements: JzodElement[] = zod._def.options.map((option: ZodTypeAny) =>
        zodToJzod(option, identifier)
      );
      return { type: "union", definition: jzodUnionElements };
    }
    case "ZodDiscriminatedUnion": {
      // console.warn(
      //   "zodToJzod: Zod discriminated unions are converted to unions in Jzod, which are converted back as plain unions in Zod, not discriminated unions as the original Zod Schema.",
      //   JSON.stringify(zod)
      // );

      const jzodUnionElements: JzodElement[] = [...zod._def.options.values()].map((option: ZodTypeAny) =>
        zodToJzod(option, identifier)
      );
      return zod._def.discriminator
        ? {
            type: "union",
            discriminator: { discriminatorType: "string", value: zod._def.discriminator } as any,
            definition: jzodUnionElements,
          }
        : { type: "union", definition: jzodUnionElements }
      ;
    }
    case "ZodEffects": {
      console.warn("zodToJzod: Zod effects are ignored.", JSON.stringify(zod));
      return { type: "any" };
      break;
    }
    case "ZodNativeEnum": {
      console.warn("zodToJzod: ZodNativeEnum are ignored.", JSON.stringify(zod));
      return { type: "any" };
      break;
    }
    case "ZodRecord": {
      // z.record(z.number()) -> { [x: string]: number }
      const valueJzodSchema = zodToJzod(zod._def.valueType, identifier);
      return { type: "record", definition: valueJzodSchema };
      break;
    }
    case "ZodTuple": {
      // z.tuple([z.string(), z.number()]) -> [string, number]
      const types: JzodElement[] = zod._def.items.map((option: ZodTypeAny) => zodToJzod(option, identifier));
      return { type: "tuple", definition: types };
      break;
    }
    case "ZodIntersection": {
      const left = zodToJzod(zod._def.left, identifier);
      const right = zodToJzod(zod._def.right, identifier);
      return { type: "intersection", definition: { left, right } };
      break;
    }
    case "ZodMap": {
      // z.map(z.string()) -> Map<string>
      const valueType = zodToJzod(zod._def.valueType, identifier);
      const keyType = zodToJzod(zod._def.keyType, identifier);

      return { type: "map", definition: [keyType, valueType] };
      break;
    }
    case "ZodSet": {
      // 	// z.set(z.string()) -> Set<string>
      const type = zodToJzod(zod._def.valueType, identifier);

      return { type: "set", definition: type };
    }
    case "ZodPromise": {
      // z.promise(z.string()) -> Promise<string>
      const type = zodToJzod(zod._def.type, identifier);
      return { type: "promise", definition: type };
    }
    case "ZodFunction": {
      // z.function().args(z.string()).returns(z.number()) -> (args_0: string) => number
      const argumentTypes = zod._def.args._def.items.map((argument: ZodTypeAny, index: number) => {
        const argumentType = zodToJzod(argument, identifier);

        return argumentType;
      });
      const returnType = zodToJzod(zod._def.returns, identifier);
      return { type: "function", definition: { args: argumentTypes, returns: returnType } };
    }
    case "ZodDefault": {
      return { type: "any" };
    }
    default:
      return { type: "any" };
  }
};
