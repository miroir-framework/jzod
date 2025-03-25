import { AnyZodObject, ZodLazy, ZodTypeAny, z } from "zod";
// import zodToJsonSchema from "zod-to-json-schema";
import { GetType, withGetType } from "zod-to-ts";

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
  JzodPromise,
  JzodRecord,
  JzodReference,
  JzodSet,
  JzodTuple,
  JzodUnion,
} from "@miroir-framework/jzod-ts";
import { ZodTextAndZodSchema, ZodTextAndZodSchemaRecord } from "./JzodInterface.js";
import { zodToZodText } from "./ZodToZodText.js";

// ##############################################################################################################
export interface JzodElementToTsTypeMessageType {
  key: string;
  value: JzodElement;
  typeName: string;
  exportPrefix: string;
}


export const typeScriptLazyReferenceConverter = (
  innerReference: ZodTypeAny & GetType,
  relativeReference: string | undefined
) =>
  withGetType(innerReference, (ts: any) => {
    const actualTypeName = relativeReference
      ? relativeReference.replace(/^(.)(.*)$/, (a, b, c) => b.toUpperCase() + c)
      : "";
    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier(actualTypeName ?? "RELATIVEPATH_NOT_DEFINED"),
      undefined
    );
  });

// ######################################################################################################
export const objectToJsStringVariables = (o: Object): string =>
  Object.entries(o).reduce(
    (acc: string, curr: [string, any]) => acc + "export const " + curr[0] + ": ZodTypeAny =" + curr[1] + ";",
    ""
  );

// ######################################################################################################
export const objectToJsStringObject = (o: Object): string =>
  Object.entries(o).reduce(
    (acc: string, curr: [string, any]) => acc + (acc.length > 1 ? ", " : "") + curr[0] + ":" + curr[1],
    "{"
  ) + "}";

// ######################################################################################################
export const objectToJsStringArray = (o: Object): string =>
  Object.entries(o).reduce((acc: string, curr: [string, any]) => acc + (acc.length > 1 ? ", " : "") + curr[1], "[") +
  "]";

// ######################################################################################################
export function getDescriptions(set: ZodTextAndZodSchemaRecord) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], a[1].zodText]));
}

// ######################################################################################################
export function getRecordZodText(set: ZodTextAndZodSchemaRecord) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], zodToZodText(a[1].zodSchema, a[0])]));
}

// ######################################################################################################
export function getContextDescriptions(set: ZodTextAndZodSchemaRecord) {
  return Object.fromEntries(
    Object.entries(set).reduce(
      (acc: [string, string][], curr: [string, ZodTextAndZodSchema]) => [
        ...acc,
        ...Object.entries(curr[1].contextZodText ? curr[1].contextZodText : {}),
      ],
      []
    )
  );
}

// ######################################################################################################
export function getJsResultSetConstDeclarations(set: ZodTextAndZodSchemaRecord) {
  return Object.entries(set).reduce((acc, curr) => acc + `export const ${curr[0]} = ${curr[1].zodText};`, "");
}

// ######################################################################################################
export function getZodSchemas(set: ZodTextAndZodSchemaRecord) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], a[1].zodSchema]));
}

// ######################################################################################################
export function getContextZodSchemas(set: ZodTextAndZodSchemaRecord) {
  return Object.fromEntries(
    Object.entries(set).reduce(
      (acc: [string, ZodTypeAny][], curr: [string, ZodTextAndZodSchema]) => [
        ...acc,
        ...Object.entries(curr[1].contextZodSchema ? curr[1].contextZodSchema : {}),
      ],
      []
    )
  );
}

// ######################################################################################################
function optionalNullablePartialZodSchema(
  zodElement: ZodTypeAny,
  optional?: boolean,
  nullable?: boolean,
  partial?: boolean
): ZodTypeAny {
  const partialElement: ZodTypeAny = partial ? (zodElement as any as AnyZodObject).partial() : zodElement; // will fail if element is not ZodObject
  const optionalElement: ZodTypeAny = optional ? partialElement.optional() : partialElement;
  const nullableElement: ZodTypeAny = nullable ? optionalElement.nullable() : optionalElement;
  return nullableElement;
}
function optionalNullablePartialZodDescription(
  zodElement: string,
  optional?: boolean,
  nullable?: boolean,
  partial?: boolean
): string {
  const partialElement: string = partial ? zodElement + ".partial()" : zodElement;
  const optionalElement: string = optional ? partialElement + ".optional()" : partialElement;
  const nullableElement: string = nullable ? optionalElement + ".nullable()" : optionalElement;
  return nullableElement;
}

