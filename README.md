# CreatorSync

CreatorSync 是一个多平台内容发布助手。本仓库当前实现了前端原型：内容输入、目标平台选择，以及面向后续 AI 改写流程的统一 `targetConfig` 上下文。

## 目录结构

```text
frontend/
  index.html              # 前端入口页面
  styles.css              # SaaS 风格页面与组件样式
  src/
    app.js                # 页面组装、状态联动与本地持久化
    config.js             # 平台元信息、默认参数与 targetConfig 工具函数
    storage.js            # localStorage 持久化封装
  tests/
    targetConfig.test.js  # targetConfig 结构与更新逻辑测试
```

## 本地启动

本项目当前前端不依赖第三方业务包，也不需要安装 npm 依赖。任选一种静态服务方式启动：

```bash
python3 -m http.server 4173 --directory frontend
```

然后访问 <http://localhost:4173>。

如果只想直接预览，也可以用浏览器打开 `frontend/index.html`。

## 测试

```bash
node frontend/tests/targetConfig.test.js
```

## 环境变量

当前前端功能不需要环境变量；`.env.example` 仅保留说明占位，便于后续接入平台账号或后端 API 时扩展。

## 依赖说明

- 运行时：现代浏览器（支持 ES Modules 与 localStorage）。
- 测试：Node.js 18+（使用内置 `node:assert/strict`）。
- 无新增第三方业务依赖。

## 来源说明

本次平台选择与目标参数配置面板未复用历史业务代码、旧模板或旧 prompt；UI、`targetConfig` 数据结构与状态联动均为本仓库内原创实现。
