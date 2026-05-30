# CreatorSync 开发规范

## 仓库结构

- `frontend/`：Next.js、React、Tailwind CSS 前端工作台。
- `backend/`：Express + TypeScript API、Adapter 和发布历史逻辑。
- `src/`：根目录轻量草稿输入 Demo。
- `prompts/`：统一改写流程使用的 prompt 模板。
- `docs/`：项目说明、环境变量、开发规范和来源说明。
- `test/`：根目录轻量 Demo 的单元测试。

## 工作方式

- 使用 npm workspaces 管理 `frontend` 与 `backend`。
- 每个 PR 只聚焦一个目标，避免夹带无关业务功能。
- 新增环境变量时必须同步更新根目录 `.env.example`，必要时也更新 `backend/.env.example`。
- 新增依赖时必须更新 README 的依赖清单，说明依赖用途。
- 新增文档必须放置在 `docs/` 目录下，根 README 只保留评审入口和核心说明。
- 如果复用旧代码、外部模板或旧 prompt，必须同时更新 README 和 `docs/source-notes.md`。

## 本地开发命令

```bash
npm install
npm run dev --workspace backend
npm run dev --workspace frontend
```

可选命令：

```bash
npm test
node --test test/draftStorage.test.js
node frontend/tests/targetConfig.test.js
npm run typecheck
npm run build
```

## Adapter 开发约定

- 新平台应新增独立 Adapter，不应把平台规则写入 route 或 UI。
- Adapter 输入应保持统一 draft 结构，平台差异写入 `platformFields`、`warnings` 和 `metadata`。
- Adapter 的 mock fallback 文案和规则必须能在无外部 API Key 时稳定运行。
- 真实平台发布能力应作为独立后续 PR 实现，不与文档或 mock 改写混杂。

## 文档要求

面向评审的文档应清晰说明：

- 项目解决什么问题。
- 第三方依赖分别提供什么基础能力。
- 哪些功能是 CreatorSync 原创设计。
- 如何在本地启动、测试和观看 Demo。
- 是否存在复用代码、复用 prompt 或外部模板。
