import { ZodTypeAny } from "zod";


import { JzodReference } from "@miroir-framework/jzod-ts";


export interface ZodSchemaAndDescription {
  contextZodSchema?: { [k: string]: ZodTypeAny }, 
  contextZodText?: { [k: string]: string }
  zodSchema: ZodTypeAny, 
  zodText:string
};

export type ZodSchemaAndDescriptionRecord = { [k: string]: ZodSchemaAndDescription };


// ##############################################################################################################
// ##############################################################################################################
// ##############################################################################################################
// ##############################################################################################################
export const jzodBootstrapElementSchema: JzodReference = {
  type: "schemaReference",
  context: {
    jzodBaseObject: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
      },
    },
    jzodArray: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "array" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
      },
    },
    jzodAttribute: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "simpleType" },
        coerce: { type: "simpleType", definition: "boolean", optional: true },
        definition: { type: "schemaReference", definition: { relativePath: "jzodEnumAttributeTypes" } },
      },
    },
    jzodAttributeDateValidations: {
      type: "object",
      definition: {
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: {
          type: "enum",
          definition: ["min", "max"],
        },
        parameter: { type: "simpleType", definition: "any" },
      },
    },
    jzodAttributeDateWithValidations: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "simpleType" },
        definition: { type: "literal", definition: "date" },
        coerce: { type: "simpleType", definition: "boolean", optional: true },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeDateValidations" } },
        },
      },
    },
    jzodAttributeNumberValidations: {
      type: "object",
      definition: {
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: {
          type: "enum",
          definition: [
            "gt",
            "gte",
            "lt",
            "lte",
            "int",
            "positive",
            "nonpositive",
            "negative",
            "nonnegative",
            "multipleOf",
            "finite",
            "safe",
          ],
        },
        parameter: { type: "simpleType", definition: "any" },
      },
    },
    jzodAttributeNumberWithValidations: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "simpleType" },
        definition: { type: "literal", definition: "number" },
        coerce: { type: "simpleType", definition: "boolean", optional: true },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeNumberValidations" } },
        },
      },
    },
    jzodAttributeStringValidations: {
      type: "object",
      definition: {
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: {
          type: "enum",
          definition: [
            "max",
            "min",
            "length",
            "email",
            "url",
            "emoji",
            "uuid",
            "cuid",
            "cuid2",
            "ulid",
            "regex",
            "includes",
            "startsWith",
            "endsWith",
            "datetime",
            "ip",
          ],
        },
        parameter: { type: "simpleType", definition: "any" },
      },
    },
    jzodAttributeStringWithValidations: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "simpleType" },
        definition: { type: "literal", definition: "string" },
        coerce: { type: "simpleType", definition: "boolean", optional: true },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeStringValidations" } },
        },
      },
    },
    jzodElement: {
      type: "union",
      discriminator: "type",
      definition: [
        { type: "schemaReference", definition: { relativePath: "jzodArray" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttribute" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributeDateWithValidations" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributeNumberWithValidations" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributeStringWithValidations" } },
        { type: "schemaReference", definition: { relativePath: "jzodEnum" } },
        { type: "schemaReference", definition: { relativePath: "jzodFunction" } },
        { type: "schemaReference", definition: { relativePath: "jzodLazy" } },
        { type: "schemaReference", definition: { relativePath: "jzodLiteral" } },
        { type: "schemaReference", definition: { relativePath: "jzodIntersection" } },
        { type: "schemaReference", definition: { relativePath: "jzodMap" } },
        { type: "schemaReference", definition: { relativePath: "jzodObject" } },
        { type: "schemaReference", definition: { relativePath: "jzodPromise" } },
        { type: "schemaReference", definition: { relativePath: "jzodRecord" } },
        { type: "schemaReference", definition: { relativePath: "jzodReference" } },
        { type: "schemaReference", definition: { relativePath: "jzodSet" } },
        { type: "schemaReference", definition: { relativePath: "jzodTuple" } },
        { type: "schemaReference", definition: { relativePath: "jzodUnion" } },
      ],
    },
    jzodEnum: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "enum" },
        definition: { type: "array", definition: { type: "simpleType", definition: "string" } },
      },
    },
    jzodEnumAttributeTypes: {
      type: "enum",
      definition: [
        "any",
        "bigint",
        "boolean",
        "date",
        "never",
        "null",
        "number",
        "string",
        "uuid",
        "undefined",
        "unknown",
        "void",
      ],
    },
    jzodEnumElementTypes: {
      type: "enum",
      definition: [
        "array",
        "enum",
        "function",
        "lazy",
        "literal",
        "intersection",
        "map",
        "object",
        "promise",
        "record",
        "schemaReference",
        "set",
        "simpleType",
        "tuple",
        "union",
      ],
    },
    jzodFunction: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "function" },
        definition: {
          type: "object",
          definition: {
            args: {
              type: "array",
              definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
            },
            returns: { type: "schemaReference", definition: { relativePath: "jzodElement" }, optional: true },
          },
        },
      },
    },
    jzodLazy: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "lazy" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodFunction" } },
      },
    },
    jzodLiteral: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "literal" },
        definition: {
          "type": "union",
          "definition": [
            { type: "simpleType", definition: "string" },
            { type: "simpleType", definition: "number" },
            { type: "simpleType", definition: "bigint" },
            { type: "simpleType", definition: "boolean" },
          ]
        }
      },
    },
    jzodIntersection: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "intersection" },
        definition: {
          type: "object",
          definition: {
            left: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
            right: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
          },
        },
      },
    },
    jzodMap: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "map" },
        definition: {
          type: "tuple",
          definition: [
            { type: "schemaReference", definition: { relativePath: "jzodElement" } },
            { type: "schemaReference", definition: { relativePath: "jzodElement" } },
          ],
        },
      },
    },
    jzodObject: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        extend: {
          type: "union",
          optional: true,
          definition: [
            { type: "schemaReference", definition: { relativePath: "jzodReference" } },
            { type: "schemaReference", definition: { relativePath: "jzodObject" } },
          ],
        },
        type: { type: "literal", definition: "object" },
        nonStrict: { type: "simpleType", definition: "boolean", optional: true },
        partial: { type: "simpleType", definition: "boolean", optional: true },
        definition: {
          type: "record",
          definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
        },
      },
    },
    jzodPromise: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "promise" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
      },
    },
    jzodRecord: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "record" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
      },
    },
    jzodReference: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "schemaReference" },
        context: {
          type: "record",
          optional: true,
          definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
        },
        definition: {
          type: "object",
          definition: {
            eager: { type: "simpleType", definition: "boolean", optional: true },
            partial: { type: "simpleType", definition: "boolean", optional: true },
            relativePath: { type: "simpleType", definition: "string", optional: true },
            absolutePath: { type: "simpleType", definition: "string", optional: true }, // absolutePath => lazy evaluation
          },
        },
      },
    },
    jzodSet: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "set" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
      },
    },
    jzodTuple: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "tuple" },
        definition: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
        },
      },
    },
    jzodUnion: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "union" },
        discriminator: { type: "simpleType", definition: "string", optional: true },
        definition: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodElement" } },
        },
      },
    },
  },
  definition: { relativePath: "jzodElement" },
};

// ################################################################################################
// ################################################################################################
export {
  jzodObject,
  jzodArray,
  jzodAttribute,
  jzodAttributeDateValidations,
  jzodAttributeDateWithValidations,
  jzodAttributeNumberValidations,
  jzodAttributeNumberWithValidations,
  jzodAttributeStringValidations,
  jzodAttributeStringWithValidations,
  jzodElement,
  jzodEnum,
  jzodEnumAttributeTypes,
  jzodEnumElementTypes,
  jzodFunction,
  jzodIntersection,
  jzodLazy,
  jzodLiteral,
  jzodMap,
  jzodPromise,
  jzodRecord,
  jzodReference,
  jzodSet,
  jzodTuple,
  jzodUnion,
} from "@miroir-framework/jzod-ts";