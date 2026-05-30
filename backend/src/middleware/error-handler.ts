import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/http-error';
import { sendError } from '../utils/response';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new HttpError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
};

const getStatusCode = (err: unknown): number => {
  if (err instanceof HttpError) {
    return err.statusCode;
  }

  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = Number((err as { status?: unknown }).status);
    if (Number.isInteger(status) && status >= 400 && status < 600) {
      return status;
    }
  }

  return 500;
};

const getErrorMessage = (err: unknown, statusCode: number): string => {
  if (err instanceof HttpError) {
    return err.message;
  }

  if (statusCode === 400 && err instanceof SyntaxError) {
    return '请求体 JSON 格式不正确，请检查后重试。';
  }

  return statusCode >= 500 ? 'internal server error' : 'request failed';
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = getStatusCode(err);
  const message = getErrorMessage(err, statusCode);
  const code = err instanceof HttpError ? err.code : statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR';
  const details = err instanceof HttpError ? err.details : undefined;

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}]`, err);
  }

  sendError(res, message, statusCode, { code, details });
};
