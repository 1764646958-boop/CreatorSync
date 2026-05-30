declare module 'fs' {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function writeFileSync(path: string, data: string): void;
}

declare module 'path' {
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
}
