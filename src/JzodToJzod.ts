import { JzodElement, JzodObject, JzodReference, JzodUnion } from "@miroir-framework/jzod-ts";

export type ResolutionFunction = (schema: JzodReference) => JzodElement | undefined;

// function forgeIdFromReference(r:JzodReference) {
export function forgeCarryOnReferenceName(absolutePath: string, relativePath:string | undefined, suffix?: string) {
  return "carryOn_" + absolutePath?.replace(/-/g,"$") + "_" + relativePath + (suffix?"_" + suffix:"")
}

export function applyCarryOnSchema(
  baseSchema: JzodElement,
  // carryOnSchema: JzodObject | JzodUnion,
  carryOnSchema: JzodElement,
  localReferencePrefix?: string | undefined,
  resolveJzodReference?: ResolutionFunction, // non-converted reference lookup
  // eagerJzodSchemas?: Record<string, JzodElement>, // non-converted reference lookup
  convertedReferences?: Record<string, JzodElement>, // converted reference lookup
): { resultSchema: JzodElement; resolvedReferences?: Record<string, JzodElement> } {
  return applyCarryOnSchemaOnLevel(
    baseSchema,
    carryOnSchema,
    true, // applyOnFirstLevel,
    localReferencePrefix,
    resolveJzodReference,
    convertedReferences
  );
}

/**
 * returns transformed @param baseSchema so that any node within the schema can be replaced
 * with @param carryOnSchema. 
 * It returns also a new environment where the references found in the returned result can
 * be resolved. This is required because schemas referenced in @param baseSchema have to be
 * tranformed to take @param carryOnSchema into account also.
 * 
 * It pushes internal reference resolution to the top level.
 * 
 * only eager references are allowed in @param baseSchema
 * This function resolves / converts each found reference at most 1 time.
 * 
 * @param baseSchema 
 * @param carryOnSchema 
 * @param applyOnFirstLevel if true, the result is a union of the baseSchema and the carryOnSchema
 * @param resolveJzodReference the reference resolution function. Corollary: the definition of absolute references must be known at carryOn-application time.
 * @returns transformed @param baseSchema joined with @param carryOnSchema
 */
