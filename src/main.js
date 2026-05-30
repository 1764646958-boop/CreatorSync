import { createContentEditor } from './contentEditor.js';

const editorRoot = document.querySelector('#content-editor');

try {
  createContentEditor(editorRoot);
} catch (error) {
  if (editorRoot) {
    editorRoot.innerHTML = `
      <article class="editor-card" role="alert">
        <p class="eyebrow">CreatorSync</p>
        <h2>内容输入器暂时不可用</h2>
        <p class="empty-messages">页面未崩溃，请刷新页面或检查本地存储权限后重试。</p>
      </article>
    `;
  }
  console.error(error);
}
