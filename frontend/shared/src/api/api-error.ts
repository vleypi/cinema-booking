import { isAxiosError } from "axios";
import { API_ERROR_TEXT } from "./api.constant";

export type FieldErrors = Record<string, string[]>;

interface IApiErrorBody {
  message?: string;
  errors?: FieldErrors;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (!isAxiosError<IApiErrorBody>(error)) return new ApiError(API_ERROR_TEXT.unknown, 0);
  if (!error.response) return new ApiError(API_ERROR_TEXT.unavailable, 0);

  const { status, data } = error.response;
  return new ApiError(data?.message ?? API_ERROR_TEXT.unknown, status, data?.errors ?? {});
};
