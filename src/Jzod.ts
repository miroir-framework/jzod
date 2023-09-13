import { AnyZodObject, ZodLazy, ZodTypeAny, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import { JzodAttributeStringWithValidations, JzodElement, JzodUnion } from "@miroir-framework/jzod-ts";
import {
  ZodSchemaAndDescription,
  ZodSchemaAndDescriptionRecord
} from "./JzodInterface";
import { zodToZodText } from "./ZodToZodText";


// ######################################################################################################
export const objectToJsStringVariables = (o: Object): string =>
  Object.entries(o).reduce(
    (acc: string, curr: [string, any]) => acc + "export const " + curr[0] + ": ZodTypeAny =" + curr[1] + ";",
    ""
  );

// ######################################################################################################
export const objectToJsStringObject = (o: Object): string =>
  Object.entries(o).reduce((acc: string, curr: [string, any]) => acc + (acc.length > 1?", ":"") + curr[0] + ":" + curr[1], "{") + "}";

// ######################################################################################################
export const objectToJsStringArray = (o: Object): string =>
  Object.entries(o).reduce((acc: string, curr: [string, any]) => acc + (acc.length>1? ", ": "") + curr[1], "[") + "]";

// ######################################################################################################
export function getDescriptions(set: ZodSchemaAndDescriptionRecord) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], a[1].zodText]));
}

// ######################################################################################################
export function getRecordZodText(set: ZodSchemaAndDescriptionRecord) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], zodToZodText(a[1].zodSchema, a[0])]));
}

// ######################################################################################################
export function getContextDescriptions(set: ZodSchemaAndDescriptionRecord) {
  return Object.fromEntries(
    Object.entries(set).reduce(
      (acc: [string, string][], curr: [string, ZodSchemaAndDescription]) => [
        ...acc,
        ...Object.entries(curr[1].contextZodText ? curr[1].contextZodText : {}),
      ],
      []
    )
  );
}

// ######################################################################################################
export function getJsResultSetConstDeclarations(set: ZodSchemaAndDescriptionRecord) {
  return Object.entries(set).reduce((acc, curr) => acc + `export const ${curr[0]} = ${curr[1].zodText};`, "");
}

// ######################################################################################################
export function getZodSchemas(set: ZodSchemaAndDescriptionRecord) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], a[1].zodSchema]));
}

// ######################################################################################################
export function getContextZodSchemas(set: ZodSchemaAndDescriptionRecord) {
  return Object.fromEntries(
    Object.entries(set).reduce(
      (acc: [string, ZodTypeAny][], curr: [string, ZodSchemaAndDescription]) => [
        ...acc,
        ...Object.entries(curr[1].contextZodSchema ? curr[1].contextZodSchema : {}),
      ],
      []
    )
  );
}

// ######################################################################################################
function optionalNullableZodSchema(zodElement:ZodTypeAny, optional?: boolean, nullable?: boolean): ZodTypeAny {
  const optionalElement = optional ? zodElement.optional() : zodElement;
  const nullableElement = nullable ? optionalElement.nullable() : optionalElement;
  return nullableElement
}
function optionalNullableZodDescription(zodElement:string, optional?: boolean, nullable?: boolean): string {
  const optionalElement = optional ? zodElement + ".optional()" : zodElement;
  const nullableElement = nullable ? optionalElement + ".nullable()" : optionalElement;
  return nullableElement
}


