// import { JzodElement } from "@miroir-framework/jzod-ts";

import { jzodToZodTextAndZodSchema } from "./JzodToZod.js";

export function jzodToZod(
  element: any /*JzodElement */,
) {
  return jzodToZodTextAndZodSchema(element).zodSchema
}