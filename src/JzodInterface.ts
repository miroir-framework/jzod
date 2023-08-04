import { ZodObject, ZodType, ZodTypeAny, z } from "zod";


// export interface ZodSchemaAndDescription {zodSchema:ZodTypeAny, description:string};
export interface ZodSchemaAndDescription<T extends ZodTypeAny> {zodSchema:T, description:string};

export type JzodToZodResult<T extends ZodTypeAny> = {[k:string]:ZodSchemaAndDescription<T>};

const jzodRootSchema = z.object({
  optional: z.boolean().optional(),
}).strict();
type JzodRoot = z.infer<typeof jzodRootSchema>;

// ##############################################################################################################
export const jzodEnumAttributeTypesSchema = z.enum([
  'any',
  'boolean',
  'number',
  'string',
  'uuid',
])

export type JzodEnumTypes = z.infer<typeof jzodEnumAttributeTypesSchema>;

// ##############################################################################################################
export const jzodEnumElementTypesSchema = z.enum([
  'array',
  'enum',
  // 'enumValue',
  'function',
  'lazy',
  'literal',
  'object',
  'record',
  'schemaReference',
  'simpleType',
  'union',
])

export type JzodEnumElementTypes = z.infer<typeof jzodEnumElementTypesSchema>;


// ##############################################################################################################
export interface JzodArray extends JzodRoot {
  optional?: boolean,
  extra?: {[k:string]:any},
  type: 'array',
  definition: JzodElement
}

// export const jzodArraySchema = z.object({ // issue with JsonSchema conversion when using extend from ZodRootSchema, although the 2 are functionnaly equivalent
export const jzodArraySchema: z.ZodType<JzodArray> = z.object({ // issue with JsonSchema conversion when using extend from ZodRootSchema, although the 2 are functionnaly equivalent
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  type: z.literal('array'),
  // type: jzodEnumElementTypesSchema.enum.array,
  definition: z.lazy(()=>jzodElementSchema)
}).strict();

// export type JzodArray = z.infer<typeof jzodArraySchema>;

// ##############################################################################################################
export const jzodAttributeStringValidationsSchema = z.object({
  extra: z.record(z.string(),z.any()).optional(),
  type: z.enum([
    "max", "min", "length", "email", "url", "emoji", "uuid", "cuid", "cuid2", "ulid", "regex", "includes", "startsWith", "endsWith", "datetime", "ip"
  ]),
  parameter: z.any()
}).strict();

export type JzodAttributeStringValidations = z.infer<typeof jzodAttributeStringValidationsSchema>;

// ##############################################################################################################
export const jzodAttributeStringWithValidationsSchema = z.object({
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal('simpleType'),
  type: z.literal(jzodEnumElementTypesSchema.enum.simpleType),
  // definition: z.literal('string'),
  definition: z.literal(jzodEnumAttributeTypesSchema.enum.string),
  validations: z.array(jzodAttributeStringValidationsSchema),
}).strict();

export type JzodAttributeStringWithValidations = z.infer<typeof jzodAttributeStringWithValidationsSchema>;

// ##############################################################################################################
export const jzodAttributeSchema = z.object({
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal('simpleType'),
  type: z.literal(jzodEnumElementTypesSchema.enum.simpleType),
  definition: z.lazy(()=>jzodEnumAttributeTypesSchema),
}).strict();

export type JzodAttribute = z.infer<typeof jzodAttributeSchema>;


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

// export const jzodElementSchema = z.union([
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

// export type JzodElement = z.infer<typeof jzodElementSchema>;

// ##############################################################################################################
export const jzodElementSetSchema = z.record(z.string(),jzodElementSchema);
export type JzodElementSet = z.infer<typeof jzodElementSetSchema>;

// ##############################################################################################################
export const jzodEnumSchema = z.object({
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal("enum"),
  type: z.literal(jzodEnumElementTypesSchema.enum.enum),
  definition: z.array(z.string()),
}).strict();

export type JzodEnum = z.infer<typeof jzodEnumSchema>;

// // ##############################################################################################################
// export const jzodEnumValueSchema = z.object({
//   optional: z.boolean().optional(),
//   extra: z.record(z.string(),z.any()).optional(),
//   // type: z.literal("enum"),
//   type: z.literal(jzodEnumElementTypesSchema.enum.enumValue),
//   definition: z.array(z.string()),
// }).strict();

