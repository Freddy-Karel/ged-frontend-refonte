export type ApiErrorCode =
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "FILE_TOO_LARGE"
  | "FILE_STORAGE_ERROR"
  | "INTERNAL_SERVER_ERROR";

export type ApiError = {
  status: number;
  code: ApiErrorCode;
  message: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
};
