import type { ApiError, ApiErrorCode } from "@/types/api/error";

type AnyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AnyRecord {
  return !!value && typeof value === "object";
}

function toStringSafe(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  try {
    return String(value);
  } catch {
    return "";
  }
}

function normalizeCode(value: unknown): ApiErrorCode {
  const code = toStringSafe(value).toUpperCase();
  if (code === "NOT_FOUND") return "NOT_FOUND";
  if (code === "BAD_REQUEST") return "BAD_REQUEST";
  if (code === "VALIDATION_ERROR") return "VALIDATION_ERROR";
  if (code === "FILE_TOO_LARGE") return "FILE_TOO_LARGE";
  if (code === "FILE_STORAGE_ERROR") return "FILE_STORAGE_ERROR";
  return "INTERNAL_SERVER_ERROR";
}

export function toApiError(input: unknown): ApiError {
  if (!isRecord(input)) {
    return {
      status: 0,
      code: "INTERNAL_SERVER_ERROR",
      message: "Une erreur est survenue lors de l'appel API.",
    };
  }

  const statusRaw = input.status;
  const status = typeof statusRaw === "number" ? statusRaw : Number(statusRaw ?? 0);

  const code = normalizeCode(input.error);

  const message =
    typeof input.message === "string"
      ? input.message
      : typeof input.error === "string"
        ? input.error
        : "Une erreur est survenue lors de l'appel API.";

  const timestamp = typeof input.timestamp === "string" ? input.timestamp : undefined;

  const fieldErrors = isRecord(input.messages)
    ? Object.fromEntries(Object.entries(input.messages).map(([k, v]) => [k, toStringSafe(v)]))
    : undefined;

  return {
    status,
    code,
    message,
    timestamp,
    fieldErrors,
  };
}
