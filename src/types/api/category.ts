export type CategoryRequest = {
  name: string;
  description?: string | null;
  active?: boolean;
  departmentId: number;
};

export type CategoryResponse = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  departmentId: number | null;
  departmentName: string | null;
  createdAt: string;
};
