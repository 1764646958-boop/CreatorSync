declare module 'express' {
  export interface Request {
    method: string;
    originalUrl: string;
    params: Record<string, string>;
    body: unknown;
    headers: Record<string, unknown>;
  }

  export interface Response<T = unknown> {
    status(code: number): this;
    json(body: T): this;
    statusCode: number;
    on(event: 'finish', listener: () => void): this;
  }

  export type NextFunction = (err?: unknown) => void;
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
  export type ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => void;

  export interface Router {
    get(path: string, handler: (req: Request, res: Response, next: NextFunction) => void): this;
    post(path: string, handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>): this;
    use(path: string, router: Router): this;
  }

  export interface Express {
    use(handler: RequestHandler): this;
    use(handler: ErrorRequestHandler): this;
    use(router: Router): this;
    use(path: string, router: Router): this;
    listen(port: number, callback?: () => void): unknown;
  }

  export interface ExpressFactory {
    (): Express;
    json(): RequestHandler;
    urlencoded(options: { extended: boolean }): RequestHandler;
    Router(): Router;
  }

  const express: ExpressFactory;
  export function Router(): Router;
  export default express;
}
