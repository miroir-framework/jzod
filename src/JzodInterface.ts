import { ZodTypeAny } from "zod";


import { JzodElement } from "@miroir-framework/jzod-ts";


export interface ZodSchemaAndDescription<T extends ZodTypeAny> {
  contextZodSchema?:{[k:string]:T}, 
  contextZodText?:{[k:string]:string}
  zodSchema:T, 
  zodText:string
};

export type ZodSchemaAndDescriptionRecord<T extends ZodTypeAny> = {[k:string]:ZodSchemaAndDescription<T>};


// ##############################################################################################################
// ##############################################################################################################
// ##############################################################################################################
// ##############################################################################################################
export const jzodBootstrapElementSchema: JzodElement = {
  type: "schemaReference",
  context: {
    jzodArraySchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "array" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
      },
    },
    jzodAttributeSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "simpleType" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodEnumAttributeTypesSchema" } },
      },
    },
    jzodAttributeDateValidationsSchema: {
      type: "object",
      definition: {
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: {
          type: "enum",
          definition: [
            "min",
            "max",
          ],
        },
        parameter: { type: "simpleType", definition: "any" },
      },
    },
    jzodAttributeDateWithValidationsSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "simpleType" },
        definition: { type: "literal", definition: "date" },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeDateValidationsSchema" } },
        },
      },
    },
    jzodAttributeNumberValidationsSchema: {
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
    jzodAttributeNumberWithValidationsSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "simpleType" },
        definition: { type: "literal", definition: "number" },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeNumberValidationsSchema" } },
        },
      },
    },
    jzodAttributeStringValidationsSchema: {
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
    jzodAttributeStringWithValidationsSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "simpleType" },
        definition: { type: "literal", definition: "string" },
        validations: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeStringValidationsSchema" } },
        },
      },
    },
    jzodElementSchema: {
      type: "union",
      discriminator: "type",
      definition: [
        { type: "schemaReference", definition: { relativePath: "jzodArraySchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributeSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributeDateWithValidationsSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributeNumberWithValidationsSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodAttributeStringWithValidationsSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodEnumSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodFunctionSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodLazySchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodLiteralSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodIntersectionSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodMapSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodObjectSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodPromiseSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodRecordSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodReferenceSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodSetSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodTupleSchema" } },
        { type: "schemaReference", definition: { relativePath: "jzodUnionSchema" } },
      ],
    },
    // jzodElementSetSchema: {
    //   type: "record",
    //   definition: {
    //     type: "schemaReference",
    //     definition: { relativePath: "jzodElementSchema" },
    //   },
    // },
    jzodEnumSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "enum" },
        definition: { type: "array", definition: { type: "simpleType", definition: "string" } },
      },
    },
    jzodEnumAttributeTypesSchema: {
      type: "enum",
      definition: ["any", "bigint", "boolean", "date", "never", "null", "number", "string", "uuid", "undefined", "unknown", "void"],
    },
    jzodEnumElementTypesSchema: {
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
    jzodFunctionSchema: {
      type: "object",
      definition: {
        type: { type: "literal", definition: "function" },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        definition: {
          type: "object",
          definition: {
            args: {
              type: "array",
              definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
            },
            returns: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" }, optional: true },
          },
        },
      },
    },
    jzodLazySchema: {
      type: "object",
      definition: {
        type: { type: "literal", definition: "lazy" },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        definition: { type: "schemaReference", definition: { relativePath: "jzodFunctionSchema" } },
      },
    },
    jzodLiteralSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "literal" },
        definition: { type: "simpleType", definition: "string" },
      },
    },
    jzodIntersectionSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "intersection" },
        definition: { 
          type: "object", 
          definition: { 
            left: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } }, 
            right: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } } 
          },
        }
      },
    },
    jzodMapSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "map" },
        definition: { 
          type: "tuple",
          definition: [{ type: "schemaReference", definition: { relativePath: "jzodElementSchema" } }, { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } }] },
      },
    },
    jzodObjectSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "object" },
        // context: {
        //   type: "record",
        //   optional: true,
        //   definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
        // },
        definition: {
          type: "record",
          definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
        },
      },
    },
    jzodPromiseSchema: {
      type: "object",
      definition: {
        // optional: { type: "simpleType", definition: "boolean", optional: true },
        // nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "promise" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
      },
    },
    jzodRecordSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "record" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
      },
    },
    jzodReferenceSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "schemaReference" },
        context: {
          type: "record",
          optional: true,
          definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
        },
        definition: {
          type: "object",
          definition: {
            relativePath: { type: "simpleType", definition: "string", optional: true },
            absolutePath: { type: "simpleType", definition: "string", optional: true },
          },
        },
      },
    },
    jzodSetSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "set" },
        definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
      },
    },
    jzodTupleSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "tuple" },
        definition: { type: "array", definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } } },
      },
    },
    jzodUnionSchema: {
      type: "object",
      definition: {
        optional: { type: "simpleType", definition: "boolean", optional: true },
        nullable: { type: "simpleType", definition: "boolean", optional: true },
        extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
        type: { type: "literal", definition: "union" },
        discriminator: { type: "simpleType", definition: "string", optional: true },
        definition: {
          type: "array",
          definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
        },
      },
    },
  },
  definition: { relativePath: "jzodElementSchema" }
};
