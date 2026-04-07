import { toAbsoluteBackendUrl } from "@/shared/api/client";

export function buildPreviewUrl(documentId: number): string {
  return toAbsoluteBackendUrl(`/api/files/documents/${documentId}/preview`);
}

export function buildOpenUrl(documentId: number): string {
  return toAbsoluteBackendUrl(`/api/files/documents/${documentId}/open`);
}

export function buildDownloadUrl(documentId: number): string {
  return toAbsoluteBackendUrl(`/api/files/documents/${documentId}/download`);
}
