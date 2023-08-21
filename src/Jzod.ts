import { AnyZodObject, ZodTypeAny, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import {
  JzodAttributeStringWithValidations,
  JzodElement,
  JzodElementSet,
  JzodObject,
  JzodToZodResult,
  JzodUnion,
  ZodSchemaAndDescription,
  jzodReferenceSchema,
} from "./JzodInterface";

export function getJsCodeCorrespondingToZodSchemaAndDescription(
  typeName: string,
  entityDefinitionEntityDefinitionZodSchema: ZodSchemaAndDescription<ZodTypeAny>
): string {
  // console.log("getJsCodeCorrespondingToZodSchemaAndDescription", entityDefinitionEntityDefinitionZodSchema.description);

  const schemaName = typeName.replace(/^(.)(.*)$/,(a,b,c)=>b.toLowerCase()+c)
  const casedtypeName = typeName.replace(/^(.)(.*)$/,(a,b,c)=>b.toUpperCase()+c)
  const bodyJsCode = `export const ${schemaName}ZodSchema = z.object(${entityDefinitionEntityDefinitionZodSchema.description});`;
  // console.log("getJsCodeCorrespondingToZodSchemaAndDescription convertedJsonZodSchema", bodyJsCode);

  const header = `import { ZodType, ZodTypeAny, z } from "zod";
import { jzodElementSchema, jzodObjectSchema } from "@miroir-framework/jzod";

`;
  const footer = `
export type ${casedtypeName} = z.infer<typeof ${schemaName}ZodSchema>
`;
  return header + bodyJsCode + footer;
}

// ######################################################################################################
export const objectToJsStringObject = (o:Object):string => Object.entries(o).reduce((acc:string,curr:[string,any])=>acc + curr[0] +':' + curr[1] + ',','{')+'}';
// ######################################################################################################
export const objectToJsStringArray = (o:Object):string => Object.entries(o).reduce((acc:string,curr:[string,any])=>acc + curr[1] + ',','[')+']';

// ######################################################################################################
export function getDescriptions(set:JzodToZodResult<ZodTypeAny>) {
  return  Object.fromEntries(Object.entries(set).map(a=>[a[0],a[1].description]))
}

// ######################################################################################################
export function getJsResultSetConstDeclarations(set:JzodToZodResult<ZodTypeAny>) {
  return  Object.entries(set).reduce((acc,curr)=>acc + `export const ${curr[0]} = ${curr[1].description};`,'')
}

// export function getJsObjectConstDeclarations(set:ZodSchemaAndDescription<ZodTypeAny>) {
//   return  Object.entries(set).reduce((acc,curr)=>acc + `export const ${curr[0]} = ${curr[1].description};`,'')
// }

// ######################################################################################################
export function getZodSchemas(set:JzodToZodResult<ZodTypeAny>) {
  return  Object.fromEntries(Object.entries(set).map(a=>[a[0],a[1].zodSchema]))
}

// ######################################################################################################
export function jzodSchemaSetToZodSchemaSet(
  elementSet: JzodElementSet,
  additionalRelativeReferences?: JzodToZodResult<ZodTypeAny>,
  absoluteReferences?: JzodToZodResult<ZodTypeAny>
): JzodToZodResult<ZodTypeAny> {
  let result: JzodToZodResult<ZodTypeAny> = {};

  for (const entry of Object.entries(elementSet)) {
    result[entry[0]] = jzodElementSchemaToZodSchemaAndDescription(
      entry[0],
      entry[1],
      () => Object.assign({}, additionalRelativeReferences ? additionalRelativeReferences : {}, result),
      () => absoluteReferences?absoluteReferences:{}
    );
  }
  return result;
}

// ######################################################################################################
export function jzodSchemaObjectToZodSchemaSet(elementSet: JzodObject, additionalReferences?:JzodToZodResult<ZodTypeAny>):JzodToZodResult<ZodTypeAny> {
  let result:JzodToZodResult<ZodTypeAny> = {}
  
  for (const entry of Object.entries(elementSet.definition)) {
    /**
     * what about external references: do we have a link to them afer conversion? (likely yes, external references give an interpretation context, like the schema in JSON schemas.)
     */
    result[entry[0]] = jzodElementSchemaToZodSchemaAndDescription(entry[0],entry[1],()=>Object.assign({},additionalReferences,result)) 
  }
  return result;
}

// ######################################################################################################
export function jzodSchemaObjectToZodSchemaAndDescription(
  elementSet: JzodObject,
  additionalReferences?: JzodToZodResult<ZodTypeAny>,
  absoluteReferences?: JzodToZodResult<ZodTypeAny>,
): ZodSchemaAndDescription<ZodTypeAny> {
  let result: JzodToZodResult<ZodTypeAny> = {};

  for (const entry of Object.entries(elementSet.definition)) {
    /**
     * what about external references: do we have a link to them afer conversion? (likely yes, external references give an interpretation context, like the schema in JSON schemas.)
     */
    result[entry[0]] = jzodElementSchemaToZodSchemaAndDescription(
      entry[0],
      entry[1],
      () => Object.assign({}, additionalReferences, result),
      () => (absoluteReferences ? absoluteReferences : {})
    );
  }
  return { zodSchema: z.object(getZodSchemas(result)), description: objectToJsStringObject(getDescriptions(result)) };
}


// ######################################################################################################
export function jzodElementSchemaToZodSchemaAndDescription(
  name: string,
  element: JzodElement,
  getSchemaRelativeReferences: () => JzodToZodResult<ZodTypeAny>,
  getAbsoluteReferences: () => JzodToZodResult<ZodTypeAny> = ()=> ({})
): ZodSchemaAndDescription<ZodTypeAny> {
  switch (element.type) {
    case "array": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(name, element.definition, getSchemaRelativeReferences, getAbsoluteReferences);
      return {
        zodSchema: element.optional ? z.array(sub.zodSchema).optional() : z.array(sub.zodSchema),
        description: element.optional ? `z.array(${sub.description}).optional()` : `z.array(${sub.description})`,
      };
      break;
    }
    case "enum": {
      if (Array.isArray(element.definition) && element.definition.length > 1) {
        return {
          zodSchema: element.optional
            ? z.enum([...element.definition] as any).optional()
            : z.enum([...element.definition] as any),
          description: `z.enum(${JSON.stringify([...element.definition])} as any)${
            element.optional ? ".optional()" : ""
          }`,
        };
      } else {
        return {
          zodSchema: z.any(),
          description: `z.any()`,
        };
      }
      break;
    }
    case "function": {
      const args = Object.entries(element.definition.args).map((e) => jzodElementSchemaToZodSchemaAndDescription(name, e[1], getSchemaRelativeReferences, getAbsoluteReferences));
      if (element.definition.returns) {
        const returns = jzodElementSchemaToZodSchemaAndDescription(name, element.definition.returns, getSchemaRelativeReferences);
        return {
          zodSchema: z
            .function()
            .args(...(args.map((z) => z.zodSchema) as any))
            .returns(returns.zodSchema),
          description: `z.function().args(${JSON.stringify(args.map((z) => z.description))}).returns(${
            returns.description
          })`,
        };
      } else {
        return {
          zodSchema: z.function().args(...(args.map((z) => z.zodSchema) as any)),
          description: `z.function().args(${JSON.stringify(args.map((z) => z.description))})`,
        };
      }
      break;
    }
    case "literal": {
      return {
        zodSchema: element.optional ? z.literal(element.definition).optional() : z.literal(element.definition),
        description: `z.literal("${element.definition}")${element.optional ? ".optional()" : ""}`,
      };
      break;
    }
    case "lazy": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(name, element.definition, getSchemaRelativeReferences, getAbsoluteReferences);
      return {
        zodSchema: z.lazy(() => sub.zodSchema),
        description: `z.lazy(()=>${sub.description})`,
      };
      break;
    }
    case "object": {
      const sub = Object.fromEntries(
        Object.entries(element.definition).map((a) => [
          a[0],
          jzodElementSchemaToZodSchemaAndDescription(name, a[1], getSchemaRelativeReferences, getAbsoluteReferences),
        ])
      );
      const schemas = Object.fromEntries(Object.entries(sub).map((a) => [a[0], a[1].zodSchema]));
      const descriptions = Object.fromEntries(Object.entries(sub).map((a) => [a[0], a[1].description]));
      return {
        zodSchema: element.optional ? z.object(schemas).strict().optional() : z.object(schemas).strict(),
        // description: element.optional?`z.object(${JSON.stringify(descriptions)})`:`z.object(${JSON.stringify(descriptions)}).optional()`
        description: element.optional
          ? `z.object(${objectToJsStringObject(descriptions)}).strict().optional()`
          : `z.object(${objectToJsStringObject(descriptions)}).strict()`,
      };
      break;
    }
    case "record": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(name, element.definition, getSchemaRelativeReferences, getAbsoluteReferences);
      return {
        zodSchema: element.optional
          ? z.record(z.string(), sub.zodSchema).optional()
          : z.record(z.string(), sub.zodSchema),
        description: `z.record(z.string(),${sub.description})${element.optional ? ".optional()" : ""}`,
      };
    }
    case "schemaReference": {
      // const jzodToZodConversionRelativeReferences = getSchemaRelativeReferences();
      // console.log("converting element schemaReference to zod schema",Object.keys(jzodToZodConversionRelativeReferences));
      // throw an exception if the element does not respect the required format
      // jzodToZodConversionRelativeReferences.jzodReferenceSchema.zodSchema.parse(element);
      jzodReferenceSchema.parse(element);
      return {
        zodSchema: z.lazy(
          ((optional: boolean) => {
            const relativeReferences = getSchemaRelativeReferences();
            const absoluteReferences = getAbsoluteReferences();
            // console.log("converting schemaReference absolute path", element.absolutePath,Object.keys(absoluteReferences),element.relativePath,Object.keys(relativeReferences),);
            
            // console.log("parsing schemaReference relativeReferences",Object.keys(relativeReferences));
            const relativePath:string | undefined = element.definition.relativePath;
            let targetObject:any
            if (element.definition.absolutePath) {
              targetObject = Object.fromEntries(
                Object.entries(
                  (absoluteReferences[element.definition.absolutePath].zodSchema as AnyZodObject).shape as any
                ).map((e: [string, any]) => [e[0], { zodSchema: e[1], description: "" }]) as [string, any][]
              );
            } else {
              targetObject = relativeReferences;
            }
            // console.log("converting schemaReference relative path targetObject", targetObject, element.relativePath,Object.keys(targetObject),);
            if (relativePath) {
              if (targetObject[relativePath]) {
                const result = optional
                  ? targetObject[relativePath].zodSchema.optional()
                  : targetObject[relativePath].zodSchema
                ;
                // console.log("converting schemaReference relative path result",result);
                  
                return result;
              } else {
                throw new Error(
                  "when converting optional " +
                    name +
                    " could not find relative reference " +
                    element.definition.relativePath +
                    " in " +
                    Object.keys(relativeReferences)
                );
              }
            } else {
              return targetObject
              // if (element.absolutePath) {
              //   if (absoluteReferences[element.absolutePath]) {
              //     return absoluteReferences[element.absolutePath]
              //   } else {
              //     throw new Error(
              //       "when converting optional " +
              //         name +
              //         " could not find absolute reference " +
              //         element.absolutePath +
              //         " in " +
              //         Object.keys(absoluteReferences)
              //     );
              //   }
              // } else {
              //   throw new Error(
              //     "when converting optional " +
              //       name +
              //       " could not find relative or absolute reference in element " +
              //       JSON.stringify(element)
              //   );
              // }
            }
          }).bind(null, element.optional)
        ),
        // description: `z.lazy(() =>references["${element.definition}"].zodSchema)` + (element.optional?'.optional()':''),
        description: `z.lazy(() =>${element.definition.relativePath}` + (element.optional ? ".optional()" : "") + ")",
      };
      break;
    }
    case "simpleType": {
      const castElement = element as JzodAttributeStringWithValidations;
      if (element && (castElement.validations || element.definition == "uuid")) {
        const elementDefinitionSchema = (d: string) => (d == "uuid" ? z.string().uuid() : (z as any)[d]());
        const zodPreSchema = castElement.validations?castElement.validations.reduce(
          (acc, curr) => (acc as any)[curr.type](curr.parameter),
          elementDefinitionSchema(element.definition)
        ):elementDefinitionSchema(element.definition);
        const zodSchema = element.optional ? zodPreSchema.optional() : zodPreSchema;
        const description =
          (castElement.validations?castElement.validations.reduce(
            (acc, curr) => acc + "." + curr.type + (curr.parameter ? "(" + curr.parameter + ")" : "()"),
            `z.${element.definition}()`
          ) : `z.${element.definition}()`) + (element.optional ? `.optional()` : ``);
        return { zodSchema, description };
      } else {
        return {
          zodSchema: element.optional ? (z as any)[element.definition]().optional() : (z as any)[element.definition](),
          description: element.optional ? `z.${element.definition}().optional()` : `z.${element.definition}()`,
        };
      }
      break;
    }
    case "union": {
      const sub = (element as JzodUnion).definition.map((e) => jzodElementSchemaToZodSchemaAndDescription(name, e, getSchemaRelativeReferences, getAbsoluteReferences));
      return {
        zodSchema: element.optional
          ? z.union(sub.map((s) => s.zodSchema) as any).optional()
          : z.union(sub.map((s) => s.zodSchema) as any),
        description: `z.union(${objectToJsStringArray(sub.map((s) => s.description))})${
          element.optional ? ".optional()" : ""
        }`,
      };
      break;
    }
    default:
      throw new Error("jzodElementSchemaToZodSchemaAndDescription could not convert given json Zod schema, unknown type:" + element["type"] + ", element: " + JSON.stringify(element));
      break;
  }
}

