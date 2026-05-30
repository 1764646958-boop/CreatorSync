declare const process: {
  env: Record<string, string | undefined>;
  uptime(): number;
};

declare const console: {
  log(...data: unknown[]): void;
  error(...data: unknown[]): void;
};
