import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartmentById,
  fetchDepartments,
  updateDepartment,
} from "@/shared/api/services/departments";
import type { DepartmentRequest } from "@/types/api/department";

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments(),
    queryFn: fetchDepartments,
  });
}

export function useDepartment(id: number | undefined) {
  return useQuery({
    queryKey: typeof id === "number" ? queryKeys.department(id) : queryKeys.department(-1),
    queryFn: () => fetchDepartmentById(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentRequest) => createDepartment(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.departmentsRoot() });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartmentRequest }) =>
      updateDepartment(id, data),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.departmentsRoot() }),
        qc.invalidateQueries({ queryKey: queryKeys.department(vars.id) }),
      ]);
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.departmentsRoot() });
    },
  });
}
