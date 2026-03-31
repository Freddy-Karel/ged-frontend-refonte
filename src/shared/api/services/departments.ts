import { apiClient } from "@/shared/api/client";
import type { DepartmentRequest, DepartmentResponse } from "@/types/api/department";
import type { CategoryResponse } from "@/types/api/category";
import type { DocumentResponse } from "@/types/api/document";

export async function fetchDepartments(): Promise<DepartmentResponse[]> {
  const response = await apiClient.get<DepartmentResponse[]>("/departments");
  return response.data;
}

export async function fetchDepartmentById(id: number): Promise<DepartmentResponse> {
  const response = await apiClient.get<DepartmentResponse>(`/departments/${id}`);
  return response.data;
}

export async function fetchDepartmentCategories(
  departmentId: number,
  activeOnly = false
): Promise<CategoryResponse[]> {
  const response = await apiClient.get<CategoryResponse[]>(
    `/departments/${departmentId}/categories`,
    {
      params: { activeOnly },
    }
  );
  return response.data;
}

export async function fetchDepartmentDocuments(
  departmentId: number,
  options?: { categoryId?: number; activeOnly?: boolean }
): Promise<DocumentResponse[]> {
  const response = await apiClient.get<DocumentResponse[]>(
    `/departments/${departmentId}/documents`,
    {
      params: {
        categoryId: options?.categoryId,
        activeOnly: options?.activeOnly ?? false,
      },
    }
  );
  return response.data;
}

export async function createDepartment(data: DepartmentRequest): Promise<DepartmentResponse> {
  const response = await apiClient.post<DepartmentResponse>("/departments", data);
  return response.data;
}

export async function updateDepartment(
  id: number,
  data: DepartmentRequest
): Promise<DepartmentResponse> {
  const response = await apiClient.put<DepartmentResponse>(`/departments/${id}`, data);
  return response.data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await apiClient.delete(`/departments/${id}`);
}
