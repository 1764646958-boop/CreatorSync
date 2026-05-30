import { BasePlatformAdapter } from './base-adapter';
import { PlatformAdapterInput, PlatformCapability, PlatformOutputContent } from './types';

const FALLBACK_TITLE = '这期内容有点东西';
const MAX_TITLE_LENGTH = 32;
const MAX_TAG_COUNT = 10;

const DEFAULT_TAGS = ['B站创作', '视频简介', '动态文案', '内容创作'];
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
  '平台',
]);

interface BilibiliDraftParts {
  hook: string;
  highlights: string[];
  discussionQuestion: string;
}

/**
 * CreatorSync original Bilibili style adapter.
 *
 * Source note: the Bilibili community tone rules, interaction structure, and
 * mock fallback copy were written for this PR. No historical business code,
 * personal prompt, or old text-style template was reused.
 */
export class BilibiliAdapter extends BasePlatformAdapter {
  public readonly platform = 'bilibili';
  public readonly adapterName = 'BilibiliContentAdapter';

  public getCapabilities(): PlatformCapability[] {
    return [
      {
        name: 'structuredContent',
        supported: true,
        note: 'Returns the shared title/body/tags/assets shape used by platform previews.',
      },
      {
        name: 'spokenCommunityRewrite',
        supported: true,
        note: 'Rewrites source material into a more conversational Bilibili video/community tone.',
      },
      {
        name: 'interactionPrompt',
        supported: true,
        note: 'Adds lightweight comments, bullet-screen, like/coin/favorite, and discussion prompts.',
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
    const parts = buildBilibiliDraftParts(sourceTitle, sourceBody);
    const title = buildBilibiliTitle(sourceTitle || parts.hook || sourceBody);
    const tags = buildTags(input.tags ?? [], `${sourceTitle} ${sourceBody}`);
    const body = buildBilibiliBody(title, parts, tags);

    return {
      ...base,
      title,
      body,
      summary: buildSummary(parts),
      tags,
      platformFields: {
        ...base.platformFields,
        content: body,
        videoDescription: buildVideoDescription(parts, tags),
        dynamicText: buildDynamicText(title, parts, tags),
        communityCopy: buildCommunityCopy(parts),
        introHook: parts.hook,
        interactionGuide: parts.discussionQuestion,
        publishScenes: ['video_description', 'dynamic_post', 'community_copy'],
        style: 'bilibili_spoken_interactive_community',
        generationMode: 'mock_fallback',
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

const splitSentences = (source: string): string[] => {
  const sentences = source
    .split(/[。！？!?；;\n]/)
    .map((sentence) => normalizeText(sentence))
    .filter((sentence) => sentence.length >= 4);

  return Array.from(new Set(sentences));
};

const buildBilibiliDraftParts = (sourceTitle: string, sourceBody: string): BilibiliDraftParts => {
  const sentences = splitSentences(sourceBody);
  const topic = pickTopic(sourceTitle, sourceBody, sentences);
  const highlights = buildHighlights(topic, sentences);

  return {
    hook: buildHook(topic, highlights),
    highlights,
    discussionQuestion: buildDiscussionQuestion(topic),
  };
};

const pickTopic = (sourceTitle: string, sourceBody: string, sentences: string[]): string => {
  if (sourceTitle.length >= 3) {
    return trimTo(sourceTitle.replace(/^(关于|如何|为什么|本文|今天|我们来聊聊)/, ''), 24);
  }

  const firstSentence = sentences[0] ?? sourceBody;

  if (firstSentence) {
    return trimTo(firstSentence.replace(/^(关于|如何|为什么|本文|今天|我们来聊聊)/, ''), 24);
  }

  return FALLBACK_TITLE;
};

const buildHighlights = (topic: string, sentences: string[]): string[] => {
  const fallbackHighlights = [
    `把「${trimTo(topic, 18)}」讲得更像朋友聊天，而不是说明书`,
    '先抛结论，再拆重点，观众不用暂停也能跟上',
    '结尾留一个讨论点，方便评论区继续聊起来',
  ];

  if (sentences.length === 0) {
    return fallbackHighlights;
  }

  const normalized = sentences.slice(0, 4).map((sentence) => trimTo(sentence, 54));

  return [...normalized, ...fallbackHighlights].slice(0, 4);
};

const buildHook = (topic: string, highlights: string[]): string => {
  const first = highlights[0] ?? topic;

  return `兄弟姐妹们，今天这期咱们把「${trimTo(topic, 18)}」用大白话捋一遍，重点是：${trimTo(first, 34)}。`;
};

const buildDiscussionQuestion = (topic: string): string =>
  `你们觉得「${trimTo(topic, 18)}」最难落地的是哪一步？弹幕/评论区聊聊，我会挑几个一起复盘。`;

const buildBilibiliTitle = (source: string): string => {
  const cleanSource = normalizeText(source);

  if (!cleanSource) {
    return FALLBACK_TITLE;
  }

  const compact = cleanSource
    .split(/[。！？!?；;,.，]/)
    .map((part) => part.trim())
    .find((part) => part.length >= 2) ?? cleanSource;
  const core = trimTo(compact.replace(/^(关于|如何|为什么|今天|本文)/, ''), 18);

  return trimTo(`${core}，这波讲明白了`, MAX_TITLE_LENGTH);
};

const buildBilibiliBody = (title: string, parts: BilibiliDraftParts, tags: string[]): string => {
  const [first, second, third, fourth] = parts.highlights;

  return [
    `【${title}】`,
    '',
    parts.hook,
    '',
    '先说人话版：',
    `这不是把原文硬改成“官方简介”，而是改成 B站观众更容易点开、看懂、愿意互动的版本。${trimTo(first, 48)}。`,
    '',
    '本期看点👇',
    `1. ${trimTo(second ?? first, 54)}，咱们不绕弯子，直接讲重点。`,
    `2. ${trimTo(third ?? '把复杂内容拆成几句好理解的话', 54)}，适合放在视频简介或动态里。`,
    `3. ${trimTo(fourth ?? '最后加一个评论区话题', 54)}，让观众看完能接着聊。`,
    '',
    '适合怎么发？',
    '• 视频简介：放开头两段，快速告诉观众这期值不值得看。',
    '• 动态发布：保留“先说人话版”和互动问题，语气更像 UP 主在和粉丝聊天。',
    '• 社区文案：用短句 + 轻量梗感，不端着，也不过度营销。',
    '',
    '看到这里，如果你觉得有帮助，记得点个赞/投个币/收藏一下，后面我继续把这类内容拆给你看。',
    parts.discussionQuestion,
    '',
    tags.slice(0, 6).map((tag) => `#${tag}#`).join(' '),
  ].join('\n');
};

const buildVideoDescription = (parts: BilibiliDraftParts, tags: string[]): string =>
  [
    parts.hook,
    '',
    `本期重点：${parts.highlights.slice(0, 3).map((highlight) => trimTo(highlight, 32)).join(' / ')}`,
    parts.discussionQuestion,
    tags.slice(0, 5).map((tag) => `#${tag}#`).join(' '),
  ].join('\n');

const buildDynamicText = (title: string, parts: BilibiliDraftParts, tags: string[]): string =>
  [
    `新稿来了：${title}`,
    parts.hook,
    '如果只看一个重点，我建议先看“先说人话版”这一段。',
    parts.discussionQuestion,
    tags.slice(0, 4).map((tag) => `#${tag}#`).join(' '),
  ].join('\n');

const buildCommunityCopy = (parts: BilibiliDraftParts): string =>
  [
    '这版会更像 UP 主口播：先把结论讲清楚，再用短句拆重点，最后把话题丢给评论区。',
    `互动引导：${parts.discussionQuestion}`,
  ].join('\n');

const buildSummary = (parts: BilibiliDraftParts): string =>
  `B站风格版本：用口语化开场、视频简介结构和互动引导包装「${trimTo(parts.highlights[0] ?? '原始内容', 24)}」。`;

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

  if (/b站|哔哩哔哩|视频|up主|弹幕|投币|收藏|简介|动态/.test(lowerSource)) {
    keywordTags.push('B站运营', 'UP主');
  }

  if (/ai|人工智能|智能|自动化/.test(lowerSource)) {
    keywordTags.push('AI工具', '效率提升');
  }

  if (/内容|写作|创作|文案|发布|分发/.test(lowerSource)) {
    keywordTags.push('内容创作', '文案改写');
  }

  if (/运营|增长|品牌|营销|转化|社区/.test(lowerSource)) {
    keywordTags.push('社区运营', '增长思路');
  }

  const words = source
    .replace(/[^\p{Script=Han}a-zA-Z0-9\s]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word.toLowerCase()));

  return [...keywordTags, ...words.slice(0, 2)];
};
