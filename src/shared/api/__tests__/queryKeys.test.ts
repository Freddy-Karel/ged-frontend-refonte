import { describe, it, expect } from "vitest";
import { queryKeys } from "../queryKeys";

describe("queryKeys", () => {
  it("should generate consistent department keys", () => {
    const key1 = queryKeys.departments();
    const key2 = queryKeys.departments();
    expect(key1).toEqual(key2);
    expect(key1).toEqual(["departments"]);
  });

  it("should generate unique keys for different department IDs", () => {
    const key1 = queryKeys.department(1);
    const key2 = queryKeys.department(2);
    expect(key1).toEqual(["departments", 1]);
    expect(key2).toEqual(["departments", 2]);
    expect(key1).not.toEqual(key2);
  });

  it("should generate document keys with filters", () => {
    const key = queryKeys.documents({
      departmentId: 1,
      categoryId: 2,
      activeOnly: true,
    });
    expect(key).toEqual(["documents", { departmentId: 1, categoryId: 2, activeOnly: true }]);
  });

  it("should handle null values in document filters", () => {
    const key = queryKeys.documents({
      departmentId: null,
      categoryId: null,
      activeOnly: false,
    });
    expect(key).toEqual(["documents", { departmentId: null, categoryId: null, activeOnly: false }]);
  });

  it("should generate category keys with department filter", () => {
    const key = queryKeys.categories({ departmentId: 1, activeOnly: true });
    expect(key).toEqual(["categories", { departmentId: 1, activeOnly: true }]);
  });
});
