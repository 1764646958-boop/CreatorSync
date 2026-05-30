# CreatorSync Backend

CreatorSync Backend provides the Express + TypeScript API layer for content adaptation, platform-specific content transformation, and publishing workflow preparation.

The backend follows an extensible Adapter Architecture that enables one source draft to be transformed into multiple platform-specific versions while keeping a unified API contract.

---

## Features

### Core Infrastructure

* Express + TypeScript API service
* Unified response format
* CORS support
* Environment-based configuration
* Health check endpoint

### Adapter Architecture

Implemented adapters:

* Xiaohongshu Adapter
* Zhihu Adapter
* Bilibili Adapter
* WeChat Official Accounts Adapter

Shared capabilities:

* Unified draft input schema
* Platform-specific content transformation
* Consistent output structure
* Mock AI fallback mode
* Extensible adapter registration mechanism

---

## Local Development

Install dependencies:

```bash
npm install
```

Start backend service:

```bash
npm run dev --workspace backend
```

Build:

```bash
npm run build --workspace backend
```

---

## Environment Variables

Copy environment variables:

```bash
cp backend/.env.example backend/.env
```

Example:

```env
PORT=3001
CORS_ORIGIN=*
```

The backend defaults to port `3001` when `PORT` is not specified.

Additional optional environment variables for future AI integration:

* `OPENAI_API_KEY`: optional future AI provider key
* `OPENAI_MODEL`: optional future model name
* `LOG_LEVEL`: optional backend log level

---

## Health Check

### Request

```http
GET /health
```

### Response

```json
{
  "success": true,
  "data": {
    "service": "CreatorSync Backend",
    "status": "ok"
  },
  "message": "success"
}
```

---

## Adapter Discovery

### Request

```http
GET /adapters
```

### Example Response

```json
{
  "success": true,
  "data": {
    "registeredAdapters": [
      "xiaohongshu",
      "zhihu",
      "bilibili",
      "wechat_official_account"
    ]
  }
}
```

---

## Unified Adaptation API

This PR adds a unified AI content adaptation dispatch service for frontend flows that need one request to generate multiple platform-ready versions.

### Request

```http
POST /api/adapt
```

### Behavior

* Accepts `draft`, `platforms`, and optional per-platform `targetConfig`
* Validates the request
* Loads centralized prompt templates from root `prompts/`
* Dispatches to the matching platform adapter
* Returns a uniform `results[]` shape for frontend previews
* Supports multi-platform adaptation in a single request

### Example Request

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

### Example Response Shape

```json
{
  "requestId": "adapt_...",
  "generationMode": "mock_fallback",
  "aiKeyConfigured": false,
  "results": [
    {
      "platform": "xiaohongshu",
      "status": "ready",
      "content": {
        "title": "...",
        "body": "...",
        "tags": [],
        "assets": [],
        "platformFields": {}
      },
      "warnings": [],
      "targetConfig": {},
      "prompt": {
        "templateVersion": "...",
        "systemPromptPath": "prompts/adapt.system.md",
        "platformPromptPath": "prompts/platforms/xiaohongshu.md"
      },
      "metadata": {
        "generationMode": "mock_fallback",
        "aiProvider": "deterministic_mock",
        "aiKeyConfigured": false
      }
    }
  ]
}
```

### Dependency Note

No new backend runtime dependency was added for this PR. Request validation is implemented with TypeScript helpers in the route layer, so no README dependency update for zod or an AI SDK is required.

### Source Note

The unified service design, request/response contract, and prompt templates in `prompts/` are original to this PR. No historical business code, old prompt template, or personal project logic was reused.

---

# Adapter APIs

All adapters use the same unified draft input structure.

## Unified Draft Input

```json
{
  "title": "用统一工作流提升内容分发效率",
  "body": "CreatorSync 帮助创作者把一段原始内容改写成不同平台适合的版本。",
  "tags": ["内容分发"]
}
```

---

## Xiaohongshu Adapter

### Endpoint

```http
POST /adapters/xiaohongshu/adapt
```

### Characteristics

* Emotional tone
* Recommendation style
* Emoji enhancement
* Lifestyle sharing structure
* Short paragraph formatting

### Output Fields

```json
{
  "content": {
    "title": "",
    "body": "",
    "tags": [],
    "assets": [],
    "platformFields": {}
  }
}
```

---

## Zhihu Adapter

### Endpoint

```http
POST /adapters/zhihu/adapt
```

### Characteristics

* Rational analysis
* Question → Analysis → Conclusion structure
* Long-form answer style
* Explicit assumptions and boundaries
* Knowledge-sharing tone

### Output Fields

```json
{
  "content": {
    "title": "",
    "body": "",
    "tags": [],
    "assets": [],
    "platformFields": {}
  }
}
```

---

## Bilibili Adapter

### Endpoint

```http
POST /adapters/bilibili/adapt
```

### Characteristics

* Conversational language
* Community interaction style
* Video description support
* Dynamic post generation
* Viewer engagement guidance

### Additional Platform Fields

```json
{
  "platformFields": {
    "videoDescription": "",
    "dynamicText": "",
    "communityCopy": "",
    "introHook": "",
    "interactionGuide": ""
  }
}
```

---

## WeChat Official Accounts Adapter

### Endpoint

```http
POST /adapters/wechat_official_account/adapt
```

Compatibility Alias:

```http
POST /adapters/wechat/adapt
```

### Characteristics

* Long-form article structure
* Intro section
* Numbered headings
* Reading-friendly layout
* Closing CTA section

### Additional Platform Fields

```json
{
  "platformFields": {
    "introduction": "",
    "sections": [],
    "summary": "",
    "callToAction": ""
  }
}
```

---

## AI Fallback Strategy

Current implementation does not require external AI services.

When no AI provider is configured:

```json
{
  "generationMode": "mock_fallback"
}
```

The backend uses deterministic platform transformation rules to guarantee:

* Stable demo behavior
* Offline execution
* Reproducible outputs
* No third-party AI dependency

Future versions may support:

* OpenAI
* DeepSeek
* Qwen
* Other LLM providers

through the same adapter contract.

---

## Project Structure

```text
backend/
├── src/
│   ├── adapters/
│   │   ├── base/
│   │   ├── xiaohongshu/
│   │   ├── zhihu/
│   │   ├── bilibili/
│   │   └── wechat/
│   │
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── server.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Originality Statement

The following components are original CreatorSync implementations:

* Adapter Architecture
* Platform Adapter Contract
* Xiaohongshu Style Rules
* Zhihu Style Rules
* Bilibili Style Rules
* WeChat Official Accounts Style Rules
* Unified AI Adaptation Service
* Mock AI Fallback Workflow
* Unified Content Transformation Pipeline
* Platform-Specific Formatting Strategies

---

## Dependency Disclosure

Runtime Dependencies:

* express
* cors
* dotenv

Development Dependencies:

* typescript
* ts-node-dev

All dependencies are declared in `backend/package.json`.

---

## Source Note

The Xiaohongshu, Zhihu, Bilibili, and WeChat Official Accounts style rules, prompt-like structures, formatting strategies, article layout rules, and mock fallback wording are original to their respective CreatorSync PR implementations.

No historical business code, old prompt templates, old article templates, previous personal project code, or proprietary text-processing logic were reused in the implementation of these adapters.

All platform adaptation logic was developed specifically for the CreatorSync repository and follows the shared platform adapter contract introduced in the adapter architecture layer.

