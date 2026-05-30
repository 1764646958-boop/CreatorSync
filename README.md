# CreatorSync

CreatorSync 是一个面向创作者的多平台内容发布助手。项目目标是帮助创作者在统一工作流中管理内容草稿、发布配置和多平台分发流程。

当前项目聚焦于：

* AI 驱动的多平台内容改写
* 平台风格与格式自动适配
* 可扩展 Adapter 架构
* 一键模拟发布工作流
* 持续 PR 工程化交付

> 当前仓库处于第一阶段开发中，已完成基础 monorepo 工程结构与前端应用壳初始化。

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
├── backend/          # Express + TypeScript 服务端 workspace
├── docs/             # 项目文档
├── frontend/         # Next.js + TypeScript + Tailwind 前端 workspace
├── prompts/          # Prompt 资产与规范占位
├── .github/          # GitHub 协作模板
├── .env.example      # 环境变量示例
├── .gitignore
├── package.json      # npm workspace 根配置
└── README.md
```

---

## Frontend

当前前端采用 Next.js App Router 架构，并基于 TypeScript 与 Tailwind CSS 构建。

当前已完成：

* SaaS 风格基础布局
* Sidebar 工作区结构
* Header 顶部导航
* 响应式页面骨架
* 共享 UI 组件目录初始化

后续将继续接入：

* 内容编辑器
* AI 改写流程
* 多平台预览
* 发布与历史管理

---

## 前端依赖

当前 frontend workspace 主要依赖：

* next
* react
* react-dom
* tailwindcss
* typescript
* postcss
* autoprefixer

后续新增依赖会持续同步更新 README。

---

## 本地启动方式

安装依赖：

```bash
npm install
```

复制环境变量：

```bash
cp .env.example .env
```

启动前端：

```bash
npm run dev:frontend
```

或进入 frontend workspace：

```bash
cd frontend
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

---

## 环境变量

当前 frontend shell 阶段无需额外环境变量。

后续接入 AI 服务与发布工作流后，将补充：

* OpenAI API Key
* 平台 Adapter 配置
* Mock Publish 配置

---

## 文档导航

* docs/overview.md
* docs/development.md
* docs/environment.md

---

## 依赖与来源说明

### 第三方依赖

当前项目已使用：

* Next.js
* React
* Tailwind CSS
* TypeScript
* Express（规划中）

所有第三方依赖均会在对应 workspace 的 `package.json` 与 README 中明确列出。

### 原创功能部分

以下内容为本项目原创设计：

* 多平台 Adapter 工作流
* AI 内容改写链路
* 多平台内容适配策略
* Mock Publish 演示流程
* PR 驱动持续交付工程方案

### 来源说明

当前阶段未复用个人历史项目代码；若后续复用通用工具函数、模板或 Prompt，将在对应 PR 中注明来源与改造内容。

