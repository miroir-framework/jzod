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

export function getTsCodeCorrespondingToZodSchemaAndDescription(
  typeName: string,
  jzodSchemaZodSchemaAndDescription: ZodSchemaAndDescription<ZodTypeAny>
): string {
  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription jzodSchemaZodSchemaAndDescription", JSON.stringify(jzodSchemaZodSchemaAndDescription));

  const schemaName = typeName.replace(/^(.)(.*)$/, (a, b, c) => b.toLowerCase() + c);
  const bodyJsCode = `export const ${schemaName} = ${jzodSchemaZodSchemaAndDescription.description};`;
  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription convertedJsonZodSchema", bodyJsCode);

  const header = `import { ZodType, ZodTypeAny, z } from "zod";`;
  const contextJsCode = jzodSchemaZodSchemaAndDescription.contextDescription
    ? Object.entries(jzodSchemaZodSchemaAndDescription.contextDescription).reduce((acc, curr) => {
        return `${acc}
export const ${curr[0]}=${curr[1]};`;
      }, "")
    : "";

  const contextTsTypesString = jzodSchemaZodSchemaAndDescription.contextZodSchema
    ? Object.entries(jzodSchemaZodSchemaAndDescription.contextZodSchema).reduce((acc, curr) => {
        // console.log("curr", JSON.stringify(curr));
        const tsNode = zodToTs(curr[1], typeName).node;
        const typeAlias = createTypeAlias(tsNode, curr[0]);
        return `${acc}
${printNode(typeAlias)}`;
      }, "")
    : "";

  // const contextTsTypesString = printNode(nodeContexttsTypesString);
  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription contextTsTypesString",contextTsTypesString);

  const tsTypesStringNode = zodToTs(jzodSchemaZodSchemaAndDescription.zodSchema, typeName).node;
  const tsTypesStringTypeAlias = createTypeAlias(tsTypesStringNode, typeName);
  const tsTypesString = printNode(tsTypesStringTypeAlias);

  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription tsTypeString",tsTypesString);

  //   const footer = `
  // export type ${casedtypeName} = z.infer<typeof ${schemaName}ZodSchema>
  // `;

  return `${header}
${contextTsTypesString}
${tsTypesString}
${contextJsCode}
${bodyJsCode}
`;
}

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
      entry[0],
      entry[1],
      () => Object.assign({}, additionalRelativeReferences ? additionalRelativeReferences : {}, result),
      () => (absoluteReferences ? absoluteReferences : {})
    );
  }
  return result;
}

// ######################################################################################################
export function jzodSchemaObjectToZodSchemaAndDescriptionRecord(
  elementSet: JzodObject,
  additionalReferences?: ZodSchemaAndDescriptionRecord<ZodTypeAny>
): ZodSchemaAndDescriptionRecord<ZodTypeAny> {
  console.log("jzodSchemaObjectToZodSchemaAndDescriptionRecord called", JSON.stringify(elementSet));

  let result: ZodSchemaAndDescriptionRecord<ZodTypeAny> = {};

  for (const entry of Object.entries(elementSet.definition)) {
    /**
     * what about external references: do we have a link to them afer conversion? (likely yes, external references give an interpretation context, like the schema in JSON schemas.)
     */
    result[entry[0]] = jzodElementSchemaToZodSchemaAndDescription(entry[0], entry[1], () =>
      Object.assign({}, additionalReferences, result)
    );
  }
  return result;
}

