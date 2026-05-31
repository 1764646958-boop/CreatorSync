# 环境变量

请复制根目录 `.env.example` 为 `.env`，并按需复制 `backend/.env.example` 为 `backend/.env`。根目录 `npm run dev` 会读取根目录 `.env` 并把关键变量传给前后端；单独启动 backend 时，`backend/.env` 会由 `dotenv` 加载。

## 根目录环境变量

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | 后端 Express 监听端口；根目录一键启动会传给 backend。 |
| `BACKEND_PORT` | `3001` | 兼容旧配置；当 `PORT` 未设置时，一键启动脚本会把它映射为 `PORT`。 |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001` | 前端访问后端 API 的基础地址。 |
| `AI_MOCK_MODE` | `false` | 设置为 `true` 时强制使用确定性 mock fallback，即使配置了 DeepSeek Key。 |
| `MOCK_PUBLISH_ENABLED` | `true` | 是否启用模拟发布流程。 |
| `PUBLISH_HISTORY_FILE` | `./data/publish-history.json` | 发布历史本地 JSON 文件路径。 |
| `DEFAULT_PLATFORM` | `xiaohongshu` | 默认平台配置预留项。 |
| `DEEPSEEK_API_KEY` | 空 | DeepSeek API Key；为空时自动使用 mock fallback。 |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | DeepSeek OpenAI-compatible API Base URL。 |
| `DEEPSEEK_MODEL` | `deepseek-chat` | DeepSeek 模型名称。 |
| `DEEPSEEK_TIMEOUT_MS` | `30000` | DeepSeek 请求超时时间。 |
| `LOG_LEVEL` | `debug` | 日志级别预留项。 |

## 后端环境变量

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | Express 服务监听端口；未设置时后端回退到 `3001`。 |
| `CORS_ORIGIN` | `*` | CORS 允许来源；生产环境应配置为明确域名。 |
| `PUBLISH_HISTORY_FILE` | `data/publish-history.json` | 发布历史文件路径，可覆盖根目录默认位置。 |
| `DEEPSEEK_API_KEY` | 空 | DeepSeek API Key；为空时自动使用 mock fallback。 |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | DeepSeek OpenAI-compatible API Base URL。 |
| `DEEPSEEK_ENDPOINT` | 空 | 可选完整 Chat Completions endpoint；未设置时由 `DEEPSEEK_BASE_URL` 拼接 `/chat/completions`。 |
| `DEEPSEEK_MODEL` | `deepseek-chat` | DeepSeek 模型名称。 |
| `DEEPSEEK_TIMEOUT_MS` | `30000` | DeepSeek 请求超时时间。 |
| `AI_MOCK_MODE` | `false` | 强制 mock fallback 开关。 |
| `DEEPSEEK_MOCK_MODE` | `false` | DeepSeek mock 开关别名。 |
| `LOG_LEVEL` | 空 | 后端日志级别预留。 |

## 推荐本地配置

```env
PORT=3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
AI_MOCK_MODE=false
MOCK_PUBLISH_ENABLED=true
PUBLISH_HISTORY_FILE=./data/publish-history.json
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

无 DeepSeek Key 时，`POST /api/adapt` 和 `POST /adapters/:platform/adapt` 都会返回 `metadata.generationMode="mock_fallback"`；配置 Key 且请求成功时返回 `metadata.generationMode="deepseek"`。若后续 PR 引入新环境变量，必须同步更新本文件与 `.env.example`。
