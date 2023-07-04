import * as path from "path";
import { ZodTypeAny, z } from "zod";

import { jzodSchemaSetToZodSchemaSet } from '../src/Jzod';
import {
  jzodArraySchema as JzodArraySchema,
  JzodElementSet,
  jzodObjectSchema as JzodObjectSchema,
  JzodToZodResult,
  jzodBootstrapSchema,
  jzodElementSetSchema,
  jzodEnumSchema,
  jzodFunctionSchema,
  jzodLazySchema,
  jzodLiteralSchema,
  jzodRecordSchema,
  jzodReferenceSchema,
  jzodAttributeSchema,
  jzodUnionSchema,
  jzodElementSchema,
  jzodAttributeStringWithValidationsSchema,
  jzodAttributeStringValidationsSchema,
  jzodEnumTypesSchema,
} from "../src/JzodInterface";
import { convertZodSchemaToJsonSchemaAndWriteToFile } from "./utils";


describe(
  'Jzod',
  () => {

    // ###########################################################################################
    it(
      'jzod elementary schema conversion',
      () => {
        const testJzodSchema:JzodElementSet = {
          "test2": 
          {
            type: "object",
            definition: {
              a: { type: "simpleType", definition: "string" },
              b: {
                type: "object",
                definition: { 
                  b1: { type: "simpleType", definition: "boolean", optional: true },
                  b2: { type:"array", definition: {type:"simpleType",definition:"boolean"}}
                },
              },
            },
          }
         };

        
        const referenceZodSchema:JzodToZodResult = {
          "test2":{
            zodSchema: z.object({
              a: z.string(),
              b: z.object({b1:z.boolean().optional(), b2: z.array(z.boolean())})
            }),
            description:""
          }
        }
        
        // const logsPath = "";
        // const referenceSchemaFilePath = path.join(logsPath,'test2ZodSchemaJsonSchema.json');
        // const convertedElementSchemaFilePath = path.join(logsPath,'test2JsonZodSchemaJsonSchema.json');

        const test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile(
          "test2ZodSchema",
          referenceZodSchema,
          testJzodSchema,
          undefined
        );
        const test2ZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile(
          "test2ZodSchema",
          jzodSchemaSetToZodSchemaSet(testJzodSchema),
          testJzodSchema,
          undefined
        );

        expect(test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString).toEqual(test2ZodSchemaJsonSchemaWithoutBootstrapElementString)

      }
    )

    // ###########################################################################################
    it(
      'jzod bootstrap equivalence',
      () => {
        const test2ZodSchema:JzodToZodResult = {
          "JzodArraySchema": {
            zodSchema: JzodArraySchema,
            description:""
          },
          "JzodAttributeSchema": {
            zodSchema: jzodAttributeSchema,
            description:""
          },
          "JzodAttributeStringWithValidationsSchema": {
            zodSchema: jzodAttributeStringWithValidationsSchema,
            description:""
          },
          "JzodAttributeStringValidationsSchema": {
            zodSchema: jzodAttributeStringValidationsSchema,
            description:""
          },
          "JzodElementSchema": {
            zodSchema: jzodElementSchema,
            description:""
          },
          "JzodElementSetSchema": {
            zodSchema: jzodElementSetSchema,
            description:""
          },
          "JzodEnumSchema": {
            "zodSchema": jzodEnumSchema,
            description:""
          },
          "JzodEnumTypesSchema": {
            "zodSchema": jzodEnumTypesSchema,
            description:""
          },
          "JzodFunctionSchema": {
            "zodSchema": jzodFunctionSchema,
            description:""
          },
          "JzodLazySchema": {
            "zodSchema": jzodLazySchema,
            description:""
          },
          "jzodLiteralSchema": {
            "zodSchema": jzodLiteralSchema,
            description:""
          },
          "JzodObjectSchema": {
            zodSchema: JzodObjectSchema,
            description:""
          },
          "JzodRecordSchema": {
            zodSchema: jzodRecordSchema,
            description:""
          },
          "JzodReferenceSchema": {
            zodSchema: jzodReferenceSchema,
            description:""
          },
          "JzodUnionSchema": {
            zodSchema: jzodUnionSchema,
            description:""
          },
        }
        
        const logsPath = "C:/Users/nono/Documents/devhome/tmp";
        const referenceSchemaFilePath = path.join(logsPath,'jsonZodBootstrap_reference.json');
        const convertedElementSchemaFilePath = path.join(logsPath,'jsonZodBootstrap_converted.json');

        const convertedJsonZodSchema:JzodToZodResult = jzodSchemaSetToZodSchemaSet(jzodBootstrapSchema);
        
        const test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile('jsonZodBootstrap_reference',test2ZodSchema,jzodBootstrapSchema,referenceSchemaFilePath);
        const test2ZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile('jsonZodBootstrap_converted',convertedJsonZodSchema,jzodBootstrapSchema,convertedElementSchemaFilePath);

        // equivalence between "hard-coded" and converted schemas
        expect(test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString).toEqual(test2ZodSchemaJsonSchemaWithoutBootstrapElementString);
      }
    )

    // ###########################################################################################
    it(
      'jzod schema simple parsing',
      () => {
  
        const convertedJsonZodSchema:JzodToZodResult = jzodSchemaSetToZodSchemaSet(jzodBootstrapSchema);

        const referentialElementSetToBeConverted: JzodElementSet = {
          test0: { type: "simpleType", definition: "string", optional: true },
          test1: {
            type: "object",
            definition: { a: { type: "simpleType", definition: "string" } },
          },
          test2: {
            type: "object",
            definition: {
              b: { type: "schemaReference", definition: "test0" },
              c: { type: "schemaReference", definition: "test1" },
            },
          },
          test3: {
            type: "enum",
            definition: ["boolean", "string", "number"],
          },
          test4: {
            type: "function",
            args: [
              { type: "simpleType", definition: "string" },
              { type: "simpleType", definition: "number" },
            ],
            returns: { type: "simpleType", definition: "number" },
          },
          test5: {
            type: "record",
            definition: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
          },
          test6: {
            type: "union",
            definition: [
              {
                type: "object", definition: { a: { type: "simpleType", definition: "string" } },
              },
              {
                type: "object", definition: { b: { type: "simpleType", definition: "number" } },
              },
            ],
          },
          test7: {
            type: "array",
            definition: {type: "object", definition: { a: { type: "simpleType", definition: "string" } }},
          },
          test8: {
            type: "lazy",
            definition: {
              type: "function", args: [ { type: "simpleType", definition: "string" } ], returns: { type: "simpleType", definition: "string" }
            }
          },
          test9: { type: "simpleType", definition: "string", optional: true, validations: [{type:"min",parameter:5}] },
        };

        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test0).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test1).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test2).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test3).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test4).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test5).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test6).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test7).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(referentialElementSetToBeConverted.test8).success).toBeTruthy();

        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodElementSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodElementSetSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodEnumSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodArraySchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodEnumSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodFunctionSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodLazySchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.jzodLiteralSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodObjectSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodRecordSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodReferenceSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodAttributeSchema).success).toBeTruthy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse(jzodBootstrapSchema.JzodUnionSchema).success).toBeTruthy();

        // tests to fail
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse({type:"lazys",definition:"toto"}).success).toBeFalsy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse({type:"lazy",type2:"lazy2",definition:"toto"}).success).toBeFalsy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse({
          type: "record",
          definition: { type: "object", definition: { a: { type: "simpleType", definition: "undefined!!!!!!" } } },
        }).success).toBeFalsy();
        expect(convertedJsonZodSchema.JzodElementSchema.zodSchema.safeParse({
          type: "object",
          definition: {
            b: { type: "schemaReference", definitions: "test0" },
            c: { type: "schemaReference", definition: "test1" },
          },
        }).success).toBeFalsy();
      }
    )

    // ###########################################################################################
    it(
      'jzod bootstrap self parsing',
      () => {
        const convertedJsonZodSchema:JzodToZodResult = jzodSchemaSetToZodSchemaSet(jzodBootstrapSchema);
        // ~~~~~~~~~~~~~~~~~ BOOTSTRAP TEST ~~~~~~~~~~~~~~~~~~~~~~~~
        expect(convertedJsonZodSchema.JzodElementSetSchema.zodSchema.safeParse(jzodBootstrapSchema).success).toBeTruthy();
      }
    )
    // ###########################################################################################
    it(
      'jzod simple data parsing',
      () => {
        const referenceSchema: { [z: string]: ZodTypeAny } = {
          test0: z.string().optional(),
          test1: z.object({ a: z.string() }),
          test2: z.object({
            // b: z.lazy(() => referenceSchema.test0),
            b: z.lazy(() => referenceSchema.test0),
            // c: z.lazy(() => referenceSchema.test1),
            c: z.lazy(() => referenceSchema.test1),
          }),
          test3: z.enum([
            'boolean',
            'string',
            'number',
          ]),
          test4: z.function().args(z.string(),z.number()).returns(z.number()),
          test5: z.record(z.string(),z.object({"a":z.string()})),
          test6: z.union([z.object({"a":z.string()}),z.object({"b":z.number()})]),
          test7: z.array(z.object({"a":z.string()})),
          test8: z.function().args(z.string()).returns(z.string()),
          test9: z.string().min(5),
        };

        const referentialElementSetToBeConverted: JzodElementSet = {
          test0: { type: "simpleType", definition: "string", optional: true },
          test1: {
            type: "object",
            definition: { a: { type: "simpleType", definition: "string" } },
          },
          test2: {
            type: "object",
            definition: {
              b: { type: "schemaReference", definition: "test0" },
              c: { type: "schemaReference", definition: "test1" },
            },
          },
          test3: {
            type: "enum",
            definition: ["boolean", "string", "number"],
          },
          test4: {
            type: "function",
            args: [
              { type: "simpleType", definition: "string" },
              { type: "simpleType", definition: "number" },
            ],
            returns: { type: "simpleType", definition: "number" },
          },
          test5: {
            type: "record",
            definition: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
          },
          test6: {
            type: "union",
            definition: [
              {
                type: "object", definition: { a: { type: "simpleType", definition: "string" } },
              },
              {
                type: "object", definition: { b: { type: "simpleType", definition: "number" } },
              },
            ],
          },
          test7: {
            type: "array",
            definition: {type: "object", definition: { a: { type: "simpleType", definition: "string" } }},
          },
          test8: {
            type: "lazy",
            definition: {
              type: "function", args: [ { type: "simpleType", definition: "string" } ], returns: { type: "simpleType", definition: "string" }
            }
          },
          test9: { type: "simpleType", definition: "string", optional: true, validations: [{type:"min",parameter:5}] },
        };
        expect(jzodElementSetSchema.safeParse(referentialElementSetToBeConverted).success).toBeTruthy();
        expect(jzodElementSetSchema.safeParse(jzodBootstrapSchema).success).toBeTruthy();

        const referentialElementSetSchema = jzodSchemaSetToZodSchemaSet(referentialElementSetToBeConverted);
        const test0_OK = "toto";
        const test0_KO = 1;
        const test1_OK = {a:"toto"};
        const test1_KO = {a:1};
        const test2_OK = {c:{a:'test'}};
        const test2_KO = {b:1};
        const test4_OK:(a:string, b:number)=>number = (a:string, b:number):number => b;
        const test4_KO:string = 'not a function';
        const test5_OK = {"e":{a:"test"},"f":{a:"test2"}};
        const test5_KO = {"e":1};
        const test6_OK = {"a":"test"};
        const test6_OK2 = {b:1};
        const test6_KO = {b:"test"};
        const test7_OK = [{"a":"test"},{"a":"test2"}];
        const test7_OK2 = [] as any[];
        const test7_KO = [{"e":1}];
        const test8_OK:(a:string)=>string = (a:string):string => a;
        const test8_KO1:(a:number)=>string = (a:number):string => "a";
        const test8_KO2:string = 'not a function';
        const test9_OK = "12345";
        const test9_KO = "1234";
        expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test4.zodSchema.safeParse(test4_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test4.zodSchema.safeParse(test4_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test5.zodSchema.safeParse(test5_OK).success).toBeTruthy();
        // expect(referentialElementSetSchema.test5.safeParse(test5_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test6.zodSchema.safeParse(test6_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test6.zodSchema.safeParse(test6_OK2).success).toBeTruthy();
        expect(referentialElementSetSchema.test6.zodSchema.safeParse(test6_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_OK2).success).toBeTruthy();
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test8.zodSchema.safeParse(test8_OK).success).toBeTruthy();
        // expect(referentialElementSetSchema.test8.zodSchema.safeParse(test8_KO1).success).toBeFalsy(); // Zod does not validate function parameter types?
        expect(referentialElementSetSchema.test8.zodSchema.safeParse(test8_KO2).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test9.zodSchema.safeParse(test9_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test9.zodSchema.safeParse(test9_KO).success).toBeFalsy();
      }
    )
  }
)
