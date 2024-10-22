import { ZodObject, ZodTypeAny, z } from "zod";

import {
  JzodElement,
  JzodObject,
  JzodReference,
  jzodToTsCode
} from "@miroir-framework/jzod-ts";

import {
  ZodSchemaAndDescription,
  ZodSchemaAndDescriptionRecord,
  jzodBootstrapElementSchema
} from "../src/JzodInterface";
import {
  jzodElementSchemaToZodSchemaAndDescription,
} from "../src/JzodToZod";
import { zodToJzod } from "../src/ZodToJzod";
import { ResolutionFunction, applyCarryOnSchema } from "../src/JzodToJzod";

import { convertZodSchemaToJsonSchemaAndWriteToFile } from "./utils";

// const tmpPath = "./tests/tmp";
// const referencesPath = "./tests/references";

// function compareZodSchemas(
//   testName: string,
//   referenceZodSchema: ZodTypeAny,
//   testJzodSchema: JzodElement,
//   definitions?: { [k: string]: ZodTypeAny }
// ) {
//   // console.log("#### starting", testName);

//   const testJzodSchemaZodSchemaAndDescription: ZodSchemaAndDescription =
//     jzodElementSchemaToZodSchemaAndDescription(testJzodSchema);
//   // console.log("#### converted", testName);

//   const referenceTestJsonSchema = convertZodSchemaToJsonSchemaAndWriteToFile(
//     "testZodSchema",
//     referenceZodSchema,
//     undefined,
//     definitions
//   );
//   const convertedTestJsonSchema = convertZodSchemaToJsonSchemaAndWriteToFile(
//     "test2ZodSchema",
//     testJzodSchemaZodSchemaAndDescription.zodSchema,
//     undefined
//   );
//   // console.log("converted", convertedTestJsonSchema);
//   // console.log("expected", referenceTestJsonSchema);

//   expect(convertedTestJsonSchema).toEqual(referenceTestJsonSchema);
//   // console.log("#### done", testName);
// }
interface TestCase {
  name: string,
  testJzodSchema: JzodElement,
  carryOnJzodSchema: JzodObject,
  expectedReferences: Record<string,JzodElement>,
  expectedResult: JzodElement,
  resolveJzodReference?: ResolutionFunction, // non-converted reference lookup
  convertedReferences?: Record<string, JzodElement>, // converted reference lookup
}
function runTest(
  t: TestCase
) {
  const testResult = applyCarryOnSchema(
    t.testJzodSchema,
    t.carryOnJzodSchema,
    undefined,
    t.resolveJzodReference,
    t.convertedReferences
  );
  console.log(t.name, "new references=", JSON.stringify(testResult.resolvedReferences, null, 2))
  console.log(t.name, "expectedResult=", JSON.stringify(t.expectedResult, null, 2))
  console.log(t.name, "result=", JSON.stringify(testResult.resultSchema, null, 2))
  expect(testResult.resultSchema).toEqual(t.expectedResult)
  expect(testResult.resolvedReferences).toEqual(t.expectedReferences)
}


