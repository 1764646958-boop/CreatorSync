import {
  FIELD_LABELS,
  FIELD_OPTIONS,
  PLATFORM_DEFINITIONS,
  togglePlatform,
  updatePlatformConfig,
  updateSourceContent,
} from './config.js';
import { loadTargetConfig, resetTargetConfig, saveTargetConfig } from './storage.js';

let targetConfig = loadTargetConfig();

const app = document.querySelector('#app');

const platformById = new Map(PLATFORM_DEFINITIONS.map((platform) => [platform.id, platform]));

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll("'", '&#039;');

const createOptionList = (fieldName, selectedValue) =>
  FIELD_OPTIONS[fieldName]
    .map(
      (option) =>
        `<option value="${option}" ${option === selectedValue ? 'selected' : ''}>${option}</option>`,
    )
    .join('');

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

const renderContentInput = () => `
  <section class="panel content-panel" aria-labelledby="content-title">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Step 1</p>
        <h2 id="content-title">内容输入</h2>
      </div>
      <span class="status-pill">${targetConfig.sourceContent.length} 字</span>
    </div>
    <textarea id="source-content" placeholder="粘贴或输入原始内容。这里不会生成内容，只会与目标平台配置一起形成后续改写上下文。">${escapeHtml(targetConfig.sourceContent)}</textarea>
    <p class="helper-text">输入内容会写入 targetConfig.sourceContent，并与平台目标参数联动展示。</p>
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
        return `
          <label class="platform-card ${checked ? 'is-selected' : ''}" style="--accent: ${platform.accent}">
            <input type="checkbox" data-platform-toggle="${platform.id}" ${checked ? 'checked' : ''} />
            <span class="platform-card__topline">
              <strong>${platform.name}</strong>
              <em>${platform.badge}</em>
            </span>
            <span class="platform-card__description">${platform.description}</span>
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

const renderSummary = () => {
  const selectedPlatforms = targetConfig.selectedPlatforms.map((platformId) => platformById.get(platformId));
  const previewPayload = {
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
          : selectedPlatforms.map((platform) => `<span class="platform-chip" style="--accent: ${platform.accent}">${platform.name}</span>`).join('')}
      </div>
      <pre><code>${escapeHtml(JSON.stringify(previewPayload, null, 2))}</code></pre>
    </aside>
  `;
};

const bindEvents = () => {
  document.querySelector('#source-content')?.addEventListener('input', (event) => {
    targetConfig = updateSourceContent(targetConfig, event.target.value);
    saveTargetConfig(targetConfig);
    render();
    document.querySelector('#source-content')?.focus();
  });

  document.querySelectorAll('[data-platform-toggle]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      targetConfig = togglePlatform(targetConfig, event.target.dataset.platformToggle);
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
        </div>
        ${renderSummary()}
      </div>
    </main>
  `;
  bindEvents();
}

render();
