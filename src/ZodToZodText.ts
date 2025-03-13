import { ZodTypeAny } from "zod";

const a: null = null;

export const zodToZodText = (zod: ZodTypeAny, identifier: string): string => {
  const typeName = zod._def.typeName;
  switch (typeName) {
    // primitive types
    case "ZodString": {
      // console.log("zodToJzod ZodString",JSON.stringify(zod));
      return zod._def.coerce?"z.coerce.z.string()":"z.string()";
    }
    case "ZodNumber": {
      return zod._def.coerce?"z.coerce.z.number()":"z.number()";
    }
    case "ZodBigInt": {
      return zod._def.coerce?"z.coerce.z.bigint()":"z.bigint()";
    }
    case "ZodBoolean": {
      return zod._def.coerce?"z.coerce.z.boolean()":"z.boolean()";
    }
    case "ZodDate": {
      return zod._def.coerce?"z.coerce.z.date()":"z.date()";
    }
    case "ZodUndefined": {
      return "z.undefined()"
    }
    case "ZodNull": {
      return "z.null()"
    }
    case "ZodVoid": {
      return "z.void()"
    }
    case "ZodAny": {
      return "z.any()"
    }
    case "ZodUnknown": {
      return "z.unknown()"
    }
    case "ZodNever": {
      return "z.never()"
    }
    // ############################################################################################
    // other types
    case "ZodArray": {
      // const jzodDefinition = zodToJzod(zod._def.type, identifier);
      return `z.array(${zodToZodText(zod._def.type, identifier)})`
      break;
    }
    case "ZodEnum": {
      const enumValues: ZodTypeAny[] = zod._def.values;
      const values = zod._def.values.map((v:ZodTypeAny)=>zodToZodText(v, identifier))
      return `z.enum(${JSON.stringify(values)})`
      break;
    }
    case "ZodLazy": {
      // it is impossible to determine what the lazy value is referring to
      // so we force the user to declare it
      // if (!getTypeType) return createTypeReferenceFromString(identifier)
      return `z.lazy(()=>${identifier})`
      break;
    }
    case "ZodLiteral": {
      const literalValue = zod._def.value;
      return `z.literal(${literalValue})`
    }
    case "ZodObject": {
      const properties = Object.entries(zod._def.shape());

      const isStrict = zod._def["unknownKeys"] === "strict";

      // console.log("isStrict",isStrict, zod._def["unknownKeys"]);
      
      const propertiesJzodTextArray: [string, string][] = properties.map(([key, value]) => {
        const nextZodNode = value as ZodTypeAny;
        const propertyJzodSchema = zodToZodText(nextZodNode, identifier);
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
        const propertyJzodSchemaWithOptional = isOptional || (propertyJzodSchema as any)["optional"] != undefined?`${propertyJzodSchema}.optional()`:propertyJzodSchema;
        const propertyJzodSchemaWithNullable = isNullable || (propertyJzodSchema as any)["nullable"] != undefined?`${propertyJzodSchema}.nullable()`:propertyJzodSchemaWithOptional;
        return [key, propertyJzodSchemaWithNullable];
      });
      // console.log("properties",JSON.stringify(properties));
      // console.log("propertiesJzodTextArray", JSON.stringify(propertiesJzodTextArray));
      
      const propertiesText = propertiesJzodTextArray.reduce(
        (acc: string, curr: [string, string]) => acc + (acc.length > 0 ? ", " : "") + `${curr[0]}: ${curr[1]}`,"");
      const result = isStrict?`z.object(${propertiesText}).strict()`:`z.object(${propertiesText})`
      // console.log("result", result);
      
      return result;
      break;
    }
    case "ZodOptional": {
      // console.log("zodToJzod ZodOptional", typeName, JSON.stringify(zod));
      return `z.optional(${zodToZodText(zod._def.innerType, identifier)})`;
      break;
    }
    case "ZodNullable": {
      // const jzodDefinition = { ...zodToJzod(zod._def.innerType, identifier), nullable: true };
      return `z.nullable(${zodToZodText(zod._def.innerType, identifier)})`;
      break;
    }
    case "ZodUnion": {
      // console.log("zodToJzod converting ZodUnion", JSON.stringify(zod));

      const zodUnionElements: string[] = zod._def.options.map((option: ZodTypeAny) =>
        zodToZodText(option, identifier)
      );
      // const propertiesText = zodUnionElements.reduce((acc:string,curr:string)=>acc.length > 0?`, ${curr}`: `${curr}`,"")
      const propertiesText = zodUnionElements.join(", ");
      return `z.union([${propertiesText}])`;
    }
    case "ZodDiscriminatedUnion": {
      console.warn(
        "zodToJzod: Zod discriminated unions are converted to unions in Jzod, which are converted back as plain unions in Zod, not discriminated unions as the original Zod Schema.",
        JSON.stringify(zod)
      );

      const zodUnionElements: string[] = zod._def.options.map((option: ZodTypeAny) =>
        zodToZodText(option, identifier)
      );
      const propertiesText = zodUnionElements.reduce((acc:string,curr:string)=>acc.length > 0?`, ${curr}`: `${curr}`,"")
      return `z.union([${propertiesText}])`;
    }
    case "ZodEffects": {
      console.warn("zodToJzod: Zod effects are ignored.", JSON.stringify(zod));
      return "z.any()";
      break;
    }
    case "ZodNativeEnum": {
      console.warn("zodToJzod: ZodNativeEnum are ignored.", JSON.stringify(zod));
      return "z.any()";
      break;
    }
    case "ZodRecord": {
      // z.record(z.number()) -> { [x: string]: number }
      const valueJzodSchema = zodToZodText(zod._def.valueType, identifier);
      return `z.record(${valueJzodSchema})`;
      break;
    }
    case "ZodTuple": {
      // z.tuple([z.string(), z.number()]) -> [string, number]
      const types: string[] = zod._def.items.map((option: ZodTypeAny) => zodToZodText(option, identifier));
      // const propertiesText = types.reduce((acc:string,curr:string)=>acc.length > 0?`, ${curr}`: `${curr}`,"")
      const propertiesText = types.join(", ");
      return `z.tuple([${propertiesText}])`;
      break;
    }
    case "ZodIntersection": {
      const left = zodToZodText(zod._def.left, identifier);
      const right = zodToZodText(zod._def.right, identifier);
      return `z.intersection(${left}, ${right})`;
      break;
    }
    case "ZodMap": {
      // z.map(z.string()) -> Map<string>
      const valueType = zodToZodText(zod._def.valueType, identifier);
      const keyType = zodToZodText(zod._def.keyType, identifier);

      return `z.map(${keyType}, ${valueType})`;
      break;
    }
    case "ZodSet": {
      // 	// z.set(z.string()) -> Set<string>
      const type = zodToZodText(zod._def.valueType, identifier);

      return `z.set(${type})`;
    }
    case "ZodPromise": {
      // z.promise(z.string()) -> Promise<string>
      const type = zodToZodText(zod._def.type, identifier);
      return `z.promise(${type})`;
    }
    case "ZodFunction": {
      // z.function().args(z.string()).returns(z.number()) -> (args_0: string) => number
      const argumentTypes = zod._def.args._def.items.map((argument: ZodTypeAny, index: number) => {
        const argumentType = zodToZodText(argument, identifier);

        return argumentType;
      });
      const propertiesText = argumentTypes.reduce((acc:string,curr:string)=>acc.length > 0?`, ${curr}`: `${curr}`,"")
      const returnType = zodToZodText(zod._def.returns, identifier);
      return `z.function().args(${propertiesText}).returns(${returnType??"z.any()"})`;
    }
    case "ZodDefault": {
      return "z.default()";
    }
    default:
      return "z.any()";
  }
};
