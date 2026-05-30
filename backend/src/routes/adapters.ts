import { Response, Router } from 'express';
import { getPlatformAdapter, listPlatformAdapters } from '../adapters/registry';
import { PlatformAdapterInput, PlatformId } from '../adapters/types';
import { HttpError } from '../types/http-error';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(
    res,
    listPlatformAdapters().map((adapter) => ({
      platform: adapter.platform,
      adapterName: adapter.adapterName,
      capabilities: adapter.getCapabilities(),
    })),
  );
});

const handleAdaptRequest = async (platform: PlatformId, body: unknown, res: Response) => {
  const adapter = getPlatformAdapter(platform);

  if (!adapter) {
    throw new HttpError(`Unsupported platform adapter: ${platform}`, 404);
  }

  const input = normalizeAdapterInput(body);
  const result = await adapter.adapt(input);

  sendSuccess(res, result);
};

router.post('/', async (req, res, next) => {
  try {
    const platform = pickPlatform(req.body);
    await handleAdaptRequest(platform, req.body, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:platform', async (req, res, next) => {
  try {
    await handleAdaptRequest(req.params.platform as PlatformId, req.body, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:platform/adapt', async (req, res, next) => {
  try {
    await handleAdaptRequest(req.params.platform as PlatformId, req.body, res);
  } catch (error) {
    next(error);
  }
});

const pickPlatform = (body: unknown): PlatformId => {
  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body must include a platform field when using /api/adapt.', 400);
  }

  const payload = body as { platform?: unknown; targetPlatform?: unknown };
  const platform = payload.platform ?? payload.targetPlatform;

  if (typeof platform !== 'string' || platform.trim().length === 0) {
    throw new HttpError('Request body must include a string platform field when using /api/adapt.', 400);
  }

  return platform.trim() as PlatformId;
};

const normalizeAdapterInput = (body: unknown): PlatformAdapterInput => {
  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body must be an adapter input object.', 400);
  }

  const payload = body as Partial<PlatformAdapterInput> & {
    content?: unknown;
    draft?: Partial<PlatformAdapterInput> & { content?: unknown; sourceContent?: unknown };
    sourceContent?: unknown;
  };
  const draft = payload.draft && typeof payload.draft === 'object' ? payload.draft : payload;
  const bodyText = pickBodyText(draft);

  if (!bodyText) {
    throw new HttpError('Request body must include a string body, content, or sourceContent field.', 400);
  }

  return {
    title: typeof draft.title === 'string' ? draft.title : undefined,
    body: bodyText,
    summary: typeof draft.summary === 'string' ? draft.summary : undefined,
    tags: Array.isArray(draft.tags) ? draft.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    assets: Array.isArray(draft.assets) ? draft.assets : undefined,
    format: draft.format,
    locale: typeof draft.locale === 'string' ? draft.locale : undefined,
    authorId: typeof draft.authorId === 'string' ? draft.authorId : undefined,
    metadata: draft.metadata,
  };
};

const pickBodyText = (
  draft: Partial<PlatformAdapterInput> & { content?: unknown; sourceContent?: unknown },
): string | undefined => {
  if (typeof draft.body === 'string') {
    return draft.body;
  }

  if (typeof draft.content === 'string') {
    return draft.content;
  }

  if (typeof draft.sourceContent === 'string') {
    return draft.sourceContent;
  }

  return undefined;
};

export default router;
