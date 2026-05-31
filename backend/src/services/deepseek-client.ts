import type { PlatformId, PlatformOutputContent } from '../adapters/types';
import type { AdaptDraftInput, AdaptPromptContext } from './adaptation-service';
import type { DeepSeekConfig } from './ai-config';

interface DeepSeekMessage {
  role: 'system' | 'user';
  content: string;
}

interface DeepSeekChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export interface GeneratePlatformContentInput {
  platform: PlatformId;
  draft: AdaptDraftInput;
  targetConfig: Record<string, unknown>;
  promptContext: AdaptPromptContext;
  fallbackContent: PlatformOutputContent;
}

export class DeepSeekClient {
  public constructor(private readonly config: DeepSeekConfig) {}

  public async generatePlatformContent(input: GeneratePlatformContentInput): Promise<PlatformOutputContent> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: buildMessages(input),
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(this.config.requestTimeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek request failed with ${response.status}: ${errorText.slice(0, 300)}`);
    }

    const payload = (await response.json()) as DeepSeekChatResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('DeepSeek response did not include message content.');
    }

    return normalizeDeepSeekContent(parseJsonObject(content), input.fallbackContent, this.config.model);
  }
}

const buildMessages = (input: GeneratePlatformContentInput): DeepSeekMessage[] => [
  {
    role: 'system',
    content: [
      input.promptContext.systemPrompt,
      '',
      'You are CreatorSync\'s DeepSeek-powered platform adaptation engine. Return only valid JSON.',
      'The JSON object must contain: title, body, summary, tags, platformFields.',
      'Keep the output suitable for the requested Chinese publishing platform and do not invent unsupported publishing credentials.',
    ].join('\n'),
  },
  {
    role: 'user',
    content: JSON.stringify(
      {
        platform: input.platform,
        platformPrompt: input.promptContext.platformPrompt,
        renderedPrompt: input.promptContext.renderedPrompt,
        draft: input.draft,
        targetConfig: input.targetConfig,
        fallbackContent: input.fallbackContent,
        outputSchema: {
          title: 'string',
          body: 'string',
          summary: 'string',
          tags: ['string'],
          platformFields: 'object',
        },
      },
      null,
      2,
    ),
  },
];

const parseJsonObject = (rawContent: string): Record<string, unknown> => {
  const trimmed = rawContent.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/iu, '')
    .replace(/\s*```$/u, '')
    .trim();

  const parsed = JSON.parse(withoutFence) as unknown;

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('DeepSeek response JSON must be an object.');
  }

  return parsed as Record<string, unknown>;
};

const normalizeDeepSeekContent = (
  candidate: Record<string, unknown>,
  fallbackContent: PlatformOutputContent,
  model: string,
): PlatformOutputContent => {
  const platformFields =
    candidate.platformFields && typeof candidate.platformFields === 'object' && !Array.isArray(candidate.platformFields)
      ? (candidate.platformFields as Record<string, unknown>)
      : {};

  return {
    title: normalizeString(candidate.title) ?? fallbackContent.title,
    body: normalizeString(candidate.body) ?? fallbackContent.body,
    summary: normalizeString(candidate.summary) ?? fallbackContent.summary,
    tags: normalizeStringArray(candidate.tags) ?? fallbackContent.tags,
    assets: fallbackContent.assets,
    platformFields: {
      ...fallbackContent.platformFields,
      ...platformFields,
      generationMode: 'deepseek',
      aiProvider: 'deepseek',
      aiModel: model,
    },
  };
};

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value.map((item) => normalizeString(item)).filter((item): item is string => Boolean(item));

  return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
};
