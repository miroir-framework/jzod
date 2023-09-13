import * as fs from "fs";
import { ZodTypeAny } from "zod";


import zodToJsonSchema from "zod-to-json-schema";

// ################################################################################################
export function convertZodSchemaToJsonSchemaAndWriteToFile(
  name: string,
  zodSchema: ZodTypeAny,
  path: string | undefined,
  definitions?: { [k: string]: ZodTypeAny }
): string {
  const zodSchemaJsonSchema = zodToJsonSchema(zodSchema, {
    // $refStrategy: "relative",
    $refStrategy: "root",
    definitions: definitions??{}
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

