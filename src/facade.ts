import ts from "typescript";

import { JzodElement } from "@miroir-framework/jzod-ts";

import { jzodElementSchemaToZodSchemaAndDescription } from "./JzodToZod.js";

// export type TsTypeAliases =  {
//   [k: string]: ts.TypeAliasDeclaration;
// }

export function jzodToZod(
  element: JzodElement,
) {
  return jzodElementSchemaToZodSchemaAndDescription(element).zodSchema
}