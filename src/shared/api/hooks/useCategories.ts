import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategoriesByDepartment,
  updateCategory,
} from "@/shared/api/services/categories";
import type { CategoryRequest } from "@/types/api/category";

type UseCategoriesOptions = {
  departmentId?: number;
  activeOnly?: boolean;
};

export function useCategories(options?: UseCategoriesOptions) {
  const departmentId = options?.departmentId;
  const activeOnly = options?.activeOnly ?? false;

  return useQuery({
    queryKey: queryKeys.categories({ departmentId: departmentId ?? null, activeOnly }),
    queryFn: () =>
      departmentId ? fetchCategoriesByDepartment(departmentId, activeOnly) : fetchCategories(),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryRequest) => createCategory(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) => updateCategory(id, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
    },
  });
}
