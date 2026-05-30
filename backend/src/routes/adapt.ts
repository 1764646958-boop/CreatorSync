import { Router } from 'express';
import { PlatformAdapterInput, PlatformId } from '../adapters/types';
import { adaptationService, AdaptDraftInput, AdaptRequestInput } from '../services/adaptation-service';
import { HttpError } from '../types/http-error';
import { sendSuccess } from '../utils/response';

const router = Router();

router.post('/adapt', async (req, res, next) => {
  try {
    const input = normalizeAdaptRequest(req.body);
    const result = await adaptationService.adapt(input);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

const normalizeAdaptRequest = (body: unknown): AdaptRequestInput => {
  if (!isPlainObject(body)) {
    throw new HttpError('Request body must be an object.', 400);
  }

  const draft = normalizeDraft(body.draft);
  const platforms = normalizePlatforms(body.platforms);
  const targetConfig = normalizeTargetConfig(body.targetConfig);

  return {
    draft,
    platforms,
    targetConfig,
  };
};

const normalizeDraft = (draft: unknown): AdaptDraftInput => {
  if (!isPlainObject(draft)) {
    throw new HttpError('Request body must include a draft object.', 400);
  }

  const body = pickBodyText(draft);

  if (!body) {
    throw new HttpError('draft.body, draft.content, or draft.sourceContent must be a non-empty string.', 400);
  }

  const tags = normalizeStringArray(draft.tags, 'draft.tags');
  const assets = normalizeAssets(draft.assets);

  return {
    title: normalizeOptionalString(draft.title, 'draft.title'),
    body,
    summary: normalizeOptionalString(draft.summary, 'draft.summary'),
    tags,
    assets,
    format: normalizeFormat(draft.format),
    locale: normalizeOptionalString(draft.locale, 'draft.locale'),
    authorId: normalizeOptionalString(draft.authorId, 'draft.authorId'),
    metadata: isPlainObject(draft.metadata) ? draft.metadata : undefined,
  };
};

const normalizePlatforms = (platforms: unknown): PlatformId[] => {
  if (!Array.isArray(platforms) || platforms.length === 0) {
    throw new HttpError('platforms must be a non-empty string array.', 400);
  }

  const normalized = platforms.map((platform, index) => {
    if (typeof platform !== 'string' || platform.trim().length === 0) {
      throw new HttpError(`platforms[${index}] must be a non-empty string.`, 400);
    }

    return platform.trim() as PlatformId;
  });

  return Array.from(new Set(normalized));
};

const normalizeTargetConfig = (targetConfig: unknown): Record<string, unknown> => {
  if (targetConfig === undefined) {
    return {};
  }

  if (!isPlainObject(targetConfig)) {
    throw new HttpError('targetConfig must be an object when provided.', 400);
  }

  return targetConfig;
};

const pickBodyText = (draft: Record<string, unknown>): string | undefined => {
  const candidates = [draft.body, draft.content, draft.sourceContent];
  const body = candidates.find((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0);

  return body?.trim();
};

const normalizeOptionalString = (value: unknown, fieldName: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(`${fieldName} must be a string when provided.`, 400);
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeStringArray = (value: unknown, fieldName: string): string[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new HttpError(`${fieldName} must be a string array when provided.`, 400);
  }

  return value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new HttpError(`${fieldName}[${index}] must be a string.`, 400);
    }

    return item.trim();
  }).filter(Boolean);
};

const normalizeAssets = (value: unknown): PlatformAdapterInput['assets'] => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new HttpError('draft.assets must be an array when provided.', 400);
  }

  return value.map((item, index) => {
    if (!isPlainObject(item) || typeof item.url !== 'string' || item.url.trim().length === 0) {
      throw new HttpError(`draft.assets[${index}].url must be a non-empty string.`, 400);
    }

    return {
      id: normalizeOptionalString(item.id, `draft.assets[${index}].id`),
      url: item.url.trim(),
      altText: normalizeOptionalString(item.altText, `draft.assets[${index}].altText`),
      mimeType: normalizeOptionalString(item.mimeType, `draft.assets[${index}].mimeType`),
    };
  });
};

const normalizeFormat = (value: unknown): PlatformAdapterInput['format'] => {
  if (value === undefined) {
    return undefined;
  }

  if (value !== 'markdown' && value !== 'plain_text') {
    throw new HttpError('draft.format must be "markdown" or "plain_text" when provided.', 400);
  }

  return value;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export default router;
