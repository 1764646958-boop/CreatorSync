import {
  FIELD_LABELS,
  FIELD_OPTIONS,
  PLATFORM_DEFINITIONS,
  togglePlatform,
  updatePlatformConfig,
  updateSourceContent,
  updateSourceTitle,
} from './config.js';
import { loadTargetConfig, resetTargetConfig, saveTargetConfig } from './storage.js';

let targetConfig = loadTargetConfig();
let requestState = {
  isAdapting: false,
  error: '',
  message: '',
  results: [],
  publishingPlatform: '',
  publishError: '',
  publishMessage: '',
  simulateAiFailure: false,
  simulatePublishFailure: false,
};

const app = document.querySelector('#app');
const API_BASE_URL = globalThis.CREATOR_SYNC_API_BASE_URL ?? 'http://localhost:3001';

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

const validateTargetConfig = () => {
  const messages = [];

  if (!targetConfig.sourceTitle.trim()) {
    messages.push('请输入标题，便于识别内容主题。');
  }

  if (!targetConfig.sourceContent.trim()) {
    messages.push('请输入正文，作为多平台发布的内容来源。');
  }

  if (targetConfig.selectedPlatforms.length === 0) {
    messages.push('请至少选择一个目标平台。');
  }

  return messages;
};

const parseApiError = (payload, fallbackMessage) => {
  const details = Array.isArray(payload?.data?.details) ? `：${payload.data.details.join(' ')}` : '';
  return `${payload?.message || fallbackMessage}${details}`;
};

const requestJson = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new Error('无法连接 CreatorSync 后端，请确认服务已启动。');
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error('后端返回格式异常，请稍后重试。');
  }

  if (!response.ok || payload.success === false) {
    throw new Error(parseApiError(payload, '请求失败，请稍后重试。'));
  }

  return payload;
};

const renderHero = () => `
  <header class="hero">
    <div>
      <p class="eyebrow">CreatorSync Target Context</p>
      <h1>配置多平台发布目标</h1>
      <p class="hero__copy">选择公众号、知乎、小红书或 B站，并为每个平台定义语气、长度、标题与标签风格。当前配置会保存为统一的 targetConfig，作为后续 AI 改写上下文。</p>
    </div>
    <div class="hero__metric" aria-label="已选择平台数量">
      <span>${targetConfig.selectedPlatforms.length}</span>
      <small>已选平台</small>
    </div>
  </header>
`;

