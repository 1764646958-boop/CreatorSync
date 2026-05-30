# CreatorSync 来源说明与原创边界

本文档用于说明 CreatorSync 当前仓库中代码、文档、prompt 和 Demo 的来源，帮助评审区分“项目原创能力”和“第三方依赖能力”。

## 总结

当前版本未复用个人旧项目代码、旧模板或旧 prompt。业务代码、Adapter 规则、mock fallback 文案、接口结构、发布历史逻辑和本文档说明均围绕 CreatorSync 的多平台内容发布助手目标在本仓库内编写。

## 原创部分

| 范围 | 说明 |
| --- | --- |
| 产品流程 | 统一草稿、平台选择、Adapter 改写、预览确认、模拟发布、发布历史。 |
| Adapter 架构 | 统一输入输出、Adapter Registry、平台能力描述和 mock fallback 返回结构。 |
| 平台规则 | 小红书、知乎、Bilibili、微信公众号的示例改写规则和结构化字段。 |
| API contract | `/api/adapt`、`/api/publish`、`/api/history` 等接口的请求/响应组织方式。 |
| 前端 Demo | 工作台布局、模拟发布状态展示、发布历史展示和本地目标配置逻辑。 |
| 本地存储 | 草稿 localStorage、目标配置 localStorage、本地 JSON 发布历史。 |
| 文档 | README、架构图、数据流、依赖清单、运行方式和原创边界说明。 |

## 第三方依赖能力

| 依赖 | 提供能力 | 是否构成业务原创能力 |
| --- | --- | --- |
| Next.js | 前端路由、开发服务和构建能力 | 否 |
| React / React DOM | UI 组件渲染能力 | 否 |
| Tailwind CSS / PostCSS / Autoprefixer | 样式工具链 | 否 |
| Express | HTTP 服务和路由能力 | 否 |
| cors | 跨域中间件 | 否 |
| dotenv | 环境变量加载 | 否 |
| TypeScript | 类型检查和编译 | 否 |
| ts-node-dev | 后端开发热重载 | 否 |
| Node.js 内置模块 | 文件系统、路径、测试、断言等基础能力 | 否 |

第三方依赖只承担基础设施角色。CreatorSync 的业务能力来自项目内定义的平台适配、统一改写 contract、mock 发布闭环和评审可复现流程。

## 复用代码说明

- **个人旧代码**：未复用。
- **个人旧模板**：未复用。
- **个人旧 prompt**：未复用。
- **外部业务代码**：未复用。
- **外部平台内容或抓取数据**：未使用。

如后续引入复用内容，应按以下格式追加记录：

| 引入时间 | 文件/模块 | 来源 | 授权/许可 | 改造点 | 保留原因 |
| --- | --- | --- | --- | --- | --- |
| TODO | TODO | TODO | TODO | TODO | TODO |

## Prompt 来源说明

`prompts/` 下的模板用于本地统一改写流程和 mock fallback 上下文组织，当前模板为 CreatorSync 项目内原创编写。模板不来自个人旧 prompt、第三方 prompt marketplace 或平台官方文案。

## Demo 来源说明

Demo 流程、模拟数据和展示说明均为本项目评审场景编写。当前 Demo 视频链接仍是 README 中的占位项，提交正式评审前应替换为真实视频地址。

## 后续维护要求

- 新增依赖：更新 README 的依赖清单并说明用途。
- 新增环境变量：更新 `.env.example` 和 `docs/environment.md`。
- 复用任何旧代码/模板/prompt：更新 README 和本文档，说明来源、授权和改造点。
- 接入真实平台 API：明确哪些能力来自平台 SDK/API，哪些能力仍由 CreatorSync 自身实现。
