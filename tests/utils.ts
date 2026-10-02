import fs from 'fs/promises';
import { ZodTypeAny, z } from "zod";

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
  // definitions are kept in the signature for callers; zod 4 inlines or references them by itself
  const zodSchemaJsonSchema = z.toJSONSchema(zodSchema, { unrepresentable: "any", cycles: "ref" });
  const zodSchemaJsonSchemaString = JSON.stringify(zodSchemaJsonSchema, undefined, 2);

  if (path) {
    if (await fileExists(path)) {
      await fs.rm(path);
    }
    await fs.writeFile(path, zodSchemaJsonSchemaString);
  }

  return zodSchemaJsonSchemaString;
}

