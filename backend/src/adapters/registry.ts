import { XiaohongshuAdapter } from './xiaohongshu-adapter';
import { PlatformAdapter, PlatformId } from './types';

const adapters = new Map<PlatformId, PlatformAdapter>([
  ['xiaohongshu', new XiaohongshuAdapter()],
]);

export const getPlatformAdapter = (platform: PlatformId): PlatformAdapter | undefined =>
  adapters.get(platform);

export const listPlatformAdapters = (): PlatformAdapter[] => Array.from(adapters.values());
