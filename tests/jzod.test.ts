import { ZodObject, ZodTypeAny, z } from "zod";

import {
  JzodElement
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

import { convertZodSchemaToJsonSchemaAndWriteToFile } from "./utils";

const tmpPath = "./tests/tmp";
const referencesPath = "./tests/references";

function compareZodSchemas(
  testName: string,
  referenceZodSchema: ZodTypeAny,
  testJzodSchema: JzodElement,
  definitions?: { [k: string]: ZodTypeAny }
) {
  // console.log("#### starting", testName);

  const testJzodSchemaZodSchemaAndDescription: ZodSchemaAndDescription =
    jzodElementSchemaToZodSchemaAndDescription(testJzodSchema);
  // console.log("#### converted", testName);

  const referenceTestJsonSchema = convertZodSchemaToJsonSchemaAndWriteToFile(
    "testZodSchema",
    referenceZodSchema,
    undefined,
    definitions
  );
  const convertedTestJsonSchema = convertZodSchemaToJsonSchemaAndWriteToFile(
    "test2ZodSchema",
    testJzodSchemaZodSchemaAndDescription.zodSchema,
    undefined
  );
  // console.log("converted", convertedTestJsonSchema);
  // console.log("expected", referenceTestJsonSchema);

  expect(convertedTestJsonSchema).toEqual(referenceTestJsonSchema);
  // console.log("#### done", testName);
}



// ################################################################################################
// ################################################################################################
// ################################################################################################
// ################################################################################################
describe(
  'Jzod',
  () => {

    // ###########################################################################################
    it(
      'jzod elementary schema conversion',
      () => {
        const test1JzodSchema:JzodElement = {
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
        ;

        const reference1ZodSchema:ZodSchemaAndDescription = {
          zodSchema: z.object({
            a: z.string(),
            b: z.object({b1:z.boolean().optional(), b2: z.array(z.boolean())})
          }),
          zodText:""
        }

        compareZodSchemas("test1", reference1ZodSchema.zodSchema, test1JzodSchema);

        // ########################################################################################
        const test2JzodSchema:JzodElement = {
          type: "schemaReference",
          context: {
            a: { type: "simpleType", definition: "string" },
          },
          definition: { relativePath: "a" }
        };

        const reference2ZodSchema:ZodTypeAny = z.string();

        compareZodSchemas("test2", reference2ZodSchema, test2JzodSchema);

        // ########################################################################################
        const test3JzodSchema:JzodElement = {
          type: "schemaReference",
          context: {
            a: { type: "simpleType", definition: "string" },
            b: {
              type: "schemaReference",
              definition: { absolutePath: "a"}
            },
          },
          definition: { relativePath: "b" }
        };

        const reference3ZodSchema:ZodTypeAny = z.string();

        compareZodSchemas("test3", reference3ZodSchema, test3JzodSchema);
        
        // ########################################################################################
        const test4JzodSchema:JzodElement = {
          type: "schemaReference",
          context: {
            b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
              type: "schemaReference",
              definition: { relativePath: "a"}
            },
            a: { type: "simpleType", definition: "string" },
          },
          definition: { relativePath: "b" }
        };

        const reference4ZodSchema:ZodTypeAny = z.string();

        compareZodSchemas("test4", reference4ZodSchema, test4JzodSchema);
        
        // ########################################################################################
        const test5JzodSchema:JzodElement = {
          type: "schemaReference",
          context: {
            a: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
            b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
              type: "object",
              definition: {
                b: { type: "schemaReference", definition: { relativePath: "a"} }
              }
            },
          },
          definition: { relativePath: "b" }
        };

        const reference5ZodSchema:ZodTypeAny = z.object({b: z.object({a:z.string()})});

        compareZodSchemas("test5", reference5ZodSchema, test5JzodSchema);
        
        // ########################################################################################
        const test6JzodSchema:JzodElement = {
          type: "schemaReference",
          context: {
            a: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
            b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
              type: "object",
              extend: { type: "schemaReference", definition: { eager: true, relativePath: "a"}},
              definition: {
                b: { type: "schemaReference", definition: { relativePath: "a"} }
              }
            },
          },
          definition: { relativePath: "b" }
        };

        const reference6ZodSchemaA: ZodObject<any> = z.object({ a: z.string() })
        const reference6ZodSchema: ZodTypeAny = reference6ZodSchemaA.extend({ b: reference6ZodSchemaA });
        compareZodSchemas("test6", reference6ZodSchema, test6JzodSchema);

        // ########################################################################################
        const test7JzodSchema:JzodElement = {
          type: "schemaReference",
          context: {
            a: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
            c: { type: "simpleType", definition: "string", optional: true },
            b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
              type: "object",
              extend: { type: "schemaReference", definition: { eager: true, relativePath: "a"}},
              definition: {
                b: { type: "schemaReference", definition: { relativePath: "a"} },
                c: { type: "schemaReference", definition: { relativePath: "c"} },
              }
            }
          },
          definition: { relativePath: "b" }
        };

        const reference7ZodSchemaA: ZodObject<any> = z.object({ a: z.string() })
        const reference7ZodSchemaC: ZodTypeAny = z.string().optional();
        const reference7ZodSchema: ZodTypeAny = reference7ZodSchemaA.extend({ b: reference7ZodSchemaA, c: reference7ZodSchemaC });
        compareZodSchemas("test7", reference7ZodSchema, test7JzodSchema);
        
        // ########################################################################################
        const test8JzodSchema:JzodElement = {
          type: "schemaReference",
          context: {
            a: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
            b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
              type: "object",
              extend: { type: "schemaReference", definition: { eager: true, relativePath: "a"}},
              definition: {
                x: { type: "schemaReference", definition: { relativePath: "a"} },
                y: { type: "schemaReference", definition: { relativePath: "c"} },
              }
            },
            c: { type: "simpleType", definition: "string", optional: true },
          },
          definition: { relativePath: "b" }
        };

        const reference8ZodSchemaA: ZodObject<any> = z.object({ a: z.string() })
        const reference8ZodSchemaC: ZodTypeAny = z.string().optional();
        const reference8ZodSchema: ZodTypeAny = reference8ZodSchemaA.extend({
          // b: convertReference(z.lazy(() => reference8ZodSchemaA)
          x: z.lazy(() => reference8ZodSchemaA),
          y: z.lazy(() => reference8ZodSchemaC),
        });
        compareZodSchemas("test8", reference8ZodSchema, test8JzodSchema);
        
        
      }
    )


    // // ###########################################################################################
    // it(
    //   'generated Zod schema from jzodBootstrapElementSchema is equivalent to hand-written Zod schema (will have no interest whenever zod schemas for bootstrap will be automatically generated)',
    //   () => {
    //     const referenceSchemaFilePath = path.join(referencesPath,'jsonZodBootstrap_reference.json');
    //     const convertedElementSchemaFilePath = path.join(tmpPath,'jsonZodBootstrap_converted.json');

    //     const jzodBootstrapElementZodSchema:ZodTypeAny = jzodToZod(jzodBootstrapElementSchema);

    //     // console.log("jzod bootstrap equivalence convertedJsonZodSchema", JSON.stringify(jzodBootstrapElementZodSchema));
        
    //     const test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile(
    //       "jsonZodBootstrap_reference",
    //       jzodElement,
    //       referenceSchemaFilePath
    //     );
    //     const test2ZodSchemaJsonSchemaWithoutBootstrapElementString = convertZodSchemaToJsonSchemaAndWriteToFile(
    //       "jsonZodBootstrap_converted",
    //       jzodBootstrapElementZodSchema,
    //       convertedElementSchemaFilePath
    //     );

    //     // equivalence between "hard-coded" and converted schemas
    //     expect(test2JsonZodSchemaJsonSchemaWithoutBootstrapElementString).toEqual(test2ZodSchemaJsonSchemaWithoutBootstrapElementString);
    //   }
    // )




    // ###########################################################################################
    it(
      'jzod schema simple parsing',
      () => {
  
        console.log("jzod schema simple parsing converting jzodBootstrapElementSchema");
        const jzodBootstrapElementZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(jzodBootstrapElementSchema);

        console.log("jzod schema simple parsing starting parsing proper ");
        
        // ########################################################################################
        const testSet: any = {
          test0: { type: "simpleType", definition: "string", optional: true },
          test1: {
            type: "object",
            nonStrict: true,
            definition: { a: { type: "simpleType", definition: "string", nullable:true } },
          },
          test2: {
            type: "object",
            extend: { type: "schemaReference", definition: { relativePath: "test0" } },
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

        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test0).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test1).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test2).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test3).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test4).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test5).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test6).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test7).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test8).success).toBeTruthy();

        // ########################################################################################
        // tests to fail
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse({type:"lazys",definition:"test"}).success).toBeFalsy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse({type:"lazy",type2:"lazy2",definition:"test"}).success).toBeFalsy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse({
          type: "record",
          definition: { type: "object", definition: { a: { type: "simpleType", definition: "undefined!!!!!!" } } },
        }).success).toBeFalsy();

        const illShapedReference = {
          type: "object",
          definition: {
            b: { type: "schemaReference", relativePathS: "test0" },
            c: { type: "schemaReference", relativePath: "test1" },
          }
        };
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(illShapedReference).success).toBeFalsy();
      }
    )

    // ###########################################################################################
    it(
      'jzod bootstrap self parsing',
      () => {
        const jzodBootstrapElementZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(jzodBootstrapElementSchema);
        // console.log("jzodBootstrapElementSchema",JSON.stringify(jzodBootstrapElementSchema));

        // ~~~~~~~~~~~~~~~~~ BOOTSTRAP TEST ~~~~~~~~~~~~~~~~~~~~~~~~
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(jzodBootstrapElementSchema).success).toBeTruthy();
      }
    )

    // ###########################################################################################
    it(
      'jzod simple data parsing',
      () => {
        const absoluteReferences = {
          // "123": jzodElementSchemaToZodSchemaAndDescription({type: "object", definition: {"x": {type:"simpleType", definition:"string"}}})
          // "123": jzodElementSchemaToZodSchemaAndDescription({type:"simpleType", definition:"string"})
          "123": jzodElementSchemaToZodSchemaAndDescription({type:"simpleType", definition:"string"})
        }

        // console.log("absoluteReferences",absoluteReferences);
        const test0: JzodElement = { type: "simpleType", definition: "string", optional: true };
        const test1: JzodElement = {
          type: "object",
          partial: true,
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
        };
        const test2: JzodElement = {
          type: "schemaReference",
          context: {
            ref0: { type: "simpleType", definition: "string", optional: true },
            ref1: {
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
            ref2: {
              type: "object",
              definition: {
                b: { type: "schemaReference", definition: { relativePath: "ref0" } },
              }
            },
            resultObject: {
              type: "object",
              extend: { type: "schemaReference", definition: { relativePath: "ref2", eager: true } },
              definition: {
                c: { type: "schemaReference", definition: { relativePath: "ref1" }, nullable: true },
              }
            }
          },
          definition: {
            relativePath: "resultObject"
          },
        };
        const test3: JzodElement = {
          type: "enum",
          definition: ["val1", "val2"],
        };
        const test4: JzodElement = {
          type: "function",
          definition: {
            args: [
              { type: "simpleType", definition: "string" },
              { type: "simpleType", definition: "number" },
            ],
            returns: { type: "simpleType", definition: "number" },
          },
        };
        const test5: JzodElement = {
          type: "record",
          definition: { type: "object", definition: { a: { type: "simpleType", definition: "string" } } },
        };
        const test6: JzodElement = {
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
        };
        const test7: JzodElement = {
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
        };
        const test8: JzodElement = {
          type: "lazy",
          definition: {
            type: "function",
            definition: {
              args: [{ type: "simpleType", definition: "string" }],
              returns: { type: "simpleType", definition: "string" },
            },
          },
        };
        const test9: JzodElement = {
          type: "simpleType",
          definition: "string",
          optional: true,
          validations: [{ type: "min", parameter: 5 }],
        };
        const test10: JzodElement = { type: "schemaReference", definition: { absolutePath: "123" } };
        const test11: JzodElement = {
          type: "schemaReference",
          context: {
            myString: {
              type: "simpleType", definition: "string" 
            },
            myObject: {
              type: "object",
              definition: {
                a: { type: "schemaReference", definition: { relativePath: "myString" } }
              }
            }
          },
          definition: { relativePath: "myObject" },
        };
        const test12: JzodElement = {
          type: "tuple",
          definition: [
            { type: "simpleType", definition: "number" },
            { type: "simpleType", definition: "string" },
          ],
        };
        const test13: JzodElement = {
          type: "intersection",
          definition: {
            left: { type: "object", definition: { name: { type: "simpleType", definition: "string" } } },
            right: { type: "object", definition: { role: { type: "simpleType", definition: "string" } } },
          },
        };
        const test14: JzodElement = {
          type: "set",
          definition: { type: "simpleType", definition: "string" },
        };
        const test15: JzodElement = {
          type: "map",
          definition: [
            { type: "simpleType", definition: "string" },
            { type: "simpleType", definition: "number" },
          ],
        };
        const test16: JzodElement = {
          type: "schemaReference", 
          context: {
            "myObject": {
              type: "object",
              definition: {
                a: {
                  type: "union",
                  definition: [
                    {
                      type: "simpleType",
                      definition: "string",
                    },
                    {
                      type: "schemaReference",
                      definition: { relativePath: "myObject"}
                    }
                  ]
                }
              }
            }
          },
          definition: { relativePath: "myObject" }
        };
        const test17: JzodElement = {
          type: "object",
          nonStrict: true,
          definition: {
            a: {
              type: "simpleType",
              definition: "number",
            },
          },
        };

        const jzodBootstrapElementZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(jzodBootstrapElementSchema);

        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test0).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test1).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test2).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test3).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test4).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test5).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test6).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test7).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test8).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test9).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test10).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test11).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test12).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test13).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test14).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test15).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test16).success).toBeTruthy();
        expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test17).success).toBeTruthy();

        const test0ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test0);
        const test1ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test1);
        const test2ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test2);
        const test3ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test3);
        const test4ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test4);
        const test5ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test5);
        const test6ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test6);
        const test7ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test7);
        const test8ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test8);
        const test9ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test9);
        const test10ZodSchema: ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
          test10,
          undefined,
          () => absoluteReferences
        );
        const test11ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test11);
        const test12ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test12);
        const test13ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test13);
        const test14ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test14);
        const test15ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test15);
        const test16ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test16);
        const test17ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test17);



        const test0_OK1 = "toto";
        const test0_OK2 = undefined;
        const test0_KO = 1;
        const test1_OK1 = {a:1, b:6};
        const test1_OK2 = {a:null, b:6};
        const test1_OK3 = {b:6};
        const test1_OK4 = {a:1};
        const test1_KO1 = {a:"toto", b:6};
        const test1_KO2 = {a:1, b: 5};
        const test1_KO3 = {a:1, b:6, c: "nok"};
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
        const test10_OK = "test";
        const test10_KO = 1;
        const test11_OK = {a: "test"};
        const test11_KO = {a:{x:"test"}};
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
        const test16_OK1 = { a: "Test"};
        const test16_OK2 = { a: { a: "Test" } };
        const test16_OK3 = { a: { a: { a: "Test"} } };
        const test16_KO1 = { a: 1 };
        const test16_KO2 = { a: { a: { a: 1 } } };
        const test16_KO3 = { a: { a: { a: "Test", b: "Test" } } };
        const test17_OK1 = { a:1, b:6 };
        const test17_KO1 = { b:6 };

        
        // #####
        expect(test0ZodSchema.zodSchema.safeParse(test0_OK1).success).toBeTruthy();
        expect(test0ZodSchema.zodSchema.safeParse(test0_OK2).success).toBeTruthy();
        expect(test0ZodSchema.zodSchema.safeParse(test0_KO).success).toBeFalsy();
        // #####
        expect(test1ZodSchema.zodSchema.safeParse(test1_OK1).success).toBeTruthy();
        expect(test1ZodSchema.zodSchema.safeParse(test1_OK2).success).toBeTruthy();
        expect(test1ZodSchema.zodSchema.safeParse(test1_OK3).success).toBeTruthy();
        expect(test1ZodSchema.zodSchema.safeParse(test1_OK4).success).toBeTruthy();
        expect(test1ZodSchema.zodSchema.safeParse(test1_KO1).success).toBeFalsy();
        expect(test1ZodSchema.zodSchema.safeParse(test1_KO2).success).toBeFalsy();
        expect(test1ZodSchema.zodSchema.safeParse(test1_KO3).success).toBeFalsy();
        // #####
        expect(test2ZodSchema.zodSchema.safeParse(test2_OK1).success).toBeTruthy();
        expect(test2ZodSchema.zodSchema.safeParse(test2_OK2).success).toBeTruthy();
        expect(test2ZodSchema.zodSchema.safeParse(test2_OK3).success).toBeTruthy();
        expect(test2ZodSchema.zodSchema.safeParse(test2_KO1).success).toBeFalsy();
        expect(test2ZodSchema.zodSchema.safeParse(test2_KO2).success).toBeFalsy();
        expect(test2ZodSchema.zodSchema.safeParse(test2_KO3).success).toBeFalsy();
        expect(test2ZodSchema.zodSchema.safeParse(test2_KO4).success).toBeFalsy();
        expect(test2ZodSchema.zodSchema.safeParse(test2_KO5).success).toBeFalsy();
        // #####
        expect(test3ZodSchema.zodSchema.safeParse(test3_OK).success).toBeTruthy();
        expect(test3ZodSchema.zodSchema.safeParse(test3_KO).success).toBeFalsy();
        // #####
        expect(test4ZodSchema.zodSchema.safeParse(test4_OK).success).toBeTruthy();
        expect(test4ZodSchema.zodSchema.safeParse(test4_KO).success).toBeFalsy();
        // #####
        expect(test5ZodSchema.zodSchema.safeParse(test5_OK).success).toBeTruthy();
        expect(test5ZodSchema.zodSchema.safeParse(test5_KO).success).toBeFalsy();
        // #####
        expect(test6ZodSchema.zodSchema.safeParse(test6_OK).success).toBeTruthy();
        expect(test6ZodSchema.zodSchema.safeParse(test6_OK2).success).toBeTruthy();
        expect(test6ZodSchema.zodSchema.safeParse(test6_KO).success).toBeFalsy();
        // #####
        expect(test7ZodSchema.zodSchema.safeParse(test7_OK).success).toBeTruthy();
        expect(test7ZodSchema.zodSchema.safeParse(test7_OK2).success).toBeTruthy();
        expect(test7ZodSchema.zodSchema.safeParse(test7_KO1).success).toBeFalsy();
        expect(test7ZodSchema.zodSchema.safeParse(test7_KO2).success).toBeFalsy();
        expect(test7ZodSchema.zodSchema.safeParse(test7_KO3).success).toBeFalsy();
        // #####
        // expect(referentialElementSetSchema.test8.zodSchema.safeParse(test8_KO1).success).toBeFalsy(); // Zod does not validate function parameter types?
        expect(test8ZodSchema.zodSchema.safeParse(test8_OK).success).toBeTruthy();
        expect(test8ZodSchema.zodSchema.safeParse(test8_KO2).success).toBeFalsy();
        // #####
        expect(test9ZodSchema.zodSchema.safeParse(test9_OK).success).toBeTruthy();
        expect(test9ZodSchema.zodSchema.safeParse(test9_KO).success).toBeFalsy();
        // #####
        expect(test10ZodSchema.zodSchema.safeParse(test10_OK).success).toBeTruthy();
        expect(test10ZodSchema.zodSchema.safeParse(test10_KO).success).toBeFalsy();
        // #####
        expect(test11ZodSchema.zodSchema.safeParse(test11_OK).success).toBeTruthy();
        expect(test11ZodSchema.zodSchema.safeParse(test11_KO).success).toBeFalsy();
        // #####
        expect(test12ZodSchema.zodSchema.safeParse(test12_OK).success).toBeTruthy();
        expect(test12ZodSchema.zodSchema.safeParse(test12_KO1).success).toBeFalsy();
        expect(test12ZodSchema.zodSchema.safeParse(test12_KO2).success).toBeFalsy();
        // #####
        // console.log("referentialElementSetSchema.test13",referentialElementSetSchema.test13.zodText,JSON.stringify(referentialElementSetSchema.test13.zodSchema));
        
        // const toto = z.intersection(z.object({name:z.string(),}).strict(),z.object({role:z.string(),}).strict())
        // console.log("compare zod schema",JSON.stringify(toto));
        // type Toto =  z.infer<typeof toto>;
        // const a:Toto = { name: "Test", role: "test"};
        // expect(referentialElementSetSchema.test13.zodSchema.parse(test13_OK).success).toBeTruthy();
        // expect(referentialElementSetSchema.test13.zodSchema.safeParse(test13_OK).success).toBeTruthy(); // FAILING!!! IS GENERATED ZOD SCHEMA WRONG??
        expect(test13ZodSchema.zodSchema.safeParse(test13_KO1).success).toBeFalsy();
        expect(test13ZodSchema.zodSchema.safeParse(test13_KO2).success).toBeFalsy();

        expect(test14ZodSchema.zodSchema.safeParse(test14_OK).success).toBeTruthy();
        expect(test14ZodSchema.zodSchema.safeParse(test14_KO).success).toBeFalsy();
        // expect(referentialElementSetSchema.test14.zodSchema.safeParse(test14_KO2).success).toBeFalsy();

        // #####
        expect(test15ZodSchema.zodSchema.safeParse(test15_OK).success).toBeTruthy();
        expect(test15ZodSchema.zodSchema.safeParse(test15_KO).success).toBeFalsy();
        // #####
        expect(test16ZodSchema.zodSchema.safeParse(test16_OK1).success).toBeTruthy();
        expect(test16ZodSchema.zodSchema.safeParse(test16_OK2).success).toBeTruthy();
        expect(test16ZodSchema.zodSchema.safeParse(test16_OK3).success).toBeTruthy();
        expect(test16ZodSchema.zodSchema.safeParse(test16_KO1).success).toBeFalsy();
        expect(test16ZodSchema.zodSchema.safeParse(test16_KO2).success).toBeFalsy();
        expect(test16ZodSchema.zodSchema.safeParse(test16_KO3).success).toBeFalsy();
        // #####
        expect(test17ZodSchema.zodSchema.safeParse(test17_OK1).success).toBeTruthy();
        expect(test17ZodSchema.zodSchema.safeParse(test17_KO1).success).toBeFalsy();


      }
    )

    // ############################################################################################
    it(
      "Jzod to Zod and back",
      async() => {

        const lazyRef:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
          {type:"simpleType", definition: "string"},
          () => ({}) as ZodSchemaAndDescriptionRecord,
          () => ({}) as ZodSchemaAndDescriptionRecord,
        );

        const testZodToJzodConversion = (
          typeName: string,
          testJzodSchema:JzodElement,
          expectedZodSchemaText: string,
          expectedJzodSchema?: JzodElement,

        ) => {
          const testZodSchemaAndDescription:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
            testJzodSchema,
            () => ({}) as ZodSchemaAndDescriptionRecord,
            () => ({lazyRef}) as ZodSchemaAndDescriptionRecord,
          )
          const testResult = zodToJzod(testZodSchemaAndDescription.zodSchema,typeName);
          // console.log("Zod to Jzod testJzodSchema", typeName, "zod text", testZodSchemaAndDescription.zodText);
          // console.log("Zod to Jzod testJzodSchema", typeName, "jzod result schema", JSON.stringify(testResult,undefined,2));
          
          expect(testZodSchemaAndDescription.zodText).toEqual(expectedZodSchemaText);
          expect(testResult).toEqual(expectedJzodSchema??testJzodSchema);
        }

        testZodToJzodConversion("test1",{ type: "simpleType", definition: "any"}, "z.any()");
        testZodToJzodConversion("test2",{ type: "simpleType", definition: "string", coerce: true },"z.coerce.string()");
        testZodToJzodConversion("test3",{ type: "simpleType", definition: "number"},"z.number()");
        testZodToJzodConversion("test4",{ type: "simpleType", definition: "bigint"},"z.bigint()");
        testZodToJzodConversion("test5",{ type: "simpleType", definition: "boolean"},"z.boolean()");
        testZodToJzodConversion("test6",{ type: "simpleType", definition: "date"},"z.date()");
        testZodToJzodConversion("test7",{ type: "simpleType", definition: "undefined"},"z.undefined()");
        testZodToJzodConversion("test8",{ type: "simpleType", definition: "unknown"},"z.unknown()");
        testZodToJzodConversion("test9",{ type: "simpleType", definition: "never"},"z.never()");
        testZodToJzodConversion("test11",{ type: "literal", definition: "test"},"z.literal(\"test\")");
        testZodToJzodConversion("test12",{ type: "array", definition: { type: "simpleType", definition: "any"}}, "z.array(z.any())");
        testZodToJzodConversion("test13",{ type: "array", definition: { type: "simpleType", definition: "number"}}, "z.array(z.number())");
        testZodToJzodConversion("test14",{ type: "array", definition: { type: "literal", definition: "number"}}, "z.array(z.literal(\"number\"))");
        testZodToJzodConversion("test15",{ type: "enum", definition: [ "a", "b", "c", "d" ] }, "z.enum([\"a\",\"b\",\"c\",\"d\"])");
        testZodToJzodConversion("test16",{ type: "union", definition: [ { type: "simpleType", definition: "string"}, { type: "simpleType", definition: "number"} ] },"z.union([z.string(), z.number()])")
        testZodToJzodConversion("test17",{ type: "object", definition: { a: { type: "simpleType", definition: "string"}, b: { type: "simpleType", definition: "number"} } }, "z.object({a:z.string(), b:z.number()}).strict()")
        testZodToJzodConversion("test18",{ type: "object", definition: { a: { type: "simpleType", definition: "string"}, b: { type: "simpleType", definition: "number", optional:true} } },"z.object({a:z.string(), b:z.number().optional()}).strict()")
        testZodToJzodConversion(
          "test19",
          {
            type: "object",
            nonStrict: true,
            definition: {
              a: { type: "simpleType", definition: "string" },
              b: { type: "simpleType", definition: "number", optional: false },
            },
          },
          "z.object({a:z.string(), b:z.number()})",
          {
            type: "object",
            nonStrict: true,
            definition: {
              a: { type: "simpleType", definition: "string" },
              b: { type: "simpleType", definition: "number" },
            },
          },
        );

        // no discriminated unions in Jzod
        const test20 = zodToJzod(
          z.discriminatedUnion("kind", [
            z.object({ kind: z.literal("a"), a: z.string() }),
            z.object({ kind: z.literal("b"), b: z.number() }),
          ]),
          "test20"
        );
        // console.log("Zod to Jzod testJzodSchema test20",JSON.stringify(test20));
          
        expect(
          test20
        ).toEqual({
          type: "union",
          discriminator: "kind",
          definition: [
            {
              type: "object",
              nonStrict: true,
              definition: {
                kind: { type: "literal", definition: "a" },
                a: { type: "simpleType", definition: "string" },
              },
            },
            {
              type: "object",
              nonStrict: true,
              definition: {
                kind: { type: "literal", definition: "b" },
                b: { type: "simpleType", definition: "number" },
              },
            },
          ],
        });
        testZodToJzodConversion("test21",{ type: "simpleType", definition: "boolean", optional: true}, "z.boolean().optional()");
        testZodToJzodConversion("test22",{ type: "simpleType", definition: "boolean", optional: false},"z.boolean()", { type: "simpleType", definition: "boolean"});
        testZodToJzodConversion("test23",{ type: "simpleType", definition: "number", nullable: true}, "z.number().nullable()");
        testZodToJzodConversion("test24",{ type: "simpleType", definition: "number", nullable: false}, "z.number()", { type: "simpleType", definition: "number"});
        testZodToJzodConversion("test25",{ type: "record", definition: {type: "simpleType", definition: "number"} }, "z.record(z.string(),z.number())");
        testZodToJzodConversion(
          "test26",
          {
            type: "tuple",
            definition: [
              { type: "simpleType", definition: "number" },
              { type: "schemaReference", definition: { absolutePath: "test26" } },
            ],
          },
          "z.tuple([z.number(), z.lazy(() =>undefined)])"
        );
        testZodToJzodConversion("test27", {
          type: "intersection",
          definition: {
            left: { type: "object", definition: { name: { type: "simpleType", definition: "string" } } },
            right: { type: "object", definition: { role: { type: "simpleType", definition: "string" } } },
          },
        }, "z.intersection(z.object({name:z.string()}).strict(),z.object({role:z.string()}).strict())");
        testZodToJzodConversion("test28",{ type: "map", definition: [ { type: "simpleType", definition: "string" }, { type: "simpleType", definition: "number" }]}, "z.map(z.string(),z.number())");
        testZodToJzodConversion("test29",{ type: "set", definition: { type: "simpleType", definition: "string" }}, "z.set(z.string())");
        testZodToJzodConversion("test30",{ type: "schemaReference", definition: { absolutePath: "test30" }}, "z.lazy(() =>undefined)"); // schemaReference are not really convertible back to Jzod: the inner structure is lost when converting to Zod
        testZodToJzodConversion("test31",{ type: "function", definition: { args: [{ type: "simpleType", definition: "string" }], returns: { type: "simpleType", definition: "number" } }}, "z.function().args([\"z.string()\"]).returns(z.number())");
        testZodToJzodConversion("test32",{ type: "promise", definition: { type: "simpleType", definition: "string" }}, "z.promise(z.string())");
        testZodToJzodConversion(
          "test33",
          {
            type: "object",
            partial: true,
            definition: {
              a: { type: "simpleType", definition: "string" },
              b: { type: "simpleType", definition: "number", optional: true },
            },
          },
          "z.object({a:z.string(), b:z.number().optional()}).strict().partial()",
          { // optional can not be converted back, it is interpreted in the Zod factory as .optional() for all attributes
            type: "object",
            definition: {
              a: { type: "simpleType", definition: "string", optional: true },
              b: { type: "simpleType", definition: "number", optional: true },
            },
          },
        );

        // TODO: HOW TO TEST SCHEMA REFERENCE CONVERSION
        // testZodToJzodConversion(
        //   "test34",
        //   {
        //     type: "schemaReference",
        //     context: {
        //       o: {
        //         type: "object", 
        //         definition: {
        //           a: { type: "simpleType", definition: "string" },
        //           b: { type: "simpleType", definition: "number", optional: true },
        //         }
        //       }
        //     },
        //     definition: {
        //       partial: true,
        //       relativePath: "o"
        //     },
        //   },
        //   // "z.object({a:z.string(), b:z.number().optional()}).strict().partial()",
        //   "z.lazy(() =>o)",
        //   { // optional can not be converted back, it is interpreted in the Zod factory as .optional() for all attributes
        //     type: "object",
        //     definition: {
        //       a: { type: "simpleType", definition: "string", optional: true },
        //       b: { type: "simpleType", definition: "number", optional: true },
        //     },
        //   },
        // );

      }
    )

  }
)