// ######################################################################################################
export function jzodElementSchemaToZodSchemaAndDescription(
  element: JzodElement,
  getSchemaEagerReferences: () => ZodSchemaAndDescriptionRecord = () => ({}),
  getLazyReferences: () => ZodSchemaAndDescriptionRecord = () => ({}),
  typeScriptLazyReferenceConverter?: (lazyZodSchema: ZodLazy<any>, relativeReference: string | undefined) => ZodLazy<any>
): ZodSchemaAndDescription {
  // console.log("jzodElementSchemaToZodSchemaAndDescription called for type",element.type);

  switch (element.type) {
    case "array": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        element.definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullableZodSchema(z.array(sub.zodSchema),element.optional,element.nullable),
        zodText: optionalNullableZodDescription(`z.array(${sub.zodText})`,element.optional,element.nullable),
      };
      break;
    }
    case "enum": {
      if (Array.isArray(element.definition) && element.definition.length > 1) {
        return {
          zodSchema: optionalNullableZodSchema(z.enum([...element.definition] as any),element.optional,element.nullable),
          zodText: optionalNullableZodDescription(`z.enum(${JSON.stringify([...element.definition])} as any)`, element.optional, element.nullable),
        };
      } else {
        return {
          // contextZodText: {},
          // contextZodSchema: {},
          zodSchema: z.any(),
          zodText: `z.any()`,
        };
      }
      break;
    }
    case "function": {
      const args = Object.entries(element.definition.args).map((e) =>
        jzodElementSchemaToZodSchemaAndDescription(
          // name,
          e[1],
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptLazyReferenceConverter
        )
      );
      if (element.definition.returns) {
        const returns = jzodElementSchemaToZodSchemaAndDescription(
          // name,
          element.definition.returns,
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptLazyReferenceConverter
        );
        return {
          contextZodText: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
          zodSchema: z
            .function()
            .args(...(args.map((z) => z.zodSchema) as any))
            .returns(returns.zodSchema),
          zodText: `z.function().args(${JSON.stringify(args.map((z) => z.zodText))}).returns(${
            returns.zodText
          })`,
        };
      } else {
        return {
          contextZodText: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
          zodSchema: z.function().args(...(args.map((z) => z.zodSchema) as any)),
          zodText: `z.function().args(${JSON.stringify(args.map((z) => z.zodText))})`,
        };
      }
      break;
    }
    case "intersection": {
      const subLeft = jzodElementSchemaToZodSchemaAndDescription(
        // "left",
        element.definition.left,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      const subRight = jzodElementSchemaToZodSchemaAndDescription(
        // "right",
        element.definition.right,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: {...subLeft.contextZodText, ...subRight.contextZodText},
        contextZodSchema: {...subLeft.contextZodSchema, ...subRight.contextZodSchema},
        zodSchema: optionalNullableZodSchema(z.intersection(subLeft.zodSchema,subRight.zodSchema),element.optional,element.nullable),
        zodText: optionalNullableZodDescription(`z.intersection(${subLeft.zodText},${subRight.zodText})`,element.optional,element.nullable),
      };
      break;
    }
    case "literal": {
      return {
        // contextZodText: {},
        // contextZodSchema: {},
        zodSchema: optionalNullableZodSchema(z.literal(element.definition),element.optional,element.nullable),
        zodText: optionalNullableZodDescription(`z.literal("${element.definition}")`,element.optional,element.nullable), // TODO: defines only strings!
      };
      break;
    }
    case "lazy": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: undefined, // lazy evaluation obfuscates any context defined within it
        contextZodSchema: undefined,
        zodSchema: z.lazy(() => sub.zodSchema),
        zodText: `z.lazy(()=>${sub.zodText})`,
      };
      break;
    }
    case "map": {
      const sub0 = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition[0],
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      const sub1 = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition[1],
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: {...sub0.contextZodText, ...sub1.contextZodText},
        contextZodSchema: {...sub0.contextZodSchema, ...sub1.contextZodSchema},
        zodSchema: optionalNullableZodSchema(z.map(sub0.zodSchema,sub1.zodSchema),element.optional,element.nullable),
        zodText: optionalNullableZodDescription(`z.set(${sub0.zodText},${sub1.zodText})`,element.optional,element.nullable),
      };
      break;
    }
    case "object": {
      // console.log("1");
      
      const extendsSubObject: ZodSchemaAndDescription | undefined = element.extend
        ? jzodElementSchemaToZodSchemaAndDescription(
            element.extend,
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptLazyReferenceConverter
          )
        : undefined;

      // console.log("2");
      const definitionSubObject: ZodSchemaAndDescriptionRecord = Object.fromEntries(
        Object.entries(element.definition).map((a) => [
          a[0],
          jzodElementSchemaToZodSchemaAndDescription(
            a[1],
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptLazyReferenceConverter
          ),
        ])
      );

      const schemas = Object.fromEntries(Object.entries(definitionSubObject).map((a) => [a[0], a[1].zodSchema]));
      const zodText = Object.fromEntries(Object.entries(definitionSubObject).map((a) => [a[0], a[1].zodText]));
      // const schemasZodText = Object.fromEntries(Object.entries(definitionSubObject).map((a) => [a[0], zodToZodText(a[1].zodSchema, a[0])]));

      const contextZodText = getContextDescriptions(definitionSubObject);
      const contextZodSchema = getContextZodSchemas(definitionSubObject);
      const resultZodSchema = extendsSubObject?(extendsSubObject.zodSchema as AnyZodObject).extend(schemas):z.object(schemas);


      /**
       */
      const preResultZodText = extendsSubObject?extendsSubObject.zodText + ".extend(" + objectToJsStringObject(zodText) +")":`z.object(${objectToJsStringObject(zodText)})`;
      const resultZodText = optionalNullableZodDescription(preResultZodText + (element.nonStrict?"":".strict()"), element.optional, element.nullable)
      // console.log(
      //   "jzodElementSchemaToZodSchemaAndDescription converting object definition",
      //   JSON.stringify(element.definition),
      //   "### extend",
      //   JSON.stringify(extendsSubObject),
      //   "### definitionSubObject waaa",
      //   JSON.stringify(definitionSubObject),
      //   // JSON.stringify(schemasZodText),
      //   "### schemaEagerReferences",
      //   JSON.stringify(getSchemaEagerReferences),
      //   "### resultZodText",
      //   resultZodText, "###"
      // );

      return {
        contextZodText: Object.keys(contextZodText).length > 0 ? contextZodText : undefined,
        contextZodSchema: Object.keys(contextZodSchema).length > 0 ? contextZodSchema : undefined,
        zodSchema: optionalNullableZodSchema(element.nonStrict?resultZodSchema:resultZodSchema.strict(), element.optional, element.nullable),
        zodText: resultZodText,
      };
      break;
    }
    case "promise": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: z.promise(sub.zodSchema),
        zodText: `z.promise(${sub.zodText})`,
      };
      break;
    }
    case "record": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullableZodSchema(z.record(z.string(), sub.zodSchema),element.optional,element.nullable),
        zodText: optionalNullableZodDescription(`z.record(z.string(),${sub.zodText})`, element.optional, element.nullable),
      };
    }
    case "schemaReference": {
      // console.log("jzodElementSchemaToZodSchemaAndDescription schemaReference", JSON.stringify(element));
      
      const localContextReferences:[string,ZodSchemaAndDescription][] = []
      for (const curr of Object.entries(element.context??{})) {
          localContextReferences.push([
            curr[0],
            jzodElementSchemaToZodSchemaAndDescription(
              // name,
              curr[1],
              ()=>({...getSchemaEagerReferences(), ...Object.fromEntries(localContextReferences)}),
              ()=>({...getLazyReferences(), ...Object.fromEntries(localContextReferences)}),
              typeScriptLazyReferenceConverter
            ),
          ]
        );
      }
      const contextSubObjectSchemaAndDescriptionRecord:ZodSchemaAndDescriptionRecord = Object.fromEntries(localContextReferences);

      const resolveEagerReference = (
        eagerReference: string | undefined,
      ): ZodSchemaAndDescription  => {
        if (eagerReference) {
            const eagerReferences: ZodSchemaAndDescriptionRecord = {...getSchemaEagerReferences(), ...contextSubObjectSchemaAndDescriptionRecord };
            // console.log("looking up eager reference", eagerReference, "optional", element.optional, "nullable", element.nullable);
            
            if (eagerReferences[eagerReference]) {
              const zodSchema = optionalNullableZodSchema(eagerReferences[eagerReference].zodSchema,element.optional,element.nullable);
              const zodText = optionalNullableZodDescription(eagerReferences[eagerReference].zodText,element.optional,element.nullable);
              return { zodSchema, zodText};
            } else {
              throw new Error(
                "when converting Jzod to Zod, could not find eager reference " +
                  element.definition.relativePath +
                  " in passed references " +
                  Object.keys(eagerReferences) +
                  " from element " + JSON.stringify(element)
              );
            }
          // }
        } else {
          return {zodSchema:z.any(), zodText: "z.any()"};
        }
      } // resolveEagerReference
      
      const lazyResolverZodSchema: ZodLazy<any> = z.lazy(
        () => {
          /**
           *  issue with zod-to-ts: specifying a TS AST generation function induces a call to the lazy function!! :-(
           * this call is avoided in this case, but this means Zod schemas used to generate typescript types must
           * not be used for validation purposes, please perform separate generations to accomodate each case.
           */
          // console.log("z.lazy called!!!!");
          
          if (typeScriptLazyReferenceConverter) {
            //
            return z.any();
          } else {
            const lazyReferences = getLazyReferences();

            if (element.definition.absolutePath && lazyReferences[element.definition.absolutePath]) {
              const absoluteRef = element.definition.absolutePath ? lazyReferences[element.definition.absolutePath].zodSchema : z.any();
              const relativeRef = element.definition.relativePath ? resolveEagerReference(element.definition.relativePath).zodSchema: absoluteRef
              // const relativeRef = element.definition.relativePath ? resolveEagerReference(element.definition.relativePath,lazyReferences).zodSchema: absoluteRef
              return relativeRef;
            } else {
              if (element.definition.relativePath) {
                // console.log("solving relativePath",element.definition.relativePath,"as eagerReference with lazy refs", JSON.stringify(lazyReferences));
                
                const relativeRef = resolveEagerReference(element.definition.relativePath).zodSchema
                return relativeRef;
              } else {
                throw new Error(
                  "when converting Jzod to Zod, could not find lazy reference " +
                  element.definition.absolutePath +
                    " in passed references " +
                    Object.keys(lazyReferences) +
                    "from element " + JSON.stringify(element)
                );
              }
            }
    
            // console.log("converting schemaReference relative path targetObject", targetObject, element.definition.relativePath,Object.keys(targetObject),);
          }
        }
      );// resolveReference

      const eagerReference = element.definition.eager? resolveEagerReference(element.definition.relativePath):undefined;
      
      const referenceResolvedSchema: ZodTypeAny = element.definition.eager
        ? eagerReference?.zodSchema??z.any()
        : typeScriptLazyReferenceConverter
        ? typeScriptLazyReferenceConverter(lazyResolverZodSchema, element.definition.relativePath)
        : lazyResolverZodSchema;

        const referenceResolvedZodText = element.definition.eager
        ? optionalNullableZodDescription(`${eagerReference?.zodText}`, element.optional, element.nullable)
        : optionalNullableZodDescription(
            `z.lazy(() =>${element.definition.relativePath})`,
            element.optional,
            element.nullable
          );

      const contextZodText = getDescriptions(contextSubObjectSchemaAndDescriptionRecord)
      const contextZodSchema = getZodSchemas(contextSubObjectSchemaAndDescriptionRecord)
      // const contextReverseZodText = getRecordZodText(contextSubObjectSchemaAndDescriptionRecord);

      // console.log(
      //   "jzodElementSchemaToZodSchemaAndDescription converting schemaReference",
      //   JSON.stringify(element),
      //   "contextSubObjectSchemaAndDescriptionRecord",
      //   JSON.stringify(contextSubObjectSchemaAndDescriptionRecord),
      //   "contextZodText",
      //   // JSON.stringify(contextZodText),
      //   JSON.stringify(contextReverseZodText),
      //   "contextZodSchema",
      //   JSON.stringify(contextZodSchema)
      // );
      const result = {
        contextZodText: Object.keys(contextZodText).length > 0?contextZodText:undefined,
        contextZodSchema: Object.keys(contextZodSchema).length > 0?contextZodSchema:undefined,
        zodSchema: referenceResolvedSchema,
        // zodSchema: typeScriptLazyReferenceConverter
        //   ? typeScriptLazyReferenceConverter(preResolveReference, element.definition.relativePath)
        //   : preResolveReference,
        // zodText: optionalNullableZodDescription(`z.lazy(() =>${element.definition.relativePath})`,element.optional, element.nullable), // TODO: take lazy / eager resolution into account!
        zodText: referenceResolvedZodText
      };
      return result;
      break;
    }
    case "set": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullableZodSchema(z.set(sub.zodSchema),element.optional,element.nullable),
        zodText: optionalNullableZodDescription(`z.set(${sub.zodText})`,element.optional,element.nullable),
      };
      break;
    }
    case "simpleType": {
      const castElement = element as JzodAttributeStringWithValidations; // specious cast, we do not know the exact type there...
      
      if (element && (castElement.validations || element.definition == "uuid")) {
        const elementDefinitionSchema = (d: string) => (d == "uuid" ? z.string().uuid() : (z as any)[d]());
        const zodPreSchema = castElement.validations
          ? castElement.validations.reduce(
              (acc, curr) => (acc as any)[curr.type](curr.parameter),
              elementDefinitionSchema(element.definition)
            )
          : elementDefinitionSchema(element.definition);
        const zodPre2Schema = element.optional ? zodPreSchema.optional() : zodPreSchema;
        const zodSchema = element.nullable ? zodPre2Schema.optional() : zodPre2Schema;
        const zodText =
          (castElement.validations
            ? castElement.validations.reduce(
                (acc, curr) => acc + "." + curr.type + (curr.parameter ? "(" + curr.parameter + ")" : "()"),
                `z.${element.definition}()`
              )
            : `z.${element.definition}()`) + (element.optional ? `.optional()` : ``) + (element.nullable ? `.nullable()` : ``);
        return { contextZodText: undefined, contextZodSchema: undefined, zodSchema, zodText };
      } else {
        const resultZodSchema = element.coerce
          ? optionalNullableZodSchema((z.coerce as any)[element.definition](), element.optional, element.nullable)
          : optionalNullableZodSchema((z as any)[element.definition](), element.optional, element.nullable)
        ;
        // console.log("jzodElementSchemaToZodSchemaAndDescription simpleType",JSON.stringify(element),JSON.stringify(resultZodSchema));
        return {
          contextZodText: undefined,
          contextZodSchema: undefined,
          zodSchema: resultZodSchema,
          zodText: element.coerce?optionalNullableZodDescription(`z.coerce.${element.definition}()`, element.optional, element.nullable): optionalNullableZodDescription(`z.${element.definition}()`, element.optional, element.nullable),
        };
      }
      break;
    }
    case "tuple": {
      if (Array.isArray(element.definition) && element.definition.length > 1) {
        const subs = element.definition.map((d) =>
          jzodElementSchemaToZodSchemaAndDescription(
            // name,
            d,
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptLazyReferenceConverter
          )
        );
  
        return {
          contextZodSchema: subs.reduce((acc,curr)=>({...acc,...curr.contextZodText}),{}),
          contextZodText: subs.reduce((acc,curr)=>({...acc,...curr.contextZodSchema}),{}),
          zodSchema: optionalNullableZodSchema(z.tuple([...subs.map(s=>s.zodSchema)] as any),element.optional,element.nullable),
          zodText: optionalNullableZodDescription(`z.tuple(${JSON.stringify([...subs.map(s=>s.zodText)])} as any)`, element.optional, element.nullable),
        };
      } else {
        return {
          // contextZodText: {},
          // contextZodSchema: {},
          zodSchema: z.any(),
          zodText: `z.any()`,
        };
      }
      break;
    }
    case "union": {
      const sub: ZodSchemaAndDescription[] = (element as JzodUnion).definition.map((e) =>
        jzodElementSchemaToZodSchemaAndDescription(
          // name,
          e,
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptLazyReferenceConverter
        )
      );
      return {
        contextZodText: Object.fromEntries(
          sub.reduce(
            (acc: [string, string][], curr: ZodSchemaAndDescription) => [
              ...acc,
              ...(curr.contextZodText ? Object.entries(curr.contextZodText) : []),
            ],
            []
          )
        ),
        contextZodSchema: Object.fromEntries(
          sub.reduce(
            (acc: [string, string][], curr: ZodSchemaAndDescription) => [
              ...acc,
              ...(curr.contextZodSchema ? Object.entries(curr.contextZodSchema) : []),
            ],
            []
          )
        ),
        /**
         * Zod unions are used instead of discriminated unions even if Jzod schema has a discriminator,
         * because TS types obtained using z.infer lack uniformity, which make them rather unusable in practice:
         * TODO: DESCRIBE PROBLEM!!!
         */

        zodSchema: optionalNullableZodSchema(z.union(sub.map((s) => s.zodSchema) as any), element.optional, element.nullable),
        zodText: optionalNullableZodDescription(`z.union(${objectToJsStringArray(sub.map((s) => s.zodText))})`, element.optional, element.nullable),
      };
      break;
    }
    default:
      throw new Error(
        "jzodElementSchemaToZodSchemaAndDescription could not convert given Jzod schema, unknown type:" +
          element["type"] +
          ", element: " +
          JSON.stringify(element)
      );
      break;
  }
}

