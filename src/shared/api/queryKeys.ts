export const queryKeys = {
  departmentsRoot: () => ["departments"] as const,
  departments: () => ["departments"] as const,
  department: (id: number) => ["departments", id] as const,

  categoriesRoot: () => ["categories"] as const,
  categories: (params?: { departmentId?: number | null; activeOnly?: boolean }) =>
    [
      "categories",
      {
        departmentId: params?.departmentId ?? null,
        activeOnly: params?.activeOnly ?? false,
      },
    ] as const,
  category: (id: number) => ["categories", id] as const,

  documentsRoot: () => ["documents"] as const,
  documents: (params?: {
    departmentId?: number | null;
    categoryId?: number | null;
    activeOnly?: boolean;
  }) =>
    [
      "documents",
      {
        departmentId: params?.departmentId ?? null,
        categoryId: params?.categoryId ?? null,
        activeOnly: params?.activeOnly ?? false,
      },
    ] as const,
  document: (id: number) => ["documents", id] as const,
  nextReference: () => ["documents", "next-reference"] as const,
} as const;