// ################################################################################################
// ################################################################################################
// ################################################################################################
// ################################################################################################
describe(
  'JzodToJzod',
  () => {

    // ###########################################################################################
    it('jzod carryOn conversion',
      () => {
        const tests: TestCase[] = [
          // // test010: simple object schema, no references
          // {
          //   name: "test10",
          //   testJzodSchema: {
          //     type: "object",
          //     definition: {
          //       a: { type: "string" },
          //       b: {
          //         type: "object",
          //         definition: {
          //           b1: { type: "boolean", optional: true },
          //           b2: { type: "array", definition: { type: "boolean" } },
          //         },
          //       },
          //     },
          //   },
          //   carryOnJzodSchema: {
          //     type: "object",
          //     definition: {
          //       c: { type: "string" },
          //     },
          //   },
          //   expectedResult: {
          //     type: "union",
          //     definition: [
          //       {
          //         type: "object",
          //         definition: {
          //           c: {
          //             type: "string",
          //           },
          //         },
          //       },
          //       {
          //         type: "object",
          //         definition: {
          //           a: {
          //             type: "union",
          //             definition: [
          //               {
          //                 type: "string",
          //               },
          //               {
          //                 type: "object",
          //                 definition: {
          //                   c: {
          //                     type: "string",
          //                   },
          //                 },
          //               },
          //             ],
          //           },
          //           b: {
          //             type: "union",
          //             definition: [
          //               {
          //                 type: "object",
          //                 definition: {
          //                   c: {
          //                     type: "string",
          //                   },
          //                 },
          //               },
          //               {
          //                 type: "object",
          //                 definition: {
          //                   b1: {
          //                     type: "union",
          //                     optional: true,
          //                     definition: [
          //                       {
          //                         type: "boolean",
          //                         optional: true,
          //                       },
          //                       {
          //                         type: "object",
          //                         definition: {
          //                           c: {
          //                             type: "string",
          //                           },
          //                         },
          //                       },
          //                     ],
          //                   },
          //                   b2: {
          //                     type: "union",
          //                     definition: [
          //                       {
          //                         type: "array",
          //                         definition: {
          //                           type: "union",
          //                           definition: [
          //                             {
          //                               type: "boolean",
          //                             },
          //                             {
          //                               type: "object",
          //                               definition: {
          //                                 c: {
          //                                   type: "string",
          //                                 },
          //                               },
          //                             },
          //                           ],
          //                         },
          //                       },
          //                       {
          //                         type: "object",
          //                         definition: {
          //                           c: {
          //                             type: "string",
          //                           },
          //                         },
          //                       },
          //                     ],
          //                   },
          //                 },
          //               },
          //             ],
          //           },
          //         },
          //       },
          //     ],
          //   },
          //   expectedReferences: {},
          // },
          // // test020: simple schemaReference with complex carryOn type
          // {
          //   name: "test020",
          //   testJzodSchema: {
          //     type: "schemaReference",
          //     definition: {
          //       absolutePath: "1e8dab4b-65a3-4686-922e-ce89a2d62aa9",
          //       relativePath: "myObject",
          //     },
          //   },
          //   carryOnJzodSchema: {
          //     type: "object",
          //     definition: {
          //       d: { type: "string" },
          //     },
          //   },
          //   expectedResult: {
          //     type: "union",
          //     extra: undefined,
          //     nullable: undefined,
          //     optional: undefined,
          //     definition: [
          //       {
          //         type: "schemaReference",
          //         context: {},
          //         definition: {
          //           relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myObject",
          //         },
          //       },
          //       {
          //         type: "object",
          //         definition: {
          //           d: {
          //             type: "string",
          //           },
          //         },
          //       },
          //     ],
          //   },
          //   expectedReferences: {
          //     carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myObject: {
          //       type: "union",
          //       definition: [
          //         {
          //           type: "object",
          //           definition: {
          //             d: {
          //               type: "string",
          //             },
          //           },
          //         },
          //         {
          //           type: "object",
          //           definition: {
          //             a: {
          //               type: "union",
          //               definition: [
          //                 {
          //                   type: "string",
          //                 },
          //                 {
          //                   type: "object",
          //                   definition: {
          //                     d: {
          //                       type: "string",
          //                     },
          //                   },
          //                 },
          //               ],
          //             },
          //             b: {
          //               type: "union",
          //               definition: [
          //                 {
          //                   type: "schemaReference",
          //                   definition: {
          //                     relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myObject",
          //                   },
          //                   context: {},
          //                 },
          //                 {
          //                   type: "object",
          //                   definition: {
          //                     d: {
          //                       type: "string",
          //                     },
          //                   },
          //                 },
          //               ],
          //             },
          //             c: {
          //               type: "union",
          //               definition: [
          //                 {
          //                   type: "array",
          //                   definition: {
          //                     type: "union",
          //                     definition: [
          //                       {
          //                         type: "schemaReference",
          //                         definition: {
          //                           relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myObject",
          //                         },
          //                         context: {},
          //                       },
          //                       {
          //                         type: "object",
          //                         definition: {
          //                           d: {
          //                             type: "string",
          //                           },
          //                         },
          //                       },
          //                     ],
          //                   },
          //                 },
          //                 {
          //                   type: "object",
          //                   definition: {
          //                     d: {
          //                       type: "string",
          //                     },
          //                   },
          //                 },
          //               ],
          //             },
          //           },
          //         },
          //       ],
          //     },
          //   },
          //   resolveJzodReference: (ref: JzodReference): JzodElement | undefined => {
          //     const store: Record<string, JzodReference> = {
          //       "1e8dab4b-65a3-4686-922e-ce89a2d62aa9": {
          //         type: "schemaReference",
          //         context: {
          //           myObject: {
          //             type: "object",
          //             definition: {
          //               a: { type: "string" },
          //               b: { type: "schemaReference", definition: { relativePath: "myObject" } },
          //               c: {
          //                 type: "array",
          //                 definition: { type: "schemaReference", definition: { relativePath: "myObject" } },
          //               },
          //             },
          //           },
          //           myString: { type: "string" },
          //         },
          //         definition: { relativePath: "myObject" },
          //       },
          //     };
          //     const resolvedAbsolutePath = store[ref.definition?.absolutePath ?? ""];
          //     return resolvedAbsolutePath && resolvedAbsolutePath.context
          //       ? resolvedAbsolutePath.context[ref.definition?.relativePath ?? ""]
          //       : undefined;
          //   },
          // },
          // // test030: simple base type with absolute schemaReference and simple carryOn type
          // {
          //   name: "test30",
          //   testJzodSchema: {
          //     type: "schemaReference",
          //     definition: { absolutePath: "1e8dab4b-65a3-4686-922e-ce89a2d62aa9", relativePath: "myString" },
          //   },
          //   carryOnJzodSchema: {
          //     type: "object",
          //     definition: {
          //       c: { type: "number" },
          //     },
          //   },
          //   resolveJzodReference: (ref: JzodReference): JzodElement | undefined => {
          //     const store: Record<string, JzodReference> = {
          //       "1e8dab4b-65a3-4686-922e-ce89a2d62aa9": {
          //         type: "schemaReference",
          //         context: {
          //           myString: { type: "string" },
          //         },
          //         definition: { relativePath: "myString" },
          //       },
          //     };
          //     const resolvedAbsolutePath = store[ref.definition?.absolutePath ?? ""];
          //     return resolvedAbsolutePath && resolvedAbsolutePath.context
          //       ? resolvedAbsolutePath.context[ref.definition?.relativePath ?? ""]
          //       : undefined;
          //   },
          //   expectedResult: {
          //     type: "union",
          //     extra: undefined,
          //     optional: undefined,
          //     nullable: undefined,
          //     definition: [
          //       {
          //         type: "schemaReference",
          //         context: {},
          //         definition: {
          //           relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString",
          //         },
          //       },
          //       {
          //         type: "object",
          //         definition: {
          //           c: {
          //             type: "number",
          //           },
          //         },
          //       },
          //     ],
          //   },
          //   expectedReferences: {
          //     carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString: {
          //       type: "union",
          //       definition: [
          //         {
          //           type: "string",
          //         },
          //         {
          //           type: "object",
          //           definition: {
          //             c: {
          //               type: "number",
          //             },
          //           },
          //         },
          //       ],
          //     },
          //   },
          // },
          // // test040: simple base type with absolute schemaReference within object and simple carryOn type
          // {
          //   name: "test040",
          //   testJzodSchema: {
          //     type: "object",
          //     definition: {
          //       a: {
          //         type: "schemaReference",
          //         definition: { absolutePath: "1e8dab4b-65a3-4686-922e-ce89a2d62aa9", relativePath: "myString" },
          //       },
          //     },
          //   },
          //   carryOnJzodSchema: {
          //     type: "object",
          //     definition: {
          //       c: { type: "number" },
          //     },
          //   },
          //   resolveJzodReference: (ref: JzodReference): JzodElement | undefined => {
          //     const store: Record<string, JzodReference> = {
          //       "1e8dab4b-65a3-4686-922e-ce89a2d62aa9": {
          //         type: "schemaReference",
          //         context: {
          //           myString: { type: "string" },
          //         },
          //         definition: { relativePath: "myString" },
          //       },
          //     };
          //     const resolvedAbsolutePath = store[ref.definition?.absolutePath ?? ""];
          //     return resolvedAbsolutePath && resolvedAbsolutePath.context
          //       ? resolvedAbsolutePath.context[ref.definition?.relativePath ?? ""]
          //       : undefined;
          //   },
          //   expectedResult: {
          //     type: "union",
          //     extra: undefined,
          //     optional: undefined,
          //     nullable: undefined,
          //     definition: [
          //       {
          //         type: "object",
          //         definition: {
          //           c: {
          //             type: "number",
          //           },
          //         },
          //       },
          //       {
          //         type: "object",
          //         definition: {
          //           a: {
          //             type: "union",
          //             definition: [
          //               {
          //                 type: "schemaReference",
          //                 context: {},
          //                 definition: {
          //                   relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString",
          //                 },
          //               },
          //               {
          //                 type: "object",
          //                 definition: {
          //                   c: {
          //                     type: "number",
          //                   },
          //                 },
          //               },
          //             ],
          //           },
          //         },
          //       },
          //     ],
          //   },
          //   expectedReferences: {
          //     carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString: {
          //       type: "union",
          //       definition: [
          //         {
          //           type: "string",
          //         },
          //         {
          //           type: "object",
          //           definition: {
          //             c: {
          //               type: "number",
          //             },
          //           },
          //         },
          //       ],
          //     },
          //   },
          // },
          // // test050: simple base type with absolute schemaReference within object and union and simple carryOn type
          // {
          //   name: "test050",
          //   testJzodSchema: {
          //     type: "object",
          //     definition: {
          //       a: {
          //         type: "union",
          //         definition: [
          //           {
          //             type: "schemaReference",
          //             definition: { absolutePath: "1e8dab4b-65a3-4686-922e-ce89a2d62aa9", relativePath: "myString" },
          //           },
          //           {
          //             type: "number",
          //           },
          //         ],
          //       },
          //     },
          //   },
          //   carryOnJzodSchema: {
          //     type: "object",
          //     definition: {
          //       c: { type: "number" },
          //     },
          //   },
          //   resolveJzodReference: (ref: JzodReference): JzodElement | undefined => {
          //     const store: Record<string, JzodReference> = {
          //       "1e8dab4b-65a3-4686-922e-ce89a2d62aa9": {
          //         type: "schemaReference",
          //         context: {
          //           myString: { type: "string" },
          //         },
          //         definition: { relativePath: "myString" },
          //       },
          //     };
          //     const resolvedAbsolutePath = store[ref.definition?.absolutePath ?? ""];
          //     return resolvedAbsolutePath && resolvedAbsolutePath.context
          //       ? resolvedAbsolutePath.context[ref.definition?.relativePath ?? ""]
          //       : undefined;
          //   },
          //   expectedResult: {
          //     type: "union",
          //     definition: [
          //       {
          //         type: "object",
          //         definition: {
          //           c: {
          //             type: "number",
          //           },
          //         },
          //       },
          //       {
          //         type: "object",
          //         definition: {
          //           a: {
          //             type: "union",
          //             definition: [
          //               {
          //                 type: "union",
          //                 definition: [
          //                   {
          //                     type: "schemaReference",
          //                     definition: {
          //                       relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString",
          //                     },
          //                     context: {},
          //                   },
          //                   {
          //                     type: "object",
          //                     definition: {
          //                       c: {
          //                         type: "number",
          //                       },
          //                     },
          //                   },
          //                 ],
          //               },
          //               {
          //                 type: "number",
          //               },
          //               {
          //                 type: "object",
          //                 definition: {
          //                   c: {
          //                     type: "number",
          //                   },
          //                 },
          //               },
          //             ],
          //           },
          //         },
          //       },
          //     ],
          //   },
          //   expectedReferences: {
          //     carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString: {
          //       type: "union",
          //       definition: [
          //         {
          //           type: "string",
          //         },
          //         {
          //           type: "object",
          //           definition: {
          //             c: {
          //               type: "number",
          //             },
          //           },
          //         },
          //       ],
          //     },
          //   },
          // },
          // test060: complex base type with one inner relative schemaReference and one inner absolute schemaReference, on a simple carryOn type
          {
            name: "test060",
            testJzodSchema: {
              type: "object",
              definition: {
                a: {
                  type: "schemaReference",
                  context: {
                    innerString: { type: "string" },
                  },
                  definition: { relativePath: "innerString" },
                },
                b: {
                  type: "schemaReference",
                  definition: { absolutePath: "1e8dab4b-65a3-4686-922e-ce89a2d62aa9", relativePath: "myString" },
                },
                d: {
                  type: "schemaReference",
                  definition: { absolutePath: "1e8dab4b-65a3-4686-922e-ce89a2d62aa9", relativePath: "myString" },
                },
              },
            },
            carryOnJzodSchema: {
              type: "object",
              definition: {
                c: { type: "number" },
              },
            },
            resolveJzodReference: (ref: JzodReference): JzodElement | undefined => {
              const store: Record<string, JzodReference> = {
                "1e8dab4b-65a3-4686-922e-ce89a2d62aa9": {
                  type: "schemaReference",
                  context: {
                    myString: { type: "string" },
                  },
                  definition: { relativePath: "myString" },
                },
              };
              const resolvedAbsolutePath = store[ref.definition?.absolutePath ?? ""];
              return resolvedAbsolutePath && resolvedAbsolutePath.context
                ? resolvedAbsolutePath.context[ref.definition?.relativePath ?? ""]
                : undefined;
            },
            expectedResult: {
              type: "union",
              definition: [
                {
                  type: "object",
                  definition: {
                    c: {
                      type: "number",
                    },
                  },
                },
                {
                  type: "object",
                  definition: {
                    a: {
                      type: "union",
                      definition: [
                        {
                          type: "schemaReference",
                          context: {
                            innerString: {
                              type: "union",
                              definition: [
                                {
                                  type: "string",
                                },
                                {
                                  type: "object",
                                  definition: {
                                    c: {
                                      type: "number",
                                    },
                                  },
                                },
                              ],
                            },
                          },
                          definition: {
                            relativePath: "innerString",
                          },
                        },
                        {
                          type: "object",
                          definition: {
                            c: {
                              type: "number",
                            },
                          },
                        },
                      ],
                    },
                    b: {
                      type: "union",
                      definition: [
                        {
                          type: "schemaReference",
                          definition: {
                            relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString",
                          },
                          context: {},
                        },
                        {
                          type: "object",
                          definition: {
                            c: {
                              type: "number",
                            },
                          },
                        },
                      ],
                    },
                    d: {
                      type: "union",
                      definition: [
                        {
                          type: "schemaReference",
                          definition: {
                            relativePath: "carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString",
                          },
                          context: {},
                        },
                        {
                          type: "object",
                          definition: {
                            c: {
                              type: "number",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            expectedReferences: {
              carryOn_1e8dab4b$65a3$4686$922e$ce89a2d62aa9_myString: {
                type: "union",
                definition: [
                  {
                    type: "string",
                  },
                  {
                    type: "object",
                    definition: {
                      c: {
                        type: "number",
                      },
                    },
                  },
                ],
              },
            },
          },
        ];
        for (const t of tests) {
          runTest(t)
        }
      }
    )
  }
)



