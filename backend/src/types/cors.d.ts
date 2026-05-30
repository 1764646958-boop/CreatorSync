declare module 'cors' {
  import { RequestHandler } from 'express';

  export interface CorsOptions {
    origin?: string | string[] | boolean;
  }

  export default function cors(options?: CorsOptions): RequestHandler;
}
