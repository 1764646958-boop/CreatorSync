import {
  PlatformAdapter,
  PlatformAdapterInput,
  PlatformAdapterResult,
  PlatformCapability,
  PlatformId,
  PlatformOutputContent,
} from './types';

/**
 * Base class for future platform adapters.
 *
 * This follows the common Adapter pattern (no historical business code reused):
 * CreatorSync receives unified draft input, delegates platform differences to a
 * concrete adapter, and receives one predictable result shape for downstream
 * preview/publishing flows.
 */
export abstract class BasePlatformAdapter implements PlatformAdapter {
  public abstract readonly platform: PlatformId;
  public abstract readonly adapterName: string;

  public getCapabilities(): PlatformCapability[] {
    return [];
  }

  public async adapt(input: PlatformAdapterInput): Promise<PlatformAdapterResult> {
    this.validateInput(input);

    const content = await this.buildPlatformContent(input);
    const warnings = this.collectWarnings(input, content);

    return {
      platform: this.platform,
      status: warnings.length > 0 ? 'needs_review' : 'ready',
      content,
      warnings,
      metadata: {
        adapterName: this.adapterName,
        generatedAt: new Date().toISOString(),
        capabilities: this.getCapabilities(),
      },
    };
  }

  /**
   * Concrete adapters implement only the platform-specific mapping here.
   * Examples reserved for later PRs: 小红书、知乎、B站、公众号 output fields.
   */
  protected abstract buildPlatformContent(
    input: PlatformAdapterInput,
  ): Promise<PlatformOutputContent> | PlatformOutputContent;

  protected validateInput(input: PlatformAdapterInput): void {
    if (!input.body || input.body.trim().length === 0) {
      throw new Error('Platform adapter input body is required.');
    }
  }

  protected collectWarnings(
    _input: PlatformAdapterInput,
    _content: PlatformOutputContent,
  ): string[] {
    return [];
  }

  protected createBaseOutput(input: PlatformAdapterInput): PlatformOutputContent {
    return {
      title: input.title,
      body: input.body,
      summary: input.summary,
      tags: input.tags ?? [],
      assets: input.assets ?? [],
      platformFields: {},
    };
  }
}
