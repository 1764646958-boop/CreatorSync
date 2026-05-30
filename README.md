
# CreatorSync

CreatorSync 是一个面向创作者的多平台内容发布助手。项目目标是帮助创作者在统一工作流中管理内容草稿、发布配置和多平台分发流程。

当前项目聚焦于：

- AI 驱动的多平台内容改写
- 平台风格与格式自动适配
- 可扩展 Adapter 架构
- 一键模拟发布工作流
- 发布历史记录与 Markdown / JSON 导出
- 持续 PR 工程化交付

> 当前仓库处于第一阶段开发中，已完成基础 monorepo 工程结构与前后端基础能力初始化，并逐步构建内容输入与平台配置能力。

---

## 技术栈

- Monorepo：npm workspaces
- Frontend：Next.js、TypeScript、Tailwind CSS
- Backend：Express、TypeScript
- Runtime：Node.js 20+、npm 10+

---

## 目录结构

```text
CreatorSync/
├── backend/
├── frontend/
├── docs/
├── prompts/
├── .github/
├── .env.example
├── package.json
└── README.md
```

---

## 发布历史与导出

本 PR 在现有平台改写流程中增加本地发布历史：后端每次完成平台 Adapter 改写/模拟发布后，会保存平台、发布时间、标题、摘要和状态到 `PUBLISH_HISTORY_FILE` 指向的 JSON 文件，默认路径为 `./data/publish-history.json`。

前端工作台顶部导航提供 **History** 入口，历史区可查看记录，并可直接导出：

- Markdown：`GET /history/export?format=markdown`
- JSON：`GET /history/export?format=json`

本功能未新增第三方业务依赖；如需修改历史存储位置，请在 `.env` 中配置 `PUBLISH_HISTORY_FILE`，并参考 `.env.example`。

来源说明：历史记录数据模型、导出机制和列表展示均为本 PR 原创实现，未复用个人旧代码、旧模板或旧 prompt。
