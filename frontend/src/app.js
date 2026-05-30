import {
  FIELD_LABELS,
  FIELD_OPTIONS,
  PLATFORM_DEFINITIONS,
  normalizeTags,
  togglePlatform,
  updatePlatformConfig,
  updateSourceDraft,
} from './config.js';
import { loadTargetConfig, resetTargetConfig, saveTargetConfig } from './storage.js';

let targetConfig = loadTargetConfig();
let activePreviewPlatform = targetConfig.selectedPlatforms[0] ?? null;
let comparisonLayout = 'side-by-side';
let adaptState = {
  status: 'idle',
  message: '选择平台并生成结果后，可在这里对比原文与平台改写版本。',
  results: {},
  errors: {},
  requestedAt: null,
};

const app = document.querySelector('#app');
const apiBaseUrl = window.__CREATORSYNC_API_BASE_URL__ ?? 'http://localhost:4000';
const adaptApiBaseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/adapt`;
const supportedAdapterIds = new Set(['xiaohongshu', 'zhihu']);

const platformById = new Map(PLATFORM_DEFINITIONS.map((platform) => [platform.id, platform]));

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const createOptionList = (fieldName, selectedValue) =>
  FIELD_OPTIONS[fieldName]
    .map(
      (option) =>
        `<option value="${option}" ${option === selectedValue ? 'selected' : ''}>${option}</option>`,
    )
    .join('');

const getSourcePreview = () => ({
  title: targetConfig.sourceTitle.trim() || '未填写标题',
  content: targetConfig.sourceContent.trim() || '未填写正文内容。',
  tags: targetConfig.sourceTags,
});

const getActivePlatform = () => {
  if (activePreviewPlatform && targetConfig.selectedPlatforms.includes(activePreviewPlatform)) {
    return activePreviewPlatform;
  }

  activePreviewPlatform = targetConfig.selectedPlatforms[0] ?? null;
  return activePreviewPlatform;
};

const renderHero = () => `
  <header class="hero">
    <div>
      <p class="eyebrow">CreatorSync Content Preview</p>
      <h1>预览并对比平台改写结果</h1>
      <p class="hero__copy">输入原文、选择发布平台并调用后端 /api/adapt 生成结构化结果。你可以在不刷新页面的情况下切换平台，快速判断哪一版更适合发布。</p>
    </div>
    <div class="hero__metric" aria-label="已生成平台结果数量">
      <span>${Object.keys(adaptState.results).length}</span>
      <small>已生成结果</small>
    </div>
  </header>
`;

const renderContentInput = () => `
  <section class="panel content-panel" aria-labelledby="content-title">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Step 1</p>
        <h2 id="content-title">原文输入</h2>
      </div>
      <span class="status-pill">${targetConfig.sourceContent.length} 字</span>
    </div>
    <label class="field input-field" for="source-title">
      <span>标题</span>
      <input id="source-title" value="${escapeHtml(targetConfig.sourceTitle)}" placeholder="请输入原始标题" data-source-field="sourceTitle" />
    </label>
    <label class="field input-field" for="source-content">
      <span>正文</span>
      <textarea id="source-content" placeholder="粘贴或输入原始内容，用于生成平台改写结果。" data-source-field="sourceContent">${escapeHtml(targetConfig.sourceContent)}</textarea>
    </label>
    <label class="field input-field" for="source-tags">
      <span>标签</span>
      <input id="source-tags" value="${escapeHtml(targetConfig.sourceTags.join(', '))}" placeholder="例如：新品, 小红书, 视频号" data-source-field="sourceTags" />
    </label>
    <p class="helper-text">预览区会以 title、content、tags 结构展示原文与平台版本。</p>
  </section>
`;

const renderPlatformSelector = () => `
  <section class="panel" aria-labelledby="platform-title">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Step 2</p>
        <h2 id="platform-title">选择目标平台</h2>
      </div>
      <button class="ghost-button" id="reset-config" type="button">重置配置</button>
    </div>
    <div class="platform-grid">
      ${PLATFORM_DEFINITIONS.map((platform) => {
        const checked = targetConfig.selectedPlatforms.includes(platform.id);
        const supported = supportedAdapterIds.has(platform.adapterId);
        return `
          <label class="platform-card ${checked ? 'is-selected' : ''}" style="--accent: ${platform.accent}">
            <input type="checkbox" data-platform-toggle="${platform.id}" ${checked ? 'checked' : ''} />
            <span class="platform-card__topline">
              <strong>${platform.name}</strong>
              <em>${platform.badge}</em>
            </span>
            <span class="platform-card__description">${platform.description}</span>
            <span class="adapter-note ${supported ? 'is-ready' : ''}">${supported ? '已接入 /api/adapt' : '等待后端适配器'}</span>
          </label>
        `;
      }).join('')}
    </div>
  </section>
