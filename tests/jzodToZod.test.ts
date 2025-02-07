import { ZodObject, ZodTypeAny, boolean, number, optional, z } from "zod";

import {
  JzodElement,
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

import { convertZodSchemaToJsonSchemaAndWriteToFile } from "./utils";

const tmpPath = "./tests/tmp";
const referencesPath = "./tests/references";

const jzodBootstrapElementZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(jzodBootstrapElementSchema);

function compareZodSchemas(
  testName: string,
  referenceZodSchema: ZodTypeAny,
  testJzodSchema: JzodElement,
  definitions?: ZodSchemaAndDescriptionRecord
) {
  // TODO: comparison of JSON schemas does not take "strict" into account
  console.log("######################## starting", testName);

  const testJzodSchemaZodSchemaAndDescription: ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
    testJzodSchema,
    definitions ? () => definitions : undefined
  );
  // console.log("#### converted", testName);
  console.log("#### converted Jzod schema yields Zod schema text:", testJzodSchemaZodSchemaAndDescription.zodText);

  const referenceTestJsonSchema = convertZodSchemaToJsonSchemaAndWriteToFile(
    "testZodSchema",
    referenceZodSchema,
    undefined,
  );
  const convertedTestJsonSchema = convertZodSchemaToJsonSchemaAndWriteToFile(
    "test2ZodSchema",
    testJzodSchemaZodSchemaAndDescription.zodSchema,
    undefined
  );
  
  // console.log("expected", referenceTestJsonSchema);
  // console.log("converted", convertedTestJsonSchema);

  expect(convertedTestJsonSchema).toEqual(referenceTestJsonSchema);
  console.log("######################## done", testName);
}



