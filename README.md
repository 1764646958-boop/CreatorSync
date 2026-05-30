# CreatorSync

CreatorSync 是一个多平台内容发布助手。本仓库当前提供前端内容输入器，用于整理统一草稿，并在浏览器本地恢复输入内容。

## 功能

- 标题输入
- 正文输入
- 标签输入
- 使用 `localStorage` 自动保存统一 draft 数据结构
- 页面刷新后自动恢复本地草稿
- 输入为空时显示提示

## 本地运行

本项目当前不需要安装第三方业务依赖，使用浏览器原生能力和静态文件即可运行。

```bash
npm run dev
```

启动后访问 <http://localhost:5173>。

## 测试

```bash
npm test
```

## 环境变量

当前功能不需要环境变量。

## draft 数据结构

本地草稿保存在 `localStorage` 的 `creatorsync:draft` 键下：

```json
{
  "version": 1,
  "title": "示例：新品上线预告",
  "body": "今天准备发布一条新品上线内容。先在 CreatorSync 中整理标题、正文和标签，刷新页面后仍会恢复这份本地草稿。",
  "tags": ["新品", "内容发布", "CreatorSync"],
  "updatedAt": "2026-05-30T00:00:00.000Z"
}
```

## 来源说明

未复用历史业务代码、旧模板或旧 prompt；本次实现围绕 CreatorSync 内容输入器原创完成。
