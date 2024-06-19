import { AnyZodObject, ZodLazy, ZodTypeAny, z } from "zod";
// import zodToJsonSchema from "zod-to-json-schema";

import {
  JzodArray,
  JzodAttributePlainDateWithValidations,
  JzodAttributePlainNumberWithValidations,
  JzodAttributePlainStringWithValidations,
  JzodElement,
  JzodEnum,
  JzodFunction,
  JzodIntersection,
  JzodLazy,
  JzodLiteral,
  JzodMap,
  JzodObject,
  JzodPromise,
  JzodRecord,
  JzodReference,
  JzodSet,
  JzodTuple,
  JzodUnion
} from "@miroir-framework/jzod-ts";
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
function optionalNullablePartialZodSchema(zodElement: ZodTypeAny, optional?: boolean, nullable?: boolean, partial?: boolean): ZodTypeAny {
  const partialElement: ZodTypeAny = partial ? (zodElement as any as AnyZodObject).partial() : zodElement; // will fail if element is not ZodObject
  const optionalElement: ZodTypeAny = optional ? partialElement.optional() : partialElement;
  const nullableElement: ZodTypeAny = nullable ? optionalElement.nullable() : optionalElement;
  return nullableElement;
}
function optionalNullablePartialZodDescription(zodElement:string, optional?: boolean, nullable?: boolean, partial?: boolean): string {
  const partialElement: string = partial ? zodElement + ".partial()" : zodElement;
  const optionalElement: string = optional ? partialElement + ".optional()" : partialElement;
  const nullableElement: string = nullable ? optionalElement + ".nullable()" : optionalElement;
  return nullableElement
}


