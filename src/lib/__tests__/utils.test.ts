import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn (className utility)", () => {
  it("should merge class names", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", true && "active", false && "inactive");
    expect(result).toBe("base active");
  });

  it("should merge tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle undefined and null", () => {
    const result = cn("base", undefined, null, "active");
    expect(result).toBe("base active");
  });
});
