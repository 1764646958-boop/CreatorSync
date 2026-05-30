# CreatorSync

CreatorSync 是一个面向创作者的多平台内容发布助手。项目目标是帮助创作者在统一工作流中管理内容草稿、发布配置和多平台分发流程。

> 当前仓库处于工程初始化阶段，本 PR 仅建立 monorepo 结构、基础脚本、环境变量示例和文档骨架，不包含业务功能实现。

## 技术栈

- Monorepo：npm workspaces
- Frontend：Next.js、TypeScript、Tailwind CSS
- Backend：Express、TypeScript
- Runtime：Node.js 20+、npm 10+

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

## 依赖说明

当前初始化阶段未引入外部 npm 依赖；后续接入 Next.js、Tailwind CSS、Express 与 TypeScript 时，将在对应 workspace 的 `package.json` 中补充并同步更新本文档。

## 本地启动方式（占位）

首次安装 workspace 基础结构：

```bash
npm install
```

复制环境变量示例：

```bash
cp .env.example .env
```

当前启动命令为占位脚本，用于验证 workspace 脚本链路。后续接入实际应用后将替换为前后端开发服务。

后续开发启动命令：

```bash
npm run dev:frontend
npm run dev:backend
```

或在根目录尝试同时启动已配置 workspace 的开发脚本：

```bash
npm run dev
```

## 文档导航

- [项目概览](docs/overview.md)
- [开发规范](docs/development.md)
- [环境变量](docs/environment.md)

## 来源说明

本次初始化未复用个人旧代码、旧模板或旧 prompt；所有内容均基于本仓库 PR 需求从零编写。
