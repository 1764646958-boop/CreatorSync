import assert from 'node:assert/strict';
import {
  PLATFORM_DEFINITIONS,
  createDefaultTargetConfig,
  normalizeTargetConfig,
  normalizeTags,
  togglePlatform,
  updatePlatformConfig,
  updateSourceContent,
  updateSourceDraft,
} from '../src/config.js';

const defaults = createDefaultTargetConfig();

assert.deepEqual(defaults.selectedPlatforms, []);
assert.equal(Object.keys(defaults.platformConfigs).length, PLATFORM_DEFINITIONS.length);

const withWechat = togglePlatform(defaults, 'wechat');
assert.deepEqual(withWechat.selectedPlatforms, ['wechat']);

const withoutWechat = togglePlatform(withWechat, 'wechat');
assert.deepEqual(withoutWechat.selectedPlatforms, []);

const customized = updatePlatformConfig(withWechat, 'wechat', 'tone', '温暖共情');
assert.equal(customized.platformConfigs.wechat.tone, '温暖共情');
assert.equal(withWechat.platformConfigs.wechat.tone, '专业可信');

const withContent = updateSourceContent(customized, '这是一段待改写内容');
assert.equal(withContent.sourceContent, '这是一段待改写内容');

const withTitle = updateSourceDraft(withContent, 'sourceTitle', '原始标题');
assert.equal(withTitle.sourceTitle, '原始标题');

const withTags = updateSourceDraft(withTitle, 'sourceTags', 'AI, 发布，AI');
assert.deepEqual(withTags.sourceTags, ['AI', '发布']);
assert.deepEqual(normalizeTags('#效率, 内容发布\n多平台'), ['效率', '内容发布', '多平台']);

const normalized = normalizeTargetConfig({
  sourceTitle: '标题',
  sourceContent: '草稿',
  sourceTags: ['效率', '内容发布'],
  selectedPlatforms: ['wechat', 'unknown'],
  platformConfigs: {
    wechat: {
      tone: '温暖共情',
    },
  },
});

assert.equal(normalized.sourceTitle, '标题');
assert.deepEqual(normalized.sourceTags, ['效率', '内容发布']);
assert.deepEqual(normalized.selectedPlatforms, ['wechat']);
assert.equal(normalized.platformConfigs.wechat.tone, '温暖共情');
assert.equal(normalized.platformConfigs.wechat.length, '长文');
assert.ok(normalized.platformConfigs.zhihu);

console.log('targetConfig tests passed');
