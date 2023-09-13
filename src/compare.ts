import { ZodTypeAny } from "zod";

// DRAFT!!
export function zodCompare(a:ZodTypeAny, b:ZodTypeAny): boolean {
  if (a._def.typeName != b._def.typeName) {
    return false;
  } else {
    switch (a._def.typeName) {
      case "ZodString": 
      case "ZodNumber": 
      case "ZodBigInt": 
      case "ZodBoolean": 
      case "ZodDate": 
      case "ZodUndefined": 
      case "ZodNull": 
      case "ZodVoid": 
      case "ZodAny": 
      case "ZodUnknown": 
      case "ZodNever": {
        return a._def.coerce == b._def.coerce;
        break;
      }
      // ############################################################################################
      // other types
      case "ZodArray": {
        return zodCompare(a._def.type, b._def.type);
        break;
      }
      case "ZodEnum": {
        return JSON.stringify(a._def.values) == JSON.stringify(b._def.values);
        break;
      }
      case "ZodLazy": {
        return true;
        break;
      }
      case "ZodLiteral": {
        return a._def.value == b._def.value;
      }
      case "ZodObject": {
        const propertiesA: [string, ZodTypeAny][] = Object.entries(a._def.shape());
        const propertiesB: [string, ZodTypeAny][] = Object.entries(b._def.shape());
  
        if (a._def["unknownKeys"] != b._def["unknownKeys"] || propertiesA.length != propertiesB.length) {
          return false;
        } else {
          propertiesA.forEach(
            (p: [string, ZodTypeAny],index) => {
              const isOptional = (p[1]._def.typeName == "ZodOptional" || p[1].isOptional()) == (propertiesB[index][1]._def.typeName == "ZodOptional" || p[1].isOptional())
              const isNullable = (p[1]._def.typeName == "ZodNullable" || p[1].isNullable()) == (propertiesB[index][1]._def.typeName == "ZodNullable" || p[1].isNullable())
              if (!(isOptional && isNullable && p[0] == propertiesB[index][0] && zodCompare(p[1],propertiesB[index][1]))) {
                return false
              }
            }
          )
        }
        return true;
        break;
      }
      case "ZodOptional": {
        return zodCompare(a._def.innerType, b._def.innerType);
        break;
      }
      case "ZodNullable": {
        return zodCompare(a._def.innerType, b._def.innerType);
        break;
      }
      case "ZodUnion": {
        // console.log("zodToJzod converting ZodUnion", JSON.stringify(zod));

        a._def.options.forEach(
          (option: ZodTypeAny, index:number) => {
            if (!zodCompare(option, b._def.options[index])) {
              return false
            }
          }
        )
        return true;
      }
      case "ZodDiscriminatedUnion": {
        console.warn(
          "zodToJzod: Zod discriminated unions are converted to unions in Jzod, which are converted back as plain unions in Zod, not discriminated unions as the original Zod Schema.",
          JSON.stringify(a)
        );
  
        a._def.options.forEach(
          (option: ZodTypeAny, index:number) => {
            if (!zodCompare(option, b._def.options[index])) {
              return false
            }
          }
        )
        return true;
        break;
      }
      case "ZodEffects": {
        return true;
        break;
      }
      case "ZodNativeEnum": {
        return true;
        break;
      }
      case "ZodRecord": {
        return zodCompare(a._def.valueType, b._def.valueType);
        break;
      }
      case "ZodTuple": {
        const propertiesA: [string, ZodTypeAny][] = Object.entries(a._def.items);
        const propertiesB: [string, ZodTypeAny][] = Object.entries(b._def.items);
  
        propertiesA.forEach(
          (p: [string, ZodTypeAny], index) => {
            if (!(p[0] == propertiesB[index][0] && zodCompare(p[1],propertiesB[index][1]))) {
              return false
            }
          }
        )
        return true;
        break;
      }
      case "ZodIntersection": {
        const left = zodCompare(a._def.left, b._def.left);
        const right = zodCompare(a._def.right, b._def.right);
        return left && right;
        break;
      }
      case "ZodMap": {
        // z.map(z.string()) -> Map<string>
        const valueType = zodCompare(a._def.valueType, b._def.valueType);
        const keyType = zodCompare(a._def.keyType, b._def.keyType);
  
        return valueType && keyType;
        break;
      }
      case "ZodSet": {
        // 	// z.set(z.string()) -> Set<string>
        const type = zodCompare(a._def.valueType, b._def.valueType);
  
        return type;
      }
      case "ZodPromise": {
        // z.promise(z.string()) -> Promise<string>
        return zodCompare(a._def.type, b._def.type);
      }
      case "ZodFunction": {
        return true;
        // // z.function().args(z.string()).returns(z.number()) -> (args_0: string) => number
        // const argumentTypes = zod._def.args._def.items.map((argument: ZodTypeAny, index: number) => {
        //   const argumentType = zodToJzod(argument, identifier);
  
        //   return argumentType;
        // });
        // const returnType = zodToJzod(zod._def.returns, identifier);
        // return { type: "function", definition: { args: argumentTypes, returns: returnType } };
      }
      case "ZodDefault": {
        return true;
      }
      default:
        return false;
        break;
    }
  }
  return true;
}