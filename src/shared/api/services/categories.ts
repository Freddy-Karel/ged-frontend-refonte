import { apiClient } from "@/shared/api/client";
import type { CategoryRequest, CategoryResponse } from "@/types/api/category";

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const response = await apiClient.get<CategoryResponse[]>("/categories");
  return response.data;
}

export async function fetchCategoriesByDepartment(
  departmentId: number,
  activeOnly = false
): Promise<CategoryResponse[]> {
  const response = await apiClient.get<CategoryResponse[]>(
    `/categories/department/${departmentId}`,
    {
      params: { activeOnly },
    }
  );
  return response.data;
}

export async function fetchCategoryById(id: number): Promise<CategoryResponse> {
  const response = await apiClient.get<CategoryResponse>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(data: CategoryRequest): Promise<CategoryResponse> {
  const response = await apiClient.post<CategoryResponse>("/categories", data);
  return response.data;
}

export async function updateCategory(id: number, data: CategoryRequest): Promise<CategoryResponse> {
  const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
