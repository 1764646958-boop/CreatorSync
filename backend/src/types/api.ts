export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  timestamp: string;
}

export interface ApiErrorPayload {
  code: string;
  details?: unknown;
}