export function applyCarryOnSchemaOnLevel(
  baseSchema: JzodElement,
  // carryOnSchema: JzodObject | JzodUnion,
  carryOnSchema: JzodElement,
  applyOnFirstLevel: boolean,
  localReferencePrefix?: string | undefined,
  resolveJzodReference?: ResolutionFunction, // non-converted reference lookup
  // eagerJzodSchemas?: Record<string, JzodElement>, // non-converted reference lookup
  convertedReferences?: Record<string, JzodElement>, // converted reference lookup
): { resultSchema: JzodElement; resolvedReferences?: Record<string, JzodElement> } {
// ): { resultSchema: JzodUnion | JzodReference; resolvedReferences?: Record<string, JzodElement> } {
  // const convertedExtra = baseSchema.extra
  /**
   * jzodBaseObject.extra is {type: "any"} by default but can be subtyped to any concrete type
   * and shall then be applied the carryOn type
   * jzodBaseObject.extra is only indirectly taken into account during the translation to Zod,
   * through inheritance of jzodBaseObject. It is then viewed as any JzodObject attribute.
   * 
   * But jzodBaseObject.extra presents a specific problem when applying a carryOn schema.
   * jzodBaseObject.extra gives the concrete type for the extra attribute of a JzodElement
   * there is no attribute giving the metatype of the jzodBaseObject.extra attribute, which is JzodElement
   * this metaExtra attribute shall be interpreted and replaced by the concrete extra attribute during
   * the translation to Zod / TS. (???)
   * 
   * 
   */
  
  // const convertedExtra: JzodElement | undefined = baseSchema.extra
  //   ? applyCarryOnSchema(
  //       baseSchema.extra, // hard-coded type for jzodBaseSchema.extra is "any", it is replaced in any "concrete" jzodSchema definition 
  //       carryOnSchema,
  //       localReferencePrefix,
  //       resolveJzodReference,
  //       convertedReferences
  //     ).resultSchema // TODO: what about resolvedReferences for extra? They are ignored, is it about right?
  //   : undefined;


  // const convertedTag = baseSchema.tag;
  const convertedTag = baseSchema.tag && baseSchema.tag.schema && baseSchema.tag.schema.valueSchema
    ? {
      ...baseSchema.tag,
      schema: {
        ...baseSchema.tag.schema,
        valueSchema: applyCarryOnSchemaOnLevel(
          baseSchema.tag.schema.valueSchema, // hard-coded type for jzodBaseSchema.extra is "any", it is replaced in any "concrete" jzodSchema definition 
          carryOnSchema,
          false, // applyOnFirstLevel
          localReferencePrefix,
          resolveJzodReference,
          convertedReferences
        ).resultSchema
      }
    } // TODO: what about resolvedReferences for extra? They are ignored, is it about right?
    : baseSchema.tag;

  // if (baseSchema.tag && baseSchema.tag.schema && baseSchema.tag.schema.valueSchema) {
  //   console.log("############# applyCarryOnSchema", "convertedTag", convertedTag)
  // }

  switch (baseSchema.type) {
    case "any":
    case "bigint":
    case "boolean":
    case "date":
    case "enum":
    case "literal":
    case "map": // TODO!!!
    case "never":
    case "null":
    case "number":
    case "string":
    case "uuid":
    case "unknown":
    case "void":
    case "undefined": {
      return {
        resultSchema: applyOnFirstLevel
          ? {
              ...baseSchema,
              tag: convertedTag,
              type: "union",
              definition: [baseSchema, carryOnSchema],
            }
          : baseSchema,
      };
      break;
    }
    case "record": {
      // const convertedSubSchemas: JzodElement[] = [];
      const convertedSubSchemasReferences: Record<string, JzodElement> = {};
      const convertedSubSchema = applyCarryOnSchemaOnLevel(
        baseSchema.definition,
        carryOnSchema,
        // false, // applyOnFirstLevel
        true, // applyOnFirstLevel
        localReferencePrefix,
        resolveJzodReference,
        convertedReferences
      );
      for (const c of Object.entries(convertedSubSchema.resolvedReferences ?? {})) {
        convertedSubSchemasReferences[c[0]] = c[1];
      }
      let result;
      if (applyOnFirstLevel) {
        return {
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            type: "union",
            definition: [
              {
                ...baseSchema,
                tag: convertedTag,
                type: "record",
                definition: convertedSubSchema.resultSchema,
              },
              carryOnSchema,
            ],
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      } else {
        return {
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            type: "record",
            definition: convertedSubSchema.resultSchema,
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      }
      break;
    }
    case "set": {
      // const convertedSubSchemas: JzodElement[] = [];
      const convertedSubSchemasReferences: Record<string, JzodElement> = {};
      const convertedSubSchema = applyCarryOnSchemaOnLevel(
        baseSchema.definition,
        carryOnSchema,
        // false, // applyOnFirstLevel
        true, // applyOnFirstLevel
        localReferencePrefix,
        resolveJzodReference,
        convertedReferences
      );
      for (const c of Object.entries(convertedSubSchema.resolvedReferences ?? {})) {
        convertedSubSchemasReferences[c[0]] = c[1];
      }
      let result;
      if (applyOnFirstLevel) {
        return {
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            type: "union",
            definition: [
              {
                ...baseSchema,
                tag: convertedTag,
                type: "set",
                definition: convertedSubSchema.resultSchema,
              },
              carryOnSchema,
            ],
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      } else {
        return {
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            type: "set",
            definition: convertedSubSchema.resultSchema,
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      }
      break;
    }
    case "array": {
      // const convertedSubSchemas: JzodElement[] = [];
      const convertedSubSchemasReferences: Record<string, JzodElement> = {};
      const convertedSubSchema = applyCarryOnSchemaOnLevel(
        baseSchema.definition,
        carryOnSchema,
        // false, // applyOnFirstLevel
        true, // applyOnFirstLevel
        localReferencePrefix,
        resolveJzodReference,
        convertedReferences
      );
      for (const c of Object.entries(convertedSubSchema.resolvedReferences ?? {})) {
        convertedSubSchemasReferences[c[0]] = c[1];
      }
      let result;
      if (applyOnFirstLevel) {
        return {
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            type: "union",
            definition: [
              {
                ...baseSchema,
                tag: convertedTag,
                type: "array",
                definition: convertedSubSchema.resultSchema,
              },
              carryOnSchema,
            ],
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      } else {
        return {
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            type: "array",
            definition: convertedSubSchema.resultSchema,
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      }
      break;
    }
    case "tuple": {
      const convertedSubSchemas: JzodElement[] = [];
      const convertedSubSchemasReferences: Record<string, JzodElement> = {};
      for (const subSchema of baseSchema.definition) {
        const convertedSubSchema = applyCarryOnSchemaOnLevel(
          subSchema,
          carryOnSchema,
          true, //applyOnFirstLevel
          localReferencePrefix,
          resolveJzodReference,
          {
            ...convertedReferences,
            ...convertedSubSchemasReferences,
          }
        );
        convertedSubSchemas.push(convertedSubSchema.resultSchema);
        for (const c of Object.entries(convertedSubSchema.resolvedReferences ?? {})) {
          convertedSubSchemasReferences[c[0]] = c[1];
        }
      }
      if (applyOnFirstLevel) {
        return {
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            type: "union",
            definition: [
              {
                ...baseSchema,
                tag: convertedTag,
                definition: convertedSubSchemas,
              },
              carryOnSchema,
              // {

              //   resolvedReferences: convertedSubSchemasReferences
              // }
            ],
          },
        };
      } else {
        return {
          // returns a tuple
          resultSchema: {
            ...baseSchema,
            tag: convertedTag,
            // type: "tuple",
            definition: convertedSubSchemas,
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      }
      break;
    }
    case "union": {
      // TODO: accumulate returned environment into unique object
      const subConvertedSchemas = baseSchema.definition.map((e) =>
        applyCarryOnSchemaOnLevel(
          e,
          carryOnSchema,
          false, // applyOnFirstLevel, no need to apply since result is a union, and carryOnSchema is added to union (array) definition
          // true, // applyOnFirstLevel, recursive conversion is needed, although carryOnSchema is added to union (array) definition itself
          localReferencePrefix,
          resolveJzodReference,
          convertedReferences
        )
      );
      const newResolvedReferences = subConvertedSchemas.filter((e) => e.resolvedReferences);
      const references = newResolvedReferences
        ? Object.fromEntries(newResolvedReferences.flatMap((e) => Object.entries(e.resolvedReferences ?? {})))
        : undefined;
      return {
        resultSchema: {
          ...baseSchema,
          tag: convertedTag,
          type: "union",
          definition: [...subConvertedSchemas.map((e) => e.resultSchema), carryOnSchema],
          // definition: [...baseSchema.definition, carryOnSchema],
        },
        resolvedReferences: references,
      };
      break;
    }
    case "object": {
      const convertedSubSchemas: Record<string, JzodElement> = {};
      const convertedSubSchemasReferences: Record<string, JzodElement> = {};
      for (const subSchema of Object.entries(baseSchema.definition)) {
        // console.log("SubSchema", subSchema[0], JSON.stringify(subSchema, null, 2));
        const convertedSubSchema = applyCarryOnSchemaOnLevel(
          subSchema[1],
          carryOnSchema,
          true,
          localReferencePrefix,
          resolveJzodReference,
          { ...convertedReferences, ...convertedSubSchemasReferences }
        );
        convertedSubSchemas[subSchema[0]] = convertedSubSchema.resultSchema;
        // console.log("convertedSubSchema", subSchema[0], JSON.stringify(convertedSubSchema.resultSchema, null, 2));
        for (const c of Object.entries(convertedSubSchema.resolvedReferences ?? {})) {
          convertedSubSchemasReferences[c[0]] = c[1];
        }
      }
      // console.log("convertedSubSchemasReferences", JSON.stringify(convertedSubSchemasReferences, null, 2));
      // console.log("convertedSubSchemas", JSON.stringify(convertedSubSchemas, null, 2));
      const convertedExtend =
        baseSchema.extend && baseSchema.extend.type == "schemaReference"
          ? {
              ...baseSchema.extend,
              definition: {
                eager: baseSchema.extend.definition.eager,
                relativePath:
                  baseSchema.extend.definition.absolutePath && baseSchema.extend.definition.relativePath
                    ? forgeCarryOnReferenceName(
                        baseSchema.extend.definition.absolutePath,
                        baseSchema.extend.definition.relativePath,
                        "extend"
                      )
                    : baseSchema.extend.definition.relativePath,
              },
            }
          : baseSchema.extend; // TODO: apply carryOn object
      if (applyOnFirstLevel) {
        return {
          resultSchema: {
            // ...baseSchema,
            optional: baseSchema.optional,
            nullable: baseSchema.nullable,
            extra: baseSchema.extra,
            tag: convertedTag,
            type: "union",
            definition: [
              carryOnSchema,
              {
                type: "object",
                // extend: baseSchema.extend,
                extend: convertedExtend as any,
                extra: baseSchema.extra,
                tag: convertedTag,
                definition: convertedSubSchemas,
              },
            ],
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      } else {
        return {
          resultSchema: {
            ...baseSchema,
            optional: baseSchema.optional,
            nullable: baseSchema.nullable,
            extra: baseSchema.extra,
            tag: convertedTag,
            extend: convertedExtend as any,
            definition: convertedSubSchemas,
          },
          resolvedReferences: convertedSubSchemasReferences,
        };
      }
      break;
    }
    case "schemaReference": {
      // if absolute reference, resolve (eager) and add to local context after running carryOnType on it
      // reference resolution is necessarily lazy, because only the name ofr the reference is used for now
      const convertedContextSubSchemas: Record<string, JzodElement> = {};
      const convertedContextSubSchemasReferences: Record<string, JzodElement> = {};
      const convertedAbosulteReferences: Record<string, JzodElement> = {};
      let resultReferenceDefinition = undefined;
      // resolve absolute definitions?
      // resolve relative definitions?
      // use resolution function instead?
      /**
       * absolute references have to be converted for carryOn, then enclosed and pushed-up as a local context reference/definition.
       * this creates a new local reference/context, and the absolute reference has to be replaced by a local reference.
       * Absolute references shall be first sought in relative reference set, to be replaced by their local counterpart.
       * What about name clashes? concatenate absolute-relative parts of name as a new name?
       * relative references of converted absolute references must be referred to by their CONVERTED reference name!
       *
       */
      if (baseSchema.definition.absolutePath) {
        // lookup a locally-defined converted version of the reference
        const localReferenceName = forgeCarryOnReferenceName(
          baseSchema.definition.absolutePath,
          baseSchema.definition.relativePath
        );

        if (!convertedReferences || !convertedReferences[localReferenceName]) {
          // absolute reference must be converted
          // we must lookup for the reference definition
          if (!resolveJzodReference) {
            throw new Error(
              "applyCarryOnSchema was not provided a resolveJzodReference function, but a reference with absolutePath was found " +
                JSON.stringify(baseSchema.definition)
            );
          }
          const resolvedReference = resolveJzodReference(baseSchema);
          if (!resolvedReference) {
            throw new Error(
              "applyCarryOnSchema no value corresponding to absolute reference for resolveJzodReference: " +
                JSON.stringify(baseSchema.definition)
            );
          }
          const convertedReference = applyCarryOnSchemaOnLevel(
            resolvedReference,
            carryOnSchema,
            true, // applyOnFirstLevel
            baseSchema.definition.absolutePath,
            resolveJzodReference,
            {
              ...convertedReferences,
              [localReferenceName]: { type: "never" },
            }
          );
          convertedAbosulteReferences[localReferenceName] = convertedReference.resultSchema; // what about local references of absolute references?
          resultReferenceDefinition = {
            relativePath: localReferenceName,
          };
        }
        else {
          // localReferenceName already exists in convertedReferences, it can be referencesd without further conversion
          resultReferenceDefinition = {
            relativePath: localReferenceName,
          };
          // throw new Error("applyCarryOnSchema could not find absolute reference " + baseSchema.definition.absolutePath + " in ");
        }

        // if reference is found in @param convertedReference, it has already been converted or is being converted right now (in the case of a recursive reference)
      } else {
        // we only need to replace it with a renamed local reference in case we have a prefix
        resultReferenceDefinition = {
          ...baseSchema.definition,
          relativePath: localReferencePrefix
            ? forgeCarryOnReferenceName(localReferencePrefix, baseSchema.definition.relativePath)
            : baseSchema.definition.relativePath,
        };
      }
      // throw error if reference definition is not found
      // do we check for integrity of relative references? We do not need to resolve it now!!
      // relative reference names are already defined, with a known definition, in baseSchema! they can be found in convertedReferences... but is it useful?
      // if the type is consistent, relative references are converted as part of the conversion process (they are in the context of one of the englobing references)

      // treating context
      for (const contextSubSchema of Object.entries(baseSchema.context ?? {})) {
        const convertedSubSchema = applyCarryOnSchemaOnLevel(
          contextSubSchema[1],
          carryOnSchema,
          // false, // applyOnFirstLevel
          true, // applyOnFirstLevel
          localReferencePrefix,
          resolveJzodReference,
          {
            ...convertedReferences,
            ...convertedContextSubSchemasReferences,
            [contextSubSchema[0]]: { type: "never" },
          }
        );
        convertedContextSubSchemas[contextSubSchema[0]] = convertedSubSchema.resultSchema;
        for (const c of Object.entries(convertedSubSchema.resolvedReferences ?? {})) {
          convertedContextSubSchemasReferences[c[0]] = c[1];
        }
      }

      return {
        resultSchema: {
          // // we have a schemaReference baseSchema, it is replaced by a Union schema
          // optional: baseSchema.optional,
          // nullable: baseSchema.nullable,
          // extra: baseSchema.extra,
          // tag: convertedTag,
          // type: "union",
          // definition: [
          //   {
              ...baseSchema, // keeping all baseSchema attributes (optional, nullable...) including context! TODO: remove context?
              // extra: baseSchema.extra,
              tag: convertedTag,
              context: convertedContextSubSchemas,
              definition: resultReferenceDefinition ? resultReferenceDefinition : baseSchema.definition,
          //   },
          //   carryOnSchema,
          // ],
        },
        resolvedReferences: {
          ...convertedReferences,
          ...convertedAbosulteReferences,
          ...convertedContextSubSchemasReferences,
        },
      };
      break;
    }
    case "intersection":
    // {
    // return {
    //   resultSchema: {
    //     type: "union",
    //     definition: [],
    //   }
    // };
    // break;
    // }
    case "promise":
    case "lazy": // TODO: alter the lazy's returned value to "carryOn" it? (becoming z.lazy(()=>carryOn(baseSchema)))
    case "function":
    default: {
      throw new Error("carryOnType could not handle baseSchema: " + JSON.stringify(baseSchema, null, 2));
      break;
    }
  }
}