// ################################################################################################
function resolveEagerReference(
  eagerReference: string | undefined,
  element: JzodReference,
  contextSubObjectSchemaAndDescriptionRecord: ZodTextAndZodSchemaRecord,
  getSchemaEagerReferences: () => ZodTextAndZodSchemaRecord = () => ({})
): ZodTextAndZodSchema {
  /**
   * TODO: if there is a carryOn clause on the reference, then the JzodSchema corresponding to this reference has to be converted again and made available
   * under a new name using the hash of the carryOn (use Json Web Token JWT?), unless the conversion has already been done.
   *
   */
  // console.log("resolveEagerReference resolving relativePath", eagerReference, !!element.definition.eager);
  if (eagerReference) {
    const eagerReferences: ZodTextAndZodSchemaRecord = {
      ...getSchemaEagerReferences(),
      ...contextSubObjectSchemaAndDescriptionRecord,
    };
    // console.log("looking up eager reference", eagerReference, "optional", element.optional, "nullable", element.nullable);

    if (eagerReferences[eagerReference]) {
      const zodSchema = optionalNullablePartialZodSchema(
        eagerReferences[eagerReference].zodSchema,
        element.optional,
        element.nullable
      );
      const zodText = optionalNullablePartialZodDescription(
        eagerReferences[eagerReference].zodText,
        element.optional,
        element.nullable
      );
      return {
        zodSchema,
        zodText,
        objectShapeZodSchema: eagerReferences[eagerReference].objectShapeZodSchema,
        objectShapeZodText: eagerReferences[eagerReference].objectShapeZodText,
      };
    } else {
      throw new Error(
        "when converting Jzod to Zod, could not find eager reference " +
          (element as JzodReference).definition.relativePath +
          " in passed references " +
          Object.keys(eagerReferences) +
          " from element " +
          JSON.stringify(element)
      );
    }
    // }
  } else {
    return { zodSchema: z.any(), zodText: "z.any()" };
  }
} // resolveEagerReference

// ################################################################################################
function getLazyResolverZodSchema(
  element: JzodReference,
  contextSubObjectSchemaAndDescriptionRecord: ZodTextAndZodSchemaRecord,
  getSchemaEagerReferences: () => ZodTextAndZodSchemaRecord = () => ({}),
  getLazyReferences: () => ZodTextAndZodSchemaRecord = () => ({}),
  typeScriptGeneration: boolean = false,
): ZodLazy<any> {
  return z.lazy(() => {
    // console.log("getLazyResolverZodSchema resolving relativePath", element.definition.relativePath, !!typeScriptLazyReferenceConverter);
    /**
     * issue with zod-to-ts: specifying a TS AST generation function induces a call to the lazy function!! :-(
     * this call is avoided in this case, but this means Zod schemas used to generate typescript types must
     * not be used for validation purposes, please perform separate generations to accomodate each case.
     */

    if (typeScriptGeneration) {
    // if (typeScriptLazyReferenceConverter) {
      /**
       * in the case of TS conversion, this function is called, but the obtained jzod schema shall not be used for validation purposes!
       * (the actual schema to be used is not known yet, since it's... lazy!).
       */
      // return z.any(); // not working: this makes returned schema optional.
      return z.never(); // all validations will fail
    } else {
      const lazyReferences: ZodTextAndZodSchemaRecord = getLazyReferences();

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
              " from element " +
              JSON.stringify(element)
          );
        }
      }

      // console.log("converting schemaReference relative path targetObject", targetObject, element.definition.relativePath,Object.keys(targetObject),);
    }
  }); // resolveReference
}

