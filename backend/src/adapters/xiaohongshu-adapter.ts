import { BasePlatformAdapter } from './base-adapter';
import { PlatformAdapterInput, PlatformCapability, PlatformOutputContent } from './types';

const FALLBACK_TITLE = '这件事真的值得试试✨';
const MAX_TITLE_LENGTH = 20;
const MAX_TAG_COUNT = 8;

const DEFAULT_TAGS = ['小红书笔记', '种草分享', '经验分享'];
const STOP_WORDS = new Set([
  'the',
  'and',
  'with',
  'for',
  'this',
  'that',
  'from',
  'into',
  '内容',
  '一个',
  '我们',
  '可以',
  '通过',
]);

/**
 * CreatorSync original Xiaohongshu style adapter.
 *
 * Prompt/rule source note: these rules were written specifically for this PR;
 * no historical business code, old prompt template, or personal project logic is reused.
 */
export class XiaohongshuAdapter extends BasePlatformAdapter {
  public readonly platform = 'xiaohongshu';
  public readonly adapterName = 'XiaohongshuContentAdapter';

  public getCapabilities(): PlatformCapability[] {
    return [
      {
        name: 'structuredContent',
        supported: true,
        note: 'Returns the shared title/body/tags/assets shape used by platform previews.',
      },
      {
        name: 'emotionalRewrite',
        supported: true,
        note: 'Rewrites source content into short, high-emotion Xiaohongshu-style sentences.',
      },
      {
        name: 'emojiOptimization',
        supported: true,
        note: 'Adds platform-appropriate emoji accents without changing the shared output contract.',
      },
      {
        name: 'mockFallback',
        supported: true,
        note: 'Stable deterministic fallback is available without any external AI API key.',
      },
    ];
  }

  protected buildPlatformContent(input: PlatformAdapterInput): PlatformOutputContent {
    const base = this.createBaseOutput(input);
    const sourceBody = normalizeText(input.body);
    const sourceTitle = normalizeText(input.title ?? '').replace(/^#+\s*/, '');
    const title = buildXiaohongshuTitle(sourceTitle || sourceBody);
    const highlights = extractHighlights(sourceBody);
    const tags = buildTags(input.tags ?? [], `${sourceTitle} ${sourceBody}`);
    const body = buildXiaohongshuBody(sourceBody, highlights, tags);

    return {
      ...base,
      title,
      body,
      summary: buildSummary(highlights),
      tags,
      platformFields: {
        ...base.platformFields,
        content: body,
        coverTitle: title,
        noteType: 'grass_note',
        style: 'xiaohongshu_emotional_short_sentences',
        generationMode: 'mock_fallback',
        emojiStrategy: 'high_emotion_seeded_recommendation',
        promptSource: 'Original CreatorSync rules for this PR; no historical prompt reused.',
      },
    };
  }
}

const normalizeText = (value: string): string =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\-[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const trimTo = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength - 1).trimEnd();
};

const buildXiaohongshuTitle = (source: string): string => {
  const cleanSource = normalizeText(source);

  if (!cleanSource) {
    return FALLBACK_TITLE;
  }

  const compact = cleanSource
    .split(/[。！？!?；;,.，]/)
    .map((part) => part.trim())
    .find((part) => part.length >= 2) ?? cleanSource;
  const core = trimTo(compact.replace(/^(关于|如何|为什么|今天|本文)/, ''), 12);

  return trimTo(`${core}｜真的香迷糊了✨`, MAX_TITLE_LENGTH);
};

const extractHighlights = (source: string): string[] => {
  const sentences = source
    .split(/[。！？!?；;\n]/)
    .map((sentence) => normalizeText(sentence))
    .filter((sentence) => sentence.length >= 4);

  const unique = Array.from(new Set(sentences));

  if (unique.length >= 3) {
    return unique.slice(0, 4);
  }

  if (unique.length > 0) {
    return unique;
  }

  return ['把复杂内容整理成更好上手的行动清单', '适合想提升效率但不想踩坑的人'];
};

const buildXiaohongshuBody = (sourceBody: string, highlights: string[], tags: string[]): string => {
  const first = highlights[0] ?? sourceBody;
  const second = highlights[1] ?? '照着做会更省心，也更容易坚持';
  const third = highlights[2] ?? '新手也能快速理解重点';

  return [
    '姐妹们，这个思路我真的想立刻分享出来！！✨',
    '',
    `原文重点我帮你浓缩好了：${trimTo(first, 48)}。`,
    '但小红书版一定不能干巴巴，要更像真实体验👇',
    '',
    '✅ 先说结论',
    `真的很适合想把「${trimTo(first, 18)}」落地的人。`,
    '不用一下子做很重的计划，先抓住最关键的一步就够了。',
    '',
    '💡 我觉得最种草的点',
    `1. ${trimTo(second, 52)}，听起来简单，但实际超级加分！`,
    `2. ${trimTo(third, 52)}，对新手也很友好，不会有距离感。`,
    '3. 重点被拆成短句之后，行动感一下就上来了。',
    '',
    '🌱 适合这些人',
    '• 想提升内容表达，但不想写得太官方的人',
    '• 想把经验包装成可收藏笔记的人',
    '• 想让读者看完就有“我也想试试”感觉的人',
    '',
    '📌 小建议',
    '发布时可以配一张清爽封面，把标题做大一点。',
    '正文保持短句 + 分段 + emoji，阅读压力会小很多～',
    '',
    `#${tags.slice(0, 5).join(' #')}`,
  ].join('\n');
};

const buildSummary = (highlights: string[]): string =>
  `小红书风格版本：用情绪化开头、短句清单和种草表达包装「${trimTo(highlights[0] ?? '原始内容', 24)}」。`;

const buildTags = (inputTags: string[], source: string): string[] => {
  const normalizedInputTags = inputTags.map(cleanTag).filter(Boolean);
  const inferredTags = inferTags(source);
  const allTags = [...normalizedInputTags, ...inferredTags, ...DEFAULT_TAGS];

  return Array.from(new Set(allTags)).slice(0, MAX_TAG_COUNT);
};

const cleanTag = (tag: string): string => tag.replace(/^#+/, '').trim();

const inferTags = (source: string): string[] => {
  const keywordTags: string[] = [];
  const lowerSource = source.toLowerCase();

  if (/ai|人工智能|智能|自动化/.test(lowerSource)) {
    keywordTags.push('AI工具', '效率提升');
  }

  if (/内容|写作|创作|文案|发布/.test(lowerSource)) {
    keywordTags.push('内容创作', '文案优化');
  }

  if (/运营|增长|品牌|营销/.test(lowerSource)) {
    keywordTags.push('运营干货', '品牌成长');
  }

  const words = source
    .replace(/[^\p{Script=Han}a-zA-Z0-9\s]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word.toLowerCase()));

  return [...keywordTags, ...words.slice(0, 2)];
};
