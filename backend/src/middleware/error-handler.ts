import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/http-error';
import { sendError } from '../utils/response';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new HttpError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const errorMessage = err instanceof Error ? err.message : 'unknown error';
  const message = statusCode >= 500 ? 'internal server error' : errorMessage;

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}]`, err);
  }

  sendError(res, message, statusCode);
};
