# CreatorSync

CreatorSync 是一个面向创作者的多平台内容发布助手。项目目标是帮助创作者在统一工作流中管理内容草稿、发布配置和多平台分发流程。

当前项目聚焦于：

* AI 驱动的多平台内容改写
* 平台风格与格式自动适配
* 可扩展 Adapter 架构
* 一键模拟发布工作流
* 持续 PR 工程化交付

> 当前仓库处于第一阶段开发中，已完成基础 monorepo 工程结构与前后端基础能力初始化，并实现了内容输入器原型。

---

## 技术栈

* Monorepo：npm workspaces
* Frontend：Next.js、TypeScript、Tailwind CSS
* Backend：Express、TypeScript
* Runtime：Node.js 20+、npm 10+

---

## 目录结构

```text id="tree"
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

## Backend（API 服务）

Backend 是 CreatorSync 的统一 API 层，基于 Express + TypeScript 构建。

当前已实现：

* Express 服务初始化
* CORS 支持
* `/health` 健康检查接口
* 统一 JSON 响应结构

未来扩展：

* AI 内容改写 API
* Platform Adapter 系统
* 发布模拟服务

---

## Frontend

当前前端采用 Next.js App Router 架构。

已实现：

* SaaS 风格布局
* Sidebar 工作区
* Header 导航
* 响应式 UI 骨架

### 内容输入器（PR4新增）

本 PR 实现了 CreatorSync 的第一个用户交互闭环 —— 内容输入器模块：

* 标题输入
* 正文输入
* 标签输入
* 基于 localStorage 的草稿自动保存
* 页面刷新后自动恢复草稿内容
* 空状态提示优化

草稿数据结构：

```json id="draft"
{
  "version": 1,
  "title": "示例：新品上线预告",
  "body": "内容草稿示例...",
  "tags": ["内容发布", "CreatorSync"],
  "updatedAt": "2026-05-30T00:00:00.000Z"
}
```

---

## 启动方式

```bash id="run1"
npm install
npm run dev:frontend
npm run dev:backend
```

---

## 原创功能说明

本项目原创设计包括：

* 多平台 Adapter 架构
* AI 内容改写流程
* 多平台风格适配策略
* Mock 发布流程
* PR 驱动持续交付体系
* 内容输入器（草稿管理模块）

---

## 来源说明

所有模块均基于本仓库 PR 逐步开发完成，无整仓库复制或外部项目直接迁移。
