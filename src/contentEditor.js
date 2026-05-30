import { getEmptyFieldMessages, loadDraft, normalizeTags, saveDraft } from './draftStorage.js';

const fieldIds = {
  title: 'draft-title',
  body: 'draft-body',
  tags: 'draft-tags',
};

export function createContentEditor(rootElement, options = {}) {
  if (!rootElement) {
    throw new Error('Content editor root element is required.');
  }

  const storage = options.storage ?? globalThis.localStorage;
  let draft = loadDraft(storage);

  rootElement.innerHTML = `
    <article class="editor-card">
      <header class="editor-header">
        <div>
          <p class="eyebrow">本地草稿</p>
          <h2>内容输入器</h2>
        </div>
        <p class="save-status" data-save-status>已恢复本地草稿</p>
      </header>

      <form class="editor-form" data-editor-form>
        <label class="field" for="${fieldIds.title}">
          <span>标题</span>
          <input id="${fieldIds.title}" name="title" type="text" placeholder="请输入内容标题" data-title />
        </label>

        <label class="field" for="${fieldIds.body}">
          <span>正文</span>
          <textarea id="${fieldIds.body}" name="body" rows="8" placeholder="请输入正文内容" data-body></textarea>
        </label>

        <label class="field" for="${fieldIds.tags}">
          <span>标签</span>
          <input id="${fieldIds.tags}" name="tags" type="text" placeholder="例如：新品, 小红书, 视频号" data-tags />
        </label>
      </form>

      <div class="draft-preview" aria-live="polite">
        <h3>草稿状态</h3>
        <ul class="empty-messages" data-empty-messages></ul>
        <p class="tag-preview" data-tag-preview></p>
      </div>
    </article>
  `;

  const titleInput = rootElement.querySelector('[data-title]');
  const bodyInput = rootElement.querySelector('[data-body]');
  const tagsInput = rootElement.querySelector('[data-tags]');
  const statusElement = rootElement.querySelector('[data-save-status]');
  const emptyMessagesElement = rootElement.querySelector('[data-empty-messages]');
  const tagPreviewElement = rootElement.querySelector('[data-tag-preview]');

  function render() {
    titleInput.value = draft.title;
    bodyInput.value = draft.body;
    tagsInput.value = draft.tags.join(', ');
    renderFeedback();
  }

  function renderFeedback() {
    const messages = getEmptyFieldMessages(draft);
    emptyMessagesElement.innerHTML = messages.length
      ? messages.map((message) => `<li>${message}</li>`).join('')
      : '<li class="success-message">标题、正文和标签已填写，草稿会自动保存到本地。</li>';

    tagPreviewElement.textContent = draft.tags.length
      ? `当前标签：${draft.tags.map((tag) => `#${tag}`).join(' ')}`
      : '当前暂无标签。';
  }

  function persistFromInputs() {
    draft = saveDraft(
      {
        ...draft,
        title: titleInput.value,
        body: bodyInput.value,
        tags: normalizeTags(tagsInput.value),
      },
      storage,
    );

    statusElement.textContent = `已保存本地草稿 · ${new Date(draft.updatedAt).toLocaleString('zh-CN')}`;
    renderFeedback();
  }

  rootElement.querySelector('[data-editor-form]').addEventListener('input', persistFromInputs);
  render();

  return {
    getDraft: () => ({ ...draft, tags: [...draft.tags] }),
  };
}
