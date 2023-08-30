// import { ZodTypeAny } from "zod";
// import { createTypeAlias, printNode, zodToTs } from "zod-to-ts";
// import { ZodSchemaAndDescription } from "./JzodInterface";
// import { TsTypeAliases } from "./facade";


// export function getTsTypesForZodSchemaAndDescription(
//   typeName: string,
//   jzodSchemaZodSchemaAndDescription: ZodSchemaAndDescription<ZodTypeAny>
// ) {
//   const contextTsTypesString = Object.fromEntries(
//     Object.entries(jzodSchemaZodSchemaAndDescription.contextZodSchema ?? {}).map((curr) => {
//       // console.log("getTsCodeCorrespondingToZodSchemaAndDescription ", JSON.stringify(curr));
//       const tsNode = zodToTs(curr[1], typeName).node;
//       const typeAlias = createTypeAlias(tsNode, curr[0]);
//       return [curr[0], typeAlias];
//     })
//   );
//   return contextTsTypesString;
// }

// export function printTypeAliases(
//   typeAliases: TsTypeAliases,
//   exportPrefix: boolean = true,
// ): string {
//   const result = Object.entries(typeAliases).reduce((acc, curr) => {
//     console.log("printTypeAliases ", JSON.stringify(curr));
//     return `${acc}
// ${(exportPrefix?"export ":"")+printNode(curr[1])}`;
//   }, "");
//   return result;
// }

// export function getTsCodeCorrespondingToZodSchemaAndDescription(
//   typeName: string,
//   jzodSchemaZodSchemaAndDescription: ZodSchemaAndDescription<ZodTypeAny>,
//   exportPrefix: boolean = true,
// ): string {
//   console.log(
//     "getTsCodeCorrespondingToZodSchemaAndDescription jzodSchemaZodSchemaAndDescription.contextZodSchema",
//     Object.keys(jzodSchemaZodSchemaAndDescription.contextZodSchema??{}),
//     "jzodSchemaZodSchemaAndDescription",
//     JSON.stringify(jzodSchemaZodSchemaAndDescription)
//   );

//   const schemaName = typeName.replace(/^(.)(.*)$/, (a, b, c) => b.toLowerCase() + c);
//   const bodyJsCode = `export const ${schemaName} = ${jzodSchemaZodSchemaAndDescription.zodText};`;
//   // console.log("getTsCodeCorrespondingToZodSchemaAndDescription convertedJsonZodSchema", bodyJsCode);

//   const header = `import { ZodType, ZodTypeAny, z } from "zod";`;

//   const typeAliases = getTsTypesForZodSchemaAndDescription(typeName, jzodSchemaZodSchemaAndDescription);

//   const contextTsTypesString = printTypeAliases(typeAliases, exportPrefix);
// //   const contextTsTypesString = Object.entries(typeAliases).reduce((acc, curr) => {
// //         console.log("getTsCodeCorrespondingToZodSchemaAndDescription ", JSON.stringify(curr));
// //         return `${acc}
// // ${printNode(curr[1])}`;
// //       }, "");
// //   const contextTsTypesString = jzodSchemaZodSchemaAndDescription.contextZodSchema
// //     ? Object.entries(jzodSchemaZodSchemaAndDescription.contextZodSchema).reduce((acc, curr) => {
// //         console.log("getTsCodeCorrespondingToZodSchemaAndDescription ", JSON.stringify(curr));
// //         const tsNode = zodToTs(curr[1], typeName).node;
// //         const typeAlias = createTypeAlias(tsNode, curr[0]);
// //         return `${acc}
// // ${printNode(typeAlias)}`;
// //       }, "")
// //     : "";

//   // console.log("getTsCodeCorrespondingToZodSchemaAndDescription contextTsTypesString",contextTsTypesString);

//   const contextJsCode = jzodSchemaZodSchemaAndDescription.contextZodText
//     ? Object.entries(jzodSchemaZodSchemaAndDescription.contextZodText).reduce((acc, curr) => {
//         return `${acc}
// export const ${curr[0]}=${curr[1]};`;
//       }, "")
//     : ""
//   ;

//   const tsTypesStringNode = zodToTs(jzodSchemaZodSchemaAndDescription.zodSchema, typeName).node;
//   const tsTypesStringTypeAlias = createTypeAlias(tsTypesStringNode, typeName);
//   const tsTypesString = (exportPrefix?"export ":"") + printNode(tsTypesStringTypeAlias);

//   // console.log("getTsCodeCorrespondingToZodSchemaAndDescription tsTypeString",tsTypesString);

//   //   const footer = `
//   // export type ${casedtypeName} = z.infer<typeof ${schemaName}ZodSchema>
//   // `;

//   return `${header}
// ${contextTsTypesString}
// ${tsTypesString}
// ${contextJsCode}
// ${bodyJsCode}
// `;
// }