// export type JzodEnumValue = z.infer<typeof jzodEnumSchema>;

// ##############################################################################################################
// export interface JzodFunction {
//   type: "function",
//   args: JzodAttribute[],
//   returns?: JzodAttribute,
// }

export const jzodFunctionSchema = z.object({
  // type: z.literal("function"),
  type: z.literal(jzodEnumElementTypesSchema.enum.function),
  extra: z.record(z.string(),z.any()).optional(),
  // anyway, arg and returns types are not use upon validation to check the function's interface. Suffices for it to be a function, it is then valid.
  definition: z.object({
    args:z.array(jzodAttributeSchema),
    returns: jzodAttributeSchema.optional(),
  })
}).strict();

export type JzodFunction = z.infer<typeof jzodFunctionSchema>;

// ##############################################################################################################
export const jzodLazySchema = z.object({
  // type: z.literal("lazy"),
  type: z.literal(jzodEnumElementTypesSchema.enum.lazy),
  extra: z.record(z.string(),z.any()).optional(),
  definition: jzodFunctionSchema,
}).strict();

export type JzodLazy = z.infer<typeof jzodLazySchema>;

// ##############################################################################################################
export const jzodReferenceSchema = z.object({ // inheritance from ZodRootSchema leads to a different JsonSchema thus invalidates tests, although it is semantically equivalent
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal("schemaReference"),
  type: z.literal(jzodEnumElementTypesSchema.enum.schemaReference),
  relativePath: z.string().optional(),
  absolutePath: z.string().optional(),
}).strict()

export type JzodReference = z.infer<typeof jzodReferenceSchema>;

// ##############################################################################################################
export const jzodLiteralSchema = z.object({
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal("literal"),
  type: z.literal(jzodEnumElementTypesSchema.enum.literal),
  // enumReference: jzodReferenceSchema.optional(),
  definition: z.string(),
}).strict();

export type JzodLiteral = z.infer<typeof jzodLiteralSchema>;

// ##############################################################################################################
export interface JzodObject extends JzodRoot {
  optional?: boolean,
  extra?: {[k:string]:any},
  type: "object",
  definition: {[attributeName:string]: JzodElement}
}

// export const jzodObjectSchema = z.object({
export const jzodObjectSchema: z.ZodType<JzodObject> = z.object({
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal('object'),
  type: z.literal(jzodEnumElementTypesSchema.enum.object),
  definition: z.lazy(()=>z.record(z.string(),jzodElementSchema)),
}).strict();


// ##############################################################################################################
export interface JzodRecord {
  optional?: boolean,
  extra?: {[k:string]:any},
  type: 'record',
  // definition: ZodSimpleElement[],
  definition: JzodElement,
}

export const jzodRecordSchema: z.ZodType<JzodRecord> = z.object({
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal('record'),
  type: z.literal(jzodEnumElementTypesSchema.enum.record),
  definition: z.lazy(()=>jzodElementSchema)
}).strict();

  // ##############################################################################################################
export interface JzodUnion {
  optional?: boolean,
  extra?: {[k:string]:any},
  type: "union",
  definition: JzodElement[],
}
export const jzodUnionSchema: z.ZodType<JzodUnion> = z.object({
  optional: z.boolean().optional(),
  extra: z.record(z.string(),z.any()).optional(),
  // type: z.literal("union"),
  type: z.literal(jzodEnumElementTypesSchema.enum.union),
  definition: z.lazy(()=>z.array(jzodElementSchema))
}).strict();

// ##############################################################################################################

