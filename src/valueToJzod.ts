import equal from "fast-deep-equal";
import { JzodElement } from "@miroir-framework/jzod-ts";


/**
 * Converts a JavaScript value to a corresponding `JzodElement` schema representation.
 *
 * - For `null`, returns a schema with type `"null"`.
 * - For strings, numbers, and booleans, returns a schema with type `"string"`, `"number"`, or `"boolean"` respectively.
 * - For arrays, returns a schema with type `"tuple"` and a definition array representing the schema of each item.
 * - For objects, returns a schema with type `"object"` and a definition object mapping each property to its schema.
 * - For unknown types, defaults to a schema with type `"null"`.
 *
 * @param value - The value to convert to a `JzodElement` schema.
 * @param arrayResolution - Determines how arrays are represented:
 *   - `"arrayAsArray"`: Arrays are represented as homogeneous arrays (with a single type or a union of types).
 *   - `"arrayAsTuple"` (default): Arrays are represented as tuples, preserving the type of each element.
 * @returns The `JzodElement` schema representing the input value.
 */
export function valueToJzod(
  value: any,
  arrayResolution: "arrayAsArray" | "arrayAsTuple" = "arrayAsTuple"
): JzodElement {
  if (value === null) {
    return { type: "null" };
  }
  if (value === undefined) {
    return { type: "undefined" };
  }
  if (typeof value === "string") {
    return { type: "string" };
  }
  if (typeof value === "number") {
    return { type: "number" };
  }
  if (typeof value === "boolean") {
    return { type: "boolean" };
  }
  if (typeof value === "bigint") {
    return { type: "bigint" };
  }
  if (Array.isArray(value)) {
    if (arrayResolution === "arrayAsArray") {
      const arrayItemTypes: JzodElement[] = value.length == 0?[{type: "any"}]:value.map(item => valueToJzod(item))
      const uniqueTypes: JzodElement[] = arrayItemTypes.filter(
        (type, index, self) => self.findIndex(t => equal(t, type)) === index
      );
      if (uniqueTypes.length === 0) {
        return { type: "any" };
      } else if (uniqueTypes.length === 1) {
        return { type: "array", definition: uniqueTypes[0] };
      } else {
        return { type: "array", definition: { type: "union", definition: uniqueTypes } };
      }
    }
    if (arrayResolution === "arrayAsTuple") {
      const itemsType: JzodElement[] = value.map((item) => valueToJzod(item));
      return { type: "tuple", definition: itemsType };
    }
  }
  if (typeof value === "object") {
    const properties: { [key: string]: JzodElement } = {};
    for (const key in value) {
      properties[key] = valueToJzod(value[key]);
    }
    return { type: "object", definition: properties };
  }
  // Fallback for unknown types
  return { type: "never" };
}