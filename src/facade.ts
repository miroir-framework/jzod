import { jzodElementSchemaToZodSchemaAndDescription } from "./Jzod";
import { JzodElement } from "./JzodInterface";

export function jzodToZod(
  element: JzodElement,
) {
  return jzodElementSchemaToZodSchemaAndDescription(element).zodSchema
}