// ######################################################################################################
export function jzodWithCarryOnToZodTextAndZodSchema(
  element: JzodElement,
  carryOn: ZodTextAndZodSchema | undefined,
  getSchemaEagerReferences: () => ZodTextAndZodSchemaRecord = () => ({}),
  getLazyReferences: () => ZodTextAndZodSchemaRecord = () => ({}),
  typeScriptGeneration: boolean = false, // needed to avoid lookup of lazy references when generating typescript types
): ZodTextAndZodSchema {
  // console.log("jzodWithCarryOnToZodTextAndZodSchema called for type",element.type);
  // console.log("jzodWithCarryOnToZodTextAndZodSchema called for element",JSON.stringify(element, null, 2));

  if ((element as any)?.carryOn && !!carryOn) {
    throw new Error(
      "jzodWithCarryOnToZodTextAndZodSchema carryOn override is not allowed, at most 1 carryOn clause can be specified in any jzod schema tree."
    );
  }

  if (!!carryOn && !["object", "schemaReference", "union"].includes(element.type)) {
    const plainZodSchema = jzodWithCarryOnToZodTextAndZodSchema(
      element,
      undefined, // carryOn
      getSchemaEagerReferences,
      getLazyReferences,
      typeScriptGeneration
    );

    return {
      // TODO: handle discriminators! There should be a list of discriminators for heteronomous object unions!
      contextZodText: undefined, // lazy evaluation obfuscates any context defined within it
      contextZodSchema: undefined,
      jzodSchema: element,
      zodSchema: z.union([plainZodSchema.zodSchema, carryOn.zodSchema]),
      zodText: `z.union([${plainZodSchema.zodText}, ${carryOn.zodText}])`,
    };
  }

  switch (element.type) {
    case "date":
    case "number":
    case "string": {
      // const castElement = element as any;
      const castElement = element as 
        | JzodAttributePlainDateWithValidations
        | JzodAttributePlainNumberWithValidations
        | JzodAttributePlainStringWithValidations;

      const zodPreSchema = castElement.coerce ? (z.coerce as any)[castElement.type]() : (z as any)[castElement.type]();
      const zodPreSchema2: ZodTypeAny = Array.isArray(castElement.validations)
        ? (castElement.validations as any).reduce(
            (acc: any, curr: any) => (acc as any)[curr.type](curr.parameter) as ZodTypeAny,
            zodPreSchema
          )
        : zodPreSchema;

      const resultZodSchema: ZodTypeAny = optionalNullablePartialZodSchema(
        zodPreSchema2,
        element.optional,
        element.nullable
      );

      return {
        contextZodText: undefined,
        contextZodSchema: undefined,
        jzodSchema: element,
        zodSchema: resultZodSchema,
        zodText: castElement.coerce
          ? optionalNullablePartialZodDescription(`z.coerce.${castElement.type}()`, element.optional, element.nullable)
          : optionalNullablePartialZodDescription(`z.${castElement.type}()`, element.optional, element.nullable),
      };
      break;
    }
    case "any":
    case "bigint":
    case "boolean":
    // case "date":
    case "never":
    case "null":
    // case "number":
    // case "string":
    case "undefined":
    case "unknown":
    case "void": {
      const zodPreSchema: ZodTypeAny = (z as any)[element.type]();
      const zodPre2Schema = element.optional ? zodPreSchema.optional() : zodPreSchema;
      const zodSchema = element.nullable ? zodPre2Schema.nullable() : zodPre2Schema;
      const zodText: string =
        `z.${element.type}()` + (element.optional ? `.optional()` : ``) + (element.nullable ? `.nullable()` : ``);

      return {
        jzodSchema: element,
        zodSchema,
        zodText,
      };
      break;
    }
    case "uuid": {
      // const castElement = element as (JzodAttributeDateWithValidations | JzodAttributeNumberWithValidations | JzodAttributeStringWithValidations );
      const zodPreSchema: ZodTypeAny = z.string().uuid();
      const zodPre2Schema = element.optional ? zodPreSchema.optional() : zodPreSchema;
      const zodSchema = element.nullable ? zodPre2Schema.nullable() : zodPre2Schema;
      const zodText: string =
        "z.string().uuid()" + (element.optional ? `.optional()` : ``) + (element.nullable ? `.nullable()` : ``);
      return {
        contextZodText: undefined,
        contextZodSchema: undefined,
        jzodSchema: element,
        zodSchema,
        zodText,
      };
    }
    case "array": {
      const sub = jzodToZodTextAndZodSchema(
        // TODO: bug? shouldn't it be jzodElementSchemaToZodSchemaAndDescriptionWithCarrryOn?
        (element as JzodArray).definition,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        jzodSchema: element,
        zodSchema: optionalNullablePartialZodSchema(z.array(sub.zodSchema), element.optional, element.nullable),
        zodText: optionalNullablePartialZodDescription(`z.array(${sub.zodText})`, element.optional, element.nullable),
      };
      break;
    }
    case "enum": {
      const castElement = element as JzodEnum;
      if (Array.isArray(castElement.definition) && castElement.definition.length > 1) {
        return {
          jzodSchema: element,
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
          jzodSchema: element,
          zodSchema: z.any(),
          zodText: `z.any()`,
        };
      }
      break;
    }
    case "function": {
      const args = Object.entries((element as JzodFunction).definition.args).map((e) =>
        jzodToZodTextAndZodSchema(
          e[1],
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptGeneration
        )
      );
      const castElement = element as JzodFunction;
      if (castElement.definition.returns) {
        const returns = jzodToZodTextAndZodSchema(
          castElement.definition.returns,
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptGeneration
        );
        return {
          contextZodText: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
          jzodSchema: element,
          zodSchema: (z.function().args as any)(...args.map((z) => z.zodSchema)) // avoid casting the parameters to z.function().args(), since this cast impacts the produced zod schema
            .returns(returns.zodSchema),
          zodText: `z.function().args(${JSON.stringify(args.map((z) => z.zodText))}).returns(${returns.zodText})`,
        };
      } else {
        return {
          contextZodText: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
          jzodSchema: element,
          zodSchema: (z.function().args as any)(...args.map((z) => z.zodSchema)), //avoiding to type parameters to z.function().args, since this cast impacts the obtained zod schema
          zodText: `z.function().args(${JSON.stringify(args.map((z) => z.zodText))})`,
        };
      }
      break;
    }
    case "intersection": {
      const subLeft = jzodToZodTextAndZodSchema(
        // "left",
        (element as JzodIntersection).definition.left,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      const subRight = jzodToZodTextAndZodSchema(
        // "right",
        (element as JzodIntersection).definition.right,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      return {
        contextZodText: { ...subLeft.contextZodText, ...subRight.contextZodText },
        contextZodSchema: { ...subLeft.contextZodSchema, ...subRight.contextZodSchema },
        jzodSchema: element,
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
        jzodSchema: element,
        zodSchema: optionalNullablePartialZodSchema(
          z.literal(castElement.definition),
          element.optional,
          element.nullable
        ),
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
      const sub = jzodWithCarryOnToZodTextAndZodSchema(
        (element as JzodLazy).definition,
        carryOn,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );

      return {
        contextZodText: undefined, // lazy evaluation obfuscates any context defined within it
        contextZodSchema: undefined,
        jzodSchema: element,
        zodSchema: z.lazy(() => sub.zodSchema),
        zodText: `z.lazy(()=>${sub.zodText})`,
      };
      break;
    }
    case "map": {
      const sub0 = jzodWithCarryOnToZodTextAndZodSchema(
        (element as JzodMap).definition[0],
        carryOn,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      const sub1 = jzodWithCarryOnToZodTextAndZodSchema(
        (element as JzodMap).definition[1],
        carryOn,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      return {
        contextZodText: { ...sub0.contextZodText, ...sub1.contextZodText },
        contextZodSchema: { ...sub0.contextZodSchema, ...sub1.contextZodSchema },
        jzodSchema: element,
        zodSchema: optionalNullablePartialZodSchema(
          z.map(sub0.zodSchema, sub1.zodSchema),
          element.optional,
          element.nullable
        ),
        zodText: optionalNullablePartialZodDescription(
          `z.map(${sub0.zodText},${sub1.zodText})`,
          element.optional,
          element.nullable
        ),
      };
      break;
    }
    case "object": {
      const extendsSubObjects: ZodTextAndZodSchema[] | undefined = !element?.extend
        ? undefined
        : !Array.isArray(element.extend)
        ? [
            jzodWithCarryOnToZodTextAndZodSchema(
              element.extend,
              undefined,
              getSchemaEagerReferences,
              getLazyReferences,
              typeScriptGeneration
            ),
          ]
        : element.extend.length > 0
        ? (element.extend as JzodElement[]).map((e) =>
            jzodWithCarryOnToZodTextAndZodSchema(
              e,
              undefined,
              getSchemaEagerReferences,
              getLazyReferences,
              typeScriptGeneration
            )
          )
        : undefined;
      const carryOnZodSchemaAndDescription = (element as any).carryOn
        ? jzodWithCarryOnToZodTextAndZodSchema(
          (element as any).carryOn,
            undefined,
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptGeneration
          )
        : carryOn;

      const objectDefinitionWithTag =
      (element as any).tag &&
        ((element as any).tag as any).schema &&
        (((element as any).tag as any).schema.metaSchema || ((element as any).tag as any).schema.valueSchema)
          ? {
              ...element.definition,
              tag: Object.assign(
                //TODO: what about tag.optional and tag.schema.optional?
                {
                  type: "object",
                  optional: true, // tags are always optional
                  definition: Object.assign(
                    {
                      value: ((element as any).tag as any).schema.valueSchema ?? { type: "any" },
                    },
                    ((element as any).tag as any).schema.metaSchema
                      ? {
                          schema: ((element as any).tag as any).schema.metaSchema ?? { type: "any" }, // the metaSchema becomes the schema of the tag (which is an intance of this metaTag)
                          optional: { type: "boolean", optional: true }, // if tag is a meta tag, it says that tag definitions can always be defined as optional / not optional (the tag can have a tag.optional attribute in this case)
                        }
                      : {}
                  ),
                }
              ),
            }
          : element.definition;
      // console.log("objectDefinitionWithTag", JSON.stringify(objectDefinitionWithTag));

      const definitionSubObject: ZodTextAndZodSchemaRecord = Object.fromEntries(
        Object.entries(objectDefinitionWithTag).map((a) => {
          try {
            return [
              a[0],
              jzodWithCarryOnToZodTextAndZodSchema(
                a[1],
                carryOnZodSchemaAndDescription,
                getSchemaEagerReferences,
                getLazyReferences,
                typeScriptGeneration
              ),
            ];
          } catch (error) {
            console.error("error when converting object definition", JSON.stringify(element.definition), error);
            throw error;
          }
        })
      );

      /**
       * take tag into account
       * if tag has a schema generate a "tag" attribute on the object with a "value" attribute having the given schema as type
       * if the tag has a value only or no value do nothing.
       * if object has a "tag" attribute, then the jzod schema of the attribute and of the "tag" must be identical
       */

      const plainObjectAttributeSchemas = Object.fromEntries(
        Object.entries(definitionSubObject).map((a) => [a[0], a[1].zodSchema])
      );
      const plainObjectAttributeZodText = Object.fromEntries(
        Object.entries(definitionSubObject).map((a) => [a[0], a[1].zodText])
      );

      const contextZodText = getContextDescriptions(definitionSubObject);
      const contextZodSchema = getContextZodSchemas(definitionSubObject);

      // resolving "extend" clause
      const extendedShapeZodSchema: { [k: string]: ZodTypeAny } =
        extendsSubObjects && extendsSubObjects?.length > 0
          ? extendsSubObjects.reduceRight(
              (acc: { [k: string]: ZodTypeAny }, curr: ZodTextAndZodSchema) => ({
                ...acc,
                ...curr.objectShapeZodSchema,
              }),
              {} as { [k: string]: ZodTypeAny }
            )
          : plainObjectAttributeSchemas;
      const extendedObjectShapeZodSchema = {
        ...extendedShapeZodSchema,
        ...plainObjectAttributeSchemas,
      };
      const partialSubObjectZodSchema = optionalNullablePartialZodSchema(
        element.nonStrict ? z.object(extendedObjectShapeZodSchema) : z.object(extendedObjectShapeZodSchema).strict(),
        undefined, // optional has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
        undefined, // nullable has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
        element.partial
      );

      // squashing "extend" clause
      const extendedObjectShapeZodText = {
        ...extendsSubObjects?.reduceRight(
          (acc: { [k: string]: string }, curr: ZodTextAndZodSchema) => ({
            ...acc,
            ...curr.objectShapeZodText,
          }),
          {} as { [k: string]: string }
        ),
        ...plainObjectAttributeZodText,
      };

      const extendedObjectZodText =
        "z.object({" +
        Object.entries(extendedObjectShapeZodText).reduce(
          (acc: string, curr: [string, string]) => acc + (acc.length > 1 ? ", " : "") + curr[0] + ":" + curr[1],
          ""
        ) +
        "})";

      const resultZodText = optionalNullablePartialZodDescription(
        extendedObjectZodText + (element.nonStrict ? "" : ".strict()"), //+ (castElement.partial ? ".partial()" : ""),
        undefined, // optional has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
        undefined, // nullable has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
        element.partial
      );

      return {
        contextZodText: Object.keys(contextZodText).length > 0 ? contextZodText : undefined, // weird test, why not just contextZodText?
        contextZodSchema: Object.keys(contextZodSchema).length > 0 ? contextZodSchema : undefined, // weird test, why not just contextZodSchema?
        objectShapeZodSchema: extendedObjectShapeZodSchema,
        objectShapeZodText: extendedObjectShapeZodText,
        jzodSchema: element,
        zodSchema: optionalNullablePartialZodSchema(
          carryOnZodSchemaAndDescription
            ? z.union([partialSubObjectZodSchema, carryOnZodSchemaAndDescription.zodSchema])
            : partialSubObjectZodSchema,
          element.optional, // optional has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
          element.nullable, // nullable has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
          undefined
        ),
        zodText: optionalNullablePartialZodDescription(
          carryOnZodSchemaAndDescription
            ? `z.union([${resultZodText},${carryOnZodSchemaAndDescription.zodText}])`
            : resultZodText,
          element.optional, // optional has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
          element.nullable, // nullable has to be dealt with at upper level, as effective returned schema can be a union, in case carryOn schema is given
          undefined
        ),
      };
      break;
    }
    case "promise": {
      const sub = jzodWithCarryOnToZodTextAndZodSchema(
        // name,
        (element as JzodPromise).definition,
        carryOn,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        jzodSchema: element,
        zodSchema: z.promise(sub.zodSchema),
        zodText: `z.promise(${sub.zodText})`,
      };
      break;
    }
    case "record": {
      const sub = jzodWithCarryOnToZodTextAndZodSchema(
        // name,
        (element as JzodRecord).definition,
        carryOn,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        jzodSchema: element,
        zodSchema: optionalNullablePartialZodSchema(
          z.record(z.string(), sub.zodSchema),
          element.optional,
          element.nullable
        ),
        zodText: optionalNullablePartialZodDescription(
          `z.record(z.string(),${sub.zodText})`,
          element.optional,
          element.nullable
        ),
      };
    }
    case "schemaReference": {
      // console.log("jzodWithCarryOnToZodTextAndZodSchema schemaReference", JSON.stringify(element));
      const castElement = element as any;

      const carryOnZodSchemaAndDescription = castElement.carryOn
        ? jzodWithCarryOnToZodTextAndZodSchema(
            castElement.carryOn,
            undefined,
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptGeneration
          )
        : carryOn;

      const localContextReferences: [string, ZodTextAndZodSchema][] = [];

      // resolve schemaReference.context
      for (const curr of Object.entries((element as JzodReference).context ?? {})) {
        try {
          const subResult: [string, ZodTextAndZodSchema] = [
            curr[0],
            jzodWithCarryOnToZodTextAndZodSchema(
              // name,
              curr[1],
              carryOnZodSchemaAndDescription,
              () => ({
                ...getSchemaEagerReferences(),
                ...Object.fromEntries(localContextReferences),
              }),
              () => ({ ...getLazyReferences(), ...Object.fromEntries(localContextReferences) }),
              typeScriptGeneration
            ),
          ];
          localContextReferences.push(subResult);
        } catch (error) {
          console.error(
            "jzodWithCarryOnToZodTextAndZodSchema error when converting schemaReference context definition",
            curr[0],
            JSON.stringify(curr[1]),
            error
          );
          throw error;
        }
      }
      const contextSubObjectSchemaAndDescriptionRecord: ZodTextAndZodSchemaRecord =
        Object.fromEntries(localContextReferences);

      return resolveJzodReferenceSchema(
        castElement,
        contextSubObjectSchemaAndDescriptionRecord,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration,
        carryOnZodSchemaAndDescription
      );

      // }

      break;
    }
    case "set": {
      const sub = jzodWithCarryOnToZodTextAndZodSchema(
        (element as JzodSet).definition,
        carryOn,
        getSchemaEagerReferences,
        getLazyReferences,
        typeScriptGeneration
      );
      return {
        contextZodText: sub.contextZodText,
        contextZodSchema: sub.contextZodSchema,
        jzodSchema: element,
        zodSchema: optionalNullablePartialZodSchema(z.set(sub.zodSchema), element.optional, element.nullable),
        zodText: optionalNullablePartialZodDescription(`z.set(${sub.zodText})`, element.optional, element.nullable),
      };
      break;
    }
    case "tuple": {
      if (Array.isArray((element as JzodTuple).definition) && (element as JzodTuple).definition.length > 1) {
        const subs = (element as JzodTuple).definition.map((d) =>
          jzodWithCarryOnToZodTextAndZodSchema(
            // name,
            d,
            carryOn,
            getSchemaEagerReferences,
            getLazyReferences,
            typeScriptGeneration
          )
        );

        const subSchemas: [ZodTypeAny, ...ZodTypeAny[]] = [
          ...subs.map((s: ZodTextAndZodSchema) => s.zodSchema),
        ] as [ZodTypeAny, ...ZodTypeAny[]];
        const result = {
          contextZodSchema: subs.reduce((acc, curr) => ({ ...acc, ...curr.contextZodText }), {}),
          contextZodText: subs.reduce((acc, curr) => ({ ...acc, ...curr.contextZodSchema }), {}),
          jzodSchema: element,
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
          jzodSchema: element,
          zodSchema: z.any(),
          zodText: `z.any()`,
        };
      }
      break;
    }
    case "union": {
      const sub: ZodTextAndZodSchema[] = (element as JzodUnion).definition.map((e) =>
        jzodWithCarryOnToZodTextAndZodSchema(
          e,
          carryOn,
          getSchemaEagerReferences,
          getLazyReferences,
          typeScriptGeneration
        )
      );
      const unionBranches = carryOn ? [...sub, carryOn] : sub;
      return {
        contextZodText: Object.fromEntries(
          sub.reduce(
            (acc: [string, string][], curr: ZodTextAndZodSchema) => [
              ...acc,
              ...(curr.contextZodText ? Object.entries(curr.contextZodText) : []),
            ],
            []
          )
        ),
        contextZodSchema: Object.fromEntries(
          sub.reduce(
            // (acc: [string, string][], curr: ZodTextAndZodSchema) => [
            (acc: [string, ZodTypeAny][], curr: ZodTextAndZodSchema) => [
              ...acc,
              ...(curr.contextZodSchema ? Object.entries(curr.contextZodSchema) : []),
            ],
            []
          )
        ),
        jzodSchema: element,
        /**
         * Zod unions are used instead of discriminated unions even if Jzod schema has a discriminator,
         * because TS types obtained using z.infer lack uniformity, which make them rather unusable in practice:
         * TODO: DESCRIBE PROBLEM!!!
         */
        zodSchema: optionalNullablePartialZodSchema(
          (z.union as any)(unionBranches.map((s) => s.zodSchema)),
          element.optional,
          element.nullable
        ), // avoiding to cast parameter to z.union(), since this cast impacts the produced zod schema
        zodText: optionalNullablePartialZodDescription(
          `z.union(${objectToJsStringArray(unionBranches.map((s) => s.zodText))})`,
          element.optional,
          element.nullable
        ),
      };
      break;
    }
    default:
      throw new Error(
        "jzodToZodTextAndZodSchema could not convert given Jzod schema, unknown type:" +
          element["type"] +
          ", element: " +
          JSON.stringify(element)
      );
      break;
  }
  throw new Error(
    "jzodWithCarryOnToZodTextAndZodSchema could not convert given Jzod schema, unknown type:" +
      element["type"] +
      ", element: " +
      JSON.stringify(element)
  );
}

// ##############################################################################################################
export function jzodToZodTextAndZodSchema(
  element: JzodElement,
  getSchemaEagerReferences: () => ZodTextAndZodSchemaRecord = () => ({}),
  getLazyReferences: () => ZodTextAndZodSchemaRecord = () => ({}),
  typeScriptGeneration: boolean = false,
): ZodTextAndZodSchema {
  return jzodWithCarryOnToZodTextAndZodSchema(
    element,
    undefined, // carryOn
    getSchemaEagerReferences,
    getLazyReferences,
    typeScriptGeneration
  );
}

// ##############################################################################################################
function resolveJzodReferenceSchema(
  element: JzodReference,
  contextSubObjectSchemaAndDescriptionRecord: ZodTextAndZodSchemaRecord,
  getSchemaEagerReferences: () => ZodTextAndZodSchemaRecord,
  getLazyReferences: () => ZodTextAndZodSchemaRecord,
  typeScriptGeneration: boolean = false,
  carryOnZodSchemaAndDescription: ZodTextAndZodSchema | undefined
): ZodTextAndZodSchema {
  let eagerReference: ZodTextAndZodSchema | undefined;
  let referenceResolvedSchema: ZodTypeAny;
  let referenceResolvedZodText: string;

  let objectShapeZodSchema: { [k: string]: ZodTypeAny } | undefined;
  let objectShapeZodText: { [k: string]: string } | undefined;

  if (element.definition.eager) {
    // console.log("jzodToZodTextAndZodSchema schemaReference eager", JSON.stringify(element));
    eagerReference = resolveEagerReference(
      element.definition.relativePath, // TODO: can eager references only be relative? This seems to be the case, is there a reason for this limitation?
      element,
      contextSubObjectSchemaAndDescriptionRecord,
      getSchemaEagerReferences
    );
    // console.log(
    //   "jzodToZodTextAndZodSchema schemaReference eager",
    //   JSON.stringify(element),
    //   "resolved to",
    //   JSON.stringify(eagerReference, null, 2)
    // );
    objectShapeZodSchema = eagerReference.objectShapeZodSchema;
    objectShapeZodText = eagerReference.objectShapeZodText;
    referenceResolvedSchema = eagerReference?.zodSchema ?? z.any();
    referenceResolvedZodText = optionalNullablePartialZodDescription(
      `${eagerReference?.zodText}`,
      element.optional,
      element.nullable
    );
  } else {
    /**
     * TODO: should carryOn clause be taken into account for lazy references? What does carryOn mean for recursive references? (including lazy references)
     * can we really apply carryOn to lazy/recursive references, or is it like "extend" of object, and references can only point to fully-defined
     * (although potentially recursive) schema?
     */
    const lazyResolverZodSchema: ZodLazy<any> = getLazyResolverZodSchema(
      element,
      contextSubObjectSchemaAndDescriptionRecord,
      getSchemaEagerReferences,
      getLazyReferences,
      typeScriptGeneration
      // typeScriptGeneration?.typeScriptLazyReferenceConverter
    );
    objectShapeZodSchema = undefined;
    objectShapeZodText = undefined;
    eagerReference = undefined;
    referenceResolvedSchema = typeScriptGeneration
      ? optionalNullablePartialZodSchema(
          typeScriptLazyReferenceConverter(lazyResolverZodSchema, element.definition.relativePath),
          element.optional,
          element.nullable
        )
      : optionalNullablePartialZodSchema(lazyResolverZodSchema, element.optional, element.nullable);
    referenceResolvedZodText = optionalNullablePartialZodDescription(
      `z.lazy(() =>${element.definition.relativePath})`,
      element.optional,
      element.nullable
    );
  }

  const contextZodText = getDescriptions(contextSubObjectSchemaAndDescriptionRecord);
  const contextZodSchema = getZodSchemas(contextSubObjectSchemaAndDescriptionRecord);

  // console.log(
  //   "jzodToZodTextAndZodSchema converting schemaReference",
  //   JSON.stringify(element),
  //   "contextSubObjectSchemaAndDescriptionRecord",
  //   JSON.stringify(contextSubObjectSchemaAndDescriptionRecord),
  //   "contextZodText",
  //   JSON.stringify(contextZodText),
  //   "contextZodSchema",
  //   JSON.stringify(contextZodSchema)
  // );
  const result: ZodTextAndZodSchema = {
    contextZodText: Object.keys(contextZodText).length > 0 ? contextZodText : undefined,
    contextZodSchema: Object.keys(contextZodSchema).length > 0 ? contextZodSchema : undefined,
    objectShapeZodSchema,
    objectShapeZodText,
    jzodSchema: element,
    zodSchema: carryOnZodSchemaAndDescription
      ? z.union([referenceResolvedSchema, carryOnZodSchemaAndDescription.zodSchema])
      : referenceResolvedSchema,
    zodText: carryOnZodSchemaAndDescription
      ? `z.union([${referenceResolvedZodText},${carryOnZodSchemaAndDescription.zodText}])`
      : referenceResolvedZodText,
  };
  return result;
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
