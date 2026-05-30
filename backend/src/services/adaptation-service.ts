import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { getPlatformAdapter } from '../adapters/registry';
import {
  PlatformAdapterInput,
  PlatformAdapterResult,
  PlatformId,
  PlatformOutputContent,
} from '../adapters/types';
import { HttpError } from '../types/http-error';

export interface AdaptDraftInput {
  title?: string;
  body: string;
  summary?: string;
  tags?: string[];
  assets?: PlatformAdapterInput['assets'];
  format?: PlatformAdapterInput['format'];
  locale?: string;
  authorId?: string;
  metadata?: Record<string, unknown>;
}

export interface AdaptRequestInput {
  draft: AdaptDraftInput;
  platforms: PlatformId[];
  targetConfig: Record<string, unknown>;
}

export interface AdaptPromptContext {
  systemPrompt: string;
  platformPrompt: string;
  renderedPrompt: string;
  templateVersion: string;
}

export interface AdaptPlatformResult {
  platform: PlatformId;
  status: PlatformAdapterResult['status'];
  content: PlatformOutputContent;
  warnings: string[];
  targetConfig: Record<string, unknown>;
  prompt: {
    templateVersion: string;
    systemPromptPath: string;
    platformPromptPath: string;
  };
  metadata: PlatformAdapterResult['metadata'] & {
    generationMode: 'mock_fallback';
    aiProvider: 'deterministic_mock';
    aiKeyConfigured: boolean;
  };
}

export interface AdaptResponsePayload {
  requestId: string;
  generationMode: 'mock_fallback';
  aiKeyConfigured: boolean;
  results: AdaptPlatformResult[];
}

const TEMPLATE_VERSION = '2026-05-30.unified-adapt.v1';
const SYSTEM_PROMPT_RELATIVE_PATH = 'prompts/adapt.system.md';
const PLATFORM_PROMPT_RELATIVE_PATHS: Record<string, string> = {
  xiaohongshu: 'prompts/platforms/xiaohongshu.md',
  zhihu: 'prompts/platforms/zhihu.md',
};
const DEFAULT_PLATFORM_PROMPT_RELATIVE_PATH = 'prompts/platforms/default.md';

export class AdaptationService {
  public async adapt(input: AdaptRequestInput): Promise<AdaptResponsePayload> {
    const aiKeyConfigured = hasAiKey();
    const results: AdaptPlatformResult[] = [];

    for (const platform of input.platforms) {
      const adapter = getPlatformAdapter(platform);

      if (!adapter) {
        throw new HttpError(`Unsupported platform adapter: ${platform}`, 400);
      }

      const targetConfig = getTargetConfigForPlatform(input.targetConfig, platform);
      const promptContext = buildPromptContext(input.draft, platform, targetConfig);
      const adapterInput = buildAdapterInput(input.draft, platform, targetConfig, promptContext);
      const adapterResult = await adapter.adapt(adapterInput);

      results.push({
        platform,
        status: adapterResult.status,
        content: adapterResult.content,
        warnings: adapterResult.warnings,
        targetConfig,
        prompt: {
          templateVersion: promptContext.templateVersion,
          systemPromptPath: SYSTEM_PROMPT_RELATIVE_PATH,
          platformPromptPath: getPlatformPromptRelativePath(platform),
        },
        metadata: {
          ...adapterResult.metadata,
          generationMode: 'mock_fallback',
          aiProvider: 'deterministic_mock',
          aiKeyConfigured,
        },
      });
    }

    return {
      requestId: createRequestId(input),
      generationMode: 'mock_fallback',
      aiKeyConfigured,
      results,
    };
  }
}

export const adaptationService = new AdaptationService();

const buildAdapterInput = (
  draft: AdaptDraftInput,
  platform: PlatformId,
  targetConfig: Record<string, unknown>,
  promptContext: AdaptPromptContext,
): PlatformAdapterInput => ({
  ...draft,
  metadata: {
    ...(draft.metadata ?? {}),
    platform,
    targetConfig,
    prompt: {
      rendered: promptContext.renderedPrompt,
      templateVersion: promptContext.templateVersion,
    },
    generationMode: 'mock_fallback',
  },
});

const buildPromptContext = (
  draft: AdaptDraftInput,
  platform: PlatformId,
  targetConfig: Record<string, unknown>,
): AdaptPromptContext => {
  const systemPrompt = loadPromptTemplate(SYSTEM_PROMPT_RELATIVE_PATH);
  const platformPrompt = loadPromptTemplate(getPlatformPromptRelativePath(platform));
  const renderedPrompt = renderTemplate([systemPrompt, platformPrompt].join('\n\n'), {
    platform,
    title: draft.title ?? '',
    body: draft.body,
    tags: (draft.tags ?? []).join(', '),
    targetConfig: JSON.stringify(targetConfig),
  });

  return {
    systemPrompt,
    platformPrompt,
    renderedPrompt,
    templateVersion: TEMPLATE_VERSION,
  };
};

const getPlatformPromptRelativePath = (platform: PlatformId): string =>
  PLATFORM_PROMPT_RELATIVE_PATHS[String(platform)] ?? DEFAULT_PLATFORM_PROMPT_RELATIVE_PATH;

const loadPromptTemplate = (relativePath: string): string => {
  const candidates = [resolve(process.cwd(), relativePath), resolve(process.cwd(), '..', relativePath)];
  const foundPath = candidates.find((candidate) => existsSync(candidate));

  if (!foundPath) {
    throw new HttpError(`Prompt template not found: ${relativePath}`, 500);
  }

  return readFileSync(foundPath, 'utf8');
};

const renderTemplate = (template: string, values: Record<string, string>): string =>
  Object.entries(values).reduce(
    (rendered, [key, value]) => rendered.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template,
  );

const getTargetConfigForPlatform = (
  targetConfig: Record<string, unknown>,
  platform: PlatformId,
): Record<string, unknown> => {
  const platformConfig = targetConfig[String(platform)];

  if (isPlainObject(platformConfig)) {
    return platformConfig;
  }

  return targetConfig;
};

const hasAiKey = (): boolean => Boolean(process.env.OPENAI_API_KEY?.trim());

const createRequestId = (input: AdaptRequestInput): string => {
  const seed = `${input.draft.title ?? ''}|${input.draft.body}|${input.platforms.join(',')}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return `adapt_${hash.toString(16).padStart(8, '0')}`;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
