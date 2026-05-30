# CreatorSync Backend

CreatorSync backend provides the Express + TypeScript API layer for content adaptation and publishing workflow preparation.

## Local development

```bash
npm run dev --workspace backend
```

The service reads `PORT` from `backend/.env.example` and defaults to `3001` when unset.

## Xiaohongshu adapter

This PR adds a Xiaohongshu content adapter exposed through the shared platform adapter contract.

- `GET /adapters` lists registered adapters and capabilities.
- `POST /adapters/xiaohongshu/adapt` accepts the unified draft input shape and returns compatible structured content with `content.title`, `content.body`, `content.tags`, `content.assets`, and `content.platformFields`.
- The adapter uses deterministic CreatorSync-authored rules for emotional rewriting, emoji accents, short-sentence structure, and seeding-style recommendations.
- No third-party AI SDK or runtime dependency was added. When no API key exists, the adapter still returns stable mock fallback output through `generationMode: "mock_fallback"`.

Example request:

```json
{
  "title": "用统一工作流提升内容分发效率",
  "body": "CreatorSync 帮助创作者把一段原始内容改写成不同平台适合的版本。它强调统一草稿、平台配置、预览和发布准备。",
  "tags": ["内容分发"]
}
```

## Zhihu adapter

This PR adds a Zhihu content adapter exposed through the same shared platform adapter contract.

- `GET /adapters` now includes `zhihu` in the registered adapter list.
- `POST /adapters/zhihu/adapt` accepts the unified draft input shape and returns compatible structured content with `content.title`, `content.body`, `content.tags`, `content.assets`, and `content.platformFields`.
- The adapter deterministically reorganizes source material into a Zhihu-style “问题—分析—结论” / 总分总 answer, emphasizing rational explanation, assumptions, boundaries, and executable judgment rather than simple word substitution.
- No third-party AI SDK or runtime dependency was added. The adapter always provides stable mock fallback output through `generationMode: "mock_fallback"` when no external AI integration is configured.

Example request:

```json
{
  "title": "用统一工作流提升内容分发效率",
  "body": "CreatorSync 帮助创作者把一段原始内容改写成不同平台适合的版本。它强调统一草稿、平台配置、预览和发布准备。",
  "tags": ["内容分发"]
}
```

## WeChat Official Accounts adapter

This PR adds a WeChat Official Accounts content adapter exposed through the same shared platform adapter contract.

- `GET /adapters` now includes `wechat_official_account` in the registered adapter list.
- `POST /adapters/wechat_official_account/adapt` accepts the unified draft input shape and returns compatible structured content with `content.title`, `content.body`, `content.tags`, `content.assets`, and `content.platformFields`.
- `POST /adapters/wechat/adapt` is also accepted as a compatibility alias for frontend target configs that use the shorter `wechat` platform id; the normalized result still reports `platform: "wechat_official_account"`.
- The adapter deterministically expands source material into a public-account long-form article with a title, 导语, numbered subheadings, short paragraphs, layout hints, image placeholders, and a closing call-to-action.
- No third-party AI SDK or runtime dependency was added. The adapter always provides stable mock fallback output through `generationMode: "mock_fallback"` when no external AI integration is configured.

Example request:

```json
{
  "title": "用统一工作流提升内容分发效率",
  "body": "CreatorSync 帮助创作者把一段原始内容改写成不同平台适合的版本。它强调统一草稿、平台配置、预览和发布准备。公众号版本需要导语、小标题、分段和结尾引导。",
  "tags": ["内容分发"]
}
```

## Source note

The Xiaohongshu, Zhihu, and WeChat Official Accounts style rules, prompt-like structures, article layout rules, and mock fallback wording are original to their PRs. No historical business code, old prompt template, old article template, or personal project text-processing logic was reused for the WeChat Official Accounts adapter.
