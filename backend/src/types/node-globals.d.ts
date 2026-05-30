declare const process: {
  env: Record<string, string | undefined>;
  uptime(): number;
  cwd(): string;
};

declare const console: {
  log(...data: unknown[]): void;
  error(...data: unknown[]): void;
};

declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding: string): string;
}

declare module 'path' {
  export function resolve(...paths: string[]): string;
}
