import { Response } from 'express';
import { ApiErrorPayload, ApiResponse } from '../types/api';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'success',
  statusCode = 200,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  message = 'internal server error',
  statusCode = 500,
  error: ApiErrorPayload = { code: 'INTERNAL_ERROR' },
): Response<ApiResponse<ApiErrorPayload>> => {
  return res.status(statusCode).json({
    success: false,
    data: error,
    message,
    timestamp: new Date().toISOString(),
  });
};
