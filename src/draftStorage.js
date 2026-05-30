export const DRAFT_STORAGE_KEY = 'creatorsync:draft';

export const DEFAULT_DRAFT = Object.freeze({
  version: 1,
  title: '示例：新品上线预告',
  body: '今天准备发布一条新品上线内容。先在 CreatorSync 中整理标题、正文和标签，刷新页面后仍会恢复这份本地草稿。',
  tags: Object.freeze(['新品', '内容发布', 'CreatorSync']),
  updatedAt: null,
});

export function createDraft(input = {}) {
  return {
    version: 1,
    title: typeof input.title === 'string' ? input.title : DEFAULT_DRAFT.title,
    body: typeof input.body === 'string' ? input.body : DEFAULT_DRAFT.body,
    tags: normalizeTags(input.tags ?? DEFAULT_DRAFT.tags),
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date().toISOString(),
  };
}

export function normalizeTags(value) {
  const rawTags = Array.isArray(value) ? value : String(value ?? '').split(/[,，\n]/u);

  return Array.from(
    new Set(
      rawTags
        .map((tag) => String(tag).trim())
        .filter(Boolean),
    ),
  );
}

export function loadDraft(storage = globalThis.localStorage) {
  if (!storage) {
    return createDraft(DEFAULT_DRAFT);
  }

  try {
    const rawDraft = storage.getItem(DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      const defaultDraft = createDraft(DEFAULT_DRAFT);
      saveDraft(defaultDraft, storage);
      return defaultDraft;
    }

    return createDraft(JSON.parse(rawDraft));
  } catch {
    return createDraft(DEFAULT_DRAFT);
  }
}

export function saveDraft(draft, storage = globalThis.localStorage) {
  const normalizedDraft = createDraft({
    ...draft,
    updatedAt: new Date().toISOString(),
  });

  if (storage) {
    try {
      storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(normalizedDraft));
    } catch {
      // Storage can be unavailable or full; keep the editor usable with in-memory draft state.
    }
  }

  return normalizedDraft;
}

export function getEmptyFieldMessages(draft) {
  const messages = [];

  if (!draft.title.trim()) {
    messages.push('请输入标题，便于后续识别内容主题。');
  }

  if (!draft.body.trim()) {
    messages.push('请输入正文，作为后续多平台发布的内容来源。');
  }

  if (draft.tags.length === 0) {
    messages.push('请输入至少一个标签，多个标签可用逗号分隔。');
  }

  return messages;
}
