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
        `<option value="${escapeHtml(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHtml(option)}</option>`,
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
              <strong>${escapeHtml(platform.name)}</strong>
              <em>${escapeHtml(platform.badge)}</em>
            </span>
            <span class="platform-card__description">${platform.description}</span>
            <span class="adapter-note ${supported ? 'is-ready' : ''}">${supported ? '已接入 /api/adapt' : '等待后端适配器'}</span>
          </label>
        `;
      }).join('')}
    </div>
  </section>
`;

// 渲染目标配置、比较面板、Tabs、卡片、Insight 等都可继续复用 main/PR6+结构
// 省略重复函数 renderTargetConfigPanel, renderComparisonPanel, renderPlatformTabs, renderPreviewCard, renderComparisonInsight

// ---------------- 事件绑定 ----------------
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

  document.querySelector('#generate-preview')?.addEventListener('click', async () => {
    // 调用 generateAdaptResults，保持 adaptState 异步流程
  });
};

// ---------------- 渲染函数 ----------------
function render() {
  if (!app) return;
  try {
    app.innerHTML = `
      <main class="shell">
        ${renderHero()}
        <div class="workspace">
          <div class="workspace__main">
            ${renderContentInput()}
            ${renderPlatformSelector()}
            <!-- 渲染目标配置和比较面板 -->
          </div>
        </div>
      </main>
    `;
    bindEvents();
  } catch (error) {
    app.innerHTML = `
      <main class="shell">
        <div class="alert alert--error" role="alert">
          页面渲染失败，请刷新或重置本地配置。
        </div>
      </main>
    `;
    console.error(error);
  }
}

render();