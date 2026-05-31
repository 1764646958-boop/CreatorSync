export interface DeepSeekConfig {
  provider: 'deepseek';
  apiKey?: string;
  baseUrl: string;
  endpoint: string;
  model: string;
  mockMode: boolean;
  requestTimeoutMs: number;
}

const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;

export const getDeepSeekConfig = (env: NodeJS.ProcessEnv = process.env): DeepSeekConfig => {
  const baseUrl = normalizeBaseUrl(env.DEEPSEEK_BASE_URL ?? DEFAULT_DEEPSEEK_BASE_URL);

  return {
    provider: 'deepseek',
    apiKey: normalizeOptionalString(env.DEEPSEEK_API_KEY),
    baseUrl,
    endpoint: normalizeBaseUrl(env.DEEPSEEK_ENDPOINT ?? `${baseUrl}/chat/completions`),
    model: normalizeOptionalString(env.DEEPSEEK_MODEL) ?? DEFAULT_DEEPSEEK_MODEL,
    mockMode: parseBoolean(env.AI_MOCK_MODE) || parseBoolean(env.DEEPSEEK_MOCK_MODE),
    requestTimeoutMs: parsePositiveInteger(env.DEEPSEEK_TIMEOUT_MS) ?? DEFAULT_REQUEST_TIMEOUT_MS,
  };
};

export const isDeepSeekReady = (config: DeepSeekConfig): boolean => Boolean(config.apiKey) && !config.mockMode;

const normalizeOptionalString = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const normalizeBaseUrl = (value: string): string => value.trim().replace(/\/+$/u, '');

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on', 'mock'].includes(value.trim().toLowerCase());
};

const parsePositiveInteger = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};
