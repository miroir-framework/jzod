import { ZodType, ZodTypeAny, z } from "zod";


export interface ZodSchemaAndDescription {zodSchema:ZodTypeAny, description:string};
export type JzodToZodResult = {[k:string]:ZodSchemaAndDescription};

const jzodRootSchema = z.object({
  optional: z.boolean().optional(),
});
type JzodRoot = z.infer<typeof jzodRootSchema>;

// ##############################################################################################################
export interface JzodArray extends JzodRoot {
  type: 'array',
  definition: JzodElement
}
export const jzodArraySchema: z.ZodType<JzodArray> = z.object({ // issue with JsonSchema conversion when using extend from ZodRootSchema, although the 2 are functionnaly equivalent
  optional: z.boolean().optional(),
  type: z.literal('array'),
  definition: z.lazy(()=>jzodElementSchema)
})


// ##############################################################################################################
export const jzodAttributeStringValidationsSchema = z.object({
  type: z.enum([
    "max", "min", "length", "email", "url", "emoji", "uuid", "cuid", "cuid2", "ulid", "regex", "includes", "startsWith", "endsWith", "datetime", "ip"
  ]),
  parameter: z.any()
})

export type JzodAttributeStringValidations = z.infer<typeof jzodAttributeStringValidationsSchema>;

// ##############################################################################################################
export const jzodAttributeStringWithValidationsSchema = z.object({
  optional: z.boolean().optional(),
  type: z.literal('simpleType'),
  definition: z.literal('string'),
  validations: z.array(jzodAttributeStringValidationsSchema),
})

export type JzodAttributeStringWithValidations = z.infer<typeof jzodAttributeStringWithValidationsSchema>;

// ##############################################################################################################
export const jzodAttributeSchema = z.object({
  optional: z.boolean().optional(),
  type: z.literal('simpleType'),
  definition: z.enum([
    'any',
    'boolean',
    'number',
    'string',
  ])
})

export type JzodAttribute = z.infer<typeof jzodAttributeSchema>;


// ##############################################################################################################
export const jzodEnumSchema = z.object({
  type: z.literal("enum"),
  definition: z.array(z.string()),
})

export type JzodEnum = z.infer<typeof jzodEnumSchema>;

// ##############################################################################################################
export const jzodLiteralSchema = z.object({
  type: z.literal("literal"),
  definition: z.string(),
})

export type JzodLiteral = z.infer<typeof jzodLiteralSchema>;

// ##############################################################################################################
export interface JzodFunction {
  type: "function",
  args: JzodAttribute[],
  returns?: JzodAttribute,
}

export const jzodFunctionSchema = z.object({
  type: z.literal("function"),
  // anyway, arg and returns types are not use upon validation to check the function's interface. Suffices for it to be a function, it is then valid.
  args:z.array(jzodAttributeSchema),
  returns: jzodAttributeSchema.optional(),
})

// ##############################################################################################################
export const jzodLazySchema = z.object({
  type: z.literal("lazy"),
  definition: jzodFunctionSchema,
})

export type JzodLazy = z.infer<typeof jzodLazySchema>;

// ##############################################################################################################
export const jzodReferenceSchema = z.object({ // inheritance from ZodRootSchema leads to a different JsonSchema thus invalidates tests, although it is semantically equivalent
  optional: z.boolean().optional(),
  type: z.literal("schemaReference"),
  definition: z.string()
})

export type JzodReference = z.infer<typeof jzodReferenceSchema>;

// ##############################################################################################################
export interface JzodRecord {
  type: 'record',
  // definition: ZodSimpleElement[],
  definition: JzodElement,
}

export const jzodRecordSchema: z.ZodType<JzodRecord> = z.object({
  type: z.literal('record'),
  definition: z.lazy(()=>jzodElementSchema)
})

// ##############################################################################################################
export type JzodElement =
| JzodArray
| JzodAttribute
| JzodAttributeStringWithValidations
| JzodEnum
| JzodFunction
| JzodLazy
| JzodLiteral
| JzodRecord
| JzodObject
| JzodReference
| JzodUnion
;

export const jzodElementSchema: z.ZodType<JzodElement> = z.union([
  z.lazy(()=>jzodArraySchema),
  z.lazy(()=>jzodAttributeSchema),
  z.lazy(()=>jzodAttributeStringWithValidationsSchema),
  z.lazy(()=>jzodEnumSchema),
  z.lazy(()=>jzodFunctionSchema),
  z.lazy(()=>jzodLazySchema),
  z.lazy(()=>jzodLiteralSchema),
  z.lazy(()=>jzodObjectSchema),
  z.lazy(()=>jzodRecordSchema),
  z.lazy(()=>jzodReferenceSchema),
  z.lazy(()=>jzodUnionSchema),
])

// ##############################################################################################################
export const jzodElementSetSchema = z.record(z.string(),jzodElementSchema);
export type JzodElementSet = z.infer<typeof jzodElementSetSchema>;


  // ##############################################################################################################