const renderContentInput = () => {
  const validationMessages = validateTargetConfig();

  return `
    <section class="panel content-panel" aria-labelledby="content-title">
      <div class="panel__header">
        <div>
          <p class="eyebrow">Step 1</p>
          <h2 id="content-title">内容输入</h2>
        </div>
        <span class="status-pill">${targetConfig.sourceContent.length} 字</span>
      </div>
      <label class="field" for="source-title">
        <span>标题</span>
        <input id="source-title" value="${escapeHtml(targetConfig.sourceTitle)}" placeholder="请输入内容标题" />
      </label>
      <label class="field" for="source-content">
        <span>正文</span>
        <textarea id="source-content" placeholder="粘贴或输入原始内容。这里不会生成内容，只会与目标平台配置一起形成后续改写上下文。">${escapeHtml(targetConfig.sourceContent)}</textarea>
      </label>
      <p class="helper-text">输入内容会写入 targetConfig，并与平台目标参数联动展示。</p>
      ${validationMessages.length > 0
        ? `<ul class="feedback-list" aria-live="polite">${validationMessages.map((message) => `<li>${escapeHtml(message)}</li>`).join('')}</ul>`
        : '<p class="success-text">标题、正文和目标平台已准备好，可以生成平台预览。</p>'}
    </section>
  `;
};

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
        return `
          <label class="platform-card ${checked ? 'is-selected' : ''}" style="--accent: ${platform.accent}">
            <input type="checkbox" data-platform-toggle="${platform.id}" ${checked ? 'checked' : ''} />
            <span class="platform-card__topline">
              <strong>${escapeHtml(platform.name)}</strong>
              <em>${escapeHtml(platform.badge)}</em>
            </span>
            <span class="platform-card__description">${escapeHtml(platform.description)}</span>
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

            if (!platform || !config) {
              return '<div class="empty-state">平台配置异常，已跳过不可识别的平台。</div>';
            }

            return `
              <article class="config-card" style="--accent: ${platform.accent}">
                <div class="config-card__header">
                  <span>${escapeHtml(platform.name)}</span>
                  <small>${escapeHtml(platform.badge)}</small>
                </div>
                <div class="field-grid">
                  ${Object.entries(FIELD_LABELS).map(([fieldName, label]) => `
                    <label class="field">
                      <span>${escapeHtml(label)}</span>
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

const renderWorkflowPanel = () => `
  <section class="panel" aria-labelledby="workflow-title">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Step 4</p>
        <h2 id="workflow-title">预览与发布兜底</h2>
      </div>
      <button class="primary-button" id="adapt-content" type="button" ${requestState.isAdapting ? 'disabled' : ''}>
        ${requestState.isAdapting ? '生成中…' : '生成平台预览'}
      </button>
    </div>
    <div class="debug-row">
      <label><input type="checkbox" id="simulate-ai-failure" ${requestState.simulateAiFailure ? 'checked' : ''} /> 模拟 AI 失败并使用 mock fallback</label>
      <label><input type="checkbox" id="simulate-publish-failure" ${requestState.simulatePublishFailure ? 'checked' : ''} /> 模拟发布失败</label>
    </div>
    ${requestState.error ? `<div class="alert alert--error" role="alert">${escapeHtml(requestState.error)}</div>` : ''}
    ${requestState.message ? `<div class="alert alert--success" role="status">${escapeHtml(requestState.message)}</div>` : ''}
    ${requestState.publishError ? `<div class="alert alert--error" role="alert">${escapeHtml(requestState.publishError)}</div>` : ''}
    ${requestState.publishMessage ? `<div class="alert alert--success" role="status">${escapeHtml(requestState.publishMessage)}</div>` : ''}
    ${requestState.results.length === 0
      ? '<div class="empty-state">生成后会在这里展示各平台预览；异常时页面会保留当前状态并显示明确提示。</div>'
      : `<div class="preview-stack">${requestState.results.map(renderPreviewCard).join('')}</div>`}
  </section>
`;

const renderPreviewCard = (result) => {
  const platform = platformById.get(result.platform);
  const title = result.content?.title ?? '未生成标题';
  const body = result.content?.body ?? '';
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  const isPublishing = requestState.publishingPlatform === result.platform;

  return `
    <article class="preview-card" style="--accent: ${platform?.accent ?? '#536dfe'}">
      <div class="preview-card__header">
        <div>
          <span class="platform-chip" style="--accent: ${platform?.accent ?? '#536dfe'}">${escapeHtml(platform?.name ?? result.platform)}</span>
          <h3>${escapeHtml(title)}</h3>
        </div>
        <button class="ghost-button" type="button" data-publish-platform="${escapeHtml(result.platform)}" ${isPublishing ? 'disabled' : ''}>
          ${isPublishing ? '发布中…' : '模拟发布'}
        </button>
      </div>
      <p>${escapeHtml(body.slice(0, 220))}${body.length > 220 ? '…' : ''}</p>
      ${warnings.length > 0 ? `<ul class="feedback-list">${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>` : ''}
    </article>
  `;
};

const renderSummary = () => {
  const selectedPlatforms = targetConfig.selectedPlatforms
    .map((platformId) => platformById.get(platformId))
    .filter(Boolean);
  const previewPayload = {
    sourceTitle: targetConfig.sourceTitle,
    sourceContent: targetConfig.sourceContent,
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
          <p class="eyebrow">Context Preview</p>
          <h2 id="summary-title">当前选择结果</h2>
        </div>
      </div>
      <div class="selected-list">
        ${selectedPlatforms.length === 0
          ? '<span class="empty-chip">尚未选择平台</span>'
          : selectedPlatforms.map((platform) => `<span class="platform-chip" style="--accent: ${platform.accent}">${escapeHtml(platform.name)}</span>`).join('')}
      </div>
      <pre><code>${escapeHtml(JSON.stringify(previewPayload, null, 2))}</code></pre>
    </aside>
  `;
};

const adaptContent = async () => {
  const validationMessages = validateTargetConfig();

  if (validationMessages.length > 0) {
    requestState = {
      ...requestState,
      error: validationMessages.join(' '),
      message: '',
    };
    render();
    return;
  }

  requestState = { ...requestState, isAdapting: true, error: '', message: '', publishError: '', publishMessage: '' };
  render();

  try {
    const responses = await Promise.all(
      targetConfig.selectedPlatforms.map((platformId) => requestJson(`/adapters/${platformId}/adapt`, {
        method: 'POST',
        body: JSON.stringify({
          title: targetConfig.sourceTitle,
          body: targetConfig.sourceContent,
          metadata: {
            platformConfig: targetConfig.platformConfigs[platformId],
            simulateAiFailure: requestState.simulateAiFailure,
          },
        }),
      })),
    );

    requestState = {
      ...requestState,
      isAdapting: false,
      error: '',
      message: responses.some((response) => /mock fallback/.test(response.message))
        ? 'AI 调用失败，已切换 mock fallback 预览。'
        : '平台预览已生成。',
      results: responses.map((response) => response.data),
    };
  } catch (error) {
    requestState = {
      ...requestState,
      isAdapting: false,
      error: error instanceof Error ? error.message : '生成平台预览失败，请稍后重试。',
    };
  }

  render();
};

const publishPreview = async (platformId) => {
  const result = requestState.results.find((item) => item.platform === platformId);

  if (!result) {
    requestState = { ...requestState, publishError: '未找到可发布的预览内容，请先重新生成。', publishMessage: '' };
    render();
    return;
  }

  requestState = { ...requestState, publishingPlatform: platformId, publishError: '', publishMessage: '' };
  render();

  try {
    const response = await requestJson(`/adapters/${platformId}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        content: result.content,
        metadata: {
          simulatePublishFailure: requestState.simulatePublishFailure,
        },
      }),
    });

    requestState = {
      ...requestState,
      publishingPlatform: '',
      publishError: '',
      publishMessage: response.data?.message ?? '发布流程已完成。',
    };
  } catch (error) {
    requestState = {
      ...requestState,
      publishingPlatform: '',
      publishError: error instanceof Error ? error.message : '发布失败，请稍后重试。',
    };
  }

  render();
};

const bindEvents = () => {
  document.querySelector('#source-title')?.addEventListener('input', (event) => {
    targetConfig = updateSourceTitle(targetConfig, event.target.value);
    requestState = { ...requestState, error: '', message: '' };
    saveTargetConfig(targetConfig);
    render();
    document.querySelector('#source-title')?.focus();
  });

  document.querySelector('#source-content')?.addEventListener('input', (event) => {
    targetConfig = updateSourceContent(targetConfig, event.target.value);
    requestState = { ...requestState, error: '', message: '' };
    saveTargetConfig(targetConfig);
    render();
    document.querySelector('#source-content')?.focus();
  });

  document.querySelectorAll('[data-platform-toggle]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      targetConfig = togglePlatform(targetConfig, event.target.dataset.platformToggle);
      requestState = { ...requestState, error: '', message: '' };
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

  document.querySelector('#simulate-ai-failure')?.addEventListener('change', (event) => {
    requestState = { ...requestState, simulateAiFailure: event.target.checked };
    render();
  });

  document.querySelector('#simulate-publish-failure')?.addEventListener('change', (event) => {
    requestState = { ...requestState, simulatePublishFailure: event.target.checked };
    render();
  });

  document.querySelector('#adapt-content')?.addEventListener('click', adaptContent);

  document.querySelectorAll('[data-publish-platform]').forEach((button) => {
    button.addEventListener('click', (event) => publishPreview(event.currentTarget.dataset.publishPlatform));
  });

  document.querySelector('#reset-config')?.addEventListener('click', () => {
    targetConfig = resetTargetConfig();
    requestState = { ...requestState, error: '', message: '', results: [], publishError: '', publishMessage: '' };
    render();
  });
};

function render() {
  if (!app) {
    return;
  }

  try {
    app.innerHTML = `
      <main class="shell">
        ${renderHero()}
        <div class="workspace">
          <div class="workspace__main">
            ${renderContentInput()}
            ${renderPlatformSelector()}
            ${renderTargetConfigPanel()}
            ${renderWorkflowPanel()}
          </div>
          ${renderSummary()}
        </div>
      </main>
    `;
    bindEvents();
  } catch (error) {
    app.innerHTML = `
      <main class="shell">
        <div class="alert alert--error" role="alert">
          页面渲染失败，但应用未崩溃。请刷新页面或重置本地配置后重试。
        </div>
      </main>
    `;
    console.error(error);
  }
}

render();
