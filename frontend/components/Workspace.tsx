"use client";

import { useMemo, useState } from "react";
import { PublishHistory } from "@/components/PublishHistory";

type PublishStatus = "idle" | "publishing" | "success" | "failed";

type PlatformVersion = {
  id: string;
  platform: string;
  platformName: string;
  title: string;
  summary: string;
  metric: string;
  preview: string;
  tags: string[];
};

type PublishTask = {
  taskId: string;
  platform: string;
  platformVersionId: string;
  status: "success" | "failed";
  submittedAt: string;
  completedAt: string;
  timestamp: string;
  message: string;
  error?: string;
};

type PublishResult = {
  status: PublishStatus;
  task?: PublishTask;
  error?: string;
};

const demoFlow = [
  { label: "输入", description: "统一草稿" },
  { label: "选择平台", description: "3 个目标渠道" },
  { label: "改写", description: "生成平台语气" },
  { label: "预览", description: "对比标题与摘要" },
  { label: "发布", description: "Mock 任务反馈" },
  { label: "历史", description: "导出复盘" },
];

const platformVersions: PlatformVersion[] = [
  {
    id: "xiaohongshu-v1",
    platform: "xiaohongshu",
    platformName: "小红书",
    title: "一篇草稿发 3 个平台？CreatorSync Demo 版来了",
    summary: "把产品更新改成更适合种草场景的短笔记，突出痛点、收益和可录制的演示路径。",
    preview: "适合开场 15 秒讲清价值：少重复改写、预览更统一、没有真实平台权限也能完整演示。",
    metric: "短文 · 热词标签 · 轻量 CTA",
    tags: ["#内容运营", "#AI效率工具", "#Demo录制"],
  },
  {
    id: "zhihu-v1",
    platform: "zhihu",
    platformName: "知乎",
    title: "内容团队如何降低多平台重复改写成本？",
    summary: "用问答视角拆解创作者的重复改写、平台差异和发布前预览问题，并给出 CreatorSync 的闭环方案。",
    preview: "先解释问题来源，再展示统一草稿、平台适配器和 mock publish 如何降低本地演示门槛。",
    metric: "中长文 · 结构化论证 · 可信结论",
    tags: ["内容生产", "多平台分发", "效率工具"],
  },
  {
    id: "wechat-v1",
    platform: "wechat",
    platformName: "公众号",
    title: "CreatorSync：从统一草稿到模拟发布的内容工作台",
    summary: "保留品牌叙事和产品目标，用导语、核心能力、演示流程和总结 CTA 组成完整图文版。",
    preview: "适合评审慢速浏览：页面展示输入、平台选择、改写预览、发布状态和历史导出。",
    metric: "长文 · 品牌关键词 · 模块化段落",
    tags: ["产品更新", "内容发布助手", "工作台"],
  },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export function Workspace() {
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({});

  const completedCount = useMemo(
    () => Object.values(publishResults).filter((result) => result.status === "success").length,
    [publishResults],
  );

  const activePublishingCount = useMemo(
    () => Object.values(publishResults).filter((result) => result.status === "publishing").length,
    [publishResults],
  );

  const publishVersion = async (version: PlatformVersion, forceFail = false) => {
    setPublishResults((current) => ({
      ...current,
      [version.id]: { status: "publishing" },
    }));

    try {
      const response = await fetch(`${apiBaseUrl}/api/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: version.platform,
          platformVersionId: forceFail ? `${version.id}-mock-fail` : version.id,
          title: version.title,
          content: version.summary,
          forceFail,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        data?: PublishTask;
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "模拟发布请求失败，请检查后端服务。");
      }

      const task = payload.data;

      setPublishResults((current) => ({
        ...current,
        [version.id]: {
          status: task.status === "success" ? "success" : "failed",
          task,
          error: task.error,
        },
      }));
    } catch (error) {
      setPublishResults((current) => ({
        ...current,
        [version.id]: {
          status: "failed",
          error: error instanceof Error ? error.message : "模拟发布失败，请稍后重试。",
        },
      }));
    }
  };

  return (
    <main className="flex min-h-[34rem] flex-1 flex-col gap-5 rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-soft backdrop-blur-xl sm:p-5">
      <section className="overflow-hidden rounded-[1.75rem] border border-brand-100 bg-gradient-to-br from-white via-brand-50/70 to-cyan-50 p-5" aria-labelledby="workspace-title">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              Step 3-6 · Rewrite → Preview → Publish → History
            </p>
            <h2 id="workspace-title" className="mt-2 text-2xl font-black text-ink sm:text-3xl">
              模拟发布工作台
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              默认示例已经按照 Demo 录制顺序排好：先看统一输入，再对比平台改写结果，最后触发 mock publish 并检查历史导出。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-3">
            <span className="rounded-2xl bg-white/90 px-4 py-3 shadow-sm">已确认 {platformVersions.length}</span>
            <span className="rounded-2xl bg-white/90 px-4 py-3 shadow-sm">发布中 {activePublishingCount}</span>
            <span className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700 shadow-sm">已成功 {completedCount}</span>
          </div>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label="CreatorSync demo flow">
          {demoFlow.map((item, index) => (
            <li key={item.label} className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid flex-1 gap-4 xl:grid-cols-3" id="platform-preview" aria-label="平台改写预览">
        {platformVersions.map((version) => {
          const result = publishResults[version.id] ?? { status: "idle" as const };
          const isPublishing = result.status === "publishing";

          return (
            <article
              key={version.id}
              className="group flex min-h-80 flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-xl hover:shadow-indigo-100/60"
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                    {version.platformName}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">平台版本预览</span>
                </div>
                <h3 className="text-lg font-black leading-7 text-slate-950">{version.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{version.summary}</p>
                <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600 shadow-inner shadow-slate-100/80">
                  {version.preview}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {version.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
                  {version.metric}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <PublishStatusPanel result={result} />
                <div className="flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    disabled={isPublishing}
                    onClick={() => publishVersion(version)}
                  >
                    {isPublishing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                    {isPublishing ? "发布中..." : "一键模拟发布"}
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPublishing}
                    onClick={() => publishVersion(version, true)}
                  >
                    模拟失败
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <PublishHistory />

      <section className="rounded-[1.75rem] border border-dashed border-brand-200 bg-brand-50/70 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-brand-700">发布闭环说明</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              发布按钮会创建 mock 任务并返回任务 ID、平台、时间戳和最终状态；“模拟失败”用于演示明确失败提示，不会触达真实平台。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-500">
            <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">预览</span>
            <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">确认</span>
            <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">历史</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function PublishStatusPanel({ result }: { result: PublishResult }) {
  if (result.status === "idle") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
        待发布：确认平台版本后可发起 mock publish。
      </div>
    );
  }

  if (result.status === "publishing") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />
        发布中：后端正在创建模拟发布任务...
      </div>
    );
  }

  if (result.status === "success" && result.task) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <p className="font-bold">发布成功</p>
        <p className="mt-1 font-mono text-xs">任务 ID：{result.task.taskId}</p>
        <p className="mt-1 text-xs">
          平台：{result.task.platform} · 时间：{formatDateTime(result.task.timestamp)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <p className="font-bold">发布失败</p>
      <p className="mt-1 text-xs">{result.error ?? result.task?.message ?? "模拟发布失败，请重试。"}</p>
      {result.task ? <p className="mt-1 font-mono text-xs">任务 ID：{result.task.taskId}</p> : null}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}
