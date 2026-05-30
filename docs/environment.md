# 环境变量

请复制根目录 `.env.example` 为 `.env`，并按需复制 `backend/.env.example` 为 `backend/.env`。

## 根目录环境变量

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `BACKEND_PORT` | `4000` | 根目录示例配置中保留的后端端口约定；实际后端服务当前读取 `PORT`。 |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | 前端访问后端 API 的基础地址；本地使用 `PORT=3001` 时建议改为 `http://localhost:3001`。 |
| `PLATFORM_ADAPTER_MODE` | `mock` | 平台适配器运行模式；当前用于标记本地 mock fallback 演示。 |
| `MOCK_PUBLISH_ENABLED` | `true` | 是否启用模拟发布流程。 |
| `PUBLISH_HISTORY_FILE` | `./data/publish-history.json` | 发布历史本地 JSON 文件路径。 |
| `DEFAULT_PLATFORM` | `xiaohongshu` | 默认平台配置预留项。 |
| `OPENAI_API_KEY` | 空 | 未来 AI Provider 接入预留；当前不配置也可运行。 |
| `OPENAI_MODEL` | `gpt-4o-mini` 示例 | 未来 AI Provider 模型名预留；当前 mock fallback 不依赖该变量。 |
| `LOG_LEVEL` | `debug` | 日志级别预留项。 |

## 后端环境变量

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | Express 服务监听端口；未设置时后端回退到 `3001`。 |
| `CORS_ORIGIN` | `*` | CORS 允许来源；生产环境应配置为明确域名。 |
| `PUBLISH_HISTORY_FILE` | `data/publish-history.json` | 发布历史文件路径，可覆盖根目录默认位置。 |
| `OPENAI_API_KEY` | 空 | 未来 AI Provider 接入预留。 |
| `OPENAI_MODEL` | 空 | 未来 AI Provider 模型名预留。 |
| `LOG_LEVEL` | 空 | 后端日志级别预留。 |

## 推荐本地配置

```env
PORT=3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
PLATFORM_ADAPTER_MODE=mock
MOCK_PUBLISH_ENABLED=true
PUBLISH_HISTORY_FILE=./data/publish-history.json
```

当前 Demo 不要求真实 AI Key 或真实平台发布凭证。若后续 PR 引入新环境变量，必须同步更新本文件与 `.env.example`。
