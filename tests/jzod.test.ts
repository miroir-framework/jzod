import * as fs from "fs";
import * as path from "path";
import { ZodTypeAny, z } from "zod";
// import * as prettier from "prettier";
// import prettier from "prettier";
// import { format } from "prettier";

import { getTsCodeCorrespondingToZodSchemaAndDescription, jzodElementSchemaToZodSchemaAndDescription, jzodObjectSchemaToZodSchemaAndDescription, jzodSchemaObjectToZodSchemaAndDescriptionRecord, jzodSchemaSetToZodSchemaAndDescriptionRecord } from '../src/Jzod';
import {
  jzodArraySchema,
  JzodElementSet,
  jzodObjectSchema,
  ZodSchemaAndDescriptionRecord,
  jzodBootstrapSetSchema,
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
  jzodEnumAttributeTypesSchema,
  ZodSchemaAndDescription,
  jzodEnumElementTypesSchema,
  JzodObject,
  JzodElement,
} from "../src/JzodInterface";
import { convertZodSchemaToJsonSchemaAndWriteToFile } from "./utils";
import { createTypeAlias, printNode, withGetType, zodToTs } from "zod-to-ts";


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
          "jzodAttributeStringWithValidationsSchema": {
            zodSchema: jzodAttributeStringWithValidationsSchema,
            description:""
          },
          "jzodAttributeStringValidationsSchema": {
            zodSchema: jzodAttributeStringValidationsSchema,
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
          "jzodObjectSchema": {
            zodSchema: jzodObjectSchema,
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
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodObjectSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodRecordSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodReferenceSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodAttributeSchema).success).toBeTruthy();
        expect(zodBootstrapSchema.jzodElementSchema.zodSchema.safeParse(jzodBootstrapSetSchema.jzodUnionSchema).success).toBeTruthy();

        // ########################################################################################
        // const testSet: JzodElementSet = {
        const testSet: any = {
          test0: { type: "simpleType", definition: "string", optional: true },
          // test00: { type: "simpleType", definition: "should fail!", optional: true },
          test1: {
            type: "object",
            definition: { a: { type: "simpleType", definition: "string" } },
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
                { type: "simpleType", definition: "string" },
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
          "123": jzodObjectSchemaToZodSchemaAndDescription({type: "object", definition: {"x": {type:"simpleType", definition:"string"}}})
        }

        // console.log("absoluteReferences",absoluteReferences);
        
        const referentialElementSetToBeConverted: JzodElementSet = {
          test0: { type: "simpleType", definition: "string", optional: true },
          test1: {
            type: "object",
            definition: { a: { type: "simpleType", definition: "string" } },
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
              type: "function", 
              definition: {
                args: [ { type: "simpleType", definition: "string" } ], returns: { type: "simpleType", definition: "string" }
              }
            }
          },
          test9: { type: "simpleType", definition: "string", optional: true, validations: [{type:"min",parameter:5}] },
          test10: { type: "schemaReference", definition: { absolutePath: "123", relativePath:"x"} },
          test11: {
            "type": "object",
            "context": {"123": {type: "simpleType", definition:"string"}},
            "definition": {
              "a": { type: "schemaReference", definition: { relativePath: "123"} }
            }
          }
        };
        expect(jzodElementSetSchema.safeParse(referentialElementSetToBeConverted).success).toBeTruthy();
        expect(jzodElementSetSchema.safeParse(jzodBootstrapSetSchema).success).toBeTruthy();

        const referentialElementSetSchema = jzodSchemaSetToZodSchemaAndDescriptionRecord(referentialElementSetToBeConverted, {}, absoluteReferences?absoluteReferences:{});
        // const referentialElementSetSchema = jzodSchemaSetToZodSchemaAndDescriptionRecord(referentialElementSetToBeConverted, {}, {});


        const test0_OK = "toto";
        const test0_KO = 1;
        const test1_OK = {a:"toto"};
        const test1_KO = {a:1};
        const test2_OK = {c:{a:'test'}};
        const test2_KO = {b:1};
        const test3_OK = "val2";
        const test3_KO = "val3";
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
        const test10_OK = "toto";
        const test10_KO = 1;
        const test11_OK = {a: "toto"};
        const test11_KO = {a:{x:"toto"}};
        expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test1.zodSchema.safeParse(test1_KO).success).toBeFalsy();
        // #####
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_OK).success).toBeTruthy();
        expect(referentialElementSetSchema.test2.zodSchema.safeParse(test2_KO).success).toBeFalsy();
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
        expect(referentialElementSetSchema.test7.zodSchema.safeParse(test7_KO).success).toBeFalsy();
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
      }
    )

    // ###########################################################################################
    it(
      'jzod simple schema parsing',
      () => {

        
        // const referentialElementSetToBeConverted: JzodElementSet = {
          //   test0: { type: "simpleType", definition: "string", optional: true },
          // };
          // expect(jzodElementSetSchema.safeParse(referentialElementSetToBeConverted).success).toBeTruthy();
          // const convertedJsonZodSchema:ZodSchemaAndDescriptionRecord<ZodTypeAny> = jzodSchemaSetToZodSchemaAndDescriptionRecord(jzodBootstrapSetSchema);
        const zodBootstrapSchema:ZodSchemaAndDescriptionRecord<ZodTypeAny> = jzodSchemaSetToZodSchemaAndDescriptionRecord(jzodBootstrapSetSchema);
          
        console.log("zodBootstrapSchema",zodBootstrapSchema.jzodReferenceSchema.description);

        // expect(jzodElementSetSchema.safeParse(jzodBootstrapSetSchema).success).toBeTruthy();

        // const referentialElementSetSchema = jzodSchemaSetToZodSchemaAndDescriptionRecord(referentialElementSetToBeConverted, {}, absoluteReferences?absoluteReferences:{});

        const test0_OK = { type: "simpleType", definition: "string", optional: true };
        const test0_KO = 1;

        expect(zodBootstrapSchema.jzodAttributeSchema.zodSchema.safeParse(test0_OK).success).toBeTruthy();
        // expect(referentialElementSetSchema.test0.zodSchema.safeParse(test0_KO).success).toBeFalsy();
      }
    )

    // ############################################################################################
    it(
      "ts Type generation",
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
            typeName,
            testJzodSchema,
            () => ({}) as ZodSchemaAndDescriptionRecord<ZodTypeAny>,
            () => ({}) as ZodSchemaAndDescriptionRecord<ZodTypeAny>,
            (innerReference:ZodTypeAny,relativeReference:string|undefined) =>  withGetType(innerReference,(ts) => ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(relativeReference?relativeReference:"RELATIVEPATH_NOT_DEFINED")))
          );

          // console.log("ts Type generation convertedJsonZodSchema", JSON.stringify(convertedJsonZodSchema));


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
          // context: {
          //   jzodArraySchema: {
          //     type: "object",
          //     definition: {
          //       optional: { type: "simpleType", definition: "boolean", optional: true },
          //       extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
          //       type: { type: "literal", definition: "array" },
          //       definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
          //     },
          //   },
          //   // jzodAttributeSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     optional: { type: "simpleType", definition: "boolean", optional: true },
          //   //     extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
          //   //     type: { type: "literal", definition: "simpleType" },
          //   //     definition: { type: "schemaReference", definition: { relativePath: "jzodEnumAttributeTypesSchema" } },
          //   //   },
          //   // },
          //   // jzodAttributeStringWithValidationsSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     optional: { type: "simpleType", definition: "boolean", optional: true },
          //   //     extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
          //   //     type: { type: "literal", definition: "simpleType" },
          //   //     definition: { type: "literal", definition: "string" },
          //   //     validations: {
          //   //       type: "array",
          //   //       definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeStringValidationsSchema" } },
          //   //     },
          //   //   },
          //   // },
          //   // jzodAttributeStringValidationsSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     extra: { type: "record", definition: { type: "simpleType", definition: "any" }, optional: true },
          //   //     type: {
          //   //       type: "enum",
          //   //       definition: [
          //   //         "max",
          //   //         "min",
          //   //         "length",
          //   //         "email",
          //   //         "url",
          //   //         "emoji",
          //   //         "uuid",
          //   //         "cuid",
          //   //         "cuid2",
          //   //         "ulid",
          //   //         "regex",
          //   //         "includes",
          //   //         "startsWith",
          //   //         "endsWith",
          //   //         "datetime",
          //   //         "ip",
          //   //       ],
          //   //     },
          //   //     parameter: { type: "simpleType", definition: "any" },
          //   //   },
          //   // },
          //   jzodElementSchema: {
          //     type: "union",
          //     "discriminant": "type",
          //     definition: [
          //       { type: "schemaReference", definition: { relativePath: "jzodArraySchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodAttributeSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodAttributeStringWithValidationsSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodEnumSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodFunctionSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodLazySchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodLiteralSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodObjectSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodRecordSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodReferenceSchema" } },
          //       // { type: "schemaReference", definition: { relativePath: "jzodUnionSchema" } },
          //     ],
          //   },
          //   // jzodElementSetSchema: {
          //   //   type: "record",
          //   //   definition: { 
          //   //     "type": "schemaReference", 
          //   //     definition: { "relativePath": "jzodElementSchema" } },
          //   // },
          //   // jzodEnumSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     "optional": { type: "simpleType", definition: "boolean", optional: true },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     "type": { type: "literal", definition: "enum" },
          //   //     "definition": { type: "array", definition: { type: "simpleType", definition: "string" } },
          //   //   },
          //   // },
          //   // jzodEnumAttributeTypesSchema: {
          //   //   type: "enum",
          //   //   definition: ["any", "boolean", "number", "string", "uuid"],
          //   // },
          //   // jzodEnumElementTypesSchema: {
          //   //   type: "enum",
          //   //   definition: [
          //   //     "array",
          //   //     "enum",
          //   //     "function",
          //   //     "lazy",
          //   //     "literal",
          //   //     "object",
          //   //     "record",
          //   //     "schemaReference",
          //   //     "simpleType",
          //   //     "union",
          //   //   ],
          //   // },
          //   // jzodFunctionSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     "type": { type: "literal", definition: "function" },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     "definition": {
          //   //       type: "object",
          //   //       definition: {
          //   //         "args": {
          //   //           type: "array",
          //   //           definition: { type: "schemaReference", definition: { relativePath: "jzodAttributeSchema" } },
          //   //         },
          //   //         "returns": { type: "schemaReference", definition: { relativePath: "jzodAttributeSchema" }, optional: true },
          //   //       }
          //   //     }
          //   //   },
          //   // },
          //   // jzodLazySchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     type: { type: "literal", definition: "lazy" },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     definition: { type: "schemaReference", definition: { relativePath: "jzodFunctionSchema" } },
          //   //   },
          //   // },
          //   // jzodLiteralSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     "optional": { type: "simpleType", definition: "boolean", optional: true },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     "type": { type: "literal", definition: "literal" },
          //   //     "definition": { type: "simpleType", definition: "string" },
          //   //   },
          //   // },
          //   // jzodObjectSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     "optional": { type: "simpleType", definition: "boolean", optional: true },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     "type": { type: "literal", definition: "object" },
          //   //     "context": {
          //   //       type: "record",
          //   //       optional: true,
          //   //       definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
          //   //     },
          //   //     "definition": {
          //   //       type: "record",
          //   //       definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
          //   //     },
          //   //   },
          //   // },
          //   // jzodRecordSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     "optional": { type: "simpleType", definition: "boolean", optional: true },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     "type": { type: "literal", definition: "record" },
          //   //     "definition": { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
          //   //   },
          //   // },
          //   // jzodReferenceSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     "optional": { type: "simpleType", definition: "boolean", optional: true },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     "type": { type: "literal", definition: "schemaReference" },
          //   //     "definition" : {
          //   //       type: "object",
          //   //       definition: {
          //   //         "relativePath": { "type": "simpleType", "definition": "string", "optional": true },
          //   //         "absolutePath": { "type": "simpleType", "definition": "string", "optional": true }
          //   //       }
          //   //     }
          //   //   },
          //   // },
          //   // jzodUnionSchema: {
          //   //   type: "object",
          //   //   definition: {
          //   //     "optional": { type: "simpleType", definition: "boolean", optional: true },
          //   //     "extra": { type: "record", definition: { type: "simpleType", definition: "any"}, optional: true },
          //   //     "type": { type: "literal", definition: "union" },
          //   //     "discriminant": { type: "simpleType", definition: "string", optional: true },
          //   //     "definition": {
          //   //       type: "array",
          //   //       definition: { type: "schemaReference", definition: { relativePath: "jzodElementSchema" } },
          //   //     },
          //   //   },
          //   // },
          // },
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
  }
)
