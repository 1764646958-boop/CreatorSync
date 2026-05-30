# CreatorSync

CreatorSync 是一个面向创作者的多平台内容发布助手。项目目标是帮助创作者在统一工作流中管理内容草稿、发布配置和多平台分发流程。

当前项目聚焦于：

* AI 驱动的多平台内容改写
* 平台风格与格式自动适配
* 可扩展 Adapter 架构
* 一键模拟发布工作流
* 持续 PR 工程化交付

> 当前仓库处于第一阶段开发中，已完成基础 monorepo 工程结构与前端 + 后端基础服务初始化。

---

## 技术栈

* Monorepo：npm workspaces
* Frontend：Next.js、TypeScript、Tailwind CSS
* Backend：Express、TypeScript
* Runtime：Node.js 20+、npm 10+

---

## 目录结构

```text
CreatorSync/
├── backend/          # Express + TypeScript API 服务
├── docs/             # 项目文档
├── frontend/         # Next.js 前端应用
├── prompts/          # Prompt 资产
├── .github/          # PR 模板与协作规范
├── .env.example
├── package.json
└── README.md
```

---

## Backend（API 服务）

Backend 是 CreatorSync 的统一 API 层，基于 Express + TypeScript 构建。

当前已实现：

* Express 服务初始化
* CORS 支持
* 环境变量加载（dotenv）
* `/health` 健康检查接口
* 统一 JSON 响应结构

健康检查示例：

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

未来将扩展：

* AI 内容改写 API
* Platform Adapter 接口层
* 发布模拟服务
* 用户内容管理

---

## Frontend

当前前端采用 Next.js App Router 架构。

已实现：

* SaaS 风格基础布局
* Sidebar 工作区结构
* Header 导航
* 响应式 UI 骨架

---

## 启动方式

安装依赖：

```bash
npm install
```

启动前端：

```bash
npm run dev:frontend
```

启动后端：

```bash
npm run dev:backend
```

---

## 环境变量

```bash
cp .env.example .env
```

---

## 文档导航

* docs/overview.md
* docs/development.md
* docs/environment.md

---

## 原创功能说明

本项目原创设计包括：

* 多平台 Adapter 架构
* AI 内容改写流程
* 多平台风格适配策略
* Mock 发布流程
* PR 驱动持续交付体系

---

## 来源说明

当前阶段未复用任何历史项目代码；所有 backend 与 frontend 初始化均为本仓库 PR 驱动开发结果。