// ##############################################################################################################
export function referentialElementRelativeDependencies(element:JzodElement | JzodElement):string[] {
  let result: string[]
  switch (element.type) {
    // case "simpleBootstrapElement":
    case "literal":
    case "simpleType":
    case "enum": {
      result = []
      break;
    }
    case "function": {
      result = []
      break;
    }
    case "schemaReference": {
      result = element.definition.relativePath?[element.definition.relativePath]:[];
      break;
    }
    case "lazy":
    case "record":
    case "array":{
      result = referentialElementRelativeDependencies(element.definition)
      break;
    }
    case "union":{ // definition is an array of ZodReferentialElement
      result = element.definition.reduce((acc:string[],curr:JzodElement)=>acc.concat(referentialElementRelativeDependencies(curr)),[]);
      break;
    }
    case "object": { // definition is an object of ZodReferentialElement
      result = Object.entries(element.definition).reduce((acc:string[],curr:[string,JzodElement])=>acc.concat(referentialElementRelativeDependencies(curr[1])),[]);
      break;
    }
    default:
      result = []
      break;
  }

  return result.filter((s)=>s != "ZodSimpleBootstrapElementSchema")
}

// ##############################################################################################################
export function _zodToJsonSchema(referentialSet:JzodToZodResult<ZodTypeAny>, dependencies:{[k:string]:string[]},name?: string):{[k:string]:any} {
  const referentialSetEntries = Object.entries(referentialSet);
  let result:{[k:string]:any} = {};

  for (const entry of referentialSetEntries) {
    const localDependencies = dependencies[entry[0]];
    const localReferentialSet = Object.fromEntries(
      Object.entries(referentialSet)
        .filter((e) => (localDependencies && localDependencies.includes(e[0])) || e[0] == entry[0])
        .map((e) => [e[0], e[1].zodSchema])
    );
    const convertedCurrent = zodToJsonSchema(entry[1].zodSchema, {$refStrategy:"relative",definitions:localReferentialSet});
    result[entry[0]] = convertedCurrent;
  }
  return result;
}