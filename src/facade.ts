import { JzodElement } from "@miroir-framework/jzod-ts";

import { jzodElementSchemaToZodSchemaAndDescription } from "./JzodToZod.js";

export function jzodToZod(
  element: JzodElement,
) {
  return jzodElementSchemaToZodSchemaAndDescription(element).zodSchema
}