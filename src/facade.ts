import ts from "typescript";

import { JzodElement } from "@miroir-framework/jzod-ts";

import { jzodElementSchemaToZodSchemaAndDescription } from "./Jzod";

// export type TsTypeAliases =  {
//   [k: string]: ts.TypeAliasDeclaration;
// }

export function jzodToZod(
  element: JzodElement,
) {
  return jzodElementSchemaToZodSchemaAndDescription(element).zodSchema
}

// export function jzodToTsTypeAliases(
//   typeName: string,
//   element: JzodElement,
// ) {
//   const elementZodSchemaAndDescription = jzodElementSchemaToZodSchemaAndDescription(
//     // typeName,
//     element,
//     () => ({} as ZodSchemaAndDescriptionRecord<ZodTypeAny>),
//     () => ({} as ZodSchemaAndDescriptionRecord<ZodTypeAny>),
//     (innerReference: ZodTypeAny, relativeReference: string | undefined) =>
//       withGetType(innerReference, (ts) =>
//         ts.factory.createTypeReferenceNode(
//           ts.factory.createIdentifier(relativeReference ? relativeReference : "RELATIVEPATH_NOT_DEFINED")
//         )
//       )
//   );

//   return getTsTypesForZodSchemaAndDescription(typeName, elementZodSchemaAndDescription);
// }