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

## Source note

The Xiaohongshu style rules, prompt-like structure, and mock fallback wording are original to this PR. No historical business code, old prompt template, or personal project text-processing logic was reused.
