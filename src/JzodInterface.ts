import { ZodTypeAny, union } from "zod";


import { JzodElement, JzodReference } from "@miroir-framework/jzod-ts";


export interface ZodSchemaAndDescription {
  contextZodSchema?: { [k: string]: ZodTypeAny }, 
  contextZodText?: { [k: string]: string }
  jzodSchema?: JzodElement, 
  zodSchema: ZodTypeAny, 
  zodText:string
};

export type ZodSchemaAndDescriptionRecord = { [k: string]: ZodSchemaAndDescription };


// ##############################################################################################################
// ##############################################################################################################
// ##############################################################################################################
// ##############################################################################################################
// export const jzodBootstrapElementSchema: any = {
export const jzodBootstrapElementSchema: JzodReference = {
  type: "schemaReference",
  context: {
    jzodBaseObject: {
      type: "object",
      definition: {
        optional: { type: "boolean", optional: true },
        nullable: { type: "boolean", optional: true },
        extra: { type: "record", definition: { type: "any" }, optional: true },
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
    jzodPlainAttribute: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "schemaReference", definition: { relativePath: "jzodEnumAttributeTypes" } },
        coerce: { type: "boolean", optional: true },
      },
    },
    jzodAttributeDateValidations: {
      type: "object",
      definition: {
        extra: { type: "record", definition: { type: "any" }, optional: true },
        type: {
          type: "enum",
          definition: ["min", "max"],
        },
        parameter: { type: "any" },
      },
    },
    jzodAttributePlainDateWithValidations: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "date" },
        coerce: { type: "boolean", optional: true },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeDateValidations" } },
        },
      },
    },
    jzodAttributeNumberValidations: {
      type: "object",
      definition: {
        extra: { type: "record", definition: { type: "any" }, optional: true },
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
        parameter: { type: "any" },
      },
    },
    jzodAttributePlainNumberWithValidations: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "number" },
        coerce: { type: "boolean", optional: true },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeNumberValidations" } },
        },
      },
    },
    jzodAttributeStringValidations: {
      type: "object",
      definition: {
        extra: { type: "record", definition: { type: "any" }, optional: true },
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
        parameter: { type: "any" },
      },
    },
    jzodAttributePlainStringWithValidations: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "string" },
        coerce: { type: "boolean", optional: true },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeStringValidations" } },
        },
      },
    },
    jzodElement: {
      type: "union",
      discriminator: {
        discriminatorType: "string",
        value: "type",
      },
      definition: [
        { type: "schemaReference", definition: { relativePath: "jzodArray" } },
        { type: "schemaReference", definition: { relativePath: "jzodPlainAttribute" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributePlainDateWithValidations" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributePlainNumberWithValidations" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributePlainStringWithValidations" } },
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
        definition: { type: "array", definition: { type: "string" } },
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
        "date",
        "enum",
        "function",
        "lazy",
        "literal",
        "intersection",
        "map",
        "number",
        "object",
        "promise",
        "record",
        "schemaReference",
        "set",
        "string",
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
        definition: { type: "schemaReference", definition: { relativePath: "jzodReference" } },
      },
    },
    jzodLiteral: {
      type: "object",
      extend: { type: "schemaReference", definition: { eager: true, relativePath: "jzodBaseObject" } },
      definition: {
        type: { type: "literal", definition: "literal" },
        definition: {
          type: "union",
          definition: [{ type: "string" }, { type: "number" }, { type: "bigint" }, { type: "boolean" }],
        },
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
        nonStrict: { type: "boolean", optional: true },
        partial: { type: "boolean", optional: true },
        carryOn: {
          type: "union",
          optional: true,
          definition: [
            {
              type: "schemaReference",
              definition: {
                relativePath: "jzodObject"
              }
            },
            {
              type: "schemaReference",
              definition: {
                relativePath: "jzodUnion"
              }
            },
          ]
        },
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
        carryOn: {
          type: "union",
          optional: true,
          definition: [
            {
              type: "schemaReference",
              definition: {
                relativePath: "jzodObject"
              }
            },
            {
              type: "schemaReference",
              definition: {
                relativePath: "jzodUnion"
              }
            },
          ]
        },
        definition: {
          type: "object",
          definition: {
            eager: { type: "boolean", optional: true },
            partial: { type: "boolean", optional: true },
            relativePath: { type: "string", optional: true },
            absolutePath: { type: "string", optional: true }, // absolutePath => lazy evaluation
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
        discriminator: {
          type: "union",
          optional: true,
          definition: [
            {
              type: "object",
              definition: {
                discriminatorType: {
                  type: "literal",
                  definition: "string",
                },
                value: { type: "string" },
              },
            },
            {
              type: "object",
              definition: {
                discriminatorType: {
                  type: "literal",
                  definition: "array",
                },
                value: {
                  type: "array",
                  definition: {
                    type: "string",
                  },
                },
              },
            },
          ],
        },
        carryOn: {
          optional: true,
          type: "schemaReference",
          definition: {
            relativePath: "jzodObject"
          }
        },
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
  jzodPlainAttribute,
  jzodAttributeDateValidations,
  jzodAttributePlainDateWithValidations,
  jzodAttributeNumberValidations,
  jzodAttributePlainNumberWithValidations,
  jzodAttributeStringValidations,
  jzodAttributePlainStringWithValidations,
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