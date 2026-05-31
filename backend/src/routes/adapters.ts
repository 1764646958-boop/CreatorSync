import { Request, Response, Router } from 'express';
import { getPlatformAdapter, listPlatformAdapters } from '../adapters/registry';
import {
  PlatformAdapterInput,
  PlatformAdapterResult,
  PlatformCapability,
  PlatformId,
  PlatformOutputContent,
} from '../adapters/types';
import { HttpError } from '../types/http-error';
import { sendSuccess } from '../utils/response';
import { adaptationService } from '../services/adaptation-service';

const router = Router();

// 列出所有平台适配器
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

// 核心 adapt 接口
router.post('/:platform/adapt', async (req: Request, res: Response, next) => {
  try {
    const platform = normalizePlatform(req.params.platform);
    const adapter = getPlatformAdapter(platform);

    if (!adapter) {
      throw new HttpError(`暂不支持 ${platform} 平台适配，请重新选择平台。`, 404, 'UNSUPPORTED_PLATFORM', { platform });
    }

    const input = normalizeAdapterInput(req.body);

    if (shouldSimulateAiFailure(req)) {
      throw new Error('Simulated AI provider failure');
    }

    const result = await adaptationService.adaptSingle(platform, input, normalizeTargetConfig(req.body));

    sendSuccess(res, result, result.metadata.generationMode === 'deepseek' ? 'DeepSeek 平台预览已生成' : '平台预览已生成（mock fallback）');
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    // fallback mock preview
    try {
      const platform = normalizePlatform(req.params.platform);
      const adapter = getPlatformAdapter(platform);
      const input = normalizeAdapterInput(req.body);

      if (!adapter) {
        throw new HttpError(`暂不支持 ${platform} 平台适配，请重新选择平台。`, 404, 'UNSUPPORTED_PLATFORM', { platform });
      }

      sendSuccess(
        res,
        buildMockFallbackResult(platform, adapter.adapterName, adapter.getCapabilities(), input),
        'AI 调用失败，已切换 mock fallback 预览',
      );
    } catch (fallbackError) {
      next(fallbackError);
    }
  }
});

// 模拟发布接口
router.post('/:platform/publish', async (req: Request, res: Response, next) => {
  try {
    const platform = normalizePlatform(req.params.platform);
    const adapter = getPlatformAdapter(platform);

    if (!adapter) {
      throw new HttpError(`暂不支持 ${platform} 平台发布，请重新选择平台。`, 404, 'UNSUPPORTED_PLATFORM', { platform });
    }

    const content = normalizePublishContent(req.body);

    if (shouldSimulatePublishFailure(req)) {
      throw new HttpError(
        `发布失败：${adapter.adapterName} 模拟发布通道暂时不可用，请稍后重试或检查平台配置。`,
        502,
        'PUBLISH_FAILED',
        { platform },
      );
    }

    sendSuccess(
      res,
      {
        platform,
        status: 'mock_published',
        message: `${adapter.adapterName} 模拟发布成功`,
        publishedAt: new Date().toISOString(),
        content,
      },
      '发布流程已完成',
    );
  } catch (error) {
    next(error);
  }
});

// ---------- 工具函数 ----------

const normalizePlatform = (platform: unknown): PlatformId => {
  if (typeof platform !== 'string' || platform.trim().length === 0) {
    throw new HttpError('请选择要处理的平台。', 400, 'PLATFORM_REQUIRED');
  }
  return platform.trim() as PlatformId;
};

const normalizeAdapterInput = (body: unknown): PlatformAdapterInput => {
  if (!body || typeof body !== 'object') {
    throw new HttpError('请求体必须是平台适配输入对象。', 400, 'INVALID_REQUEST_BODY');
  }

  const payload = body as Partial<PlatformAdapterInput> & {
    content?: unknown;
    draft?: Partial<PlatformAdapterInput> & { content?: unknown; sourceContent?: unknown };
    sourceContent?: unknown;
  };

  const draft = payload.draft && typeof payload.draft === 'object' ? payload.draft : payload;
  const title = typeof draft.title === 'string' ? draft.title.trim() : '';
  const bodyText = pickBodyText(draft)?.trim() ?? '';

  const validationErrors = [
    !title ? '请输入标题，便于生成平台预览。' : '',
    !bodyText ? '请输入正文，作为多平台发布的内容来源。' : '',
  ].filter(Boolean);

  if (validationErrors.length > 0) {
    throw new HttpError('输入校验失败，请补全标题和正文。', 400, 'VALIDATION_ERROR', validationErrors);
  }

  return {
    title,
    body: bodyText,
    summary: typeof draft.summary === 'string' ? draft.summary.trim() : undefined,
    tags: Array.isArray(draft.tags) ? draft.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    assets: Array.isArray(draft.assets) ? draft.assets : undefined,
    format: draft.format,
    locale: typeof draft.locale === 'string' ? draft.locale : undefined,
    authorId: typeof draft.authorId === 'string' ? draft.authorId : undefined,
    metadata: draft.metadata,
  };
};

