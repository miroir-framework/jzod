import { ZodTypeAny } from "zod";
import { ZodSchemaAndDescription } from "./JzodInterface";
import { createTypeAlias, printNode, zodToTs } from "zod-to-ts";

export function getTsCodeCorrespondingToZodSchemaAndDescription(
  typeName: string,
  jzodSchemaZodSchemaAndDescription: ZodSchemaAndDescription<ZodTypeAny>
): string {
  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription jzodSchemaZodSchemaAndDescription", JSON.stringify(jzodSchemaZodSchemaAndDescription));

  const schemaName = typeName.replace(/^(.)(.*)$/, (a, b, c) => b.toLowerCase() + c);
  const bodyJsCode = `export const ${schemaName} = ${jzodSchemaZodSchemaAndDescription.description};`;
  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription convertedJsonZodSchema", bodyJsCode);

  const header = `import { ZodType, ZodTypeAny, z } from "zod";`;
  const contextJsCode = jzodSchemaZodSchemaAndDescription.contextDescription
    ? Object.entries(jzodSchemaZodSchemaAndDescription.contextDescription).reduce((acc, curr) => {
        return `${acc}
export const ${curr[0]}=${curr[1]};`;
      }, "")
    : "";

  const contextTsTypesString = jzodSchemaZodSchemaAndDescription.contextZodSchema
    ? Object.entries(jzodSchemaZodSchemaAndDescription.contextZodSchema).reduce((acc, curr) => {
        // console.log("curr", JSON.stringify(curr));
        const tsNode = zodToTs(curr[1], typeName).node;
        const typeAlias = createTypeAlias(tsNode, curr[0]);
        return `${acc}
${printNode(typeAlias)}`;
      }, "")
    : "";

  // const contextTsTypesString = printNode(nodeContexttsTypesString);
  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription contextTsTypesString",contextTsTypesString);

  const tsTypesStringNode = zodToTs(jzodSchemaZodSchemaAndDescription.zodSchema, typeName).node;
  const tsTypesStringTypeAlias = createTypeAlias(tsTypesStringNode, typeName);
  const tsTypesString = printNode(tsTypesStringTypeAlias);

  // console.log("getTsCodeCorrespondingToZodSchemaAndDescription tsTypeString",tsTypesString);

  //   const footer = `
  // export type ${casedtypeName} = z.infer<typeof ${schemaName}ZodSchema>
  // `;

  return `${header}
${contextTsTypesString}
${tsTypesString}
${contextJsCode}
${bodyJsCode}
`;
}
