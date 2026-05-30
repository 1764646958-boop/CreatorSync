# CreatorSync Backend

CreatorSync backend provides the Express + TypeScript API layer for content adaptation and publishing workflow preparation.

## Local development

```bash
npm run dev --workspace backend
```

The service reads `PORT` from `backend/.env.example` and defaults to `3001` when unset.


## Unified adaptation API

This PR adds a unified AI content adaptation dispatch service for frontend flows that need one request to generate multiple platform-ready versions.

- `POST /api/adapt` accepts `draft`, `platforms`, and optional per-platform `targetConfig`.
- The service validates the request, loads centralized prompt templates from root `prompts/`, dispatches to the matching platform adapter, and returns a uniform `results[]` shape for frontend previews.
- One request can target multiple platforms, for example `xiaohongshu` and `zhihu`.
- No third-party validation or AI SDK dependency was added. When `OPENAI_API_KEY` is unset, the service automatically uses deterministic mock fallback output through the existing adapters so local demos still exercise the full flow.

Example request:

```json
{
  "draft": {
    "title": "用统一工作流提升内容分发效率",
    "body": "CreatorSync 帮助创作者把一段原始内容改写成不同平台适合的版本。它强调统一草稿、平台配置、预览和发布准备。",
    "tags": ["内容分发", "AI工具"]
  },
  "platforms": ["xiaohongshu", "zhihu"],
  "targetConfig": {
    "xiaohongshu": { "tone": "emotional", "maxTitleLength": 20 },
    "zhihu": { "structure": "question_analysis_conclusion" }
  }
}
```

The response data uses this stable shape:

```json
{
  "requestId": "adapt_...",
  "generationMode": "mock_fallback",
  "aiKeyConfigured": false,
  "results": [
    {
      "platform": "xiaohongshu",
      "status": "ready",
      "content": { "title": "...", "body": "...", "tags": [], "assets": [], "platformFields": {} },
      "warnings": [],
      "targetConfig": {},
      "prompt": { "templateVersion": "...", "systemPromptPath": "prompts/adapt.system.md", "platformPromptPath": "prompts/platforms/xiaohongshu.md" },
      "metadata": { "generationMode": "mock_fallback", "aiProvider": "deterministic_mock", "aiKeyConfigured": false }
    }
  ]
}
```

### Environment variables

- `PORT`: backend service port, default `3001`.
- `CORS_ORIGIN`: comma-separated allowed origins or `*`.
- `OPENAI_API_KEY`: optional future AI provider key. Leave unset for deterministic mock fallback.

### Dependency note

No new backend runtime dependency was added for this PR. Request validation is implemented with TypeScript helpers in the route layer, so no README dependency update for zod or an AI SDK is required.

### Source note

The unified service design, request/response contract, and prompt templates in `prompts/` are original to this PR. No historical business code, old prompt template, or personal project logic was reused.

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

## Source note

The Xiaohongshu and Zhihu style rules, prompt-like structures, and mock fallback wording are original to their PRs. No historical business code, old prompt template, or personal project text-processing logic was reused for the Zhihu adapter.