export interface JzodUnion {
  type: "union",
  definition: JzodElement[],
}
export const jzodUnionSchema: z.ZodType<JzodUnion> = z.object({
  type: z.literal("union"),
  definition: z.lazy(()=>z.array(jzodElementSchema))
});

// ##############################################################################################################
export interface JzodObject extends JzodRoot {
  type: 'object',
  definition: {[attributeName:string]: JzodElement}
}

export const jzodObjectSchema: z.ZodType<JzodObject> = z.object({
  optional: z.boolean().optional(),
  type: z.literal('object'),
  definition: z.lazy(()=>z.record(z.string(),jzodElementSchema)),
})

// ##############################################################################################################

export const jzodBootstrapSchema: JzodElementSet = {
  JzodArraySchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "array" },
      "definition": { type: "schemaReference", definition: "JzodElementSchema" },
    },
  },
// // ##############################################################################################################
// export const jzodAttributeStringValidationsSchema = z.object({
//   type: z.enum([
//     "max", "min", "length", "email", "url", "emoji", "uuid", "cuid", "cuid2", "ulid", "regex", "includes", "startsWith", "endsWith", "datetime", "ip"
//   ]),
//   parameter: z.any()
// })

// export type JzodAttributeStringValidations = z.infer<typeof jzodAttributeStringValidationsSchema>;

// // ##############################################################################################################
// export const jzodAttributeStringSchema = z.object({
//   optional: z.boolean().optional(),
//   type: z.literal('simpleType'),
//   definition: z.literal('string'),
//   validations: jzodAttributeStringValidationsSchema.optional()
// })

// export type JzodAttributeString = z.infer<typeof jzodAttributeStringSchema>;
  JzodAttributeSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "simpleType" },
      "definition": { type: "enum", definition: ['any','boolean','number','string',] },
    },
  },
  JzodAttributeStringWithValidationsSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "simpleType" },
      "definition": { type: "literal", definition: "string" },
      "validations": {
        type: "array",
        definition: { type: "schemaReference", definition: "JzodAttributeStringValidationsSchema" },
      },
    },
  },
  JzodAttributeStringValidationsSchema: {
    type: "object",
    definition: {
      "type": { type: "enum", definition: ["max", "min", "length", "email", "url", "emoji", "uuid", "cuid", "cuid2", "ulid", "regex", "includes", "startsWith", "endsWith", "datetime", "ip",] },
      "parameter": { type: "simpleType", definition: "any" },
    },
  },
  JzodElementSchema: {
    type: "union",
    definition: [
      { type: "schemaReference", definition: "JzodArraySchema"},
      { type: "schemaReference", definition: "JzodAttributeSchema"},
      { type: "schemaReference", definition: "JzodAttributeStringWithValidationsSchema"},
      { type: "schemaReference", definition: "JzodEnumSchema"},
      { type: "schemaReference", definition: "JzodFunctionSchema"},
      { type: "schemaReference", definition: "JzodLazySchema"},
      { type: "schemaReference", definition: "jzodLiteralSchema"},
      { type: "schemaReference", definition: "JzodObjectSchema"},
      { type: "schemaReference", definition: "JzodRecordSchema"},
      { type: "schemaReference", definition: "JzodReferenceSchema"},
      { type: "schemaReference", definition: "JzodUnionSchema"},
    ]
  },
  JzodElementSetSchema: {
    type: "record",
    definition: { type: "schemaReference", definition:"JzodElementSchema" },
  },
  JzodEnumSchema: {
    type: "object",
    definition: {
      "type": { type: "literal", definition: "enum" },
      "definition": { type: "array", definition: { type: "simpleType", definition: "string" } },
    },
  },
  JzodFunctionSchema: {
    type: "object",
    definition: {
      type: { type: "literal", definition: "function" },
      args: {
        type: "array",
        definition: { type: "schemaReference", definition: "JzodAttributeSchema" },
      },
      returns: { type: "schemaReference", definition: "JzodAttributeSchema", optional: true },
    },
  },
  JzodLazySchema: {
    type: "object",
    definition: {
      type: { type: "literal", definition: "lazy" },
      definition: { type: "schemaReference", definition: "JzodFunctionSchema" },
    },
  },
  jzodLiteralSchema: {
    type: "object",
    definition: {
      "type": { type: "literal", definition: "literal" },
      "definition": { type: "simpleType", definition: "string" },
    },
  },
  JzodObjectSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "object" },
      "definition": {
        type: "record",
        definition: { type: "schemaReference", definition:"JzodElementSchema" },
      },
    },
  },
  JzodRecordSchema: {
    type: "object",
    definition: {
      type: { type: "literal", definition: "record" },
      definition: { type: "schemaReference", definition: "JzodElementSchema" },
    },
  },
  JzodReferenceSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "schemaReference" },
      "definition": { type: "simpleType", definition: "string" },
    },
  },
  JzodUnionSchema: {
    type: "object",
    definition: {
      "type": { type: "literal", definition: "union" },
      "definition": {
        type: "array",
        definition: { type: "schemaReference", definition: "JzodElementSchema" },
      },
    },
  },
};