// ################################################################################################
function resolveEagerReference(
  eagerReference: string | undefined,
  element: JzodReference,
  contextSubObjectSchemaAndDescriptionRecord:ZodSchemaAndDescriptionRecord,
  getSchemaEagerReferences: () => ZodSchemaAndDescriptionRecord = () => ({}),
): ZodSchemaAndDescription {
  if (eagerReference) {
      const eagerReferences: ZodSchemaAndDescriptionRecord = {...getSchemaEagerReferences(), ...contextSubObjectSchemaAndDescriptionRecord };
      // console.log("looking up eager reference", eagerReference, "optional", element.optional, "nullable", element.nullable);
      
      if (eagerReferences[eagerReference]) {
        const zodSchema = optionalNullablePartialZodSchema(eagerReferences[eagerReference].zodSchema,element.optional,element.nullable);
        const zodText = optionalNullablePartialZodDescription(eagerReferences[eagerReference].zodText,element.optional,element.nullable);
        return { zodSchema, zodText};
      } else {
        throw new Error(
          "when converting Jzod to Zod, could not find eager reference " +
            (element as JzodReference).definition.relativePath +
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



// ################################################################################################
function getLazyResolverZodSchema(
  element: JzodReference,
  contextSubObjectSchemaAndDescriptionRecord:ZodSchemaAndDescriptionRecord,
  getSchemaEagerReferences: () => ZodSchemaAndDescriptionRecord = () => ({}),
  getLazyReferences: () => ZodSchemaAndDescriptionRecord = () => ({}),
  typeScriptLazyReferenceConverter?: (lazyZodSchema: ZodLazy<any>, relativeReference: string | undefined) => any /** returns "any" to avoid pollution from zod-to-ts type "GetType", actual return type is ZodType<any, any, any> & GetType */
): ZodLazy<any> {
  return z.lazy(
  () => {
    /**
     *  issue with zod-to-ts: specifying a TS AST generation function induces a call to the lazy function!! :-(
     * this call is avoided in this case, but this means Zod schemas used to generate typescript types must
     * not be used for validation purposes, please perform separate generations to accomodate each case.
     */
    
    if (typeScriptLazyReferenceConverter) {
      /**
       * in the case of TS conversion, this function is called, but the obtained jzod schema shall not be used for validation purposes! 
       * (the actual schema to be used is not known yet, since it's... lazy!).
      */ 
      // return z.any(); // not working: this makes returned schema optional.
      return z.never(); // all validations will fail
    } else {
      const lazyReferences: ZodSchemaAndDescriptionRecord = getLazyReferences();

      // console.log("JzodToZod when evaluating",element.definition,"got lazy references", lazyReferences);
      if (element.definition.absolutePath && lazyReferences[element.definition.absolutePath]) {
        const absoluteRef = element.definition.absolutePath
          ? lazyReferences[element.definition.absolutePath].zodSchema
          : z.any();
        const relativeRef = element.definition.relativePath
          ? element.definition.eager
            ? resolveEagerReference(
                element.definition.relativePath,
                element,
                contextSubObjectSchemaAndDescriptionRecord,
                getSchemaEagerReferences
              ).zodSchema
            : lazyReferences[element.definition.relativePath].zodSchema
          : absoluteRef;
        const relativeRefPartial = element.definition.partial
          ? (relativeRef as any as AnyZodObject).partial()
          : relativeRef; // will fail if relativeRef is not a ZodObject
        return relativeRefPartial;
      } else {
        if (element.definition.relativePath) {
          // console.log("solving relativePath",element.definition.relativePath,"as eagerReference with lazy refs", JSON.stringify(lazyReferences));

          const relativeRef = resolveEagerReference(
            element.definition.relativePath,
            element,
            contextSubObjectSchemaAndDescriptionRecord,
            getSchemaEagerReferences
          ).zodSchema;
          const relativeRefPartial = element.definition.partial
            ? (relativeRef as any as AnyZodObject).partial()
            : relativeRef; // will fail if relativeRef is not a ZodObject
          return relativeRefPartial;
        } else {
          throw new Error(
            "when converting Jzod to Zod, could not find lazy reference " +
            element.definition.absolutePath +
              " in passed references " +
              Object.keys(lazyReferences) +
              " from element " + JSON.stringify(element)
          );
        }
      }

      // console.log("converting schemaReference relative path targetObject", targetObject, element.definition.relativePath,Object.keys(targetObject),);
    }
  }
);// resolveReference
} 


// ######################################################################################################
export function jzodElementSchemaToZodSchemaAndDescription(
  element: JzodElement,
  getSchemaEagerReferences: () => ZodSchemaAndDescriptionRecord = () => ({}),
  getLazyReferences: () => ZodSchemaAndDescriptionRecord = () => ({}),
  typeScriptLazyReferenceConverter?: (lazyZodSchema: ZodLazy<any>, relativeReference: string | undefined) => any /** returns "any" to avoid pollution from zod-to-ts type "GetType", actual return type is ZodType<any, any, any> & GetType */
): ZodSchemaAndDescription {
  // console.log("jzodElementSchemaToZodSchemaAndDescription called for type",element.type);

  switch (element.type as string) { // TODO; remove cast as string for element.type!
    case "date":
    case "number":
    case "string": {
      const castElement = element as JzodAttributePlainDateWithValidations | JzodAttributePlainNumberWithValidations | JzodAttributePlainStringWithValidations;

      const zodPreSchema = castElement.coerce
        ? (z.coerce as any)[castElement.type]()
        : (z as any)[castElement.type]()
      ;
      const zodPreSchema2: ZodTypeAny = Array.isArray(castElement.validations)
      ? (castElement.validations as any).reduce(
          (acc: any, curr:any) => (acc as any)[curr.type](curr.parameter) as ZodTypeAny,
          zodPreSchema
        )
      : zodPreSchema;

      const resultZodSchema: ZodTypeAny = optionalNullablePartialZodSchema(zodPreSchema2, element.optional, element.nullable);

      return {
        contextZodText: undefined,
        contextZodSchema: undefined,
        zodSchema: resultZodSchema,
        zodText: castElement.coerce
          ? optionalNullablePartialZodDescription(
              `z.coerce.${castElement.type}()`,
              element.optional,
              element.nullable
            )
          : optionalNullablePartialZodDescription(`z.${castElement.type}()`, element.optional, element.nullable),
      };
      break;
    }
    case "any":
    case "bigint":
    case "boolean":
    case "date":
    case "never":
    case "null":
    case "number":
    case "string":
    case "undefined":
    case "unknown":
    case "void": {
      const zodPreSchema: ZodTypeAny = (z as any)[element.type]();
      const zodPre2Schema = element.optional ? zodPreSchema.optional() : zodPreSchema;
      const zodSchema = element.nullable ? zodPre2Schema.nullable() : zodPre2Schema;
      const zodText: string = `z.${element.type}()` + (element.optional ? `.optional()` : ``) + (element.nullable ? `.nullable()` : ``);

      return {
        zodSchema,
        zodText,
      }
      break;
    }
    case "uuid": {
      // const castElement = element as (JzodAttributeDateWithValidations | JzodAttributeNumberWithValidations | JzodAttributeStringWithValidations );
      const zodPreSchema: ZodTypeAny = z.string().uuid();
      const zodPre2Schema = element.optional ? zodPreSchema.optional() : zodPreSchema;
      const zodSchema = element.nullable ? zodPre2Schema.nullable() : zodPre2Schema;
      const zodText: string = "z.string().uuid()" + (element.optional ? `.optional()` : ``) + (element.nullable ? `.nullable()` : ``);
      return { contextZodText: undefined, contextZodSchema: undefined, zodSchema, zodText };
    }
    case "array": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        (element as JzodArray).definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullablePartialZodSchema(z.array(sub.zodSchema),element.optional,element.nullable),
        zodText: optionalNullablePartialZodDescription(`z.array(${sub.zodText})`,element.optional,element.nullable),
      };
      break;
    }
    case "enum": {
      const castElement = element as JzodEnum;
      if (Array.isArray(castElement.definition) && castElement.definition.length > 1) {
        return {
          zodSchema: optionalNullablePartialZodSchema(
            (z.enum as any)([...castElement.definition]),
            element.optional,
            element.nullable
          ), // avoiding to cast parameter to z.enum, since the cast impacts the generated zod schema
          zodText: optionalNullablePartialZodDescription(
            `z.enum(${JSON.stringify([...castElement.definition])})`,
            element.optional,
            element.nullable
          ),
        };
      } else {
        return {
          zodSchema: z.any(),
          zodText: `z.any()`,
        };
      }
      break;
    }
    case "function": {
      const args = Object.entries((element as JzodFunction).definition.args).map((e) =>
        jzodElementSchemaToZodSchemaAndDescription(
          e[1],
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptLazyReferenceConverter
        )
      );
      const castElement = element as JzodFunction
      if (castElement.definition.returns) {
        const returns = jzodElementSchemaToZodSchemaAndDescription(
          castElement.definition.returns,
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptLazyReferenceConverter
        );
        return {
          contextZodText: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
          zodSchema: (z
            .function()
            .args as any)(...(args.map((z) => z.zodSchema))) // avoid casting the parameters to z.function().args(), since this cast impacts the produced zod schema
            .returns(returns.zodSchema),
          zodText: `z.function().args(${JSON.stringify(args.map((z) => z.zodText))}).returns(${
            returns.zodText
          })`,
        };
      } else {
        return {
          contextZodText: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
          zodSchema: (z.function().args as any)(...(args.map((z) => z.zodSchema))), //avoiding to type parameters to z.function().args, since this cast impacts the obtained zod schema
          zodText: `z.function().args(${JSON.stringify(args.map((z) => z.zodText))})`,
        };
      }
      break;
    }
    case "intersection": {
      const subLeft = jzodElementSchemaToZodSchemaAndDescription(
        // "left",
        (element as JzodIntersection).definition.left,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      const subRight = jzodElementSchemaToZodSchemaAndDescription(
        // "right",
        (element as JzodIntersection).definition.right,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: { ...subLeft.contextZodText, ...subRight.contextZodText },
        contextZodSchema: { ...subLeft.contextZodSchema, ...subRight.contextZodSchema },
        zodSchema: optionalNullablePartialZodSchema(
          z.intersection(subLeft.zodSchema, subRight.zodSchema),
          element.optional,
          element.nullable
        ),
        zodText: optionalNullablePartialZodDescription(
          `z.intersection(${subLeft.zodText},${subRight.zodText})`,
          element.optional,
          element.nullable
        ),
      };
      break;
    }
    case "literal": {
      const castElement = element as JzodLiteral;
      return {
        zodSchema: optionalNullablePartialZodSchema(z.literal(castElement.definition), element.optional, element.nullable),
        zodText: optionalNullablePartialZodDescription(
          typeof castElement.definition == "string"
            ? `z.literal("${castElement.definition}")`
            : `z.literal(${castElement.definition})`,
          element.optional,
          element.nullable
        ), // TODO: defines only strings!
      };
      break;
    }
    case "lazy": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        (element as JzodLazy).definition,
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
        (element as JzodMap).definition[0],
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      const sub1 = jzodElementSchemaToZodSchemaAndDescription(
        (element as JzodMap).definition[1],
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: {...sub0.contextZodText, ...sub1.contextZodText},
        contextZodSchema: {...sub0.contextZodSchema, ...sub1.contextZodSchema},
        zodSchema: optionalNullablePartialZodSchema(z.map(sub0.zodSchema,sub1.zodSchema),element.optional,element.nullable),
        zodText: optionalNullablePartialZodDescription(`z.map(${sub0.zodText},${sub1.zodText})`,element.optional,element.nullable),
      };
      break;
    }
    case "object": {
      const castElement = element as JzodObject;
      const extendsSubObject: ZodSchemaAndDescription | undefined = castElement?.extend
        ? jzodElementSchemaToZodSchemaAndDescription(
            castElement.extend,
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptLazyReferenceConverter
          )
        : undefined;

      const definitionSubObject: ZodSchemaAndDescriptionRecord = Object.fromEntries(
        Object.entries(castElement.definition).map((a) => [
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

      const contextZodText = getContextDescriptions(definitionSubObject);
      const contextZodSchema = getContextZodSchemas(definitionSubObject);
      const preResultZodSchema = extendsSubObject?(extendsSubObject.zodSchema as AnyZodObject).extend(schemas):z.object(schemas);
      const resultZodSchema = castElement.partial?preResultZodSchema.partial():preResultZodSchema;

      /**
       */
      const preResultZodText = extendsSubObject
        ? extendsSubObject.zodText + ".extend(" + objectToJsStringObject(zodText) + ")"
        : `z.object(${objectToJsStringObject(zodText)})`;
      const resultZodText = optionalNullablePartialZodDescription(
        preResultZodText + (castElement.nonStrict ? "" : ".strict()") + (castElement.partial ? ".partial()" : ""),
        element.optional,
        element.nullable
      );
      // console.log(
      //   "jzodElementSchemaToZodSchemaAndDescription converting object definition",
      //   JSON.stringify(element.definition),
      //   "### extend",
      //   JSON.stringify(extendsSubObject),
      //   "### definitionSubObject waaa",
      //   JSON.stringify(definitionSubObject),
      //   (definitionSubObject["test"]?definitionSubObject["test"].zodSchema.isOptional():""),
      //   // JSON.stringify(schemasZodText),
      //   "### schemaEagerReferences",
      //   JSON.stringify(getSchemaEagerReferences),
      //   "### resultZodText",
      //   resultZodText, "###"
      // );

      return {
        contextZodText: Object.keys(contextZodText).length > 0 ? contextZodText : undefined,
        contextZodSchema: Object.keys(contextZodSchema).length > 0 ? contextZodSchema : undefined,
        zodSchema: optionalNullablePartialZodSchema(
          castElement.nonStrict ? resultZodSchema : resultZodSchema.strict(),
          element.optional,
          element.nullable
        ),
        zodText: resultZodText,
      };
      break;
    }
    case "promise": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        (element as JzodPromise).definition,
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
        (element as JzodRecord).definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullablePartialZodSchema(z.record(z.string(), sub.zodSchema),element.optional,element.nullable),
        zodText: optionalNullablePartialZodDescription(`z.record(z.string(),${sub.zodText})`, element.optional, element.nullable),
      };
    }
    case "schemaReference": {
      // console.log("jzodElementSchemaToZodSchemaAndDescription schemaReference", JSON.stringify(element));
      
      const localContextReferences:[string,ZodSchemaAndDescription][] = [];
      // resolve schemaReference.context
      for (const curr of Object.entries((element as JzodReference).context??{})) {
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

      const castElement = element as JzodReference; // ugly, but linter comes out with typing issue (with eg element.definition.relativePath) otherwise

      const lazyResolverZodSchema: ZodLazy<any> = getLazyResolverZodSchema(
        castElement,
        contextSubObjectSchemaAndDescriptionRecord,
        getSchemaEagerReferences,
        getLazyReferences
      )

      const eagerReference = castElement.definition.eager
        ? resolveEagerReference(
          castElement.definition.relativePath,
          castElement,
          contextSubObjectSchemaAndDescriptionRecord,
          getSchemaEagerReferences
        )
        : undefined;
      
      const referenceResolvedSchema: ZodTypeAny = castElement.definition.eager
        ? eagerReference?.zodSchema ?? z.any()
        : typeScriptLazyReferenceConverter
        ? optionalNullablePartialZodSchema(
            typeScriptLazyReferenceConverter(lazyResolverZodSchema, castElement.definition.relativePath),
            element.optional,
            element.nullable
          )
        : optionalNullablePartialZodSchema(lazyResolverZodSchema, element.optional, element.nullable);

      const referenceResolvedZodText = castElement.definition.eager
        ? optionalNullablePartialZodDescription(`${eagerReference?.zodText}`, element.optional, element.nullable)
        : optionalNullablePartialZodDescription(
            `z.lazy(() =>${castElement.definition.relativePath})`,
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
      //   JSON.stringify(contextZodText),
      //   "contextZodSchema",
      //   JSON.stringify(contextZodSchema)
      // );
      const result = {
        contextZodText: Object.keys(contextZodText).length > 0?contextZodText:undefined,
        contextZodSchema: Object.keys(contextZodSchema).length > 0?contextZodSchema:undefined,
        zodSchema: referenceResolvedSchema,
        zodText: referenceResolvedZodText
      };
      return result;
      break;
    }
    case "set": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        (element as JzodSet).definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptLazyReferenceConverter
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullablePartialZodSchema(z.set(sub.zodSchema),element.optional,element.nullable),
        zodText: optionalNullablePartialZodDescription(`z.set(${sub.zodText})`,element.optional,element.nullable),
      };
      break;
    }
    case "tuple": {
      if (Array.isArray((element as JzodTuple).definition) && (element as JzodTuple).definition.length > 1) {
        const subs = (element as JzodTuple).definition.map((d) =>
          jzodElementSchemaToZodSchemaAndDescription(
            // name,
            d,
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptLazyReferenceConverter
          )
        );
        
        const subSchemas: [ZodTypeAny, ...ZodTypeAny[]] = [...subs.map((s:ZodSchemaAndDescription)=>s.zodSchema)] as [ZodTypeAny, ...ZodTypeAny[]]
        const result = {
          contextZodSchema: subs.reduce((acc, curr) => ({ ...acc, ...curr.contextZodText }), {}),
          contextZodText: subs.reduce((acc, curr) => ({ ...acc, ...curr.contextZodSchema }), {}),
          zodSchema: optionalNullablePartialZodSchema(z.tuple(subSchemas), element.optional, element.nullable), // avoid converting z.tuple() parameter to any, since this cast impacts resulting zod schema
          zodText: optionalNullablePartialZodDescription(
            `z.tuple(${objectToJsStringArray(subs.map((s) => s.zodText))})`,
            element.optional,
            element.nullable
          ),
        };
        return result;
      } else {
        return {
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

        zodSchema: optionalNullablePartialZodSchema(
          (z.union as any)(sub.map((s) => s.zodSchema)),
          element.optional,
          element.nullable
        ), // avoiding to cast parameter to z.union(), since this cast impacts the produced zod schema
        zodText: optionalNullablePartialZodDescription(
          `z.union(${objectToJsStringArray(sub.map((s) => s.zodText))})`,
          element.optional,
          element.nullable
        ),
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
// export function _zodToJsonSchema(
//   referentialSet: ZodSchemaAndDescriptionRecord,
//   dependencies: { [k: string]: string[] },
//   name?: string
// ): { [k: string]: any } {
//   const referentialSetEntries = Object.entries(referentialSet);
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
