export type DocumentStatus = "DRAFT" | "VALIDATED" | "ARCHIVED";

export const DOCUMENT_STATUSES: readonly DocumentStatus[] = [
  "DRAFT",
  "VALIDATED",
  "ARCHIVED",
] as const;
