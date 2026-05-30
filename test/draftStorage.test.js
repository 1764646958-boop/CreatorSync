import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DRAFT,
  DRAFT_STORAGE_KEY,
  getEmptyFieldMessages,
  loadDraft,
  normalizeTags,
  saveDraft,
} from '../src/draftStorage.js';

function createMemoryStorage() {
  const data = new Map();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}

test('loadDraft returns and persists the default draft when storage is empty', () => {
  const storage = createMemoryStorage();
  const draft = loadDraft(storage);

  assert.equal(draft.version, 1);
  assert.equal(draft.title, DEFAULT_DRAFT.title);
  assert.deepEqual(draft.tags, [...DEFAULT_DRAFT.tags]);
  assert.equal(JSON.parse(storage.getItem(DRAFT_STORAGE_KEY)).title, DEFAULT_DRAFT.title);
});

test('saveDraft normalizes a unified draft structure', () => {
  const storage = createMemoryStorage();
  const draft = saveDraft(
    {
      title: '  自定义标题  ',
      body: '正文',
      tags: '小红书, 视频号，小红书',
    },
    storage,
  );

  assert.equal(draft.version, 1);
  assert.equal(draft.title, '  自定义标题  ');
  assert.deepEqual(draft.tags, ['小红书', '视频号']);
  assert.ok(draft.updatedAt);
});

test('normalizeTags removes empty and duplicated tags', () => {
  assert.deepEqual(normalizeTags('新品, , 内容发布，新品'), ['新品', '内容发布']);
});

test('getEmptyFieldMessages reports missing title, body and tags', () => {
  const messages = getEmptyFieldMessages({ title: ' ', body: '', tags: [] });

  assert.equal(messages.length, 3);
  assert.match(messages[0], /标题/);
  assert.match(messages[1], /正文/);
  assert.match(messages[2], /标签/);
});
