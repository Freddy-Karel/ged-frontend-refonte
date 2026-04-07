import type { DocumentStatus } from "@/types/domain/document";
import type { AxiosProgressEvent } from "axios";
import { apiClient, apiUploadClient, toAbsoluteBackendUrl } from "@/shared/api/client";
import type {
  DocumentRequest,
  DocumentResponse,
  DocumentUploadRequest,
  NextReferenceResponse,
} from "@/types/api/document";

function isAbsoluteHttpUrl(value?: string | null): boolean {
  return !!value && /^https?:\/\//i.test(value);
}

function normalizeDocument(item: DocumentResponse): DocumentResponse {
  return {
    ...item,
    openUrl: item.openUrl ? toAbsoluteBackendUrl(item.openUrl) : item.openUrl,
    downloadUrl: item.downloadUrl ? toAbsoluteBackendUrl(item.downloadUrl) : item.downloadUrl,
    externalUrl: isAbsoluteHttpUrl(item.externalUrl)
      ? item.externalUrl
      : item.externalUrl
        ? toAbsoluteBackendUrl(item.externalUrl)
        : item.externalUrl,
    filePath:
      item.storageType === "LOCAL_DISK"
        ? item.filePath
        : item.filePath && !isAbsoluteHttpUrl(item.filePath)
          ? toAbsoluteBackendUrl(item.filePath)
          : item.filePath,
  };
}

export async function fetchDocuments(): Promise<DocumentResponse[]> {
  const response = await apiClient.get<DocumentResponse[]>("/documents");
  return response.data.map(normalizeDocument);
}

export async function fetchDocumentsByDepartment(
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
  return response.data.map(normalizeDocument);
}

export async function fetchDocumentsActive(): Promise<DocumentResponse[]> {
  const response = await apiClient.get<DocumentResponse[]>("/documents/active");
  return response.data.map(normalizeDocument);
}

export async function fetchDocumentById(id: number): Promise<DocumentResponse> {
  const response = await apiClient.get<DocumentResponse>(`/documents/${id}`);
  return normalizeDocument(response.data);
}

export async function fetchDocumentsByStatus(status: DocumentStatus): Promise<DocumentResponse[]> {
  const response = await apiClient.get<DocumentResponse[]>(`/documents/status/${status}`);
  return response.data.map(normalizeDocument);
}

export async function searchDocuments(keyword: string): Promise<DocumentResponse[]> {
  const response = await apiClient.get<DocumentResponse[]>("/documents/search", {
    params: { keyword },
  });
  return response.data.map(normalizeDocument);
}

export async function fetchNextReferenceCode(): Promise<string> {
  const response = await apiClient.get<NextReferenceResponse>("/documents/next-reference");
  return response.data.referenceCode;
}

export async function createDocument(data: DocumentRequest): Promise<DocumentResponse> {
  const response = await apiClient.post<DocumentResponse>("/documents", {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    filePath: data.filePath ?? null,
    externalUrl: data.externalUrl ?? null,
    externalDocument: data.externalDocument ?? false,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  });
  return normalizeDocument(response.data);
}

export async function createDocumentExternalLink(data: DocumentRequest): Promise<DocumentResponse> {
  const response = await apiClient.post<DocumentResponse>("/documents/link", {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    externalUrl: data.externalUrl ?? null,
    externalDocument: true,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  });
  return normalizeDocument(response.data);
}

export async function createDocumentWithUpload(
  data: DocumentUploadRequest,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  formData.append("status", data.status);
  formData.append("documentDate", data.documentDate);
  formData.append("active", String(data.active ?? true));
  formData.append("categoryId", String(data.categoryId));
  formData.append("departmentId", String(data.departmentId));
  formData.append("file", data.file);

  const response = await apiUploadClient.post<DocumentResponse>("/documents/upload", formData, {
    onUploadProgress,
  });
  return normalizeDocument(response.data);
}

export async function updateDocument(id: number, data: DocumentRequest): Promise<DocumentResponse> {
  const response = await apiClient.put<DocumentResponse>(`/documents/${id}`, {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    filePath: data.filePath ?? null,
    externalUrl: data.externalUrl ?? null,
    externalDocument: data.externalDocument ?? false,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  });
  return normalizeDocument(response.data);
}

export async function updateDocumentExternalLink(
  id: number,
  data: DocumentRequest
): Promise<DocumentResponse> {
  const response = await apiClient.put<DocumentResponse>(`/documents/${id}/link`, {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    externalUrl: data.externalUrl ?? null,
    externalDocument: true,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  });
  return normalizeDocument(response.data);
}

export async function updateDocumentWithUpload(
  id: number,
  data: DocumentUploadRequest,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  formData.append("status", data.status);
  formData.append("documentDate", data.documentDate);
  formData.append("active", String(data.active ?? true));
  formData.append("categoryId", String(data.categoryId));
  formData.append("departmentId", String(data.departmentId));
  formData.append("file", data.file);

  const response = await apiUploadClient.put<DocumentResponse>(
    `/documents/${id}/upload`,
    formData,
    {
      onUploadProgress,
    }
  );
  return normalizeDocument(response.data);
}

export async function deleteDocument(id: number): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}
