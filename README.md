
# CreatorSync

CreatorSync 是一个面向创作者的多平台内容发布助手。项目目标是帮助创作者在统一工作流中管理内容草稿、发布配置和多平台分发流程。

当前项目聚焦于：

- AI 驱动的多平台内容改写
- 平台风格与格式自动适配
- 可扩展 Adapter 架构
- 一键模拟发布工作流
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