`;

const renderTargetConfigPanel = () => `
  <section class="panel" aria-labelledby="config-title">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Step 3</p>
        <h2 id="config-title">目标参数配置</h2>
      </div>
      <span class="status-pill">自动本地保存</span>
    </div>
    ${targetConfig.selectedPlatforms.length === 0
      ? '<div class="empty-state">请先勾选至少一个平台，随后可配置对应目标参数。</div>'
      : `<div class="config-stack">
          ${targetConfig.selectedPlatforms.map((platformId) => {
            const platform = platformById.get(platformId);
            const config = targetConfig.platformConfigs[platformId];
            return `
              <article class="config-card" style="--accent: ${platform.accent}">
                <div class="config-card__header">
                  <span>${platform.name}</span>
                  <small>${platform.badge}</small>
                </div>
                <div class="field-grid">
                  ${Object.entries(FIELD_LABELS).map(([fieldName, label]) => `
                    <label class="field">
                      <span>${label}</span>
                      <select data-platform-config="${platformId}" data-field="${fieldName}">
                        ${createOptionList(fieldName, config[fieldName])}
                      </select>
                    </label>
                  `).join('')}
                </div>
              </article>
            `;
          }).join('')}
        </div>`}
  </section>
`;

const renderPlatformTabs = () => {
  if (targetConfig.selectedPlatforms.length === 0) {
    return '<div class="empty-state">选择平台后，可在这里切换查看不同平台结果。</div>';
  }

  return `
    <div class="preview-tabs" role="tablist" aria-label="平台结果切换">
      ${targetConfig.selectedPlatforms.map((platformId) => {
        const platform = platformById.get(platformId);
        const isActive = getActivePlatform() === platformId;
        const hasResult = Boolean(adaptState.results[platformId]);
        const hasError = Boolean(adaptState.errors[platformId]);
        return `
          <button class="preview-tab ${isActive ? 'is-active' : ''}" style="--accent: ${platform.accent}" type="button" role="tab" aria-selected="${isActive}" data-preview-platform="${platformId}">
            ${platform.name}
            <span>${hasResult ? '已生成' : hasError ? '需处理' : '待生成'}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
};

const renderTags = (tags) =>
  tags.length === 0
    ? '<span class="empty-tag">无标签</span>'
    : tags.map((tag) => `<span class="tag-chip">#${escapeHtml(tag)}</span>`).join('');

const normalizeResultContent = (result) => {
  const content = result?.content ?? {};
  return {
    title: content.title || '未返回标题',
    content: content.body || content.content || '暂无平台正文。',
    tags: Array.isArray(content.tags) ? content.tags : [],
    summary: content.summary,
    warnings: Array.isArray(result?.warnings) ? result.warnings : [],
    status: result?.status ?? 'idle',
  };
};

const renderPreviewCard = (label, preview, variant = '') => `
  <article class="preview-card ${variant}">
    <div class="preview-card__header">
      <p class="eyebrow">${label}</p>
      <span>${preview.content.length} 字</span>
    </div>
    <div class="preview-field">
      <strong>title</strong>
      <h3>${escapeHtml(preview.title)}</h3>
    </div>
    <div class="preview-field">
      <strong>content</strong>
      <p>${escapeHtml(preview.content).replaceAll('\n', '<br />')}</p>
    </div>
    <div class="preview-field">
      <strong>tags</strong>
      <div class="tag-list">${renderTags(preview.tags)}</div>
    </div>
    ${preview.summary ? `<div class="preview-field"><strong>summary</strong><p>${escapeHtml(preview.summary)}</p></div>` : ''}
  </article>
`;

const renderComparisonInsight = (sourcePreview, platformPreview, platform) => {
  const titleDelta = platformPreview.title.length - sourcePreview.title.length;
  const contentDelta = platformPreview.content.length - sourcePreview.content.length;
  const tagDelta = platformPreview.tags.length - sourcePreview.tags.length;

  return `
    <div class="insight-grid">
      <span><strong>${titleDelta >= 0 ? '+' : ''}${titleDelta}</strong> 标题字数差</span>
      <span><strong>${contentDelta >= 0 ? '+' : ''}${contentDelta}</strong> 正文字数差</span>
      <span><strong>${tagDelta >= 0 ? '+' : ''}${tagDelta}</strong> 标签数量差</span>
      <span><strong>${platform.badge}</strong> 发布语境</span>
    </div>
  `;
};

const renderComparisonPanel = () => {
  const activePlatformId = getActivePlatform();
  const sourcePreview = getSourcePreview();

  if (!activePlatformId) {
    return `
      <section class="panel comparison-panel" aria-labelledby="comparison-title">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Step 4</p>
            <h2 id="comparison-title">内容预览与版本对比</h2>
          </div>
        </div>
        <div class="empty-state">请选择平台并点击生成结果，Demo 将展示原文与平台改写版本。</div>
      </section>
    `;
  }

  const platform = platformById.get(activePlatformId);
  const result = adaptState.results[activePlatformId];
  const error = adaptState.errors[activePlatformId];
  const platformPreview = result ? normalizeResultContent(result) : null;

  return `
    <section class="panel comparison-panel" aria-labelledby="comparison-title">
      <div class="panel__header comparison-header">
        <div>
          <p class="eyebrow">Step 4</p>
          <h2 id="comparison-title">内容预览与版本对比</h2>
        </div>
        <div class="action-row">
          <button class="ghost-button ${comparisonLayout === 'side-by-side' ? 'is-active' : ''}" type="button" data-layout="side-by-side">并排对比</button>
          <button class="ghost-button ${comparisonLayout === 'stacked' ? 'is-active' : ''}" type="button" data-layout="stacked">上下对比</button>
          <button class="primary-button" type="button" id="generate-preview" ${targetConfig.selectedPlatforms.length === 0 ? 'disabled' : ''}>${adaptState.status === 'loading' ? '生成中...' : '生成结果'}</button>
        </div>
      </div>
      ${renderPlatformTabs()}
      <p class="preview-status ${adaptState.status}">${escapeHtml(adaptState.message)}</p>
      ${error ? `<div class="error-state">${escapeHtml(error)}</div>` : ''}
      <div class="comparison-grid ${comparisonLayout === 'stacked' ? 'is-stacked' : ''}">
        ${renderPreviewCard('原文 Source', sourcePreview)}
        ${platformPreview
          ? renderPreviewCard(`${platform.name} Adapted`, platformPreview, 'is-adapted')
          : `<article class="preview-card is-empty"><p class="eyebrow">${platform.name} Adapted</p><div class="empty-state">当前平台尚未生成结果。点击“生成结果”后将通过 /api/adapt 获取 title、content、tags。</div></article>`}
      </div>
      ${platformPreview ? renderComparisonInsight(sourcePreview, platformPreview, platform) : ''}
      ${platformPreview?.warnings.length ? `<div class="warning-list"><strong>发布前提醒</strong>${platformPreview.warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join('')}</div>` : ''}
    </section>
  `;
};

const renderSummary = () => {
  const selectedPlatforms = targetConfig.selectedPlatforms.map((platformId) => platformById.get(platformId));
  const previewPayload = {
    api: adaptApiBaseUrl,
    source: getSourcePreview(),
    selectedPlatforms: targetConfig.selectedPlatforms,
    platformConfigs: Object.fromEntries(
      targetConfig.selectedPlatforms.map((platformId) => [
        platformId,
        targetConfig.platformConfigs[platformId],
      ]),
    ),
  };

  return `
    <aside class="summary" aria-labelledby="summary-title">
      <div class="panel__header">
        <div>
          <p class="eyebrow">Review Summary</p>
          <h2 id="summary-title">当前选择结果</h2>
        </div>
      </div>
      <div class="selected-list">
        ${selectedPlatforms.length === 0
          ? '<span class="empty-chip">尚未选择平台</span>'
          : selectedPlatforms.map((platform) => `<span class="platform-chip" style="--accent: ${platform.accent}">${platform.name}</span>`).join('')}
      </div>
      <pre><code>${escapeHtml(JSON.stringify(previewPayload, null, 2))}</code></pre>
    </aside>
  `;
};

const syncDraftField = (event) => {
  const field = event.target.dataset.sourceField;
  const value = field === 'sourceTags' ? normalizeTags(event.target.value) : event.target.value;
  targetConfig = updateSourceDraft(targetConfig, field, value);
  saveTargetConfig(targetConfig);

  const previousFocus = event.target.id;
  render();
  const focusedElement = document.querySelector(`#${previousFocus}`);
  focusedElement?.focus();

  if (field === 'sourceContent' || field === 'sourceTitle') {
    focusedElement?.setSelectionRange?.(focusedElement.value.length, focusedElement.value.length);
  }
};

const buildAdaptPayload = (platformId) => ({
  draft: {
    title: targetConfig.sourceTitle,
    body: targetConfig.sourceContent,
    tags: targetConfig.sourceTags,
    format: 'markdown',
    metadata: {
      targetPlatform: platformId,
      platformConfig: targetConfig.platformConfigs[platformId],
    },
  },
});

const adaptPlatform = async (platformId) => {
  const platform = platformById.get(platformId);
  const response = await fetch(adaptApiBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform: platform.adapterId,
      ...buildAdaptPayload(platformId),
    }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `请求失败：${response.status}`);
  }

  return payload.data ?? payload;
};

const generateAdaptResults = async () => {
  if (targetConfig.selectedPlatforms.length === 0) {
    adaptState = { ...adaptState, status: 'error', message: '请先选择至少一个平台。' };
    render();
    return;
  }

  if (!targetConfig.sourceContent.trim()) {
    adaptState = { ...adaptState, status: 'error', message: '请先填写正文内容，再生成平台结果。' };
    render();
    return;
  }

  adaptState = {
    ...adaptState,
    status: 'loading',
    message: '正在通过后端 /api/adapt 获取平台改写结果...',
    errors: {},
    requestedAt: new Date().toISOString(),
  };
  render();

  const unsupportedPlatforms = targetConfig.selectedPlatforms.filter(
    (platformId) => !supportedAdapterIds.has(platformById.get(platformId).adapterId),
  );
  const requestPlatforms = targetConfig.selectedPlatforms.filter(
    (platformId) => supportedAdapterIds.has(platformById.get(platformId).adapterId),
  );
  const settledResults = await Promise.allSettled(
    requestPlatforms.map(async (platformId) => [platformId, await adaptPlatform(platformId)]),
  );

  const nextResults = { ...adaptState.results };
  const nextErrors = {};

  settledResults.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      const [platformId, result] = settledResult.value;
      nextResults[platformId] = result;
      return;
    }

    const platformId = requestPlatforms[settledResults.indexOf(settledResult)];
    nextErrors[platformId] = settledResult.reason?.message ?? '平台结果生成失败。';
    delete nextResults[platformId];
  });

  unsupportedPlatforms.forEach((platformId) => {
    nextErrors[platformId] = '当前后端尚未注册该平台适配器，本 PR 仅展示前端预览占位与错误提示。';
    delete nextResults[platformId];
  });

  const successCount = Object.keys(nextResults).filter((platformId) =>
    targetConfig.selectedPlatforms.includes(platformId),
  ).length;
  const errorCount = Object.keys(nextErrors).length;

  adaptState = {
    ...adaptState,
    status: errorCount > 0 ? 'error' : 'success',
    message: `已生成 ${successCount} 个平台结果${errorCount ? `，${errorCount} 个平台需要后端适配器或重试` : ''}。`,
    results: nextResults,
    errors: nextErrors,
  };
  render();
};

