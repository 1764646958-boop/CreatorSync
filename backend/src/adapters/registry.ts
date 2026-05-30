import { XiaohongshuAdapter } from './xiaohongshu-adapter';
import { ZhihuAdapter } from './zhihu-adapter';
import { BilibiliAdapter } from './bilibili-adapter';
import { WeChatOfficialAccountAdapter } from './wechat-official-account-adapter';
import { PlatformAdapter, PlatformId } from './types';

const weChatOfficialAccountAdapter = new WeChatOfficialAccountAdapter();

const adapters = new Map<PlatformId, PlatformAdapter>([
  ['xiaohongshu', new XiaohongshuAdapter()],
  ['zhihu', new ZhihuAdapter()],
  ['bilibili', new BilibiliAdapter()],

  // canonical id
  ['wechat_official_account', weChatOfficialAccountAdapter],

  // compatibility alias
  ['wechat', weChatOfficialAccountAdapter],
]);

export const getPlatformAdapter = (
  platform: PlatformId,
): PlatformAdapter | undefined => adapters.get(platform);

export const listPlatformAdapters = (): PlatformAdapter[] =>
  Array.from(new Set(adapters.values()));