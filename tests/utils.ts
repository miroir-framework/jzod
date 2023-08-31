import * as fs from "fs";
import { ZodTypeAny } from "zod";


import zodToJsonSchema from "zod-to-json-schema";

// ################################################################################################
export function convertZodSchemaToJsonSchemaAndWriteToFile(
  name: string,
  zodSchema: ZodTypeAny,
  path: string | undefined
): string {
  const zodSchemaJsonSchema = zodToJsonSchema(zodSchema, {
    $refStrategy: "relative",
  });
  const zodSchemaJsonSchemaString = JSON.stringify(zodSchemaJsonSchema, undefined, 2);

  if (path) {
    if (fs.existsSync(path)) {
      fs.rmSync(path);
    }
    fs.writeFileSync(path, zodSchemaJsonSchemaString);
  }

  return zodSchemaJsonSchemaString;
}

