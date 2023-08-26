import { AnyZodObject, ZodTypeAny, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { createTypeAlias, printNode, zodToTs } from "zod-to-ts";

import {
  JzodAttributeStringWithValidations,
  JzodElement,
  JzodElementSet,
  JzodObject,
  JzodUnion,
  ZodSchemaAndDescription,
  ZodSchemaAndDescriptionRecord,
  jzodReferenceSchema,
} from "./JzodInterface";


// ######################################################################################################
export const objectToJsStringVariables = (o: Object): string =>
  Object.entries(o).reduce(
    (acc: string, curr: [string, any]) => acc + "export const " + curr[0] + ": ZodTypeAny =" + curr[1] + ";",
    ""
  );

// ######################################################################################################
export const objectToJsStringObject = (o: Object): string =>
  Object.entries(o).reduce((acc: string, curr: [string, any]) => acc + curr[0] + ":" + curr[1] + ",", "{") + "}";

// ######################################################################################################
export const objectToJsStringArray = (o: Object): string =>
  Object.entries(o).reduce((acc: string, curr: [string, any]) => acc + curr[1] + ",", "[") + "]";

// ######################################################################################################
export function getDescriptions(set: ZodSchemaAndDescriptionRecord<ZodTypeAny>) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], a[1].description]));
}

// ######################################################################################################
export function getContextDescriptions(set: ZodSchemaAndDescriptionRecord<ZodTypeAny>) {
  return Object.fromEntries(
    Object.entries(set).reduce(
      (acc: [string, string][], curr: [string, ZodSchemaAndDescription<ZodTypeAny>]) => [
        ...acc,
        ...Object.entries(curr[1].contextDescription ? curr[1].contextDescription : {}),
      ],
      []
    )
  );
}

// ######################################################################################################
export function getJsResultSetConstDeclarations(set: ZodSchemaAndDescriptionRecord<ZodTypeAny>) {
  return Object.entries(set).reduce((acc, curr) => acc + `export const ${curr[0]} = ${curr[1].description};`, "");
}

// ######################################################################################################
export function getZodSchemas(set: ZodSchemaAndDescriptionRecord<ZodTypeAny>) {
  return Object.fromEntries(Object.entries(set).map((a) => [a[0], a[1].zodSchema]));
}

// ######################################################################################################
export function getContextZodSchemas(set: ZodSchemaAndDescriptionRecord<ZodTypeAny>) {
  return Object.fromEntries(
    Object.entries(set).reduce(
      (acc: [string, ZodTypeAny][], curr: [string, ZodSchemaAndDescription<ZodTypeAny>]) => [
        ...acc,
        ...Object.entries(curr[1].contextZodSchema ? curr[1].contextZodSchema : {}),
      ],
      []
    )
  );
}

// ######################################################################################################
export function jzodSchemaSetToZodSchemaAndDescriptionRecord(
  elementSet: JzodElementSet,
  additionalRelativeReferences?: ZodSchemaAndDescriptionRecord<ZodTypeAny>,
  absoluteReferences?: ZodSchemaAndDescriptionRecord<ZodTypeAny>
): ZodSchemaAndDescriptionRecord<ZodTypeAny> {
  let result: ZodSchemaAndDescriptionRecord<ZodTypeAny> = {};

  for (const entry of Object.entries(elementSet)) {
    result[entry[0]] = jzodElementSchemaToZodSchemaAndDescription(
      // entry[0],
      entry[1],
      () => Object.assign({}, additionalRelativeReferences ? additionalRelativeReferences : {}, result),
      () => (absoluteReferences ? absoluteReferences : {})
    );
  }
  return result;
}

// ######################################################################################################
function optionalNullableZodSchema(zodElement:ZodTypeAny, optional?: boolean, nullable?: boolean): ZodTypeAny {
  const optionalElement = optional ? zodElement.optional() : zodElement;
  const nullableElement = nullable ? optionalElement.nullable() : optionalElement;
  return nullableElement
}
function optionalNullableZodDescription(zodElement:string, optional?: boolean, nullable?: boolean): string {
  const optionalElement = optional ? zodElement +".optional()" : zodElement;
  const nullableElement = nullable ? optionalElement+".nullable()" : optionalElement;
  return nullableElement
}