const pickBodyText = (draft: Partial<PlatformAdapterInput> & { content?: unknown; sourceContent?: unknown }): string | undefined => {
  if (typeof draft.body === 'string') return draft.body;
  if (typeof draft.content === 'string') return draft.content;
  if (typeof draft.sourceContent === 'string') return draft.sourceContent;
  return undefined;
};

const normalizePublishContent = (body: unknown): PlatformOutputContent => {
  if (!body || typeof body !== 'object') {
    throw new HttpError('请求体必须包含待发布内容。', 400, 'INVALID_REQUEST_BODY');
  }

  const payload = body as { content?: Partial<PlatformOutputContent>; result?: { content?: Partial<PlatformOutputContent> } };
  const content = payload.content ?? payload.result?.content;
  const title = typeof content?.title === 'string' ? content.title.trim() : '';
  const bodyText = typeof content?.body === 'string' ? content.body.trim() : '';

  const validationErrors = [
    !title ? '发布前请先生成或填写标题。' : '',
    !bodyText ? '发布前请先生成或填写正文。' : '',
  ].filter(Boolean);

  if (validationErrors.length > 0) {
    throw new HttpError('发布校验失败，请检查预览内容。', 400, 'VALIDATION_ERROR', validationErrors);
  }

  return {
    title,
    body: bodyText,
    summary: typeof content?.summary === 'string' ? content.summary : undefined,
    tags: Array.isArray(content?.tags) ? content.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    assets: Array.isArray(content?.assets) ? content.assets : [],
    platformFields: content?.platformFields && typeof content.platformFields === 'object' ? content.platformFields : {},
  };
};


const normalizeTargetConfig = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const payload = body as { targetConfig?: unknown; platformConfig?: unknown };

  if (payload.targetConfig && typeof payload.targetConfig === 'object' && !Array.isArray(payload.targetConfig)) {
    return payload.targetConfig as Record<string, unknown>;
  }

  if (payload.platformConfig && typeof payload.platformConfig === 'object' && !Array.isArray(payload.platformConfig)) {
    return payload.platformConfig as Record<string, unknown>;
  }

  return {};
};

const shouldSimulateAiFailure = (req: Request): boolean => {
  const headerValue = req.headers['x-simulate-ai-failure'];
  const body = req.body as { simulateAiFailure?: unknown; metadata?: { simulateAiFailure?: unknown } };
  return headerValue === 'true' || body?.simulateAiFailure === true || body?.metadata?.simulateAiFailure === true;
};

const shouldSimulatePublishFailure = (req: Request): boolean => {
  const headerValue = req.headers['x-simulate-publish-failure'];
  const body = req.body as { simulatePublishFailure?: unknown; metadata?: { simulatePublishFailure?: unknown } };
  return headerValue === 'true' || body?.simulatePublishFailure === true || body?.metadata?.simulatePublishFailure === true;
};

const buildMockFallbackResult = (
  platform: PlatformId,
  adapterName: string,
  capabilities: PlatformCapability[],
  input: PlatformAdapterInput,
): PlatformAdapterResult => ({
  platform,
  status: 'needs_review',
  content: {
    title: input.title,
    body: [
      input.body,
      '',
      '——',
      'AI 服务暂不可用，CreatorSync 已保留原始正文并生成 mock fallback 预览，请人工确认后再发布。',
    ].join('\n'),
    summary: input.summary ?? 'AI 调用失败后的 mock fallback 预览。',
    tags: input.tags ?? [],
    assets: input.assets ?? [],
    platformFields: {
      generationMode: 'mock_fallback',
      fallbackReason: 'ai_provider_failed',
    },
  },
  warnings: ['AI 调用失败，已使用 mock fallback，发布前请人工复核。'],
  metadata: {
    adapterName,
    generatedAt: new Date().toISOString(),
    capabilities,
  },
});

export default router;