export const jzodBootstrapSetSchema: JzodElementSet = {
  jzodArraySchema: {
    type: "object",
    definition: {
      optional: { type: "simpleType", definition: "boolean", optional: true },
      extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
      type: { type: "literal", definition: "array" },
      definition: { type: "schemaReference", relativePath: "jzodElementSchema" },
    },
  },
  jzodAttributeSchema: {
    type: "object",
    definition: {
      optional: { type: "simpleType", definition: "boolean", optional: true },
      extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
      type: { type: "literal", definition: "simpleType" },
      definition: { type: "schemaReference", relativePath: "jzodEnumAttributeTypesSchema" },
    },
  },
  jzodAttributeStringWithValidationsSchema: {
    type: "object",
    definition: {
      optional: { type: "simpleType", definition: "boolean", optional: true },
      extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
      type: { type: "literal", definition: "simpleType" },
      definition: { type: "literal", definition: "string" },
      validations: {
        type: "array",
        definition: { type: "schemaReference", relativePath: "jzodAttributeStringValidationsSchema" },
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
  jzodElementSchema: {
    type: "union",
    definition: [
      { type: "schemaReference", relativePath: "jzodArraySchema" },
      { type: "schemaReference", relativePath: "jzodAttributeSchema" },
      { type: "schemaReference", relativePath: "jzodAttributeStringWithValidationsSchema" },
      { type: "schemaReference", relativePath: "jzodEnumSchema" },
      { type: "schemaReference", relativePath: "jzodFunctionSchema" },
      { type: "schemaReference", relativePath: "jzodLazySchema" },
      { type: "schemaReference", relativePath: "jzodLiteralSchema" },
      { type: "schemaReference", relativePath: "jzodObjectSchema" },
      { type: "schemaReference", relativePath: "jzodRecordSchema" },
      { type: "schemaReference", relativePath: "jzodReferenceSchema" },
      { type: "schemaReference", relativePath: "jzodUnionSchema" },
    ],
  },
  jzodElementSetSchema: {
    type: "record",
    definition: { 
      "type": "schemaReference", 
      "relativePath": "jzodElementSchema" },
  },
  jzodEnumSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      "type": { type: "literal", definition: "enum" },
      "definition": { type: "array", definition: { type: "simpleType", definition: "string" } },
    },
  },
  // jzodEnumValueSchema: {
  //   type: "object",
  //   definition: {
  //     "optional": { type: "simpleType", definition: "boolean", optional: true },
  //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
  //     "type": { type: "literal", definition: "enumValue" },
  //     "enumReference": { type: "schemaReference", relativePath: "jzodReferenceSchema" },
  //     "definition": { type: "simpleType", definition: "string" },
  //   },
  // },
  jzodEnumAttributeTypesSchema: {
    type: "enum",
    definition: ["any", "boolean", "number", "string", "uuid"],
  },
  jzodEnumElementTypesSchema: {
    type: "enum",
    definition: [
      "array",
      "enum",
      "function",
      "lazy",
      "literal",
      "object",
      "record",
      "schemaReference",
      "simpleType",
      "union",
    ],
  },
  jzodFunctionSchema: {
    type: "object",
    definition: {
      "type": { type: "literal", definition: "function" },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      "definition": {
        type: "object",
        definition: {
          "args": {
            type: "array",
            definition: { type: "schemaReference", relativePath: "jzodAttributeSchema" },
          },
          "returns": { type: "schemaReference", relativePath: "jzodAttributeSchema", optional: true },
        }
      }
    },
  },
  jzodLazySchema: {
    type: "object",
    definition: {
      type: { type: "literal", definition: "lazy" },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      definition: { type: "schemaReference", relativePath: "jzodFunctionSchema" },
    },
  },
  jzodLiteralSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      "type": { type: "literal", definition: "literal" },
      "definition": { type: "simpleType", definition: "string" },
    },
  },
  jzodObjectSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      // "type": { type: "enumValue", definition: "object", enumReference:{ type: "schemaReference", relativePath: "jzodEnumElementTypesSchema" } },
      "type": { type: "literal", definition: "object" },
      "definition": {
        type: "record",
        definition: { type: "schemaReference", relativePath: "jzodElementSchema" },
      },
    },
  },
  jzodRecordSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      "type": { type: "literal", definition: "record" },
      "definition": { type: "schemaReference", relativePath: "jzodElementSchema" },
    },
  },
  jzodReferenceSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      "type": { type: "literal", definition: "schemaReference" },
      "relativePath": { "type": "simpleType", "definition": "string", "optional": true },
      "absolutePath": { "type": "simpleType", "definition": "string", "optional": true }
    },
  },
  jzodUnionSchema: {
    type: "object",
    definition: {
      "optional": { type: "simpleType", definition: "boolean", optional: true },
      "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
      "type": { type: "literal", definition: "union" },
      "definition": {
        type: "array",
        definition: { type: "schemaReference", relativePath: "jzodElementSchema" },
      },
    },
  },
};

