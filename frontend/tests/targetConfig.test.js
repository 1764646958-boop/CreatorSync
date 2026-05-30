import assert from 'node:assert/strict';
import {
  PLATFORM_DEFINITIONS,
  createDefaultTargetConfig,
  normalizeTargetConfig,
  togglePlatform,
  updatePlatformConfig,
  updateSourceContent,
  updateSourceTitle,
} from '../src/config.js';

const defaults = createDefaultTargetConfig();

assert.deepEqual(defaults.selectedPlatforms, []);
assert.equal(defaults.sourceTitle, '');
assert.equal(Object.keys(defaults.platformConfigs).length, PLATFORM_DEFINITIONS.length);

const withWechat = togglePlatform(defaults, 'wechat');
assert.deepEqual(withWechat.selectedPlatforms, ['wechat']);

const withoutWechat = togglePlatform(withWechat, 'wechat');
assert.deepEqual(withoutWechat.selectedPlatforms, []);

const customized = updatePlatformConfig(withWechat, 'wechat', 'tone', '温暖共情');
assert.equal(customized.platformConfigs.wechat.tone, '温暖共情');
assert.equal(withWechat.platformConfigs.wechat.tone, '专业可信');

const withTitle = updateSourceTitle(customized, '发布标题');
assert.equal(withTitle.sourceTitle, '发布标题');

const withContent = updateSourceContent(withTitle, '这是一段待改写内容');
assert.equal(withContent.sourceContent, '这是一段待改写内容');

const normalized = normalizeTargetConfig({
  sourceTitle: '标题',
  sourceContent: '草稿',
  selectedPlatforms: ['wechat', 'unknown'],
  platformConfigs: {
    wechat: {
      tone: '温暖共情',
    },
  },
});

assert.equal(normalized.sourceTitle, '标题');
assert.deepEqual(normalized.selectedPlatforms, ['wechat']);
assert.equal(normalized.platformConfigs.wechat.tone, '温暖共情');
assert.equal(normalized.platformConfigs.wechat.length, '长文');
assert.ok(normalized.platformConfigs.zhihu);

console.log('targetConfig tests passed');
