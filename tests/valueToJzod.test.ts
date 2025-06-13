import { describe, it, expect } from 'vitest';
import { valueToJzod } from "../src/valueToJzod";

describe("valueToJzod", () => {
  it("should convert null", () => {
    expect(valueToJzod(null)).toEqual({ type: "null" });
  });

  it("should convert undefined", () => {
    expect(valueToJzod(undefined)).toEqual({ type: "undefined" });
  });

  it("should convert empty string", () => {
    expect(valueToJzod("")).toEqual({ type: "string" });
  });

  it("should convert string", () => {
    expect(valueToJzod("hello")).toEqual({ type: "string" });
  });

  it("should convert number", () => {
    expect(valueToJzod(42)).toEqual({ type: "number" });
  });

  it("should convert boolean", () => {
    expect(valueToJzod(true)).toEqual({ type: "boolean" });
    expect(valueToJzod(false)).toEqual({ type: "boolean" });
  });

  it("should convert bigint", () => {
    expect(valueToJzod(BigInt(1234567890123456789))).toEqual({ type: "bigint" });
  });


  // ##############################################################################################
  // ARRAYS AS TUPLES
  // ##############################################################################################
  it("should convert empty array as tuple", () => {
    expect(valueToJzod([])).toEqual({ type: "tuple", definition: [] });
  });

  it("should convert array of primitives as tuple", () => {
    expect(valueToJzod([1, "a", false])).toEqual({
      type: "tuple",
      definition: [
        { type: "number" },
        { type: "string" },
        { type: "boolean" }
      ]
    });
  });

  it("should convert nested arrays as tuple", () => {
    expect(valueToJzod([[1, 2], ["a", "b"]])).toEqual({
      type: "tuple",
      definition: [
        {
          type: "tuple",
          definition: [{ type: "number" }, { type: "number" }]
        },
        {
          type: "tuple",
          definition: [{ type: "string" }, { type: "string" }]
        }
      ]
    });
  });

  // ##############################################################################################
  // ARRAYS AS UNIONS
  // ##############################################################################################
  it("should convert empty array as array of any", () => {
    expect(valueToJzod([], "arrayAsArray")).toEqual({ type: "array", definition: { type: "any" } });
  });

  it("should convert array with single type as array", () => {
    const result = valueToJzod([1, 2, 3], "arrayAsArray");
    expect(result).toEqual({
      type: "array",
      definition: { type: "number" },
    });
  });

  it("should convert array with mixed types as an array of a union", () => {
    expect(valueToJzod([1, "a", true], "arrayAsArray")).toEqual({
      type: "array",
      definition: {
        type: "union",
        definition: [{ type: "number" }, { type: "string" }, { type: "boolean" }],
      },
    });
  });


  // ##############################################################################################
  // OBJECTS
  // ##############################################################################################
  it("should convert empty object", () => {
    expect(valueToJzod({})).toEqual({ type: "object", definition: {} });
  });

  it("should convert object with primitives", () => {
    expect(valueToJzod({ a: 1, b: "x", c: false })).toEqual({
      type: "object",
      definition: {
        a: { type: "number" },
        b: { type: "string" },
        c: { type: "boolean" }
      }
    });
  });

  it("should convert nested objects", () => {
    expect(valueToJzod({ foo: { bar: 1 }, arr: [true, null] })).toEqual({
      type: "object",
      definition: {
        foo: {
          type: "object",
          definition: {
            bar: { type: "number" }
          }
        },
        arr: {
          type: "tuple",
          definition: [{ type: "boolean" }, { type: "null" }]
        }
      }
    });
  });

  it("should handle mixed types in arrays and objects", () => {
    expect(valueToJzod([{ a: 1 }, 2, "b"])).toEqual({
      type: "tuple",
      definition: [
        {
          type: "object",
          definition: { a: { type: "number" } }
        },
        { type: "number" },
        { type: "string" }
      ]
    });
  });

  it("should handle complex nested structures", () => {
    expect(valueToJzod({
      a: [1, "two", { three: true }],
      b: { c: null, d: [4, 5] }
    })).toEqual({
      type: "object",
      definition: {
        a: {
          type: "tuple",
          definition: [
            { type: "number" },
            { type: "string" },
            {
              type: "object",
              definition: { three: { type: "boolean" } }
            }
          ]
        },
        b: {
          type: "object",
          definition: {
            c: { type: "null" },
            d: {
              type: "tuple",
              definition: [{ type: "number" }, { type: "number" }]
            }
          }
        }
      }
    });
  });
  
  it("should fallback to never for unsupported types", () => {
    expect(valueToJzod(() => {})).toEqual({ type: "never" });
    expect(valueToJzod(Symbol("sym"))).toEqual({ type: "never" });
  });
});
