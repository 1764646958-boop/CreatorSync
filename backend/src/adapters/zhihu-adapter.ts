import { BasePlatformAdapter } from './base-adapter';
import { PlatformAdapterInput, PlatformCapability, PlatformOutputContent } from './types';

const FALLBACK_TITLE = '这件事应该如何理性看待？';
const MAX_TITLE_LENGTH = 48;
const MAX_TAG_COUNT = 8;

const DEFAULT_TAGS = ['知乎回答', '深度思考', '内容创作'];
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
]);

interface ZhihuOutline {
  question: string;
  thesis: string;
  analyses: string[];
  conclusion: string;
}

/**
 * CreatorSync original Zhihu style adapter.
 *
 * Prompt/rule source note: these rules were written specifically for this PR;
 * no historical business code, old prompt template, or personal project logic is reused.
 */
export class ZhihuAdapter extends BasePlatformAdapter {
  public readonly platform = 'zhihu';
  public readonly adapterName = 'ZhihuContentAdapter';

  public getCapabilities(): PlatformCapability[] {
    return [
      {
        name: 'structuredContent',
        supported: true,
        note: 'Returns the shared title/body/tags/assets shape used by platform previews.',
      },
      {
        name: 'rationalRewrite',
        supported: true,
        note: 'Reorganizes source content into explanatory, evidence-oriented Zhihu-style paragraphs.',
      },
      {
        name: 'questionAnalysisConclusion',
        supported: true,
        note: 'Supports a 问题—分析—结论 structure that frontend previews can render directly.',
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
    const outline = buildOutline(sourceTitle, sourceBody);
    const title = buildZhihuTitle(outline.question);
    const tags = buildTags(input.tags ?? [], `${sourceTitle} ${sourceBody}`);
    const body = buildZhihuBody(outline, tags);

    return {
      ...base,
      title,
      body,
      summary: buildSummary(outline),
      tags,
      platformFields: {
        ...base.platformFields,
        content: body,
        answerTitle: title,
        structure: 'question_analysis_conclusion',
        style: 'zhihu_rational_structured_explanatory',
        generationMode: 'mock_fallback',
        rewriteStrategy: 'reorganize_logic_not_word_substitution',
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

const buildOutline = (sourceTitle: string, sourceBody: string): ZhihuOutline => {
  const sentences = splitSentences(sourceBody);
  const topic = pickTopic(sourceTitle, sourceBody, sentences);
  const question = buildQuestion(topic, sourceTitle);
  const thesis = buildThesis(topic, sentences);
  const analyses = buildAnalysisPoints(topic, sentences);
  const conclusion = buildConclusion(topic, sentences);

  return {
    question,
    thesis,
    analyses,
    conclusion,
  };
};

const pickTopic = (sourceTitle: string, sourceBody: string, sentences: string[]): string => {
  if (sourceTitle.length >= 4) {
    return trimTo(sourceTitle.replace(/^(关于|如何|为什么|本文|今天)/, ''), 28);
  }

  const firstSentence = sentences[0] ?? sourceBody;

  if (firstSentence) {
    return trimTo(firstSentence.replace(/^(关于|如何|为什么|本文|今天)/, ''), 28);
  }

  return '原始内容';
};

const buildQuestion = (topic: string, sourceTitle: string): string => {
  const cleanTitle = trimTo(sourceTitle || topic, MAX_TITLE_LENGTH - 1);

  if (!cleanTitle) {
    return FALLBACK_TITLE;
  }

  if (/[？?]$/.test(cleanTitle) || /^(如何|为什么|是否|怎样|怎么)/.test(cleanTitle)) {
    return cleanTitle.replace(/[?？]?$/, '？');
  }

  return trimTo(`${cleanTitle}，真正值得讨论的是什么？`, MAX_TITLE_LENGTH);
};

const buildZhihuTitle = (question: string): string =>
  trimTo(question || FALLBACK_TITLE, MAX_TITLE_LENGTH);

const buildThesis = (topic: string, sentences: string[]): string => {
  const first = sentences[0] ?? topic;
  const second = sentences[1];
  const context = second ? `同时也要看到：${trimTo(second, 42)}。` : '更重要的是，它背后反映的是目标、路径与执行成本之间的匹配问题。';

  return `我的判断是，讨论「${trimTo(topic, 20)}」不应该只停留在表面结论，而要先还原它解决了什么问题。${context}`;
};

const buildAnalysisPoints = (topic: string, sentences: string[]): string[] => {
  const first = sentences[0] ?? topic;
  const second = sentences[1] ?? '它能够把分散的信息放回统一流程中理解';
  const third = sentences[2] ?? '真正的价值不在于形式变化，而在于降低理解和执行门槛';

  return [
    `先看需求层面。原文提到的核心是「${trimTo(first, 46)}」，这说明读者关心的不是概念本身，而是它能否解决真实场景中的效率或表达问题。`,
    `再看方法层面。${trimTo(second, 58)}。知乎语境下更适合把这类内容拆成背景、约束和可执行步骤，而不是直接给出情绪化判断。`,
    `最后看边界条件。${trimTo(third, 58)}。如果缺少具体场景、对象和判断标准，再好的观点也容易变成泛泛而谈。`,
  ];
};

const buildConclusion = (topic: string, sentences: string[]): string => {
  const anchor = sentences[0] ?? topic;

  return `所以，对「${trimTo(topic, 20)}」更稳妥的理解是：先明确问题，再拆解原因，最后给出可执行的判断。这样既保留了原文「${trimTo(anchor, 24)}」的重点，也让读者知道为什么要这样做、适合谁做，以及下一步该怎么做。`;
};

const buildZhihuBody = (outline: ZhihuOutline, tags: string[]): string =>
  [
    `## 问题：${outline.question}`,
    '',
    '先说结论：这件事的重点不在于把原文换一种说法，而在于把原本分散的信息整理成“背景—原因—行动”的逻辑链。',
    '',
    '## 分析',
    '',
    outline.thesis,
    '',
    ...outline.analyses.flatMap((analysis, index) => [`${index + 1}. ${analysis}`, '']),
    '## 结论',
    '',
    outline.conclusion,
    '',
    '如果要发布成知乎回答，建议保留这种总分总节奏：开头给判断，中段解释依据，结尾落到可执行建议。读者会更容易判断这篇内容是否与自己的问题相关。',
    '',
    `相关话题：${tags.slice(0, 5).map((tag) => `#${tag}`).join(' ')}`,
  ].join('\n');

const buildSummary = (outline: ZhihuOutline): string =>
  `知乎风格版本：围绕「${trimTo(outline.question.replace(/[？?]$/, ''), 28)}」重组为问题、分析与结论，强调理性解释和可执行判断。`;

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

  if (/内容|写作|创作|文案|发布|分发/.test(lowerSource)) {
    keywordTags.push('内容创作', '写作方法');
  }

  if (/运营|增长|品牌|营销|转化/.test(lowerSource)) {
    keywordTags.push('运营方法', '增长思维');
  }

  if (/知识|学习|方法|经验|效率/.test(lowerSource)) {
    keywordTags.push('知识管理', '经验复盘');
  }

  const words = source
    .replace(/[^\p{Script=Han}a-zA-Z0-9\s]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word.toLowerCase()));

  return [...keywordTags, ...words.slice(0, 2)];
};
