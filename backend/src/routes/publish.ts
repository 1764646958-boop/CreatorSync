import { Router } from 'express';
import { HttpError } from '../types/http-error';
import { sendSuccess } from '../utils/response';

type MockPublishStatus = 'success' | 'failed';

interface PublishRequestBody {
  platform?: unknown;
  platformVersionId?: unknown;
  title?: unknown;
  content?: unknown;
  forceFail?: unknown;
}

interface NormalizedPublishInput {
  platform: string;
  platformVersionId: string;
  title?: unknown;
  content?: unknown;
  forceFail?: unknown;
}

interface PublishTask {
  taskId: string;
  platform: string;
  platformVersionId: string;
  status: MockPublishStatus;
  submittedAt: string;
  completedAt: string;
  timestamp: string;
  message: string;
  error?: string;
}

const router = Router();

const SUPPORTED_PLATFORMS = new Set(['wechat', 'zhihu', 'xiaohongshu', 'bilibili']);
const MOCK_PUBLISH_DELAY_MS = 600;

router.post('/', async (req, res, next) => {
  try {
    const input = normalizePublishRequest(req.body);
    const submittedAt = new Date().toISOString();

    await delay(MOCK_PUBLISH_DELAY_MS);

    const completedAt = new Date().toISOString();
    const status: MockPublishStatus = shouldFail(input) ? 'failed' : 'success';
    const task: PublishTask = {
      taskId: createTaskId(input.platform),
      platform: input.platform,
      platformVersionId: input.platformVersionId,
      status,
      submittedAt,
      completedAt,
      timestamp: completedAt,
      message:
        status === 'success'
          ? 'Mock publish completed successfully.'
          : 'Mock publish failed. Please review the platform version and try again.',
      ...(status === 'failed'
        ? { error: 'Simulated publish failure triggered by request payload.' }
        : {}),
    };

    sendSuccess(
      res,
      task,
      status === 'success' ? 'mock publish succeeded' : 'mock publish failed',
      200,
    );
  } catch (error) {
    next(error);
  }
});

const normalizePublishRequest = (body: unknown): NormalizedPublishInput => {
  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body must be a publish payload object.', 400);
  }

  const payload = body as PublishRequestBody;
  const platform = typeof payload.platform === 'string' ? payload.platform.trim() : '';

  if (!platform) {
    throw new HttpError('Request body must include a platform.', 400);
  }

  if (!SUPPORTED_PLATFORMS.has(platform)) {
    throw new HttpError(`Unsupported mock publish platform: ${platform}`, 400);
  }

  const platformVersionId =
    typeof payload.platformVersionId === 'string' && payload.platformVersionId.trim()
      ? payload.platformVersionId.trim()
      : `${platform}-draft-v1`;

  return {
    platform,
    platformVersionId,
    title: payload.title,
    content: payload.content,
    forceFail: payload.forceFail,
  };
};

const shouldFail = (input: NormalizedPublishInput): boolean => {
  if (input.forceFail === true) {
    return true;
  }

  const content = typeof input.content === 'string' ? input.content : '';
  const title = typeof input.title === 'string' ? input.title : '';

  return /mock-fail|模拟失败|发布失败/iu.test(`${input.platformVersionId} ${title} ${content}`);
};

const createTaskId = (platform: string): string => {
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `mock_${platform}_${Date.now().toString(36)}_${randomSuffix}`;
};

const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export default router;
