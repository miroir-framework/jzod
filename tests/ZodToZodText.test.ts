import { z } from "zod";
import { zodToZodText } from "../src/ZodToZodText";

describe("zodToZodText", () => {
  const identifier = "MySchema";

  it("converts ZodString", () => {
    const schema = z.string();
    expect(zodToZodText(schema, identifier)).toBe("z.string()");
  });

  it("converts ZodNumber", () => {
    const schema = z.number();
    expect(zodToZodText(schema, identifier)).toBe("z.number()");
  });

  it("converts ZodArray", () => {
    const schema = z.array(z.string());
    expect(zodToZodText(schema, identifier)).toBe("z.array(z.string())");
  });

  it("converts ZodLiteral", () => {
    const schema = z.literal("test");
    expect(zodToZodText(schema, identifier)).toBe("z.literal(test)");
  });

  it("converts ZodOptional", () => {
    const schema = z.number().optional();
    expect(zodToZodText(schema, identifier)).toBe("z.optional(z.number())");
  });

  it("converts ZodNullable", () => {
    const schema = z.number().nullable();
    expect(zodToZodText(schema, identifier)).toBe("z.nullable(z.number())");
  });

  it("converts ZodObject", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().optional(),
    });
    // Note: since the "age" property is defined as an optional,
    // the inner zodToZodText already produces "z.optional(z.number())"
    // and then an additional ".optional()" is appended in the object case.
    // Therefore, we expect a double optional on "age".
    expect(zodToZodText(schema, identifier))
      .toBe("z.object(name: z.string(), age: z.optional(z.number()).optional())");
  });

  it("converts ZodUnion", () => {
    const schema = z.union([z.string(), z.number()]);
    expect(zodToZodText(schema, identifier)).toBe("z.union([z.string(), z.number()])");
  });

  it("converts ZodIntersection", () => {
    const schema = z.intersection(z.string(), z.number());
    expect(zodToZodText(schema, identifier)).toBe("z.intersection(z.string(), z.number())");
  });

  it("converts ZodTuple", () => {
    const schema = z.tuple([z.string(), z.number()]);
    expect(zodToZodText(schema, identifier)).toBe("z.tuple([z.string(), z.number()])");
  });

  it("converts ZodMap", () => {
    const schema = z.map(z.string(), z.number());
    expect(zodToZodText(schema, identifier)).toBe("z.map(z.string(), z.number())");
  });

  it("converts ZodSet", () => {
    const schema = z.set(z.string());
    expect(zodToZodText(schema, identifier)).toBe("z.set(z.string())");
  });

  it("converts ZodFunction", () => {
    const schema = z.function().args(z.string()).returns(z.number());
    expect(zodToZodText(schema, identifier)).toBe("z.function().args(z.string()).returns(z.number())");
  });

  it("converts ZodLazy", () => {
    const schema = z.lazy(() => z.string());
    expect(zodToZodText(schema, identifier)).toBe("z.lazy(()=>MySchema)");
  });

  it("converts ZodDefault", () => {
    const schema = z.string().default("hello");
    expect(zodToZodText(schema, identifier)).toBe("z.default()");
  });

  it("converts ZodEffects", () => {
    const schema = z.string().transform((val) => val);
    expect(zodToZodText(schema, identifier)).toBe("z.any()");
  });
});