// ################################################################################################
// ################################################################################################
// ################################################################################################
// ################################################################################################
describe(
  'JzodToZod',
  () => {
    // // ###########################################################################################
    // it('jzod elementary schema conversion',
    //   () => {
    //     // ########################################################################################
    //     // OBJECTS
    //     // ########################################################################################
    //     const test1JzodSchema:JzodElement = {
    //         type: "object",
    //         definition: {
    //           a: { type: "string" },
    //           b: {
    //             type: "object",
    //             definition: {
    //               b1: { type: "boolean", optional: true },
    //               b2: { type:"array", definition: { type: "boolean" } }
    //             },
    //           },
    //         },
    //       }
    //     ;

    //     const reference1ZodSchema:ZodSchemaAndDescription = {
    //       zodSchema: z.object({
    //         a: z.string(),
    //         b: z.object({b1:z.boolean().optional(), b2: z.array(z.boolean())})
    //       }),
    //       zodText:""
    //     }

    //     compareZodSchemas("test1", reference1ZodSchema.zodSchema, test1JzodSchema);

    //     // ########################################################################################
    //     // REFERENCES
    //     // ########################################################################################
    //     // schemaReference: simple schemaReference
    //     const test2JzodSchema:JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "string" },
    //       },
    //       definition: { relativePath: "a" }
    //     };

    //     const reference2ZodSchema:ZodTypeAny = z.string();

    //     compareZodSchemas("test2", reference2ZodSchema, test2JzodSchema);

    //     // ########################################################################################
    //     // TODO: is this right? the inner reference has absolutePath, which should be relativePath!!
    //     // Why such a difference absolutePath/relativePath, which does not seem justified here?
    //     // schemaReference: context with object that has innner schemaReference
    //     const test3JzodSchema:JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "string" },
    //         b: {
    //           type: "schemaReference",
    //           definition: { absolutePath: "a"}
    //         },
    //       },
    //       definition: { relativePath: "b" }
    //     };

    //     const reference3ZodSchema:ZodTypeAny = z.string();

    //     compareZodSchemas("test3", reference3ZodSchema, test3JzodSchema);


    //     // ########################################################################################
    //     const test20JzodSchema:any = {
    //       type: "any",
    //     };

    //     const reference20ZodSchema:ZodTypeAny = z.any();

    //     compareZodSchemas("test20", reference20ZodSchema, test20JzodSchema);

    //     // ########################################################################################
    //     const test21JzodSchema:any = {
    //       type: "string",
    //       nullable: true,
    //     };

    //     const reference21ZodSchema:ZodTypeAny = z.string().nullable();

    //     compareZodSchemas("test21", reference21ZodSchema, test21JzodSchema);

    //     // ########################################################################################
    //     const test22JzodSchema:any = {
    //       type: "uuid",
    //       optional: true
    //     };

    //     const reference22ZodSchema:ZodTypeAny = z.string().uuid().optional();

    //     compareZodSchemas("test22", reference22ZodSchema, test22JzodSchema);

    //     // ########################################################################################
    //     const test22bJzodSchema:any = {
    //       type: "string",
    //       optional: true,
    //       validations: [ { type: "uuid" } ]
    //     };

    //     const reference22bZodSchema:ZodTypeAny = z.string().uuid().optional();

    //     compareZodSchemas("test22b", reference22bZodSchema, test22bJzodSchema);

    //     // ########################################################################################
    //     const test23JzodSchema:any = {
    //       type: "never",
    //       optional: true
    //     };

    //     const reference23ZodSchema:ZodTypeAny = z.never().optional();

    //     compareZodSchemas("test23", reference23ZodSchema, test23JzodSchema);

    //     // ########################################################################################
    //     // using deprecated "simpleType" Jzod schema for string declaration
    //     const test24JzodSchema:any = {
    //       type: "string",
    //       validations:[{ type: "min", parameter: 5 }, { type:"includes", parameter:"#"}]
    //     };

    //     const reference24ZodSchema:ZodTypeAny = z.string().min(5).includes("#");

    //     compareZodSchemas("test24", reference24ZodSchema, test24JzodSchema);

    //     // ########################################################################################
    //     const test25JzodSchema:any = {
    //       type: "string",
    //       validations:[{ type: "min", parameter: 5 }, { type:"includes", parameter:"#"}]
    //     };

    //     const reference25ZodSchema:ZodTypeAny = z.string().min(5).includes("#");

    //     compareZodSchemas("test25", reference25ZodSchema, test25JzodSchema);

    //     // // ########################################################################################
    //     // // bigint literals available only from ES2020
    //     // const test26JzodSchema:any = {
    //     //   type: "bigint",
    //     //   validations:[{ type: "gt", parameter: 5n }, { type:"lt", parameter:10n}]
    //     // };

    //     // const reference26ZodSchema:ZodTypeAny = z.bigint().gt(5n).lt(10n);

    //     // compareZodSchemas("test26", reference26ZodSchema, test26JzodSchema);

    //     // ########################################################################################
    //     const test27JzodSchema:any = {
    //       type: "number",
    //       validations:[{ type: "gt", parameter: 5 }, { type:"lt", parameter:10}]
    //     };

    //     const reference27ZodSchema:ZodTypeAny = z.number().gt(5).lt(10);

    //     compareZodSchemas("test27", reference27ZodSchema, test27JzodSchema);

    //     // ########################################################################################
    //     const dateMin = new Date()
    //     const dateMax = new Date()
    //     const test28JzodSchema:any = {
    //       type: "date",
    //       validations:[{ type: "min", parameter: dateMin }, { type:"max", parameter:dateMax}]
    //     };

    //     const reference28ZodSchema:ZodTypeAny = z.date().min(dateMin).max(dateMax)

    //     compareZodSchemas("test28", reference28ZodSchema, test28JzodSchema);

    //     // // ########################################################################################
    //     // // OBJECTS & INHERITANCE
    //     // // ########################################################################################
    //     const test30JzodSchema:JzodElement = {
    //       type: "object",
    //       // tag: {
    //       //   value: "this is a test tag!"
    //       // },
    //       extend: {
    //         type: "object",
    //         definition: {
    //           b: { type: "number" },
    //           c: { type: "number" },
    //         },
    //       },
    //       definition: {
    //         a: { type: "string" },
    //         b: { type: "string" },
    //       },
    //     };

    //     const reference30ZodSchema:ZodTypeAny = z.object({b: z.string(), c: z.number(), a: z.string() }).strict();

    //     compareZodSchemas("test30", reference30ZodSchema, test30JzodSchema);
        
    //     // ########################################################################################
    //     const test32JzodSchema: JzodElement = {
    //       type: "object",
    //       extend: {
    //         type: "object",
    //         extend: { type: "object", definition: { a: { type: "string" }, d: { type: "boolean"} } },
    //         definition: {
    //           b: { type: "number" },
    //           c: { type: "number" },
    //         },
    //       },
    //       definition: {
    //         a: { type: "string" },
    //         b: { type: "string" },
    //         e: { type: "bigint" },
    //       },
    //     };

    //     // const reference32ZodSchema:ZodTypeAny = z.object({a: z.string(), b: z.string(), c: z.number(), d: z.boolean(), e: z.bigint() }).strict();
    //     const reference32ZodSchema:ZodTypeAny = z.object({
    //       a: z.string(),
    //       d: z.boolean(),
    //       b: z.string(),
    //       c: z.number(),
    //       e: z.bigint()
    //     }).strict();

    //     compareZodSchemas("test32", reference32ZodSchema, test32JzodSchema);
        
    //     console.log("######################################### ending test32");


    //     // ########################################################################################
    //     // TAGS: plain value tags are ignored during Zod schema generation
    //     // ########################################################################################
    //     const test50JzodSchema:JzodElement = {
    //       type: "object",
    //       tag: {
    //         value: "this is a test tag!"
    //       },
    //       definition: {
    //         a: { type: "string" },
    //       },
    //     };

    //     const reference50ZodSchema:ZodTypeAny = z.object({a: z.string()});

    //     compareZodSchemas("test50", reference50ZodSchema, test50JzodSchema);
        
    //     // ########################################################################################
    //     // TAGS: valueTagSchema is converted to typed value tag during schema generation of meta-schema
    //     const test51JzodSchema:JzodElement = {
    //       type: "object",
    //       tag: {
    //         value: "this defines the type of a tag!",
    //         optional: true,
    //         schema: {
    //           valueSchema: {
    //             type: "number",
    //             optional: true,
    //             // definition: {
    //             //   value: { type: "number" }
    //             // }
    //           }
    //         }
    //       },
    //       definition: {
    //         a: { type: "string" },
    //       },
    //     };

    //     const reference51ZodSchema: ZodTypeAny = z.object({
    //       a: z.string(),
    //       tag: z.object({ value: z.number().optional() }).optional(),
    //     });

    //     compareZodSchemas("test51", reference51ZodSchema, test51JzodSchema);
        
    //     // ########################################################################################
    //     // TAGS: valueSchema is converted to typed tag value during schema generation of meta-schema
    //     const test52JzodSchema: JzodElement = {
    //       type: "object",
    //       tag: {
    //         // optional: true,
    //         // value: "this defines the type of a tag!",
    //         schema: {
    //           optional: true,
    //           valueSchema: {
    //             type: "object",
    //             // optional: true,
    //             definition: {
    //               a: { type: "string" },
    //               b: { type: "number" },
    //             },
    //           },
    //         },
    //       },
    //       definition: {
    //         a: { type: "string" },
    //       },
    //     };

    //     const reference52ZodSchema: ZodTypeAny = z.object({
    //       a: z.string(),
    //       tag: z.object({
    //           // optional: z.boolean().optional(),
    //           value: z.object({
    //             a: z.string(),
    //             b: z.number(),
    //           }),
    //       }).optional(),
    //     });

    //     compareZodSchemas("test52", reference52ZodSchema, test52JzodSchema, {
    //       jzodElement: jzodBootstrapElementZodSchema,
    //     });

    //     // ########################################################################################
    //     // TAGS: metaTagSchema is converted to typed meta tag during schema generation of meta-meta-schema
    //     const test53JzodSchema: JzodElement = {
    //       type: "object",
    //       tag: {
    //         optional: true,
    //         schema: {
    //           optional: true,
    //           metaSchema: {
    //             type: "object",
    //             optional: true,
    //             definition: {
    //               optional: {
    //                 type: "boolean",
    //                 optional: true,
    //               },
    //               metaSchema: {
    //                 type: "schemaReference",
    //                 optional: true,
    //                 definition: {
    //                   relativePath: "jzodElement",
    //                 },
    //               },
    //               valueSchema: {
    //                 type: "schemaReference",
    //                 optional: true,
    //                 definition: {
    //                   relativePath: "jzodElement",
    //                 },
    //               },
    //             },
    //           },
    //           valueSchema: {
    //             type: "object",
    //             optional: true,
    //             definition: {
    //               id: {
    //                 type: "number",
    //                 optional: true,
    //               },
    //               defaultLabel: {
    //                 type: "string",
    //                 optional: true,
    //               },
    //               initializeTo: {
    //                 type: "any",
    //                 optional: true,
    //               },
    //               targetEntity: {
    //                 type: "string",
    //                 optional: true,
    //               },
    //               editable: {
    //                 type: "boolean",
    //                 optional: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //       definition: {
    //         a: { type: "string" },
    //       },
    //     };

    //     const reference53ZodSchema: ZodTypeAny = z.object({
    //       a: z.string(),
    //       tag: z.object({
    //         value: z.object({
    //           id: z.number().optional(),
    //           defaultLabel: z.string().optional(),
    //           initializeTo: z.any().optional(),
    //           targetEntity: z.string().optional(),
    //           editable: z.boolean().optional(),
    //         }).optional(),
    //         schema: z.object({
    //             optional: z.boolean().optional(),
    //             metaSchema: jzodBootstrapElementZodSchema.zodSchema.optional(),
    //             valueSchema: jzodBootstrapElementZodSchema.zodSchema.optional(),
    //           }).optional(),
    //         optional: z.boolean().optional(),
    //       }).optional(),
    //     });

    //     compareZodSchemas("test53", reference53ZodSchema, test53JzodSchema, {
    //       jzodElement: jzodBootstrapElementZodSchema,
    //     });

    //     // ########################################################################################
    //     const test60JzodSchema: JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "object", definition: { a: { type: "string" } } },
    //         c: { type: "object", definition: { c: { type: "number" } } },
    //         b: {
    //           // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "object",
    //           extend: [
    //             { type: "schemaReference", definition: { eager: true, relativePath: "a" } },
    //             { type: "schemaReference", definition: { eager: true, relativePath: "c" } },
    //           ],
    //           definition: {
    //             b: { type: "string" },
    //           },
    //         },
    //       },
    //       definition: { relativePath: "b" },
    //     };

    //     const reference60ZodSchema: ZodTypeAny = z.object({ c: z.number(), a: z.string(), b: z.string(),  });
    //     compareZodSchemas("test60", reference60ZodSchema, test60JzodSchema);
    //     // ########################################################################################
    //     // multiple inheritance with name clash (inheritance is done in order of appearance, inner-most inherited object is at the end of the extend array)
    //     const test61JzodSchema: JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "object", definition: { a: { type: "string" } } },
    //         c: { type: "object", definition: { c: { type: "number" } } },
    //         b: {
    //           // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "object",
    //           extend: [
    //             { type: "object", definition: { c: { type: "string" } } },
    //             { type: "schemaReference", definition: { eager: true, relativePath: "c" } },
    //           ],
    //           definition: {
    //             b: { type: "string" },
    //           },
    //         },
    //       },
    //       definition: { relativePath: "b" },
    //     };

    //     const reference61ZodSchema: ZodTypeAny = z.object({ c: z.string(), b: z.string(),  });
    //     compareZodSchemas("test61", reference61ZodSchema, test61JzodSchema);

    //     // ########################################################################################
    //     // Local object definition trumps inherited definition upon name clash 
    //     const test62JzodSchema: JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "object", definition: { a: { type: "string" } } },
    //         b: {
    //           // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "object",
    //           extend: [
    //             { type: "object", definition: { c: { type: "string" } } },
    //             // { type: "schemaReference", definition: { eager: true, relativePath: "c" } },
    //           ],
    //           definition: {
    //             c: { type: "number" },
    //           },
    //         },
    //       },
    //       definition: { relativePath: "b" },
    //     };

    //     const reference62ZodSchema: ZodTypeAny = z.object({ c: z.number() });
    //     compareZodSchemas("test62", reference62ZodSchema, test62JzodSchema);

    //     // ########################################################################################
    //     // schemaReferences: schemaReference and inherited schemaReferences
    //     // ########################################################################################
    //     const test104JzodSchema:JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "schemaReference",
    //           definition: { relativePath: "a"}
    //         },
    //         a: { type: "string" },
    //       },
    //       definition: { relativePath: "b" }
    //     };

    //     const reference4ZodSchema:ZodTypeAny = z.string();

    //     compareZodSchemas("test104", reference4ZodSchema, test104JzodSchema);

    //     // ########################################################################################
    //     const test105JzodSchema:JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "object", definition: { a: { type: "string" } } },
    //         b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "object",
    //           definition: {
    //             b: { type: "schemaReference", definition: { relativePath: "a"} }
    //           }
    //         },
    //       },
    //       definition: { relativePath: "b" }
    //     };

    //     const reference5ZodSchema:ZodTypeAny = z.object({b: z.object({a:z.string()})});

    //     compareZodSchemas("test105", reference5ZodSchema, test105JzodSchema);

    //     // ########################################################################################
    //     const test106JzodSchema:JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "object", definition: { a: { type: "string" } } },
    //         b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "object",
    //           extend: { type: "schemaReference", definition: { eager: true, relativePath: "a"}},
    //           definition: {
    //             b: { type: "schemaReference", definition: { relativePath: "a"} }
    //           }
    //         },
    //       },
    //       definition: { relativePath: "b" }
    //     };

    //     const reference106ZodSchemaA: ZodObject<any> = z.object({ a: z.string() })
    //     const reference106ZodSchema: ZodTypeAny = reference106ZodSchemaA.extend({ b: reference106ZodSchemaA });
    //     compareZodSchemas("test106", reference106ZodSchema, test106JzodSchema);

    //     // ########################################################################################
    //     const test107JzodSchema:JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "object", definition: { a: { type: "string" } } },
    //         c: { type: "string", optional: true },
    //         b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "object",
    //           extend: { type: "schemaReference", definition: { eager: true, relativePath: "a"}},
    //           definition: {
    //             b: { type: "schemaReference", definition: { relativePath: "a"} },
    //             c: { type: "schemaReference", definition: { relativePath: "c"} },
    //           }
    //         }
    //       },
    //       definition: { relativePath: "b" }
    //     };

    //     const reference107ZodSchemaA: ZodObject<any> = z.object({ a: z.string() })
    //     const reference107ZodSchemaC: ZodTypeAny = z.string().optional();
    //     const reference107ZodSchema: ZodTypeAny = reference107ZodSchemaA.extend({ b: reference107ZodSchemaA, c: reference107ZodSchemaC });
    //     compareZodSchemas("test107", reference107ZodSchema, test107JzodSchema);

    //     // ########################################################################################
    //     const test108JzodSchema:JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         a: { type: "object", definition: { a: { type: "string" } } },
    //         b: { // check that reference resolution is indeed lazy, by placing the item calling the reference before the reference itself
    //           type: "object",
    //           extend: { type: "schemaReference", definition: { eager: true, relativePath: "a"}},
    //           definition: {
    //             x: { type: "schemaReference", definition: { relativePath: "a"} },
    //             y: { type: "schemaReference", definition: { relativePath: "c"} },
    //           }
    //         },
    //         c: { type: "string", optional: true },
    //       },
    //       definition: { relativePath: "b" }
    //     };

    //     const reference108ZodSchemaA: ZodObject<any> = z.object({ a: z.string() })
    //     const reference108ZodSchemaC: ZodTypeAny = z.string().optional();
    //     const reference108ZodSchema: ZodTypeAny = reference108ZodSchemaA.extend({
    //       x: z.lazy(() => reference108ZodSchemaA),
    //       y: z.lazy(() => reference108ZodSchemaC),
    //     });
    //     compareZodSchemas("test108", reference108ZodSchema, test108JzodSchema);
    //   }
    // )
    
    
    // // ###########################################################################################
    // it('jzod schema simple parsing', () =>
    //   {
    //     console.log("jzod schema simple parsing converting jzodBootstrapElementSchema");
    //     // const jzodBootstrapElementZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(jzodBootstrapElementSchema);

    //     // console.log("jzod schema simple parsing starting parsing proper ", jzodBootstrapElementZodSchema.contextZodText);
    //     console.log("jzod schema simple parsing starting parsing proper ");

    //     // ########################################################################################
    //     const testSet: Record<string,JzodElement> = {
    //       test0: { type: "string", optional: true },
    //       test1: {
    //         type: "object",
    //         nonStrict: true,
    //         definition: { a: { type: "string", nullable:true } },
    //       },
    //       test2: {
    //         type: "object",
    //         extend: { type: "schemaReference", definition: { relativePath: "test0" } },
    //         definition: {
    //           b: { type: "schemaReference", definition: { relativePath: "test0" } },
    //           c: { type: "schemaReference", definition: { relativePath: "test1" } },
    //         },
    //       },
    //       test3: {
    //         type: "enum",
    //         definition: ["boolean", "string", "number"],
    //       },
    //       test4: {
    //         type: "function",
    //         definition: {
    //           args: [
    //             { type: "string", optional: true, nullable: true },
    //             { type: "number" },
    //           ],
    //           returns: { type: "number" },
    //         }
    //       },
    //       test5: {
    //         type: "record",
    //         definition: { type: "object", definition: { a: { type: "string" } } },
    //       },
    //       test6: {
    //         type: "union",
    //         definition: [
    //           {
    //             type: "object", definition: { a: { type: "string" } },
    //           },
    //           {
    //             type: "object", definition: { b: { type: "number" } },
    //           },
    //         ],
    //       },
    //       test7: {
    //         type: "array",
    //         definition: {type: "object", definition: { a: { type: "string" } }},
    //       },
    //       test8: {
    //         type: "lazy",
    //         definition: {
    //           type: "schemaReference", definition: { relativePath: "a" }
    //         }
    //       },
    //       test9: { type: "string", optional: true, validations: [{type:"min",parameter:5}] },
    //       test10: {
    //         type: "union",
    //         discriminator: {
    //           discriminatorType: "string",
    //           value: "type"
    //         },
    //         definition: [
    //           {
    //             type: "object", definition: { type: { type: "literal", definition: "a"}, a: { type: "string" } },
    //           },
    //           {
    //             type: "object", definition: { type: { type: "literal", definition: "b" }, b: { type: "number" } },
    //           },
    //         ],
    //       },

    //       // using alternate "PlainAttribute" format
    //       test20: { type: "string", optional: true },
    //       test21: {
    //         type: "object",
    //         nonStrict: true,
    //         definition: { a: { type: "string", nullable:true } },
    //       },
    //       test22: {
    //         type: "object",
    //         nonStrict: true,
    //         carryOn: {
    //           type: "object",
    //           definition: {
    //             b: {
    //               type: "string"
    //             }
    //           }
    //         },
    //         definition: { a: { type: "string", nullable:true } },
    //       },
    //     };

    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test0).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test1).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test2).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test3).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test4).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test5).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test6).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test7).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test8).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test9).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test10).success).toBeTruthy();

    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test20).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test21).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(testSet.test22).success).toBeTruthy();

    //     // ########################################################################################
    //     // tests to fail
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse({type:"lazys",definition:"test"}).success).toBeFalsy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse({type:"lazy",type2:"lazy2",definition:"test"}).success).toBeFalsy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse({
    //       type: "record",
    //       definition: { type: "object", definition: { a: { type: "undefined!!!!!!" } } },
    //     }).success).toBeFalsy();

    //     const illShapedReference = {
    //       type: "object",
    //       definition: {
    //         b: { type: "schemaReference", relativePathS: "test0" },
    //         c: { type: "schemaReference", relativePath: "test1" },
    //       }
    //     };
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(illShapedReference).success).toBeFalsy();
    //   }
    // )

    // // ###########################################################################################
    // it("jzod bootstrap self parsing", () => {
    //   // const jzodBootstrapElementZodSchema: ZodSchemaAndDescription =
    //   //   jzodElementSchemaToZodSchemaAndDescription(jzodBootstrapElementSchema);
    //   console.log("jzodBootstrapElementSchema", JSON.stringify(jzodBootstrapElementZodSchema.zodSchema));

    //   // ~~~~~~~~~~~~~~~~~ BOOTSTRAP TEST ~~~~~~~~~~~~~~~~~~~~~~~~
    //   expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(jzodBootstrapElementSchema).success).toBeTruthy();
    // });

    // // ###########################################################################################
    // it('jzod simple data parsing',
    //   () => {
    //     const absoluteReferences = {
    //       "123": jzodElementSchemaToZodSchemaAndDescription({type: "string"})
    //     }

    //     // console.log("absoluteReferences",absoluteReferences);
    //     const test0: JzodElement = { type: "string", optional: true };
    //     // const test1: JzodElement = {
    //     const test1: any = {
    //       type: "object",
    //       partial: true,
    //       definition: {
    //         a: {
    //           type: "number",
    //           nullable: true,
    //         },
    //         b: {
    //           type: "number",
    //           validations: [{ type: "gt", parameter: 5 }],
    //         },
    //       },
    //     };
    //     // schemaReference
    //     const test2: JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         ref0: { type: "string", optional: true },
    //         ref1: {
    //           type: "object",
    //           definition: {
    //             a: {
    //               type: "number",
    //               nullable: true,
    //             },
    //             b: {
    //               type: "number",
    //               validations: [{ type: "gt", parameter: 5 }],
    //             },

    //           },
    //         },
    //         ref2: {
    //           type: "object",
    //           definition: {
    //             b: { type: "schemaReference", definition: { relativePath: "ref0" } },
    //           }
    //         },
    //         resultObject: {
    //           type: "object",
    //           extend: { type: "schemaReference", definition: { relativePath: "ref2", eager: true } },
    //           definition: {
    //             c: { type: "schemaReference", definition: { relativePath: "ref1" }, nullable: true },
    //           }
    //         }
    //       },
    //       definition: {
    //         relativePath: "resultObject"
    //       },
    //     };
    //     // enum
    //     const test3: JzodElement = {
    //       type: "enum",
    //       definition: ["val1", "val2"],
    //     };
    //     // function
    //     const test4: JzodElement = {
    //       type: "function",
    //       definition: {
    //         args: [
    //           { type: "string" },
    //           { type: "number" },
    //         ],
    //         returns: { type: "number" },
    //       },
    //     };
    //     // record
    //     const test5: JzodElement = {
    //       type: "record",
    //       definition: { type: "object", definition: { a: { type: "string" } } },
    //     };
    //     // union (NOT discriminated)
    //     const test6: JzodElement = {
    //       type: "union",
    //       definition: [
    //         {
    //           type: "object",
    //           definition: { a: { type: "string" } },
    //         },
    //         {
    //           type: "object",
    //           definition: { b: { type: "number" } },
    //         },
    //       ],
    //     };
    //     // array
    //     const test7: JzodElement = {
    //       type: "array",
    //       definition: {
    //         type: "object",
    //         definition: {
    //           a: {
    //             type: "string",
    //             validations: [
    //               { type: "min", parameter: 5 },
    //               { type: "includes", parameter: "#" },
    //             ],
    //           },
    //         },
    //       },
    //     };
    //     // lazy
    //     const test8: JzodElement = {
    //       type: "lazy",
    //       definition: {
    //         type: "schemaReference", definition: { absolutePath: "123" }
    //       },
    //     };
    //     // optional
    //     const test9: JzodElement = {
    //       type: "string",
    //       optional: true,
    //       validations: [{ type: "min", parameter: 5 }],
    //     };
    //     // schemaReference absolutePath only
    //     const test10: JzodElement = { type: "schemaReference", definition: { absolutePath: "123" } };
    //     // schemaReference relativePath only
    //     const test11: JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         myString: {
    //           type: "string"
    //         },
    //         myObject: {
    //           type: "object",
    //           definition: {
    //             a: { type: "schemaReference", definition: { relativePath: "myString" } }
    //           }
    //         }
    //       },
    //       definition: { relativePath: "myObject" },
    //     };
    //     // tuple
    //     const test12: JzodElement = {
    //       type: "tuple",
    //       definition: [
    //         { type: "number" },
    //         { type: "string" },
    //       ],
    //     };
    //     // intersection
    //     const test13: JzodElement = {
    //       type: "intersection",
    //       definition: {
    //         left: { type: "object", definition: { name: { type: "string" } } },
    //         right: { type: "object", definition: { role: { type: "string" } } },
    //       },
    //     };

    //     // set
    //     const test14: JzodElement = {
    //       type: "set",
    //       definition: { type: "string" },
    //     };

    //     // map
    //     const test15: JzodElement = {
    //       type: "map",
    //       definition: [
    //         { type: "string" },
    //         { type: "number" },
    //       ],
    //     };

    //     // recursive schemaReference
    //     const test16: JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         "myObject": {
    //           type: "object",
    //           definition: {
    //             a: {
    //               type: "union",
    //               definition: [
    //                 {
    //                   type: "string",
    //                 },
    //                 {
    //                   type: "schemaReference",
    //                   definition: { relativePath: "myObject"}
    //                 }
    //               ]
    //             }
    //           }
    //         }
    //       },
    //       definition: { relativePath: "myObject" }
    //     };

    //     // nonStrict Object
    //     const test17: JzodElement = {
    //       type: "object",
    //       nonStrict: true,
    //       definition: {
    //         a: {
    //           type: "number",
    //         },
    //       },
    //     };

    //     // discriminated unions
    //     const test18: JzodElement = {
    //       type: "union",
    //       discriminator: {
    //         discriminatorType: "string",
    //         value: "type"
    //       },
    //       definition: [
    //         {
    //           type: "object", definition: { type: { type: "literal", definition: "a"}, a: { type: "string" } },
    //         },
    //         {
    //           type: "object", definition: { type: { type: "literal", definition: "b" }, b: { type: "number" } },
    //         },
    //       ],
    //     };

    //     // heteronous unions
    //     const test19: JzodElement = {
    //       type: "union",
    //       discriminator: {
    //         discriminatorType: "string",
    //         value: "type"
    //       },
    //       definition: [
    //         {
    //           type: "object", definition: { type: { type: "literal", definition: "a"}, a: { type: "string" } },
    //         },
    //         {
    //           type: "object", definition: { type: { type: "literal", definition: "b" }, b: { type: "number" } },
    //         },
    //         {
    //           type: "string",
    //         },
    //         {
    //           type: "number",
    //         },
    //       ],
    //     };

    //     // manyfold discriminated object unions
    //     const test20: JzodElement = {
    //       type: "union",
    //       discriminator: {
    //         discriminatorType: "array",
    //         value: [ "type", "kind" ]
    //       },
    //       definition: [
    //         {
    //           type: "object", definition: { type: { type: "literal", definition: "a"}, a: { type: "string" } },
    //         },
    //         {
    //           type: "object", definition: { type: { type: "literal", definition: "b" }, b: { type: "number" } },
    //         },
    //         {
    //           type: "object", definition: { kind: { type: "literal", definition: "a"}, a: { type: "number" } },
    //         },
    //         {
    //           type: "object", definition: { kind: { type: "literal", definition: "b" }, b: { type: "string" } },
    //         },
    //         {
    //           type: "string",
    //         },
    //         {
    //           type: "number",
    //         },
    //       ],
    //     };

    //     // carry-on type on object
    //     const test21: JzodElement = {
    //       type: "object",
    //       carryOn: {
    //         type: "object",
    //         definition: {
    //           d: { type: "boolean" }
    //         }
    //       },
    //       definition: {
    //         a: { type: "string"},
    //         b: { type: "object", optional: true, definition: { c: { type: "number"}}}
    //       }
    //     }

    //     // carry-on type on union
    //     const test22: JzodElement = {
    //       type: "object",
    //       carryOn: {
    //         type: "object",
    //         definition: {
    //           d: { type: "boolean" },
    //         },
    //       },
    //       definition: {
    //         a: {
    //           type: "union",
    //           definition: [
    //             { type: "string" },
    //             { type: "number" },
    //             {
    //               type: "object",
    //               definition: { b: { type: "number", optional: true }, c: { type: "string", optional: true } },
    //             },
    //           ],
    //         },
    //       },
    //     };

    //     // carry-on type on union
    //     const test23: JzodElement = {
    //       type: "object",
    //       carryOn: {
    //         type: "union",
    //         definition: [
    //           {
    //             type: "object",
    //             definition: {
    //               d: { type: "boolean" },
    //             },
    //           },
    //           {
    //             type: "object",
    //             definition: {
    //               e: { type: "string" },
    //             },
    //           }
    //         ]
    //       },
    //       definition: {
    //         a: {
    //           type: "union",
    //           definition: [
    //             { type: "string" },
    //             { type: "number" },
    //             {
    //               type: "object",
    //               definition: { b: { type: "number", optional: true }, c: { type: "string", optional: true } },
    //             },
    //           ],
    //         },
    //       },
    //     };

    //     // carry-on type with recursive object reference
    //     const test24: JzodElement = {
    //       type: "schemaReference",
    //       context: {
    //         myObject: {
    //           type: "object",
    //           definition: {
    //             a: { type: "string"},
    //             b: { type: "schemaReference", optional: true, definition: { relativePath: "myObject" } }
    //           }
    //         }
    //       },
    //       carryOn: {
    //         type: "object",
    //         definition: {
    //           c: { type: "number" },
    //         },
    //       },
    //       definition: {
    //         relativePath: "myObject"
    //       },
    //     };

    //     // const jzodBootstrapElementZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(jzodBootstrapElementSchema);

    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test0).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test1).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test2).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test3).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test4).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test5).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test6).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test7).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test8).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test9).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test10).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test11).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test12).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test13).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test14).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test15).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test16).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test17).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test18).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test19).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test20).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test21).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test22).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test23).success).toBeTruthy();
    //     expect(jzodBootstrapElementZodSchema.zodSchema.safeParse(test24).success).toBeTruthy();

    //     const test0ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test0);
    //     const test1ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test1);
    //     const test2ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test2);
    //     const test3ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test3);
    //     const test4ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test4);
    //     const test5ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test5);
    //     const test6ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test6);
    //     const test7ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test7);
    //     const test8ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
    //       test8,
    //       undefined,
    //       () => absoluteReferences
    //     );
    //     const test9ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test9);
    //     const test10ZodSchema: ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
    //       test10,
    //       undefined,
    //       () => absoluteReferences
    //     );
    //     const test11ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test11);
    //     const test12ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test12);
    //     const test13ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test13);
    //     const test14ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test14);
    //     const test15ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test15);
    //     const test16ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test16);
    //     const test17ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test17);
    //     const test18ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test18);
    //     const test19ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test19);
    //     const test20ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test20);
    //     const test21ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test21);
    //     const test22ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test22);
    //     const test23ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test23);
    //     const test24ZodSchema:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(test24);

    //     const test0_OK1 = "toto";
    //     const test0_OK2 = undefined;
    //     const test0_KO = 1;
    //     const test1_OK1 = {a:1, b:6};
    //     const test1_OK2 = {a:null, b:6};
    //     const test1_OK3 = {b:6};
    //     const test1_OK4 = {a:1};
    //     const test1_KO1 = {a:"toto", b:6};
    //     const test1_KO2 = {a:1, b: 5};
    //     const test1_KO3 = {a:1, b:6, c: "nok"};
    //     const test2_OK1 = {c:{a: 1, b: 6}};
    //     const test2_OK2 = {c:{a: null, b: 6}};
    //     const test2_OK3 = {b:"1", c:null};
    //     const test2_KO1 = {b:1};
    //     const test2_KO2 = {b:"1"};
    //     const test2_KO3 = {b:1, c:null};
    //     const test2_KO4 = {c:{a: undefined}};
    //     const test2_KO5 = {b: null, c:{a:'test'}};
    //     const test3_OK = "val2";
    //     const test3_KO = "val3";
    //     const test4_OK:(a:string, b:number)=>number = (a:string, b:number):number => b;
    //     const test4_KO:string = 'not a function';
    //     const test5_OK = {"e":{a:"test"},"f":{a:"test2"}};
    //     const test5_KO = {"e":1};
    //     const test6_OK = {"a":"test"};
    //     const test6_OK2 = {b:1};
    //     const test6_KO = {b:"test"};
    //     const test7_OK = [{"a":"123#4"},{"a":"#1234"}];
    //     const test7_OK2 = [] as any[];
    //     const test7_KO1 = [{"e":"1"}];
    //     const test7_KO2 = [ {"a":"#12345"}, {"a":"12345"} ];
    //     const test7_KO3 = [ {"a":"#12345"}, {"a":"#123"} ];
    //     const test8_OK:string = "test";
    //     const test8_KO1:number = 1;
    //     const test9_OK = "12345";
    //     const test9_KO = "1234";
    //     const test10_OK = "test";
    //     const test10_KO = 1;
    //     const test11_OK = {a: "test"};
    //     const test11_KO = {a:{x:"test"}};
    //     const test12_OK = [ 1, "a" ];
    //     const test12_KO1 = [ "a", 1 ];
    //     const test12_KO2 = [ 1, "a", "b" ];
    //     const test13_OK = { name: "Test", role: "test"};
    //     const test13_KO1 = { name: "Test"};
    //     const test13_KO2 = { role: "test"};
    //     const test14_OK = new Set<string>(["a", "b", "c"]);
    //     const test14_KO = new Set<number>([ 1, 2, 3 ]);
    //     const test15_OK = new Map<string,number>([["a", 1 ], ["b", 2 ], ["c", 3 ] ]);
    //     const test15_KO = new Map<string,string>([["a", "1" ], ["b", "2" ], ["c", "3" ] ]);
    //     const test16_OK1 = { a: "Test"};
    //     const test16_OK2 = { a: { a: "Test" } };
    //     const test16_OK3 = { a: { a: { a: "Test"} } };
    //     const test16_KO1 = { a: 1 };
    //     const test16_KO2 = { a: { a: { a: 1 } } };
    //     const test16_KO3 = { a: { a: { a: "Test", b: "Test" } } };
    //     const test17_OK1 = { a:1, b:6 };
    //     const test17_KO1 = { b:6 };
    //     // discriminater union
    //     const test18_OK1 = { type: "a", a: "test" };
    //     const test18_OK2 = { type: "b", b: 1 };
    //     const test18_KO1 = { a: "test" };
    //     const test18_KO2 = { b:6 };
    //     const test18_KO3 = { type: "a", a: 1 };
    //     // heteronomous union
    //     const test19_OK1 = { type: "a", a: "test" };
    //     const test19_OK2 = { type: "b", b: 1 };
    //     const test19_OK3 = "test";
    //     const test19_OK4 = 1;
    //     const test19_KO1 = { a: "test" };
    //     const test19_KO2 = true;
    //     // manyfold-discriminated union
    //     const test20_OK1 = { type: "a", a: "test" };
    //     const test20_OK2 = { type: "b", b: 1 };
    //     const test20_OK3 = { kind: "a", a: 1 };
    //     const test20_OK4 = { kind: "b", b: "test" };
    //     const test20_OK5 = "test";
    //     const test20_OK6 = 1;
    //     const test20_KO1 = { a: "test" };
    //     const test20_KO2 = true;
    //     // carry-on type with object
    //     const test21_OK1 = { d: true }
    //     const test21_OK2 = { a: { d: true } }
    //     const test21_OK3 = { a: "test", b: { d: false } }
    //     const test21_OK4 = { a: { d: true }, b: { d: false } }
    //     const test21_OK5 = { a: { d: true }, b: { c: 1 } }
    //     const test21_OK6 = { a: { d: true }, b: { c: { d: false } } }
    //     const test21_KO1 = { d: 1 }
    //     const test21_KO2 = { a: 1 }
    //     const test21_KO3 = { a: { d: "true" } }
    //     const test21_KO4 = { a: "test", b: { d: "false" } }
    //     const test21_KO5 = { a: "test", b: { c: "test" } }
    //     const test21_KO6 = { a: { d: true }, b: { c: { d: "false" } } }

    //     // carry-on type with union, array, map, record, reference, set, intersection...
    //     const test22_OK1 = { d: true }
    //     const test22_OK2 = { a: 1 }
    //     const test22_OK3 = { a: { d: true} }
    //     const test22_OK4 = { a: { b: 1 } }
    //     const test22_OK5 = { a: { b: { d: false } } }
    //     const test22_OK6 = { a: { b: 1, c: "test" } }
    //     const test22_OK7 = { a: { b: 1, c: { d: false } } }
    //     const test22_OK8 = { a: { c: { d: false } } }
    //     const test22_OK9 = { a: { b: { d: false }, c: { d: false } } }
    //     const test22_KO1 = { a: { b: 1, c: { d: "false" } } }
    //     const test22_KO2 = { a: { d: "false" } }

    //     // carry-on type with union, array, map, record, reference, set, intersection...
    //     const test23_OK1 = { e: "test" }
    //     const test23_OK2 = { a: 1 }
    //     const test23_OK3 = { a: { d: true} }
    //     const test23_OK4 = { a: { b: 1 } }
    //     const test23_OK5 = { a: { b: { e: "test" } } }
    //     const test23_OK6 = { a: { b: 1, c: "test" } }
    //     const test23_OK7 = { a: { b: 1, c: { e: "test" } } }
    //     const test23_OK8 = { a: { c: { d: false } } }
    //     const test23_OK9 = { a: { b: { e: "test" }, c: { d: false } } }
    //     const test23_KO1 = { a: { b: 1, c: { e: false } } }
    //     const test23_KO2 = { a: { e: false } }

    //     // carry-on type with union, array, map, record, reference, set, intersection...
    //     // carry-on type with recursive object reference
    //     const test24_OK1 = { a: "test" }
    //     const test24_OK2 = { c: 1 }
    //     const test24_OK3 = { a: "test", b: { c: 1 }}
    //     const test24_KO1 = { a: "test", b: { c: "test" }}

    //     // #####
    //     expect(test0ZodSchema.zodSchema.safeParse(test0_OK1).success).toBeTruthy();
    //     expect(test0ZodSchema.zodSchema.safeParse(test0_OK2).success).toBeTruthy();
    //     expect(test0ZodSchema.zodSchema.safeParse(test0_KO).success).toBeFalsy();
    //     // #####
    //     expect(test1ZodSchema.zodSchema.safeParse(test1_OK1).success).toBeTruthy();
    //     expect(test1ZodSchema.zodSchema.safeParse(test1_OK2).success).toBeTruthy();
    //     expect(test1ZodSchema.zodSchema.safeParse(test1_OK3).success).toBeTruthy();
    //     expect(test1ZodSchema.zodSchema.safeParse(test1_OK4).success).toBeTruthy();
    //     expect(test1ZodSchema.zodSchema.safeParse(test1_KO1).success).toBeFalsy();
    //     expect(test1ZodSchema.zodSchema.safeParse(test1_KO2).success).toBeFalsy();
    //     expect(test1ZodSchema.zodSchema.safeParse(test1_KO3).success).toBeFalsy();
    //     // #####
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_OK1).success).toBeTruthy();
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_OK2).success).toBeTruthy();
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_OK3).success).toBeTruthy();
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_KO1).success).toBeFalsy();
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_KO2).success).toBeFalsy();
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_KO3).success).toBeFalsy();
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_KO4).success).toBeFalsy();
    //     expect(test2ZodSchema.zodSchema.safeParse(test2_KO5).success).toBeFalsy();
    //     // #####
    //     expect(test3ZodSchema.zodSchema.safeParse(test3_OK).success).toBeTruthy();
    //     expect(test3ZodSchema.zodSchema.safeParse(test3_KO).success).toBeFalsy();
    //     // #####
    //     expect(test4ZodSchema.zodSchema.safeParse(test4_OK).success).toBeTruthy();
    //     expect(test4ZodSchema.zodSchema.safeParse(test4_KO).success).toBeFalsy();
    //     // #####
    //     expect(test5ZodSchema.zodSchema.safeParse(test5_OK).success).toBeTruthy();
    //     expect(test5ZodSchema.zodSchema.safeParse(test5_KO).success).toBeFalsy();
    //     // #####
    //     expect(test6ZodSchema.zodSchema.safeParse(test6_OK).success).toBeTruthy();
    //     expect(test6ZodSchema.zodSchema.safeParse(test6_OK2).success).toBeTruthy();
    //     expect(test6ZodSchema.zodSchema.safeParse(test6_KO).success).toBeFalsy();
    //     // #####
    //     expect(test7ZodSchema.zodSchema.safeParse(test7_OK).success).toBeTruthy();
    //     expect(test7ZodSchema.zodSchema.safeParse(test7_OK2).success).toBeTruthy();
    //     expect(test7ZodSchema.zodSchema.safeParse(test7_KO1).success).toBeFalsy();
    //     expect(test7ZodSchema.zodSchema.safeParse(test7_KO2).success).toBeFalsy();
    //     expect(test7ZodSchema.zodSchema.safeParse(test7_KO3).success).toBeFalsy();
    //     // #####
    //     expect(test8ZodSchema.zodSchema.safeParse(test8_OK).success).toBeTruthy();
    //     expect(test8ZodSchema.zodSchema.safeParse(test8_KO1).success).toBeFalsy();
    //     // #####
    //     expect(test9ZodSchema.zodSchema.safeParse(test9_OK).success).toBeTruthy();
    //     expect(test9ZodSchema.zodSchema.safeParse(test9_KO).success).toBeFalsy();
    //     // #####
    //     expect(test10ZodSchema.zodSchema.safeParse(test10_OK).success).toBeTruthy();
    //     expect(test10ZodSchema.zodSchema.safeParse(test10_KO).success).toBeFalsy();
    //     // #####
    //     expect(test11ZodSchema.zodSchema.safeParse(test11_OK).success).toBeTruthy();
    //     expect(test11ZodSchema.zodSchema.safeParse(test11_KO).success).toBeFalsy();
    //     // #####
    //     expect(test12ZodSchema.zodSchema.safeParse(test12_OK).success).toBeTruthy();
    //     expect(test12ZodSchema.zodSchema.safeParse(test12_KO1).success).toBeFalsy();
    //     expect(test12ZodSchema.zodSchema.safeParse(test12_KO2).success).toBeFalsy();
    //     // #####
    //     // console.log("referentialElementSetSchema.test13",referentialElementSetSchema.test13.zodText,JSON.stringify(referentialElementSetSchema.test13.zodSchema));

    //     // const toto = z.intersection(z.object({name:z.string(),}).strict(),z.object({role:z.string(),}).strict())
    //     // console.log("compare zod schema",JSON.stringify(toto));
    //     // type Toto =  z.infer<typeof toto>;
    //     // const a:Toto = { name: "Test", role: "test"};
    //     // expect(referentialElementSetSchema.test13.zodSchema.parse(test13_OK).success).toBeTruthy();
    //     // expect(referentialElementSetSchema.test13.zodSchema.safeParse(test13_OK).success).toBeTruthy(); // FAILING!!! IS GENERATED ZOD SCHEMA WRONG??
    //     expect(test13ZodSchema.zodSchema.safeParse(test13_KO1).success).toBeFalsy();
    //     expect(test13ZodSchema.zodSchema.safeParse(test13_KO2).success).toBeFalsy();

    //     expect(test14ZodSchema.zodSchema.safeParse(test14_OK).success).toBeTruthy();
    //     expect(test14ZodSchema.zodSchema.safeParse(test14_KO).success).toBeFalsy();
    //     // expect(referentialElementSetSchema.test14.zodSchema.safeParse(test14_KO2).success).toBeFalsy();

    //     // #####
    //     expect(test15ZodSchema.zodSchema.safeParse(test15_OK).success).toBeTruthy();
    //     expect(test15ZodSchema.zodSchema.safeParse(test15_KO).success).toBeFalsy();
    //     // #####
    //     expect(test16ZodSchema.zodSchema.safeParse(test16_OK1).success).toBeTruthy();
    //     expect(test16ZodSchema.zodSchema.safeParse(test16_OK2).success).toBeTruthy();
    //     expect(test16ZodSchema.zodSchema.safeParse(test16_OK3).success).toBeTruthy();
    //     expect(test16ZodSchema.zodSchema.safeParse(test16_KO1).success).toBeFalsy();
    //     expect(test16ZodSchema.zodSchema.safeParse(test16_KO2).success).toBeFalsy();
    //     expect(test16ZodSchema.zodSchema.safeParse(test16_KO3).success).toBeFalsy();
    //     // #####
    //     expect(test17ZodSchema.zodSchema.safeParse(test17_OK1).success).toBeTruthy();
    //     expect(test17ZodSchema.zodSchema.safeParse(test17_KO1).success).toBeFalsy();
    //     // #####
    //     expect(test18ZodSchema.zodSchema.safeParse(test18_OK1).success).toBeTruthy();
    //     expect(test18ZodSchema.zodSchema.safeParse(test18_OK2).success).toBeTruthy();
    //     expect(test18ZodSchema.zodSchema.safeParse(test18_KO1).success).toBeFalsy();
    //     expect(test18ZodSchema.zodSchema.safeParse(test18_KO2).success).toBeFalsy();
    //     expect(test18ZodSchema.zodSchema.safeParse(test18_KO3).success).toBeFalsy();
    //     // #####
    //     expect(test19ZodSchema.zodSchema.safeParse(test19_OK1).success).toBeTruthy();
    //     expect(test19ZodSchema.zodSchema.safeParse(test19_OK2).success).toBeTruthy();
    //     expect(test19ZodSchema.zodSchema.safeParse(test19_OK3).success).toBeTruthy();
    //     expect(test19ZodSchema.zodSchema.safeParse(test19_OK4).success).toBeTruthy();
    //     expect(test19ZodSchema.zodSchema.safeParse(test19_KO1).success).toBeFalsy();
    //     expect(test19ZodSchema.zodSchema.safeParse(test19_KO2).success).toBeFalsy();
    //     // ##### mmanyfold discriminated type
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_OK1).success).toBeTruthy();
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_OK2).success).toBeTruthy();
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_OK3).success).toBeTruthy();
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_OK4).success).toBeTruthy();
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_OK5).success).toBeTruthy();
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_OK6).success).toBeTruthy();
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_KO1).success).toBeFalsy();
    //     expect(test20ZodSchema.zodSchema.safeParse(test20_KO2).success).toBeFalsy();
    //     // expect(test19ZodSchema.zodSchema.safeParse(test19_KO3).success).toBeFalsy();

    //     // carry-on type
    //     // console.log("test21ZodSchema", test21ZodSchema.zodText)
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_OK1).success).toBeTruthy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_OK2).success).toBeTruthy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_OK3).success).toBeTruthy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_OK4).success).toBeTruthy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_OK5).success).toBeTruthy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_OK6).success).toBeTruthy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_KO1).success).toBeFalsy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_KO2).success).toBeFalsy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_KO3).success).toBeFalsy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_KO4).success).toBeFalsy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_KO5).success).toBeFalsy();
    //     expect(test21ZodSchema.zodSchema.safeParse(test21_KO6).success).toBeFalsy();

    //     // carry-on carrying on union
    //     // console.log("test22ZodSchema", test22ZodSchema.zodText)
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK1).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK2).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK3).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK4).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK5).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK6).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK7).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK8).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_OK9).success).toBeTruthy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_KO1).success).toBeFalsy();
    //     expect(test22ZodSchema.zodSchema.safeParse(test22_KO2).success).toBeFalsy();

    //     // carry-on union carrying on union
    //     // console.log("test22ZodSchema", test22ZodSchema.zodText)
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK1).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK2).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK3).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK4).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK5).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK6).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK7).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK8).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_OK9).success).toBeTruthy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_KO1).success).toBeFalsy();
    //     expect(test23ZodSchema.zodSchema.safeParse(test23_KO2).success).toBeFalsy();

    //     // carry-on union carrying on union
    //     // console.log("test24ZodSchema", test24ZodSchema.zodText)
    //     console.log("test24ZodSchema", jzodToTsCode (
    //       test24,
    //       true,// exportPrefix: boolean = true,
    //       "test24"// typeName?: string,
    //     ))
    //     expect(test24ZodSchema.zodSchema.safeParse(test24_OK1).success).toBeTruthy();
    //     expect(test24ZodSchema.zodSchema.safeParse(test24_OK2).success).toBeTruthy();
    //     expect(test24ZodSchema.zodSchema.safeParse(test24_OK3).success).toBeTruthy();
    //     expect(test24ZodSchema.zodSchema.safeParse(test24_KO1).success).toBeFalsy();

    //   }
    // )

    // ############################################################################################
    it("Jzod to Zod and back",
      async() => {

        const lazyRef:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
          {type:"string"},
          () => ({}) as ZodSchemaAndDescriptionRecord,
          () => ({}) as ZodSchemaAndDescriptionRecord,
        );

        const testZodToJzodConversion = (
          testName: string,
          testJzodSchema:JzodElement,
          expectedZodSchemaText: string,
          expectedJzodSchema?: JzodElement,

        ) => {
          const testZodSchemaAndDescription:ZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
            testJzodSchema,
            () => ({}) as ZodSchemaAndDescriptionRecord,
            () => ({lazyRef}) as ZodSchemaAndDescriptionRecord,
          )
          const testResult = zodToJzod(testZodSchemaAndDescription.zodSchema,testName);
          // console.log("Zod to Jzod testJzodSchema", typeName, "zod text", testZodSchemaAndDescription.zodText);
          // console.log("Zod to Jzod testJzodSchema", typeName, "jzod result schema", JSON.stringify(testResult,undefined,2));

          console.log("Zod to Jzod testJzodSchema", testName);
          expect(testZodSchemaAndDescription.zodText).toEqual(expectedZodSchemaText);
          expect(testResult).toEqual(expectedJzodSchema??testJzodSchema);
        }

        // testZodToJzodConversion("test1",{ type: "simpleType", definition: "any"}, "z.any()");
        testZodToJzodConversion("test1", { type: "any" }, "z.any()");
        testZodToJzodConversion("test2", { type: "string", coerce: true }, "z.coerce.string()");
        testZodToJzodConversion("test3", { type: "number" }, "z.number()");
        testZodToJzodConversion("test4", { type: "bigint" }, "z.bigint()");
        testZodToJzodConversion("test5", { type: "boolean" }, "z.boolean()");
        testZodToJzodConversion("test6", { type: "date" }, "z.date()");
        testZodToJzodConversion("test7", { type: "undefined" }, "z.undefined()");
        testZodToJzodConversion("test8", { type: "unknown" }, "z.unknown()");
        testZodToJzodConversion("test9", { type: "never" }, "z.never()");
        testZodToJzodConversion("test11", { type: "literal", definition: "test" }, 'z.literal("test")');
        testZodToJzodConversion("test12", { type: "array", definition: { type: "any" } }, "z.array(z.any())");
        testZodToJzodConversion("test13", { type: "array", definition: { type: "number" } }, "z.array(z.number())");
        testZodToJzodConversion(
          "test14",
          { type: "array", definition: { type: "literal", definition: "number" } },
          'z.array(z.literal("number"))'
        );
        testZodToJzodConversion(
          "test15",
          { type: "enum", definition: ["a", "b", "c", "d"] },
          'z.enum(["a","b","c","d"])'
        );
        testZodToJzodConversion(
          "test16",
          { type: "union", definition: [{ type: "string" }, { type: "number" }] },
          "z.union([z.string(), z.number()])"
        );
        testZodToJzodConversion(
          "test17",
          { type: "object", definition: { a: { type: "string" }, b: { type: "number" } } },
          "z.object({a:z.string(), b:z.number()}).strict()"
        );
        testZodToJzodConversion(
          "test18",
          { type: "object", definition: { a: { type: "string" }, b: { type: "number", optional: true } } },
          "z.object({a:z.string(), b:z.number().optional()}).strict()"
        );
        testZodToJzodConversion(
          "test19",
          {
            type: "object",
            nonStrict: true,
            definition: {
              a: { type: "string" },
              b: { type: "number", optional: false },
            },
          },
          "z.object({a:z.string(), b:z.number()})",
          {
            type: "object",
            nonStrict: true,
            definition: {
              a: { type: "string" },
              b: { type: "number" },
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
          discriminator: {
            discriminatorType: "string",
            value: "kind"
          },
          definition: [
            {
              type: "object",
              nonStrict: true,
              definition: {
                kind: { type: "literal", definition: "a" },
                a: { type: "string" },
              },
            },
            {
              type: "object",
              nonStrict: true,
              definition: {
                kind: { type: "literal", definition: "b" },
                b: { type: "number" },
              },
            },
          ],
        });
        testZodToJzodConversion("test21",{ type: "boolean", optional: true}, "z.boolean().optional()");
        testZodToJzodConversion("test22",{ type: "boolean", optional: false},"z.boolean()", { type: "boolean"});
        testZodToJzodConversion("test23",{ type: "number", nullable: true}, "z.number().nullable()");
        testZodToJzodConversion("test24",{ type: "number", nullable: false}, "z.number()", { type: "number"});
        testZodToJzodConversion("test25",{ type: "record", definition: {type: "number"} }, "z.record(z.string(),z.number())");
        testZodToJzodConversion(
          "test26",
          {
            type: "tuple",
            definition: [
              { type: "number" },
              { type: "schemaReference", definition: { absolutePath: "test26" } },
            ],
          },
          "z.tuple([z.number(), z.lazy(() =>undefined)])"
        );
        testZodToJzodConversion("test27", {
          type: "intersection",
          definition: {
            left: { type: "object", definition: { name: { type: "string" } } },
            right: { type: "object", definition: { role: { type: "string" } } },
          },
        }, "z.intersection(z.object({name:z.string()}).strict(),z.object({role:z.string()}).strict())");
        testZodToJzodConversion("test28",{ type: "map", definition: [ { type: "string" }, { type: "number" }]}, "z.map(z.string(),z.number())");
        testZodToJzodConversion("test29",{ type: "set", definition: { type: "string" }}, "z.set(z.string())");
        testZodToJzodConversion("test30",{ type: "schemaReference", definition: { absolutePath: "test30" }}, "z.lazy(() =>undefined)"); // schemaReference are not really convertible back to Jzod: the inner structure is lost when converting to Zod
        testZodToJzodConversion("test31",{ type: "function", definition: { args: [{ type: "string" }], returns: { type: "number" } }}, "z.function().args([\"z.string()\"]).returns(z.number())");
        testZodToJzodConversion("test32",{ type: "promise", definition: { type: "string" }}, "z.promise(z.string())");
        testZodToJzodConversion(
          "test33",
          {
            type: "object",
            partial: true,
            definition: {
              a: { type: "string" },
              b: { type: "number", optional: true },
            },
          },
          "z.object({a:z.string(), b:z.number().optional()}).strict().partial()",
          { // optional can not be converted back, it is interpreted in the Zod factory as .optional() for all attributes
            type: "object",
            definition: {
              a: { type: "string", optional: true },
              b: { type: "number", optional: true },
            },
          },
        );

        // // TODO: HOW TO TEST SCHEMA REFERENCE CONVERSION
        // testZodToJzodConversion(
        //   "test34",
        //   {
        //     type: "schemaReference",
        //     context: {
        //       o: {
        //         type: "object",
        //         definition: {
        //           a: { type: "string" },
        //           b: { type: "number", optional: true },
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
        //       a: { type: "string", optional: true },
        //       b: { type: "number", optional: true },
        //     },
        //   },
        // );

      }
    )
  }
)



