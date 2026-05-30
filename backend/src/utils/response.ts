import { Response } from 'express';
import { ApiResponse } from '../types/api';

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
  data: unknown = null,
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};