// ######################################################################################################
export function jzodObjectSchemaToZodSchemaAndDescription(
  jzodObject: JzodObject,
  additionalReferences?: ZodSchemaAndDescriptionRecord<ZodTypeAny>,
  absoluteReferences?: ZodSchemaAndDescriptionRecord<ZodTypeAny>
): ZodSchemaAndDescription<ZodTypeAny> {
  let result: ZodSchemaAndDescriptionRecord<ZodTypeAny> = {};

  for (const entry of Object.entries(jzodObject.definition)) {
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
  // return { zodSchema: z.object(getZodSchemas(result)), description: objectToJsStringObject(getDescriptions(result)) };
  return {
    contextZodSchema: getContextZodSchemas(result),
    contextDescription: getContextDescriptions(result),
    zodSchema: z.object(getZodSchemas(result)),
    description: objectToJsStringVariables(getDescriptions(result)),
  };
}

// ######################################################################################################
export function jzodElementSchemaToZodSchemaAndDescription(
  name: string,
  element: JzodElement,
  getSchemaRelativeReferences: () => ZodSchemaAndDescriptionRecord<ZodTypeAny>,
  getAbsoluteReferences: () => ZodSchemaAndDescriptionRecord<ZodTypeAny> = () => ({}),
  typeScriptReferenceConverter?: (innerReference: ZodTypeAny, relativeReference: string | undefined) => ZodTypeAny
): ZodSchemaAndDescription<ZodTypeAny> {
  // console.log("jzodElementSchemaToZodSchemaAndDescription called",name,"type",element.type);

  switch (element.type) {
    case "array": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        name,
        element.definition,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: sub.contextDescription,
        contextZodSchema: sub.contextZodSchema,
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
          name,
          e[1],
          getSchemaRelativeReferences,
          getAbsoluteReferences,
          typeScriptReferenceConverter
        )
      );
      if (element.definition.returns) {
        const returns = jzodElementSchemaToZodSchemaAndDescription(
          name,
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
    case "literal": {
      return {
        // contextDescription: {},
        // contextZodSchema: {},
        zodSchema: element.optional ? z.literal(element.definition).optional() : z.literal(element.definition),
        description: `z.literal("${element.definition}")${element.optional ? ".optional()" : ""}`,
      };
      break;
    }
    case "lazy": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        name,
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
    case "object": {
      const contextSubObject = element.context
        ? Object.fromEntries(
            Object.entries(element.context).map((a) => [
              a[0],
              jzodElementSchemaToZodSchemaAndDescription(
                name,
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
            name,
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
        zodSchema: element.optional ? z.object(schemas).strict().optional() : z.object(schemas).strict(),
        // description: element.optional?`z.object(${JSON.stringify(descriptions)})`:`z.object(${JSON.stringify(descriptions)}).optional()`
        description: element.optional
          ? `z.object(${objectToJsStringObject(descriptions)}).strict().optional()`
          : `z.object(${objectToJsStringObject(descriptions)}).strict()`,
      };
      break;
    }
    case "record": {
      const sub = jzodElementSchemaToZodSchemaAndDescription(
        name,
        element.definition,
        getSchemaRelativeReferences,
        getAbsoluteReferences,
        typeScriptReferenceConverter
      );
      return {
        contextDescription: sub.contextDescription,
        contextZodSchema: sub.contextZodSchema,
        zodSchema: element.optional
          ? z.record(z.string(), sub.zodSchema).optional()
          : z.record(z.string(), sub.zodSchema),
        description: `z.record(z.string(),${sub.description})${element.optional ? ".optional()" : ""}`,
      };
    }
    case "schemaReference": {
      // console.log("converting element schemaReference to zod schema",JSON.stringify(element));
      // throw an exception if the element does not respect the required format
      jzodReferenceSchema.parse(element);
      const resolveReference = z.lazy(
        // ((optional: boolean) => {
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
                const result = element.optional
                  ? targetObject[relativePath].zodSchema.optional()
                  : targetObject[relativePath].zodSchema;
                // console.log("converting schemaReference relative path",name,"result",JSON.stringify(result));

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
              return targetObject;
            }
          }
        }
      );
      return {
        contextDescription: undefined, // references do not expose the context of referenced JzodElement
        contextZodSchema: undefined,
        // zodSchema: z.lazy(
        //   ((optional: boolean) => {
        //     const relativeReferences = getSchemaRelativeReferences();
        //     const absoluteReferences = getAbsoluteReferences();
        //     console.log(
        //       "########## jzodElementSchemaToZodSchemaAndDescription converting schemaReference absolute path",
        //       element.definition.absolutePath,
        //       Object.keys(absoluteReferences),
        //       "relativePath",
        //       element.definition.relativePath,
        //       Object.keys(relativeReferences)
        //     );

        //     // console.log("parsing schemaReference relativeReferences",Object.keys(relativeReferences));
        //     const relativePath:string | undefined = element.definition.relativePath;
        //     let targetObject:any
        //     if (element.definition.absolutePath) {
        //       targetObject = Object.fromEntries(
        //         Object.entries(
        //           (absoluteReferences[element.definition.absolutePath].zodSchema as AnyZodObject).shape as any
        //         ).map((e: [string, any]) => [e[0], { zodSchema: e[1], description: "" }]) as [string, any][]
        //       );
        //     } else {
        //       targetObject = relativeReferences;
        //     }
        //     // console.log("converting schemaReference relative path targetObject", targetObject, element.relativePath,Object.keys(targetObject),);
        //     if (relativePath) {
        //       if (targetObject[relativePath]) {
        //         const result = withGetType(
        //           // z.lazy(() =>
        //             optional ? targetObject[relativePath].zodSchema.optional() : targetObject[relativePath].zodSchema
        //           // ),
        //           ,
        //           (ts) => ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(relativePath)) // TODO: DO NOT POLLUTE ZOD SCHEMAS WITH ZOD-TO-TS NONSENSE
        //         );
        //         // const result = optional
        //         //   ? targetObject[relativePath].zodSchema.optional()
        //         //   : targetObject[relativePath].zodSchema
        //         // ;
        //         console.log("converting schemaReference relative path",name,"result",JSON.stringify(result));

        //         return result;
        //       } else {
        //         throw new Error(
        //           "when converting optional " +
        //             name +
        //             " could not find relative reference " +
        //             element.definition.relativePath +
        //             " in " +
        //             Object.keys(relativeReferences)
        //         );
        //       }
        //     } else {
        //       return targetObject
        //     }
        //   }).bind(null, element.optional)
        // ),
        zodSchema: typeScriptReferenceConverter
          ? typeScriptReferenceConverter(resolveReference, element.definition.relativePath)
          : resolveReference,
        // withGetType(,(ts) => ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(element.definition.relativePath?element.definition.relativePath:"RELATIVEPATH_NOT_DEFINED"))
        // }),(ts) => ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(element.definition.relativePath?element.definition.relativePath:"RELATIVEPATH_NOT_DEFINED"))
        // }).bind(null, element.optional)),(ts) => ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(element.definition.relativePath?element.definition.relativePath:"RELATIVEPATH_NOT_DEFINED"))
        // ),
        description: `z.lazy(() =>${element.definition.relativePath}` + (element.optional ? ".optional()" : "") + ")",
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
        const zodSchema = element.optional ? zodPreSchema.optional() : zodPreSchema;
        const description =
          (castElement.validations
            ? castElement.validations.reduce(
                (acc, curr) => acc + "." + curr.type + (curr.parameter ? "(" + curr.parameter + ")" : "()"),
                `z.${element.definition}()`
              )
            : `z.${element.definition}()`) + (element.optional ? `.optional()` : ``);
        return { contextDescription: undefined, contextZodSchema: undefined, zodSchema, description };
      } else {
        return {
          contextDescription: undefined,
          contextZodSchema: undefined,
          zodSchema: element.optional ? (z as any)[element.definition]().optional() : (z as any)[element.definition](),
          description: element.optional ? `z.${element.definition}().optional()` : `z.${element.definition}()`,
        };
      }
      break;
    }
    case "union": {
      const sub: ZodSchemaAndDescription<ZodTypeAny>[] = (element as JzodUnion).definition.map((e) =>
        jzodElementSchemaToZodSchemaAndDescription(
          name,
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
