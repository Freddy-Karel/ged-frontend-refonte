export type DepartmentRequest = {
  name: string;
  description?: string | null;
  active?: boolean;
};

export type DepartmentResponse = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
};