// ##############################################################################################################
export function referentialElementRelativeDependencies(element: JzodElement | JzodElement): string[] {
  let result: string[];
  switch (element.type) {
    // case "simpleBootstrapElement":
    case "literal":
    case "simpleType":
    case "enum": {
      result = [];
      break;
    }
    case "function": {
      result = [];
      break;
    }
    case "schemaReference": {
      result = element.definition.relativePath ? [element.definition.relativePath] : [];
      break;
    }
    case "lazy":
    case "record":
    case "array": {
      result = referentialElementRelativeDependencies(element.definition);
      break;
    }
    case "union": {
      // definition is an array of ZodReferentialElement
      result = element.definition.reduce(
        (acc: string[], curr: JzodElement) => acc.concat(referentialElementRelativeDependencies(curr)),
        []
      );
      break;
    }
    case "object": {
      // definition is an object of ZodReferentialElement
      result = Object.entries(element.definition).reduce(
        (acc: string[], curr: [string, JzodElement]) => acc.concat(referentialElementRelativeDependencies(curr[1])),
        []
      );
      break;
    }
    default:
      result = [];
      break;
  }

  return result.filter((s) => s != "ZodSimpleBootstrapElementSchema");
}

// // ##############################################################################################################
// export function _zodSchemaToJsonSchema(
//   referentialSchema: ZodSchemaAndDescription,
//   dependencies: { [k: string]: string[] },
//   name?: string
// ): { [k: string]: any } {
//   // const referentialSetEntries = Object.entries(referentialSchema);
//   let result: { [k: string]: any } = {};

