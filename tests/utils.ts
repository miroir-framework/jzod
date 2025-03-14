import fs from 'fs/promises';
import { ZodTypeAny } from "zod";


import zodToJsonSchema from "zod-to-json-schema";

async function fileExists(filePath: string): Promise<boolean> {
  try {
      await fs.access(filePath);
      return true;
  } catch {
      return false;
  }
}

// ################################################################################################
export async function convertZodSchemaToJsonSchemaAndWriteToFile(
  name: string,
  zodSchema: ZodTypeAny,
  path: string | undefined,
  definitions?: { [k: string]: ZodTypeAny }
): Promise<string> {
  const zodSchemaJsonSchema = zodToJsonSchema(zodSchema, {
    // $refStrategy: "relative",
    $refStrategy: "root",
    definitions: definitions??{}
  });
  const zodSchemaJsonSchemaString = JSON.stringify(zodSchemaJsonSchema, undefined, 2);

  if (path) {
    if (await fileExists(path)) {
      await fs.rm(path);
    }
    await fs.writeFile(path, zodSchemaJsonSchemaString);
  }

  return zodSchemaJsonSchemaString;
}

