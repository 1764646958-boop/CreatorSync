/**
 * Platform adapter shared types.
 *
 * These contracts keep CreatorSync's main workflow platform-agnostic: callers
 * submit one normalized content shape, while each platform adapter returns the
 * platform-specific publishing payload it can support.
 */

export const KNOWN_PLATFORM_IDS = [
  'xiaohongshu',
  'zhihu',
  'bilibili',
  'wechat_official_account',
] as const;

export type KnownPlatformId = (typeof KNOWN_PLATFORM_IDS)[number];

/**
 * Keeps known first-party platform IDs discoverable while still allowing future
 * custom adapters to be registered without changing every call site.
 */
export type PlatformId = KnownPlatformId | (string & {});

export type ContentFormat = 'markdown' | 'plain_text';

export interface PlatformAssetInput {
  id?: string;
  url: string;
  altText?: string;
  mimeType?: string;
}

/**
 * Unified input accepted by every adapter.
 *
 * Product flows should normalize drafts into this structure before invoking an
 * adapter. Platform-specific constraints belong in adapter output/metadata, not
 * in the shared input contract.
 */
export interface PlatformAdapterInput {
  title?: string;
  body: string;
  summary?: string;
  tags?: string[];
  assets?: PlatformAssetInput[];
  format?: ContentFormat;
  locale?: string;
  authorId?: string;
  metadata?: Record<string, unknown>;
}

export interface PlatformCapability {
  /** Human-readable capability name, for example "supportsRichText". */
  name: string;
  supported: boolean;
  note?: string;
}

export interface PlatformOutputContent {
  title?: string;
  body: string;
  summary?: string;
  tags: string[];
  assets: PlatformAssetInput[];
  /** Platform-owned fields such as cover text, topic IDs, or column IDs. */
  platformFields: Record<string, unknown>;
}

export type PlatformAdapterStatus = 'ready' | 'needs_review' | 'unsupported';

/**
 * Unified result returned by all adapters.
 *
 * The result separates normalized content from platform-only fields so callers
 * can render common previews and still preserve platform differences.
 */
export interface PlatformAdapterResult {
  platform: PlatformId;
  status: PlatformAdapterStatus;
  content: PlatformOutputContent;
  warnings: string[];
  metadata: {
    adapterName: string;
    generatedAt: string;
    capabilities: PlatformCapability[];
  };
}

export interface PlatformAdapter {
  readonly platform: PlatformId;
  readonly adapterName: string;

  getCapabilities(): PlatformCapability[];
  adapt(input: PlatformAdapterInput): Promise<PlatformAdapterResult>;
}
