import type { DocumentStatus } from "@/types/domain/document";

export type DocumentRequest = {
  title: string;
  description?: string | null;
  status: DocumentStatus;
  documentDate: string;
  filePath?: string | null;
  externalUrl?: string | null;
  externalDocument?: boolean;
  active?: boolean;
  categoryId: number;
  departmentId: number;
};

export type DocumentUploadRequest = {
  title: string;
  description?: string | null;
  status: DocumentStatus;
  documentDate: string;
  active?: boolean;
  categoryId: number;
  departmentId: number;
  file: File;
};

export type DocumentResponse = {
  id: number;
  title: string;
  referenceCode: string;
  description?: string | null;
  status: DocumentStatus;
  documentDate: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;

  filePath?: string | null;
  originalFileName?: string | null;
  storedFileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;

  categoryId?: number | null;
  categoryName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;

  openUrl?: string | null;
  downloadUrl?: string | null;

  externalUrl?: string | null;
  externalDocument?: boolean | null;
  storageType?: "LOCAL_DISK" | "EXTERNAL_LINK" | "MANUAL_PATH" | string | null;
};

export type NextReferenceResponse = {
  referenceCode: string;
};
