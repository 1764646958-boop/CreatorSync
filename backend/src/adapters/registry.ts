import { XiaohongshuAdapter } from './xiaohongshu-adapter';
import { ZhihuAdapter } from './zhihu-adapter';
import { BilibiliAdapter } from './bilibili-adapter';
import { PlatformAdapter, PlatformId } from './types';

const adapters = new Map<PlatformId, PlatformAdapter>([
  ['xiaohongshu', new XiaohongshuAdapter()],
  ['zhihu', new ZhihuAdapter()],
  ['bilibili', new BilibiliAdapter()],
]);

export const getPlatformAdapter = (platform: PlatformId): PlatformAdapter | undefined =>
  adapters.get(platform);

export const listPlatformAdapters = (): PlatformAdapter[] => Array.from(adapters.values());