//   for (const entry of referentialSetEntries) {
//     const localDependencies = dependencies[entry[0]];
//     const localReferentialSet = Object.fromEntries(
//       Object.entries(referentialSet)
//         .filter((e) => (localDependencies && localDependencies.includes(e[0])) || e[0] == entry[0])
//         .map((e) => [e[0], e[1].zodSchema])
//     );
//     const convertedCurrent = zodToJsonSchema(entry[1].zodSchema, {
//       $refStrategy: "relative",
//       definitions: localReferentialSet,
//     });
//     result[entry[0]] = convertedCurrent;
//   }
//   return result;
// }

// ##############################################################################################################
export function _zodToJsonSchema(
  referentialSet: ZodSchemaAndDescriptionRecord,
  dependencies: { [k: string]: string[] },
  name?: string
): { [k: string]: any } {
  const referentialSetEntries = Object.entries(referentialSet);
  let result: { [k: string]: any } = {};

  for (const entry of referentialSetEntries) {
    const localDependencies = dependencies[entry[0]];
    const localReferentialSet = Object.fromEntries(
      Object.entries(referentialSet)
        .filter((e) => (localDependencies && localDependencies.includes(e[0])) || e[0] == entry[0])
        .map((e) => [e[0], e[1].zodSchema])
    );
    const convertedCurrent = zodToJsonSchema(entry[1].zodSchema, {
      $refStrategy: "relative",
      definitions: localReferentialSet,
    });
    result[entry[0]] = convertedCurrent;
  }
  return result;
}
