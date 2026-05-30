## Backend Unified Adaptation API

CreatorSync backend exposes `POST /api/adapt` for generating multiple platform versions from one draft.

The endpoint accepts:

- `draft`
- `platforms`
- optional per-platform `targetConfig`

and dispatches requests through the registered platform adapter architecture.

Features:

- Multi-platform adaptation in a single request
- Unified response structure
- Shared prompt template loading
- Adapter-based content transformation
- Deterministic mock fallback mode

Prompt templates for the unified adaptation flow live in `prompts/`.

No new third-party dependency was added; local development works without `OPENAI_API_KEY` by using deterministic mock fallback content.

---

## Publish History & Export

CreatorSync records adaptation and publishing activity into a local publish history store.

After a successful adaptation or mock publishing operation, the backend saves:

- Platform
- Publish time
- Title
- Summary
- Publish status

History is stored in:

```text
./data/publish-history.json