// ######################################################################################################
export function jzodElementSchemaToZodSchemaAndDescription(
  element: JzodElement,
  getSchemaRelativeReferences: () => ZodSchemaAndDescriptionRecord<ZodTypeAny> = () => ({}),
  getAbsoluteReferences: () => ZodSchemaAndDescriptionRecord<ZodTypeAny> = () => ({}),
  typeScriptReferenceConverter?: (innerReference: ZodTypeAny, relativeReference: string | undefined) => ZodTypeAny
): ZodSchemaAndDescription<ZodTypeAny> {
  // console.log("jzodElementSchemaToZodSchemaAndDescription called",name,"type",element.type);

  switch (element.type) {
    case "array": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        element.definition,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: sub.contextDescription,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullableZodSchema(z.array(sub.zodSchema),element.optional,element.nullable),
        description: optionalNullableZodDescription(`z.array(${sub.description})`,element.optional,element.nullable),
      };
      break;
    }
    case "enum": {
      if (Array.isArray(element.definition) && element.definition.length > 1) {
        return {
          zodSchema: optionalNullableZodSchema(z.enum([...element.definition] as any),element.optional,element.nullable),
          description: optionalNullableZodDescription(`z.enum(${JSON.stringify([...element.definition])} as any)`, element.optional, element.nullable),
        };
      } else {
        return {
          // contextDescription: {},
          // contextZodSchema: {},
          zodSchema: z.any(),
          description: `z.any()`,
        };
      }
      break;
    }
    case "function": {
      const args = Object.entries(element.definition.args).map((e) =>
        jzodElementSchemaToZodSchemaAndDescription(
          // name,
          e[1],
          getSchemaRelativeReferences,
          getAbsoluteReferences,
          typeScriptReferenceConverter
        )
      );
      if (element.definition.returns) {
        const returns = jzodElementSchemaToZodSchemaAndDescription(
          // name,
          element.definition.returns,
          getSchemaRelativeReferences,
          getAbsoluteReferences,
          typeScriptReferenceConverter
        );
        return {
          contextDescription: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
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
          contextDescription: undefined, // function definitions obfuscate any context defined within them
          contextZodSchema: undefined,
          zodSchema: z.function().args(...(args.map((z) => z.zodSchema) as any)),
          description: `z.function().args(${JSON.stringify(args.map((z) => z.description))})`,
        };
      }
      break;
    }
    case "intersection": {
      const subLeft = jzodElementSchemaToZodSchemaAndDescription(
        // "left",
        element.definition.left,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      const subRight = jzodElementSchemaToZodSchemaAndDescription(
        // "right",
        element.definition.right,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: {...subLeft.contextDescription, ...subRight.contextDescription},
        contextZodSchema: {...subLeft.contextZodSchema, ...subRight.contextZodSchema},
        zodSchema: optionalNullableZodSchema(z.intersection(subLeft.zodSchema,subRight.zodSchema),element.optional,element.nullable),
        description: optionalNullableZodDescription(`z.intersection(${subLeft.description},${subRight.description})`,element.optional,element.nullable),
      };
      break;
    }
    case "literal": {
      return {
        // contextDescription: {},
        // contextZodSchema: {},
        zodSchema: optionalNullableZodSchema(z.literal(element.definition),element.optional,element.nullable),
        description: optionalNullableZodDescription(`z.literal("${element.definition}")`,element.optional,element.nullable),
      };
      break;
    }
    case "lazy": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: undefined, // lazy evaluation obfuscates any context defined within it
        contextZodSchema: undefined,
        zodSchema: z.lazy(() => sub.zodSchema),
        description: `z.lazy(()=>${sub.description})`,
      };
      break;
    }
    case "map": {
      const sub0 = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition[0],
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      const sub1 = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition[1],
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: {...sub0.contextDescription, ...sub1.contextDescription},
        contextZodSchema: {...sub0.contextZodSchema, ...sub1.contextZodSchema},
        zodSchema: optionalNullableZodSchema(z.map(sub0.zodSchema,sub1.zodSchema),element.optional,element.nullable),
        description: optionalNullableZodDescription(`z.set(${sub0.description},${sub1.description})`,element.optional,element.nullable),
      };
      break;
    }
    case "object": {
      const contextSubObject = element.context
        ? Object.fromEntries(
            Object.entries(element.context).map((a) => [
              a[0],
              jzodElementSchemaToZodSchemaAndDescription(
                // name,
                a[1],
                getSchemaRelativeReferences,
                getAbsoluteReferences,
                typeScriptReferenceConverter
              ),
            ])
          )
        : {};

      const definitionSubObjectContext = () => ({ ...getSchemaRelativeReferences(), ...contextSubObject });
      const definitionSubObject: ZodSchemaAndDescriptionRecord<ZodTypeAny> = Object.fromEntries(
        Object.entries(element.definition).map((a) => [
          a[0],
          jzodElementSchemaToZodSchemaAndDescription(
            // name,
            a[1],
            definitionSubObjectContext,
            getAbsoluteReferences,
            typeScriptReferenceConverter
          ),
        ])
      );
      // console.log("jzodElementSchemaToZodSchemaAndDescription converting",name,"contextSubObject",JSON.stringify(contextSubObject),"#### definitionSubObject",JSON.stringify(definitionSubObject));
      const contextSchemas = Object.fromEntries(
        // TODO: detect name clashes!
        [
          ...Object.entries(contextSubObject)
            .filter((a) => a[1].zodSchema)
            .map((a) => [a[0], a[1].zodSchema]),
          ...Object.entries(definitionSubObject)
            .filter((a) => a[1].contextZodSchema)
            .map((a) => [a[0], a[1].contextZodSchema]),
        ]
      );
      const contextDescription = Object.fromEntries([
        // Object.entries(contextSubObject).filter(a=>a[1].description != null).map((a) => [a[0], a[1].description]),
        ...Object.entries(contextSubObject)
          .filter((a) => a[1].description)
          .map((a) => [a[0], a[1].description]),
        ...Object.entries(definitionSubObject)
          .filter((a) => a[1].contextDescription)
          .map((a) => [a[0], a[1].contextDescription]),
      ]);
      // console.log("jzodElementSchemaToZodSchemaAndDescription converting",name,"contextDescription",JSON.stringify(contextDescription),"contextSubObject",JSON.stringify(contextSubObject));

      const schemas = Object.fromEntries(Object.entries(definitionSubObject).map((a) => [a[0], a[1].zodSchema]));
      const descriptions = Object.fromEntries(Object.entries(definitionSubObject).map((a) => [a[0], a[1].description]));
      return {
        contextZodSchema: contextSchemas,
        contextDescription: contextDescription,
        zodSchema: optionalNullableZodSchema(z.object(schemas).strict(),element.optional,element.nullable),
        // description: element.optional?`z.object(${JSON.stringify(descriptions)})`:`z.object(${JSON.stringify(descriptions)}).optional()`
        description: optionalNullableZodDescription(`z.object(${objectToJsStringObject(descriptions)}).strict()`, element.optional, element.nullable),
      };
      break;
    }
    case "promise": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: sub.contextDescription,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: z.promise(sub.zodSchema),
        description: `z.promise(${sub.description})`,
      };
      break;
    }
    case "record": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: sub.contextDescription,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullableZodSchema(z.record(z.string(), sub.zodSchema),element.optional,element.nullable),
        description: optionalNullableZodDescription(`z.record(z.string(),${sub.description})`, element.optional, element.nullable),
      };
    }
    case "schemaReference": {
      jzodReferenceSchema.parse(element);
      const resolveReference = z.lazy(
        () => {
          /**
           *  issue with zod-to-ts: specifying a TS AST generation function induces a call to the lazy function!! :-(
           * this call is avoided in this case, but this means Zod schemas used to generate typescript types must
           * not be used for validation purposes, please perform separate generations to accomodate both cases.
           */
          if (typeScriptReferenceConverter) {
            //
            return z.any();
          } else {
            const relativeReferences = getSchemaRelativeReferences();
            const absoluteReferences = getAbsoluteReferences();

            // console.log(
            //   "########## jzodElementSchemaToZodSchemaAndDescription converting schemaReference absolute path",
            //   element.definition.absolutePath,
            //   Object.keys(absoluteReferences),
            //   "relativePath",
            //   element.definition.relativePath,
            //   Object.keys(relativeReferences)
            // );

            // console.log("parsing schemaReference relativeReferences",Object.keys(relativeReferences));
            const relativePath: string | undefined = element.definition.relativePath;
            let targetObject: any;
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
                const result = optionalNullableZodSchema(targetObject[relativePath].zodSchema,element.optional,element.nullable);
                // console.log("converting schemaReference relative path",name,"result",JSON.stringify(result));

                return result;
              } else {
                throw new Error(
                  "when converting Jzod to Zod, could not find relative reference " +
                    element.definition.relativePath +
                    " in " +
                    Object.keys(relativeReferences)
                );
              }
            } else {
              return targetObject;
            }
          }
        }
      );
      return {
        contextDescription: undefined, // references do not expose the context of referenced JzodElement
        contextZodSchema: undefined,
        zodSchema: typeScriptReferenceConverter
          ? typeScriptReferenceConverter(resolveReference, element.definition.relativePath)
          : resolveReference,
        description: optionalNullableZodDescription(`z.lazy(() =>${element.definition.relativePath})`,element.optional, element.nullable),
      };
      break;
    }
    case "set": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        // name,
        element.definition,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: sub.contextDescription,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: optionalNullableZodSchema(z.set(sub.zodSchema),element.optional,element.nullable),
        description: optionalNullableZodDescription(`z.set(${sub.description})`,element.optional,element.nullable),
      };
      break;
    }
    case "simpleType": {
      const castElement = element as JzodAttributeStringWithValidations;
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
        const description =
          (castElement.validations
            ? castElement.validations.reduce(
                (acc, curr) => acc + "." + curr.type + (curr.parameter ? "(" + curr.parameter + ")" : "()"),
                `z.${element.definition}()`
              )
            : `z.${element.definition}()`) + (element.optional ? `.optional()` : ``) + (element.nullable ? `.nullable()` : ``);
        return { contextDescription: undefined, contextZodSchema: undefined, zodSchema, description };
      } else {
        return {
          contextDescription: undefined,
          contextZodSchema: undefined,
          zodSchema: optionalNullableZodSchema((z as any)[element.definition](),element.optional,element.nullable),
          description: optionalNullableZodDescription(`z.${element.definition}()`, element.optional, element.nullable),
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
            getSchemaRelativeReferences,
            getAbsoluteReferences,
            typeScriptReferenceConverter
          )
        );
  
        return {
          contextZodSchema: subs.reduce((acc,curr)=>({...acc,...curr.contextDescription}),{}),
          contextDescription: subs.reduce((acc,curr)=>({...acc,...curr.contextZodSchema}),{}),
          zodSchema: optionalNullableZodSchema(z.tuple([...subs.map(s=>s.zodSchema)] as any),element.optional,element.nullable),
          description: optionalNullableZodDescription(`z.tuple(${JSON.stringify([...subs.map(s=>s.description)])} as any)`, element.optional, element.nullable),
        };
      } else {
        return {
          // contextDescription: {},
          // contextZodSchema: {},
          zodSchema: z.any(),
          description: `z.any()`,
        };
      }
      break;
    }
    case "union": {
      const sub: ZodSchemaAndDescription<ZodTypeAny>[] = (element as JzodUnion).definition.map((e) =>
        jzodElementSchemaToZodSchemaAndDescription(
          // name,
          e,
          getSchemaRelativeReferences,
          getAbsoluteReferences,
          typeScriptReferenceConverter
        )
      );
      return {
        contextDescription: Object.fromEntries(
          sub.reduce(
            (acc: [string, string][], curr: ZodSchemaAndDescription<ZodTypeAny>) => [
              ...acc,
              ...(curr.contextDescription ? Object.entries(curr.contextDescription) : []),
            ],
            []
          )
        ),
        contextZodSchema: Object.fromEntries(
          sub.reduce(
            (acc: [string, string][], curr: ZodSchemaAndDescription<ZodTypeAny>) => [
              ...acc,
              ...(curr.contextZodSchema ? Object.entries(curr.contextZodSchema) : []),
            ],
            []
          )
        ),
        /**
         * Zod unions are used instead of discriminated unions even if Jzod schema has a discriminant,
         * because TS types obtained using z.infer lack uniformity, which make them rather unusable in practice:
         * TODO: DESCRIBE PROBLEM!!!
         */

        zodSchema: optionalNullableZodSchema(z.union(sub.map((s) => s.zodSchema) as any), element.optional, element.nullable),
        description: optionalNullableZodDescription(`z.union(${objectToJsStringArray(sub.map((s) => s.description))})`, element.optional, element.nullable),
      };
      break;
    }
    default:
      throw new Error(
        "jzodElementSchemaToZodSchemaAndDescription could not convert given json Zod schema, unknown type:" +
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

// ##############################################################################################################
export function _zodToJsonSchema(
  referentialSet: ZodSchemaAndDescriptionRecord<ZodTypeAny>,
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
