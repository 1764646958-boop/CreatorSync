import { BasePlatformAdapter } from './base-adapter';
import { PlatformAdapterInput, PlatformCapability, PlatformOutputContent } from './types';

const FALLBACK_TITLE = '把这件事讲清楚：给创作者的一份长文拆解';
const MAX_TITLE_LENGTH = 64;
const MAX_DIGEST_LENGTH = 120;
const MAX_TAG_COUNT = 8;

const DEFAULT_TAGS = ['公众号长文', '图文排版', '内容创作'];
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
  '这个',
  '如果',
  '但是',
]);

interface WeChatArticleOutline {
  title: string;
  lead: string;
  sections: WeChatArticleSection[];
  ending: string;
}

interface WeChatArticleSection {
  heading: string;
  paragraphs: string[];
}

/**
 * CreatorSync original WeChat Official Accounts long-form adapter.
 *
 * Prompt/rule source note: these rules were written specifically for this PR;
 * no historical business code, old article template, or personal project layout logic is reused.
 */
export class WeChatOfficialAccountAdapter extends BasePlatformAdapter {
  public readonly platform = 'wechat_official_account';
  public readonly adapterName = 'WeChatOfficialAccountContentAdapter';

  public getCapabilities(): PlatformCapability[] {
    return [
      {
        name: 'structuredContent',
        supported: true,
        note: 'Returns the shared title/body/tags/assets shape used by platform previews.',
      },
      {
        name: 'longFormRewrite',
        supported: true,
        note: 'Rewrites source material into a WeChat Official Accounts long-form article with lead, sections, and ending CTA.',
      },
      {
        name: 'editorReadyLayout',
        supported: true,
        note: 'Uses readable spacing, numbered subheadings, pull-quote style emphasis, and image placeholders suitable for copying into the WeChat editor.',
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
    const tags = buildTags(input.tags ?? [], `${sourceTitle} ${sourceBody}`);
    const outline = buildArticleOutline(sourceTitle, sourceBody);
    const body = buildWeChatBody(outline, tags, input.assets?.length ?? 0);
    const digest = buildDigest(outline);

    return {
      ...base,
      title: outline.title,
      body,
      summary: digest,
      tags,
      platformFields: {
        ...base.platformFields,
        content: body,
        articleTitle: outline.title,
        digest,
        structure: 'lead_numbered_sections_ending_cta',
        style: 'wechat_official_account_editor_ready_longform',
        generationMode: 'mock_fallback',
        layoutHints: ['导语', '编号小标题', '短段落', '重点提示', '图片占位', '结尾引导'],
        rewriteStrategy: 'expand_source_into_readable_longform_article',
        promptSource: 'Original CreatorSync rules for this PR; no historical prompt or article template reused.',
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

const buildArticleOutline = (sourceTitle: string, sourceBody: string): WeChatArticleOutline => {
  const sentences = splitSentences(sourceBody);
  const topic = pickTopic(sourceTitle, sourceBody, sentences);
  const title = buildTitle(topic, sourceTitle);
  const core = sentences[0] ?? topic;
  const context = sentences[1] ?? '读者真正需要的不是更多零散信息，而是一条能直接理解、收藏和复用的表达路径';
  const method = sentences[2] ?? '把原始素材拆成清晰层次后，内容会更容易形成开头吸引、中段展开和结尾行动的阅读节奏';
  const value = sentences[3] ?? '这样的改写方式既保留原意，也更适合公众号图文场景里的深度阅读';

  return {
    title,
    lead: buildLead(topic, core, context),
    sections: [
      {
        heading: `先把问题说透：为什么「${trimTo(topic, 16)}」值得展开`,
        paragraphs: [
          `原文的核心并不只是「${trimTo(core, 42)}」，更重要的是它背后对应了一个很典型的内容场景：读者希望快速看懂重点，同时也希望知道这件事和自己有什么关系。`,
          `所以公众号版本不适合只做简单摘要，而要把信息重新组织成“背景—观点—方法—行动”的阅读路径。这样读者从第一屏开始就能判断：这篇文章是否值得继续读下去。`,
        ],
      },
      {
        heading: '再搭好文章骨架：让读者一段一段读下去',
        paragraphs: [
          `${trimTo(context, 78)}。放在公众号里，这句话需要被进一步拆开：先给结论，再解释原因，最后补上可以落地的建议。`,
          '相比密集堆砌信息，公众号长文更依赖段落节奏。每一段只承担一个任务：要么交代背景，要么提出判断，要么补充细节，要么推动读者进入下一节。',
        ],
      },
      {
        heading: '最后落到行动：把观点变成可复制的发布版本',
        paragraphs: [
          `${trimTo(method, 82)}。这也是本次改写的重点：保留原始信息，但让它更像一篇可以直接排版发布的图文稿。`,
          `${trimTo(value, 82)}。发布时可以在关键段落前后留白，并搭配一张封面图或过程截图，让文章从“能读”进一步变成“愿意读、方便转发”。`,
        ],
      },
    ],
    ending: buildEnding(topic),
  };
};

const pickTopic = (sourceTitle: string, sourceBody: string, sentences: string[]): string => {
  if (sourceTitle.length >= 4) {
    return trimTo(sourceTitle.replace(/^(关于|如何|为什么|本文|今天)/, ''), 36);
  }

  const firstSentence = sentences[0] ?? sourceBody;

  if (firstSentence) {
    return trimTo(firstSentence.replace(/^(关于|如何|为什么|本文|今天)/, ''), 36);
  }

  return '原始内容';
};

const buildTitle = (topic: string, sourceTitle: string): string => {
  const cleanTitle = trimTo(sourceTitle || topic, MAX_TITLE_LENGTH - 8);

  if (!cleanTitle) {
    return FALLBACK_TITLE;
  }

  if (/指南|方法|拆解|复盘|清单|观察/.test(cleanTitle)) {
    return trimTo(cleanTitle, MAX_TITLE_LENGTH);
  }

  return trimTo(`${cleanTitle}：一篇适合收藏的深度拆解`, MAX_TITLE_LENGTH);
};

const buildLead = (topic: string, core: string, context: string): string =>
  `如果只用一句话概括「${trimTo(topic, 18)}」，它讲的是：${trimTo(core, 52)}。但对公众号读者来说，更有价值的不是把信息看完，而是看完之后能带走一个清晰判断。\n\n这篇改写会沿着「为什么重要—怎么理解—如何落地」展开，把原始内容整理成更适合长文阅读和图文排版的版本。${trimTo(context, 48)}。`;

const buildEnding = (topic: string): string =>
  `写到最后，回到「${trimTo(topic, 18)}」本身：一篇好的公众号文章，不只是把观点讲完整，也要让读者在合适的地方停下来、想一想，并知道下一步可以怎么做。\n\n如果你正在准备把这类内容发布到公众号，可以直接沿用这套结构：开头给导语，中段用小标题分层，结尾留下行动引导。\n\n如果这篇文章对你有启发，欢迎收藏起来，下一次写长文前拿出来对照：你的标题是否清楚、段落是否透气、结尾是否给了读者继续行动的理由。`;

const buildWeChatBody = (outline: WeChatArticleOutline, tags: string[], assetCount: number): string => {
  const sections = outline.sections.flatMap((section, index) => [
    `${String(index + 1).padStart(2, '0')}｜${section.heading}`,
    '',
    ...section.paragraphs.flatMap((paragraph) => [paragraph, '']),
    index === 0 ? '💡 重点提示：公众号长文的第一屏要尽快交代价值，让读者知道继续阅读会获得什么。' : undefined,
    index === 1 ? '📌 排版建议：每 2～3 个自然段留一次空行，小标题前后保持呼吸感。' : undefined,
    index === 2 ? '🖼️ 配图建议：这里可以插入一张流程图、截图或关键观点卡片，增强图文节奏。' : undefined,
    '',
  ].filter((line): line is string => typeof line === 'string'));

  return [
    outline.title,
    '',
    '— 导语 —',
    '',
    outline.lead,
    '',
    '— 正文 —',
    '',
    ...sections,
    assetCount > 0 ? `已关联 ${assetCount} 个素材：建议按“小标题后补图”的方式插入，避免图片连续堆叠。` : '（图片占位）建议在这里补充封面延展图、案例截图或核心观点卡片。',
    '',
    '— 结尾引导 —',
    '',
    outline.ending,
    '',
    `关键词：${tags.slice(0, 5).join(' / ')}`,
  ].join('\n');
};

const buildDigest = (outline: WeChatArticleOutline): string =>
  trimTo(`公众号长文版本：围绕「${outline.title}」重组导语、小标题、分段和结尾引导，提升阅读节奏与图文排版感。`, MAX_DIGEST_LENGTH);

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

  if (/内容|写作|创作|文案|发布|分发|公众号/.test(lowerSource)) {
    keywordTags.push('内容创作', '长文写作');
  }

  if (/运营|增长|品牌|营销|转化|私域/.test(lowerSource)) {
    keywordTags.push('品牌运营', '私域增长');
  }

  if (/知识|学习|方法|经验|效率|复盘/.test(lowerSource)) {
    keywordTags.push('经验复盘', '方法论');
  }

  const words = source
    .replace(/[^\p{Script=Han}a-zA-Z0-9\s]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word.toLowerCase()));

  return [...keywordTags, ...words.slice(0, 2)];
};
