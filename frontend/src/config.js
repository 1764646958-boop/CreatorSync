export const PLATFORM_DEFINITIONS = [
  {
    id: 'wechat',
    adapterId: 'wechat_official_account',
    name: '公众号',
    badge: '深度图文',
    description: '适合系统化观点、品牌内容与私域沉淀。',
    accent: '#1aad19',
    defaults: {
      tone: '专业可信',
      length: '长文',
      titleStyle: '观点型标题',
      tagStyle: '品牌关键词',
    },
  },
  {
    id: 'zhihu',
    adapterId: 'zhihu',
    name: '知乎',
    badge: '问答社区',
    description: '适合经验拆解、理性分析与可信背书。',
    accent: '#1772f6',
    defaults: {
      tone: '理性分析',
      length: '中长文',
      titleStyle: '问题型标题',
      tagStyle: '领域话题',
    },
  },
  {
    id: 'xiaohongshu',
    adapterId: 'xiaohongshu',
    name: '小红书',
    badge: '种草笔记',
    description: '适合生活化表达、清单攻略与标签分发。',
    accent: '#ff2442',
    defaults: {
      tone: '轻松种草',
      length: '短文',
      titleStyle: '情绪价值标题',
      tagStyle: '热词标签',
    },
  },
  {
    id: 'bilibili',
    adapterId: 'bilibili',
    name: 'B站',
    badge: '视频社区',
    description: '适合脚本结构、互动表达与年轻化语境。',
    accent: '#00aeec',
    defaults: {
      tone: '活泼互动',
      length: '视频脚本',
      titleStyle: '悬念型标题',
      tagStyle: '分区标签',
    },
  },
];

export const FIELD_OPTIONS = {
  tone: ['专业可信', '理性分析', '轻松种草', '活泼互动', '温暖共情'],
  length: ['短文', '中长文', '长文', '视频脚本'],
  titleStyle: ['观点型标题', '问题型标题', '情绪价值标题', '悬念型标题', '教程型标题'],
  tagStyle: ['品牌关键词', '领域话题', '热词标签', '分区标签', '无标签'],
};

export const FIELD_LABELS = {
  tone: '语气',
  length: '长度',
  titleStyle: '标题风格',
  tagStyle: '标签风格',
};

const getDefaultPlatformConfig = () =>
  PLATFORM_DEFINITIONS.reduce((configs, platform) => {
    configs[platform.id] = { ...platform.defaults };
    return configs;
  }, {});

export const normalizeTags = (value) => {
  const rawTags = Array.isArray(value) ? value : String(value ?? '').split(/[,，#\n]/u);

  return Array.from(new Set(rawTags.map((tag) => String(tag).trim()).filter(Boolean)));
};

export const createDefaultTargetConfig = () => ({
  version: 1,
  sourceTitle: '',
  sourceContent: '',
  sourceTags: [],
  selectedPlatforms: [],
  platformConfigs: getDefaultPlatformConfig(),
  updatedAt: new Date().toISOString(),
});

export const normalizeTargetConfig = (candidate) => {
  const defaults = createDefaultTargetConfig();

  if (!candidate || typeof candidate !== 'object') {
    return defaults;
  }

  const validPlatformIds = new Set(PLATFORM_DEFINITIONS.map((platform) => platform.id));
  const selectedPlatforms = Array.isArray(candidate.selectedPlatforms)
    ? candidate.selectedPlatforms.filter((platformId) => validPlatformIds.has(platformId))
    : [];

  return {
    ...defaults,
    ...candidate,
    sourceTitle: typeof candidate.sourceTitle === 'string' ? candidate.sourceTitle : '',
    sourceContent: typeof candidate.sourceContent === 'string' ? candidate.sourceContent : '',
    sourceTags: normalizeTags(candidate.sourceTags ?? []),
    selectedPlatforms,
    platformConfigs: PLATFORM_DEFINITIONS.reduce((configs, platform) => {
      configs[platform.id] = {
        ...platform.defaults,
        ...(candidate.platformConfigs?.[platform.id] ?? {}),
      };
      return configs;
    }, {}),
    updatedAt: candidate.updatedAt ?? defaults.updatedAt,
  };
};

export const togglePlatform = (targetConfig, platformId) => {
  const selectedPlatforms = targetConfig.selectedPlatforms.includes(platformId)
    ? targetConfig.selectedPlatforms.filter((selectedId) => selectedId !== platformId)
    : [...targetConfig.selectedPlatforms, platformId];

  return {
    ...targetConfig,
    selectedPlatforms,
    updatedAt: new Date().toISOString(),
  };
};

export const updatePlatformConfig = (targetConfig, platformId, field, value) => ({
  ...targetConfig,
  platformConfigs: {
    ...targetConfig.platformConfigs,
    [platformId]: {
      ...targetConfig.platformConfigs[platformId],
      [field]: value,
    },
  },
  updatedAt: new Date().toISOString(),
});

export const updateSourceDraft = (targetConfig, field, value) => ({
  ...targetConfig,
  [field]: field === 'sourceTags' ? normalizeTags(value) : value,
  updatedAt: new Date().toISOString(),
});

export const updateSourceContent = (targetConfig, sourceContent) =>
  updateSourceDraft(targetConfig, 'sourceContent', sourceContent);
