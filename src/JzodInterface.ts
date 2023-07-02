import { ZodType, ZodTypeAny, z } from "zod";


export interface ZodSchemaAndDescription {zodSchema:ZodTypeAny, description:string};
export type JzodToZodResult = {[k:string]:ZodSchemaAndDescription};

const jzodRootSchema = z.object({
  optional: z.boolean().optional(),
});
type JzodRoot = z.infer<typeof jzodRootSchema>;

// ##############################################################################################################
export interface JzodSimpleAttribute extends JzodRoot {
  type: "simpleType",
  definition: 'any' | 'boolean' | 'string' | 'number'
}

export const jzodSimpleAttributeSchema: z.ZodType<JzodSimpleAttribute> = z.object({
  optional: z.boolean().optional(),
  type: z.literal('simpleType'),
  definition: z.enum([
    'any',
    'boolean',
    'string',
    'number',
  ])
})

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
  args: JzodSimpleAttribute[],
  returns?: JzodSimpleAttribute,
}

export const jzodFunctionSchema = z.object({
  type: z.literal("function"),
  // anyway, arg and returns types are not use upon validation to check the function's interface. Suffices for it to be a function, it is then valid.
  args:z.array(jzodSimpleAttributeSchema),
  returns: jzodSimpleAttributeSchema.optional(),
})

// ##############################################################################################################
export const jzodLazySchema = z.object({
  type: z.literal("lazy"),
  definition: jzodFunctionSchema,
})

export type JzodLazy = z.infer<typeof jzodLazySchema>;

// ##############################################################################################################
export const jzodReferentialCoreElementSchema = z.object({ // inheritance from ZodRootSchema leads to a different JsonSchema thus invalidates tests, although it is semantically equivalent
  optional: z.boolean().optional(),
  type: z.literal("schemaReference"),
  definition: z.string()
})

export type JzodReference = z.infer<typeof jzodReferentialCoreElementSchema>;

// ##############################################################################################################
export interface JzodRecord {
  type: 'record',
  // definition: ZodSimpleElement[],
  definition: JzodElement,
}

export const jzodRecordSchema: z.ZodType<JzodRecord> = z.object({
  type: z.literal('record'),
  definition: z.lazy(()=>jzodReferenceSchema)
})

// ##############################################################################################################
export type JzodElement =
| JzodArray
| JzodEnum
| JzodFunction
| JzodLazy
| JzodLiteral
| JzodSimpleAttribute
| JzodRecord
| JzodObject
| JzodReference
| JzodUnion
;

export const jzodReferenceSchema: z.ZodType<JzodElement> = z.union([
  z.lazy(()=>jzodArraySchema),
  z.lazy(()=>jzodEnumSchema),
  z.lazy(()=>jzodFunctionSchema),
  z.lazy(()=>jzodLazySchema),
  z.lazy(()=>jzodLiteralSchema),
  z.lazy(()=>jzodObject),
  z.lazy(()=>jzodRecordSchema),
  z.lazy(()=>jzodReferentialCoreElementSchema),
  z.lazy(()=>jzodSimpleAttributeSchema),
  z.lazy(()=>jzodUnionSchema),
])

// ##############################################################################################################
export const jzodElementSetSchema = z.record(z.string(),jzodReferenceSchema);
export type JzodElementSet = z.infer<typeof jzodElementSetSchema>;


  // ##############################################################################################################
export interface JzodUnion {
  type: "union",
  definition: JzodElement[],
}
export const jzodUnionSchema: z.ZodType<JzodUnion> = z.object({
  type: z.literal("union"),
  definition: z.lazy(()=>z.array(jzodReferenceSchema))
});

// ##############################################################################################################
export interface JzodObject extends JzodRoot {
  type: 'object',
  definition: {[attributeName:string]: JzodElement}
}

export const jzodObject: z.ZodType<JzodObject> = z.object({
  optional: z.boolean().optional(),
  type: z.literal('object'),
  definition: z.lazy(()=>z.record(z.string(),jzodReferenceSchema)),
})

// ##############################################################################################################
export interface JzodArray extends JzodRoot {
  type: 'array',
  definition: JzodElement
}
export const jzodArraySchema: z.ZodType<JzodArray> = z.object({ // issue with JsonSchema conversion when using extend from ZodRootSchema, although the 2 are functionnaly equivalent
  optional: z.boolean().optional(),
  type: z.literal('array'),
  definition: z.lazy(()=>jzodReferenceSchema)
})

// ##############################################################################################################

export const jzodBootstrapSchema: JzodElementSet = {
  JzodArraySchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "array" },
      "definition": { type: "schemaReference", definition: "JzodReferentialElementSchema" },
    },
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
        definition: { type: "schemaReference", definition: "JzodSimpleAttributeSchema" },
      },
      returns: { type: "schemaReference", definition: "JzodSimpleAttributeSchema", optional: true },
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
        definition: { type: "schemaReference", definition:"JzodReferentialElementSchema" },
      },
    },
  },
  JzodRecordSchema: {
    type: "object",
    definition: {
      type: { type: "literal", definition: "record" },
      definition: { type: "schemaReference", definition: "JzodReferentialElementSchema" },
    },
  },
  JzodReferentialCoreElementSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "schemaReference" },
      "definition": { type: "simpleType", definition: "string" },
    },
  },
  JzodReferentialElementSchema: {
    type: "union",
    definition: [
      { type: "schemaReference", definition: "JzodArraySchema"},
      { type: "schemaReference", definition: "JzodEnumSchema"},
      { type: "schemaReference", definition: "JzodFunctionSchema"},
      { type: "schemaReference", definition: "JzodLazySchema"},
      { type: "schemaReference", definition: "jzodLiteralSchema"},
      { type: "schemaReference", definition: "JzodObjectSchema"},
      { type: "schemaReference", definition: "JzodRecordSchema"},
      { type: "schemaReference", definition: "JzodReferentialCoreElementSchema"},
      { type: "schemaReference", definition: "JzodSimpleAttributeSchema"},
      { type: "schemaReference", definition: "JzodUnionSchema"},
    ]
  },
  JzodReferentialElementSetSchema: {
    type: "record",
    definition: { type: "schemaReference", definition:"JzodReferentialElementSchema" },
  },
  JzodSimpleAttributeSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "type": { type: "literal", definition: "simpleType" },
      "definition": { type: "enum", definition: ['any','boolean','string','number',] },
    },
  },
  JzodUnionSchema: {
    type: "object",
    definition: {
      "type": { type: "literal", definition: "union" },
      "definition": {
        type: "array",
        definition: { type: "schemaReference", definition: "JzodReferentialElementSchema" },
      },
    },
  },
};