const bindEvents = () => {
  document.querySelectorAll('[data-source-field]').forEach((input) => {
    input.addEventListener('input', syncDraftField);
  });

  document.querySelectorAll('[data-platform-toggle]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      targetConfig = togglePlatform(targetConfig, event.target.dataset.platformToggle);
      activePreviewPlatform = getActivePlatform();
      saveTargetConfig(targetConfig);
      render();
    });
  });

  document.querySelectorAll('[data-platform-config]').forEach((select) => {
    select.addEventListener('change', (event) => {
      targetConfig = updatePlatformConfig(
        targetConfig,
        event.target.dataset.platformConfig,
        event.target.dataset.field,
        event.target.value,
      );
      saveTargetConfig(targetConfig);
      render();
    });
  });

  document.querySelectorAll('[data-preview-platform]').forEach((button) => {
    button.addEventListener('click', (event) => {
      activePreviewPlatform = event.currentTarget.dataset.previewPlatform;
      render();
    });
  });

  document.querySelectorAll('[data-layout]').forEach((button) => {
    button.addEventListener('click', (event) => {
      comparisonLayout = event.currentTarget.dataset.layout;
      render();
    });
  });

  document.querySelector('#generate-preview')?.addEventListener('click', generateAdaptResults);

  document.querySelector('#reset-config')?.addEventListener('click', () => {
    targetConfig = resetTargetConfig();
    activePreviewPlatform = null;
    adaptState = {
      status: 'idle',
      message: '选择平台并生成结果后，可在这里对比原文与平台改写版本。',
      results: {},
      errors: {},
      requestedAt: null,
    };
    render();
  });
};

function render() {
  app.innerHTML = `
    <main class="shell">
      ${renderHero()}
      <div class="workspace">
        <div class="workspace__main">
          ${renderContentInput()}
          ${renderPlatformSelector()}
          ${renderTargetConfigPanel()}
          ${renderComparisonPanel()}
        </div>
        ${renderSummary()}
      </div>
    </main>
  `;
  bindEvents();
}

render();
