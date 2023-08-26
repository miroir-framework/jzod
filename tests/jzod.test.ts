import * as fs from "fs";
import * as path from "path";

import { ZodTypeAny, z } from "zod";
import { withGetType } from "zod-to-ts";


import { zodToJzod } from "../src/ZodToJzod";
import { getTsCodeCorrespondingToZodSchemaAndDescription } from "../src/JzodToTs";
import {
  jzodElementSchemaToZodSchemaAndDescription,
  jzodSchemaSetToZodSchemaAndDescriptionRecord,
} from "../src/Jzod";
import {
  JzodElement,
  JzodElementSet,
  JzodObject,
  ZodSchemaAndDescription,
  ZodSchemaAndDescriptionRecord,
  jzodArraySchema,
  jzodAttributeDateValidationsSchema,
  jzodAttributeDateWithValidationsSchema,
  jzodAttributeNumberValidationsSchema,
  jzodAttributeNumberWithValidationsSchema,
  jzodAttributeSchema,
  jzodAttributeStringValidationsSchema,
  jzodAttributeStringWithValidationsSchema,
  jzodBootstrapSetSchema,
  jzodElementSchema,
  jzodElementSetSchema,
  jzodEnumAttributeTypesSchema,
  jzodEnumElementTypesSchema,
  jzodEnumSchema,
  jzodFunctionSchema,
  jzodIntersectionSchema,
  jzodLazySchema,
  jzodLiteralSchema,
  jzodMapSchema,
  jzodObjectSchema,
  jzodPromiseSchema,
  jzodRecordSchema,
  jzodReferenceSchema,
  jzodSetSchema,
  jzodTupleSchema,
  jzodUnionSchema,
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

        const x = z.object({
          a: z.string(),
          b: z.object({b1:z.boolean().optional(), b2: z.array(z.boolean())})
        })
        const referenceZodSchema:ZodSchemaAndDescriptionRecord<typeof x> = {
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
          jzodSchemaSetToZodSchemaAndDescriptionRecord(testJzodSchema),
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
        const test2ZodSchema = {
          "jzodArraySchema": {
            zodSchema: jzodArraySchema,
            description:""
          },
          "jzodAttributeSchema": {
            zodSchema: jzodAttributeSchema,
            description:""
          },
          "jzodAttributeDateValidationsSchema": {
            zodSchema: jzodAttributeDateValidationsSchema,
            description:""
          },
          "jzodAttributeDateWithValidationsSchema": {
            zodSchema: jzodAttributeDateWithValidationsSchema,
            description:""
          },
          "jzodAttributeNumberValidationsSchema": {
            zodSchema: jzodAttributeNumberValidationsSchema,
            description:""
          },
          "jzodAttributeNumberWithValidationsSchema": {
            zodSchema: jzodAttributeNumberWithValidationsSchema,
            description:""
          },
          "jzodAttributeStringValidationsSchema": {
            zodSchema: jzodAttributeStringValidationsSchema,
            description:""
          },
          "jzodAttributeStringWithValidationsSchema": {
            zodSchema: jzodAttributeStringWithValidationsSchema,
            description:""
          },
          "jzodElementSchema": {
            zodSchema: jzodElementSchema,
            description:""
          },
          "jzodElementSetSchema": {
            zodSchema: jzodElementSetSchema,
            description:""
          },
          "jzodEnumSchema": {
            "zodSchema": jzodEnumSchema,
            description:""
          },
          "jzodEnumAttributeTypesSchema": {
            "zodSchema": jzodEnumAttributeTypesSchema,
            description:""
          },
          "jzodEnumElementTypesSchema": {
            "zodSchema": jzodEnumElementTypesSchema,
            description:""
          },
          "jzodFunctionSchema": {
            "zodSchema": jzodFunctionSchema,
            description:""
          },
          "jzodLazySchema": {
            "zodSchema": jzodLazySchema,
            description:""
          },
          "jzodLiteralSchema": {
            "zodSchema": jzodLiteralSchema,
            description:""
          },
          "jzodIntersectionSchema": {
            zodSchema: jzodIntersectionSchema,
            description:""
          },
          "jzodMapSchema": {
            zodSchema: jzodMapSchema,
            description:""
          },
          "jzodObjectSchema": {
            zodSchema: jzodObjectSchema,
            description:""
          },
          "jzodPromiseSchema": {
            zodSchema: jzodPromiseSchema,
            description:""
          },
          "jzodRecordSchema": {
            zodSchema: jzodRecordSchema,
            description:""
          },
          "jzodReferenceSchema": {
            zodSchema: jzodReferenceSchema,
            description:""
          },
          "jzodSetSchema": {
            zodSchema: jzodSetSchema,
            description:""
          },
          "jzodTupleSchema": {
            zodSchema: jzodTupleSchema,
            description:""
          },
          "jzodUnionSchema": {
            zodSchema: jzodUnionSchema,
            description:""
          },
        }
        
        const logsPath = "C:/Users/nono/Documents/devhome/tmp";
        const referenceSchemaFilePath = path.join(logsPath,'jsonZodBootstrap_reference.json');
        const convertedElementSchemaFilePath = path.join(logsPath,'jsonZodBootstrap_converted.json');

        // const convertedJsonZodSchema:ZodSchemaAndDescriptionRecord<typeof jzodElementSetSchema> = jzodSchemaSetToZodSchemaAndDescriptionRecord(jzodBootstrapSetSchema);
        const convertedJsonZodSchema:ZodSchemaAndDescriptionRecord<ZodTypeAny> = jzodSchemaSetToZodSchemaAndDescriptionRecord(jzodBootstrapSetSchema);
        
        const test2ZodSchemaTyped:ZodSchemaAndDescriptionRecord<ZodTypeAny> = test2ZodSchema;

        // console.log("jzod bootstrap equivalence convertedJsonZodSchema", JSON.stringify(convertedJsonZodSchema));
        
        const test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile(
          "jsonZodBootstrap_reference",
          test2ZodSchema,
          jzodBootstrapSetSchema,
          referenceSchemaFilePath
        );
        const test2ZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile(
          "jsonZodBootstrap_converted",
          convertedJsonZodSchema,
          jzodBootstrapSetSchema,
          convertedElementSchemaFilePath
        );

        // equivalence between "hard-coded" and converted schemas
        expect(test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString).toEqual(test2ZodSchemaJsonSchemaWithoutBootstrapElementString);
      }
    )

    // ###########################################################################################
    it(
      'jzod schema simple parsing',
      () => {
  
        const zodBootstrapSchema:ZodSchemaAndDescriptionRecord<ZodTypeAny> = jzodSchemaSetToZodSchemaAndDescriptionRecord(jzodBootstrapSetSchema);

        console.log("jzod schema simple parsing ");
        
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodArraySchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodElementSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodElementSetSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodEnumSchema).success).toBeTruthy();
        // expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodEnumSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodFunctionSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodLazySchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodLiteralSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodIntersectionSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodMapSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodObjectSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodRecordSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodReferenceSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodSetSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodAttributeSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodUnionSchema).success).toBeTruthy();

        // ########################################################################################
        // const testSet: JzodElementSet = {
        const testSet: any = {
          test0: { type: "simpleType", definition: "string", optional: true },
          // test00: { type: "simpleType", definition: "should fail!", optional: true },
          test1: {
            type: "object",
            definition: { a: { type: "simpleType", definition: "string", nullable:true } },
          },
          test2: {
            type: "object",
            definition: {
              b: { type: "schemaReference", definition: { relativePath: "test0" } },
              c: { type: "schemaReference", definition: { relativePath: "test1" } },
            },
          },
          test3: {
            type: "enum",
            definition: ["boolean", "string", "number"],
          },
          test4: {
            type: "function",
            definition: {
              args: [
                { type: "simpleType", definition: "string", optional: true, nullable: true },
                { type: "simpleType", definition: "number" },
              ],
              returns: { type: "simpleType", definition: "number" },
            }
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
              type: "function", definition: {args:[ { type: "simpleType", definition: "string" } ], returns: { type: "simpleType", definition: "string" }}
            }
          },
          test9: { type: "simpleType", definition: "string", optional: true, validations: [{type:"min",parameter:5}] },
        };

        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test0).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test1).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test2).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test3).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test4).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test5).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test6).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test7).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(testSet.test8).success).toBeTruthy();

        // ########################################################################################
        // tests to fail
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse({type:"lazys",definition:"toto"}).success).toBeFalsy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse({type:"lazy",type2:"lazy2",definition:"toto"}).success).toBeFalsy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse({
          type: "record",
          definition: { type: "object", definition: { a: { type: "simpleType", definition: "undefined!!!!!!" } } },
        }).success).toBeFalsy();

        const illShapedReference = {
          type: "object",
          definition: {
            // b: { type: "schemaReference", definitionssssssssss: "test0" },
            b: { type: "schemaReference", relativePathS: "test0" },
            c: { type: "schemaReference", relativePath: "test1" },
          }
        };
        expect(zodBootstrapSchema.jzodObjectSchema.zodSchema.safeParse(illShapedReference).success).toBeFalsy();
      }
    )

    // ###########################################################################################
    it(
      'jzod bootstrap self parsing',
      () => {
        const convertedJsonZodSchema:ZodSchemaAndDescriptionRecord<ZodTypeAny> = jzodSchemaSetToZodSchemaAndDescriptionRecord(jzodBootstrapSetSchema);
        // ~~~~~~~~~~~~~~~~~ BOOTSTRAP TEST ~~~~~~~~~~~~~~~~~~~~~~~~
        expect(convertedJsonZodSchema.jzodElementSetSchema.zodSchema.safeParse(jzodBootstrapSetSchema).success).toBeTruthy();
        // expect(convertedJsonZodSchema.jzodElementSetSchema.zodSchema.parse(jzodBootstrapSetSchema));
      }
    )

    // ###########################################################################################
    it(
      'jzod simple data parsing',
      () => {
        const absoluteReferences = {
          "123": jzodElementSchemaToZodSchemaAndDescription({type: "object", definition: {"x": {type:"simpleType", definition:"string"}}})
        }

        // console.log("absoluteReferences",absoluteReferences);
        
        const referentialElementSetToBeConverted: JzodElementSet = {
          test0: { type: "simpleType", definition: "string", optional: true },
          test1: {
            type: "object",
            definition: {
              a: {
                type: "simpleType",
                definition: "number",
                nullable: true,
              },
              b: {
                type: "simpleType",
                definition: "number",
                validations: [{ type: "gt", parameter: 5 }],
              },

            },
          },
          test2: {
            type: "object",
            definition: {
              b: { type: "schemaReference", definition: { relativePath: "test0" } },
              c: { type: "schemaReference", definition: { relativePath: "test1" }, nullable: true },
            },
          },
          test3: {
            type: "enum",
            definition: ["val1", "val2"],
          },
          test4: {
            type: "function",
            definition: {
              args: [
                { type: "simpleType", definition: "string" },
                { type: "simpleType", definition: "number" },
              ],
              returns: { type: "simpleType", definition: "number" },
            },
          },
          test5: {
            type: "record",
            definition: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
          },
          test6: {
            type: "union",
            definition: [
              {
                type: "object",
                definition: { a: { type: "simpleType", definition: "string" } },
              },
              {
                type: "object",
                definition: { b: { type: "simpleType", definition: "number" } },
              },
            ],
          },
          test7: {
            type: "array",
            definition: {
              type: "object",
              definition: {
                a: {
                  type: "simpleType",
                  definition: "string",
                  validations: [
                    { type: "min", parameter: 5 },
                    { type: "includes", parameter: "#" },
                  ],
                },
              },
            },
          },
          test8: {
            type: "lazy",
            definition: {
              type: "function",
              definition: {
                args: [{ type: "simpleType", definition: "string" }],
                returns: { type: "simpleType", definition: "string" },
              },
            },
          },
          test9: {
            type: "simpleType",
            definition: "string",
            optional: true,
            validations: [{ type: "min", parameter: 5 }],
          },
          test10: { type: "schemaReference", definition: { absolutePath: "123", relativePath: "x" } },
          test11: {
            type: "object",
            context: { "123": { type: "simpleType", definition: "string" } },
            definition: {
              a: { type: "schemaReference", definition: { relativePath: "123" } },
            },
          },
          test12: {
            type: "tuple",
            definition: [
              { type: "simpleType", definition: "number" },
              { type: "simpleType", definition: "string" },
            ],
          },
          test13: {
            type: "intersection",
            definition: {
              left: { type: "object", definition: { name: { type: "simpleType", definition: "string" } } },
              right: { type: "object", definition: { role: { type: "simpleType", definition: "string" } } },
            },
          },
          test14: {
            type: "set",
            definition: { type: "simpleType", definition: "string" },
          },
          test15: {
            type: "map",
            definition: [
              { type: "simpleType", definition: "string" },
              { type: "simpleType", definition: "number" },
            ],
          },
          type16: {
            type: "simpleType",
            definition: "string",
            validations: [
              { type: "min", parameter: 5 },
              { type: "includes", parameter: "#" },
            ],
          },
        };

        expect(jzodElementSetSchema.safeParse(referentialElementSetToBeConverted).success).toBeTruthy();
        expect(jzodElementSetSchema.safeParse(jzodBootstrapSetSchema).success).toBeTruthy();

        const referentialElementSetSchema = jzodSchemaSetToZodSchemaAndDescriptionRecord(referentialElementSetToBeConverted, {}, absoluteReferences?absoluteReferences:{});
        // const referentialElementSetSchema = jzodSchemaSetToZodSchemaAndDescriptionRecord(referentialElementSetToBeConverted, {}, {});


        const test0_OK1 = "toto";
        const test0_OK2 = undefined;
        const test0_KO = 1;
        const test1_OK1 = {a:1, b:6};
        const test1_OK2 = {a:null, b:6};
        const test1_KO1 = {a:"toto", b:6};
        const test1_KO2 = {a:1, b: 5};
        const test2_OK1 = {c:{a: 1, b: 6}};
        const test2_OK2 = {c:{a: null, b: 6}};
        const test2_OK3 = {b:"1", c:null};
        const test2_KO1 = {b:1};
        const test2_KO2 = {b:"1"};
        const test2_KO3 = {b:1, c:null};
        const test2_KO4 = {c:{a: undefined}};
        const test2_KO5 = {b: null, c:{a:'test'}};
        const test3_OK = "val2";
        const test3_KO = "val3";
        const test4_OK:(a:string, b:number)=>number = (a:string, b:number):number => b;
        const test4_KO:string = 'not a function';
        const test5_OK = {"e":{a:"test"},"f":{a:"test2"}};
        const test5_KO = {"e":1};
        const test6_OK = {"a":"test"};
        const test6_OK2 = {b:1};
        const test6_KO = {b:"test"};
        const test7_OK = [{"a":"123#4"},{"a":"#1234"}];
        const test7_OK2 = [] as any[];
        const test7_KO1 = [{"e":"1"}];
        const test7_KO2 = [ {"a":"#12345"}, {"a":"12345"} ];
        const test7_KO3 = [ {"a":"#12345"}, {"a":"#123"} ];
        const test8_OK:(a:string)=>string = (a:string):string => a;
        const test8_KO1:(a:number)=>string = (a:number):string => "a";
        const test8_KO2:string = 'not a function';
        const test9_OK = "12345";
        const test9_KO = "1234";
        const test10_OK = "toto";
        const test10_KO = 1;
        const test11_OK = {a: "toto"};
        const test11_KO = {a:{x:"toto"}};
        const test12_OK = [ 1, "a" ];
        const test12_KO1 = [ "a", 1 ];
        const test12_KO2 = [ 1, "a", "b" ];
        const test13_OK = { name: "Test", role: "test"};
        const test13_KO1 = { name: "Test"};
        const test13_KO2 = { role: "test"};
        const test14_OK = new Set<string>(["a", "b", "c"]);
        const test14_KO = new Set<number>([ 1, 2, 3 ]);
        const test15_OK = new Map<string,number>([["a", 1 ], ["b", 2 ], ["c", 3 ] ]);
        const test15_KO = new Map<string,string>([["a", "1" ], ["b", "2" ], ["c", "3" ] ]);

        // #####
        expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_OK1).success).toBeTruthy();
        expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_OK2).success).toBeTruthy();
        expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_OK1).success).toBeTruthy();
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_OK2).success).toBeTruthy();
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_KO1).success).toBeFalsy();
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_KO2).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_OK1).success).toBeTruthy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_OK2).success).toBeTruthy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_OK3).success).toBeTruthy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_KO1).success).toBeFalsy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_KO2).success).toBeFalsy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_KO3).success).toBeFalsy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_KO4).success).toBeFalsy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_KO5).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test3.zodSchema.safeParse(test3_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test3.zodSchema.safeParse(test3_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test4.zodSchema.safeParse(test4_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test4.zodSchema.safeParse(test4_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test5.zodSchema.safeParse(test5_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test5.zodSchema.safeParse(test5_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test6.zodSchema.safeParse(test6_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test6.zodSchema.safeParse(test6_OK2).success).toBeTruthy();
        expect(referentialElementSetSchema.test6.zodSchema.safeParse(test6_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_OK2).success).toBeTruthy();
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_KO1).success).toBeFalsy();
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_KO2).success).toBeFalsy();
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_KO3).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test8.zodSchema.safeParse(test8_OK).success).toBeTruthy();
        // expect(referentialElementSetSchema.test8.zodSchema.safeParse(test8_KO1).success).toBeFalsy(); // Zod does not validate function parameter types?
        expect(referentialElementSetSchema.test8.zodSchema.safeParse(test8_KO2).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test9.zodSchema.safeParse(test9_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test9.zodSchema.safeParse(test9_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test10.zodSchema.safeParse(test10_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test10.zodSchema.safeParse(test10_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test11.zodSchema.safeParse(test11_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test11.zodSchema.safeParse(test11_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test12.zodSchema.safeParse(test12_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test12.zodSchema.safeParse(test12_KO1).success).toBeFalsy();
        expect(referentialElementSetSchema.test12.zodSchema.safeParse(test12_KO2).success).toBeFalsy();
        // #####
        // console.log("referentialElementSetSchema.test13",referentialElementSetSchema.test13.description,JSON.stringify(referentialElementSetSchema.test13.zodSchema));
        
        // const toto = z.intersection(z.object({name:z.string(),}).strict(),z.object({role:z.string(),}).strict())
        // console.log("compare zod schema",JSON.stringify(toto));
        // type Toto =  z.infer<typeof toto>;
        // const a:Toto = { name: "Test", role: "test"};
        // expect(referentialElementSetSchema.test13.zodSchema.parse(test13_OK).success).toBeTruthy();
        // expect(referentialElementSetSchema.test13.zodSchema.safeParse(test13_OK).success).toBeTruthy(); // FAILING!!! IS GENERATED ZOD SCHEMA WRONG??
        expect(referentialElementSetSchema.test13.zodSchema.safeParse(test13_KO1).success).toBeFalsy();
        expect(referentialElementSetSchema.test13.zodSchema.safeParse(test13_KO2).success).toBeFalsy();

        expect(referentialElementSetSchema.test14.zodSchema.safeParse(test14_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test14.zodSchema.safeParse(test14_KO).success).toBeFalsy();
        // expect(referentialElementSetSchema.test14.zodSchema.safeParse(test14_KO2).success).toBeFalsy();

        expect(referentialElementSetSchema.test15.zodSchema.safeParse(test15_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test15.zodSchema.safeParse(test15_KO).success).toBeFalsy();
      }
    )

    // ############################################################################################
    it(
      "Jzod to TS Type",
      async() => {

        const writeTsFile = (
          testJzodSchema: JzodObject,
          convertedJsonZodSchema: ZodSchemaAndDescription<ZodTypeAny>,
          typeName: string,
          testResultSchemaFilePath:string,
        ) => {
          const result = getTsCodeCorrespondingToZodSchemaAndDescription(typeName,convertedJsonZodSchema)
          fs.writeFileSync(testResultSchemaFilePath,result);
          return result;
        }

        const testJzodToTs = (
          testDirectory: string,
          referenceFileName: string,
          testFileName: string,
          testJzodSchema:JzodObject,
          typeName: string
        ) => {
          const testResultSchemaFilePath = path.join(testDirectory,testFileName);
          const expectedSchemaFilePath = path.join(testDirectory,referenceFileName);

          const convertedJsonZodSchema = jzodElementSchemaToZodSchemaAndDescription(
            // typeName,
            testJzodSchema,
            () => ({} as ZodSchemaAndDescriptionRecord<ZodTypeAny>),
            () => ({} as ZodSchemaAndDescriptionRecord<ZodTypeAny>),
            (innerReference: ZodTypeAny, relativeReference: string | undefined) =>
              withGetType(innerReference, (ts) =>
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier(relativeReference ? relativeReference : "RELATIVEPATH_NOT_DEFINED")
                )
              )
          );

          console.log("ts Type generation", typeName);
          // console.log("ts Type generation", typeName,JSON.stringify(convertedJsonZodSchema));


          const resultContents = writeTsFile(
            testJzodSchema,
            convertedJsonZodSchema,
            typeName,
            testResultSchemaFilePath,
          ).replace(/(\r\n|\n|\r)/gm, "");
          console.log("ts Type generation resultContents", resultContents);

          const expectedFileContents = fs.readFileSync(expectedSchemaFilePath).toString().replace(/(\r\n|\n|\r)/gm, "")
          expect(resultContents).toEqual(expectedFileContents);
        }

        const logsPath = "C:/Users/nono/Documents/devhome/tmp";
        // ########################################################################################
        const testJzodSchema1:JzodObject = {
          type: "object",
          context: {
            a: { type: "simpleType", definition: "string"}
          },
          definition: {
            "optional": { type: "simpleType", definition: "boolean", optional: true },
            "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
            "type": { type: "literal", definition: "enum" },
            "definition": { type: "array", definition: { type: "schemaReference", definition: {relativePath: "a"} } },
          },
        }

        testJzodToTs(
          logsPath,
          "tsTypeGeneration-testJzodSchema1 - reference.ts",
          "tsTypeGeneration-testJzodSchema1.ts",
          testJzodSchema1,
          "testJzodSchema1"
        );

        // ########################################################################################
        const testJzodSchema2:JzodObject = 
        {
          type: "object", 
          // context: jzodBootstrapSetSchema,
          context:{
            jzodLiteralSchema: {
              type: "object",
              definition: {
                "optional": { type: "simpleType", definition: "boolean", optional: true },
                "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
                "type": { type: "literal", definition: "literal" },
                "definition": { type: "simpleType", definition: "string" },
              },
            }
          },
          definition: {
            "a": { type: "array", definition: { type: "schemaReference", definition: {relativePath: "jzodLiteralSchema"} } },
          },
        }

        testJzodToTs(
          logsPath,
          "tsTypeGeneration-testJzodSchema2 - reference.ts",
          "tsTypeGeneration-testJzodSchema2.ts",
          testJzodSchema2,
          "testJzodSchema2"
        );

        // ########################################################################################
        const testJzodSchema3:JzodObject = 
        {
          type: "object", 
          // context: jzodBootstrapSetSchema,
          context:{
            jzodLiteralSchema: {
              type: "object",
              definition: {
                "optional": { type: "simpleType", definition: "boolean", optional: true },
                "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
                "type": { type: "literal", definition: "literal" },
                "definition": { type: "simpleType", definition: "string" },
              },
            },
            jzodElementSchema: {
              type: "union",
              "discriminant": "type",
              definition: [
                { type: "schemaReference", definition: { relativePath: "jzodLiteralSchema" } },
              ],
            },
          },
          definition: {
            "b": { type: "array", definition: { type: "schemaReference", definition: {relativePath: "jzodElementSchema"} } },
          },
        }

        testJzodToTs(
          logsPath,
          "tsTypeGeneration-testJzodSchema3 - reference.ts",
          "tsTypeGeneration-testJzodSchema3.ts",
          testJzodSchema3,
          "testJzodSchema3"
        );

        // ########################################################################################
        const testJzodSchema4:JzodObject = 
        {
          type: "object", 
          context: jzodBootstrapSetSchema,
          definition: {
            "c": { type: "array", definition: { type: "schemaReference", definition: {relativePath: "jzodArraySchema"} } },
          },
        }

        testJzodToTs(
          logsPath,
          "tsTypeGeneration-testJzodSchema4 - reference.ts",
          "tsTypeGeneration-testJzodSchema4.ts",
          testJzodSchema4,
          "testJzodSchema4"
        );
      }
    )

    // ############################################################################################
    it(
      "Zod to Jzod",
      async() => {
        const testZodToJzodConversion = (
          typeName: string,
          testJzodSchema:JzodElement,
          expectedJzodSchema?: JzodElement,
        ) => {
          const testZodSchema:ZodSchemaAndDescription<ZodTypeAny> = jzodElementSchemaToZodSchemaAndDescription(
            testJzodSchema,
            () => ({}) as ZodSchemaAndDescriptionRecord<ZodTypeAny>,
            () => ({}) as ZodSchemaAndDescriptionRecord<ZodTypeAny>,
          )
          const testResult = zodToJzod(testZodSchema.zodSchema,typeName);
          // console.log("Zod to Jzod testJzodSchema", typeName, JSON.stringify(testJzodSchema),"result",JSON.stringify(testResult));
          
          expect(testResult).toEqual(expectedJzodSchema??testJzodSchema);
        }

        // const test1JzodSchema:JzodElement = { type: "simpleType", definition: "any"}
        testZodToJzodConversion("test1",{ type: "simpleType", definition: "any"});
        testZodToJzodConversion("test2",{ type: "simpleType", definition: "string"});
        testZodToJzodConversion("test3",{ type: "simpleType", definition: "number"});
        testZodToJzodConversion("test4",{ type: "simpleType", definition: "bigint"});
        testZodToJzodConversion("test5",{ type: "simpleType", definition: "boolean"});
        testZodToJzodConversion("test6",{ type: "simpleType", definition: "date"});
        testZodToJzodConversion("test7",{ type: "simpleType", definition: "undefined"});
        testZodToJzodConversion("test8",{ type: "simpleType", definition: "unknown"});
        testZodToJzodConversion("test9",{ type: "simpleType", definition: "never"});
        testZodToJzodConversion("test11",{ type: "literal", definition: "test"})
        testZodToJzodConversion("test12",{ type: "array", definition: { type: "simpleType", definition: "any"}})
        testZodToJzodConversion("test13",{ type: "array", definition: { type: "simpleType", definition: "number"}})
        testZodToJzodConversion("test14",{ type: "array", definition: { type: "literal", definition: "number"}})
        testZodToJzodConversion("test15",{ type: "enum", definition: [ "a", "b", "c", "d" ] })
        testZodToJzodConversion("test16",{ type: "union", definition: [ { type: "simpleType", definition: "string"}, { type: "simpleType", definition: "number"} ] },)
        testZodToJzodConversion("test17",{ type: "object", definition: { a: { type: "simpleType", definition: "string"}, b: { type: "simpleType", definition: "number"} } })
        testZodToJzodConversion("test18",{ type: "object", definition: { a: { type: "simpleType", definition: "string"}, b: { type: "simpleType", definition: "number", optional:true} } })
        testZodToJzodConversion(
          "test19",
          {
            type: "object",
            definition: {
              a: { type: "simpleType", definition: "string" },
              b: { type: "simpleType", definition: "number", optional: false },
            },
          },
          {
            type: "object",
            definition: {
              a: { type: "simpleType", definition: "string" },
              b: { type: "simpleType", definition: "number" },
            },
          }
        );
        const test20 = zodToJzod(
          z.discriminatedUnion("kind", [
            z.object({ kind: z.literal("a"), a: z.string() }),
            z.object({ kind: z.literal("b"), b: z.number() }),
          ]),
          "test20"
        );
        console.log("Zod to Jzod testJzodSchema test20",JSON.stringify(test20));
          
        expect(
          test20
        ).toEqual({
          type: "union",
          discriminant: "kind",
          definition: [
            {
              type: "object",
              definition: {
                kind: { type: "literal", definition: "a" },
                a: { type: "simpleType", definition: "string" },
              },
            },
            {
              type: "object",
              definition: {
                kind: { type: "literal", definition: "b" },
                b: { type: "simpleType", definition: "number" },
              },
            },
          ],
        });
        testZodToJzodConversion("test21",{ type: "simpleType", definition: "boolean", optional: true});
        testZodToJzodConversion("test22",{ type: "simpleType", definition: "boolean", optional: false},{ type: "simpleType", definition: "boolean"});
        testZodToJzodConversion("test23",{ type: "simpleType", definition: "number", nullable: true});
        testZodToJzodConversion("test24",{ type: "simpleType", definition: "number", nullable: false},{ type: "simpleType", definition: "number"});
        testZodToJzodConversion("test25",{ type: "record", definition: {type: "simpleType", definition: "number"} });
        testZodToJzodConversion("test26",{ type: "tuple", definition: [ {type: "simpleType", definition: "number"}, {type: "simpleType", definition: "number"} ]});
        testZodToJzodConversion("test27", {
          type: "intersection",
          definition: {
            left: { type: "object", definition: { name: { type: "simpleType", definition: "string" } } },
            right: { type: "object", definition: { role: { type: "simpleType", definition: "string" } } },
          },
        });
        testZodToJzodConversion("test28",{ type: "map", definition: [ { type: "simpleType", definition: "string" }, { type: "simpleType", definition: "number" }]});
        testZodToJzodConversion("test29",{ type: "set", definition: { type: "simpleType", definition: "string" }});
        testZodToJzodConversion("test30",{ type: "schemaReference", definition: { relativePath: "test30" }});
        testZodToJzodConversion("test31",{ type: "function", definition: { args: [{ type: "simpleType", definition: "string" }], returns: { type: "simpleType", definition: "number" } }});
        testZodToJzodConversion("test32",{ type: "promise", definition: { type: "simpleType", definition: "string" }});
      }
    )

  }
)



