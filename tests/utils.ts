import * as fs from "fs";

import { _zodToJsonSchema, referentialElementDependencies } from "../src/Jzod";
import { JzodElement, JzodElementSet, JzodToZodResult } from "../src/JzodInterface";

export function convertZodSchemaToJsonSchemaAndWriteToFile(name:string,zodSchema:JzodToZodResult,jsonZodSchemaSet:JzodElementSet,path:string | undefined):string {
  const setDependencies = Object.fromEntries(
    Object.entries(jsonZodSchemaSet).map((e: [string, JzodElement]) => [
      e[0],
      referentialElementDependencies(e[1]),
    ])
  );

  const setZodSchemaJsonSchema = _zodToJsonSchema(zodSchema,setDependencies,name);
  const setZodSchemaJsonSchemaString = JSON.stringify(setZodSchemaJsonSchema,undefined,2)

  if (path) {
    if (fs.existsSync(path)) {
      fs.rmSync(path)
    }
    fs.writeFileSync(path,setZodSchemaJsonSchemaString);
  }
  
  return setZodSchemaJsonSchemaString
}