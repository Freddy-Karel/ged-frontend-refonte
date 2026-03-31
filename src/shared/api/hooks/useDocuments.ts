import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { queryKeys } from "@/shared/api/queryKeys";
import {
  createDocument,
  createDocumentExternalLink,
  createDocumentWithUpload,
  deleteDocument,
  fetchDocuments,
  fetchDocumentsActive,
  fetchDocumentsByDepartment,
  fetchNextReferenceCode,
  updateDocument,
  updateDocumentExternalLink,
  updateDocumentWithUpload,
} from "@/shared/api/services/documents";
import type { DocumentRequest, DocumentUploadRequest } from "@/types/api/document";

type UseDocumentsOptions = {
  departmentId?: number;
  categoryId?: number;
  activeOnly?: boolean;
};

export function useDocuments(options?: UseDocumentsOptions) {
  const departmentId = options?.departmentId;
  const categoryId = options?.categoryId;
  const activeOnly = options?.activeOnly ?? false;

  return useQuery({
    queryKey: queryKeys.documents({
      departmentId: departmentId ?? null,
      categoryId: categoryId ?? null,
      activeOnly,
    }),
    queryFn: () => {
      if (typeof departmentId === "number") {
        return fetchDocumentsByDepartment(departmentId, {
          categoryId,
          activeOnly,
        });
      }

      if (activeOnly) {
        return fetchDocumentsActive();
      }

      return fetchDocuments();
    },
  });
}

export function useNextReferenceCode() {
  return useQuery({
    queryKey: queryKeys.nextReference(),
    queryFn: fetchNextReferenceCode,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentRequest) => createDocument(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.documentsRoot() });
    },
  });
}

export function useCreateDocumentExternalLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentRequest) => createDocumentExternalLink(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.documentsRoot() });
    },
  });
}

export function useCreateDocumentWithUpload(options?: {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentUploadRequest) =>
      createDocumentWithUpload(data, options?.onUploadProgress),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.documentsRoot() });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocumentRequest }) => updateDocument(id, data),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.documentsRoot() }),
        qc.invalidateQueries({ queryKey: queryKeys.document(vars.id) }),
      ]);
    },
  });
}

export function useUpdateDocumentExternalLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocumentRequest }) =>
      updateDocumentExternalLink(id, data),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.documentsRoot() }),
        qc.invalidateQueries({ queryKey: queryKeys.document(vars.id) }),
      ]);
    },
  });
}

export function useUpdateDocumentWithUpload(options?: {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocumentUploadRequest }) =>
      updateDocumentWithUpload(id, data, options?.onUploadProgress),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.documentsRoot() }),
        qc.invalidateQueries({ queryKey: queryKeys.document(vars.id) }),
      ]);
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.documentsRoot() });
    },
  });
}
