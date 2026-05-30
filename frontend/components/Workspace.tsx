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

const platformVersions: PlatformVersion[] = [
  {
    id: "wechat-v1",
    platform: "wechat",
    platformName: "公众号",
    title: "深度图文版",
    summary: "确认后的长文版本，保留观点、结构化小标题和品牌关键词。",
    metric: "长文 · 品牌关键词",
  },
  {
    id: "zhihu-v1",
    platform: "zhihu",
    platformName: "知乎",
    title: "问答拆解版",
    summary: "用于演示理性分析口吻，强调问题背景、拆解逻辑和可信结论。",
    metric: "中长文 · 领域话题",
  },
  {
    id: "xiaohongshu-v1",
    platform: "xiaohongshu",
    platformName: "小红书",
    title: "种草笔记版",
    summary: "用于演示轻量内容发布，包含情绪价值标题和热词标签。",
    metric: "短文 · 热词标签",
  },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export function Workspace() {
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({});

  const completedCount = useMemo(
    () => Object.values(publishResults).filter((result) => result.status === "success").length,
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

      setPublishResults((current) => ({
        ...current,
        [version.id]: {
          status: payload.data.status === "success" ? "success" : "failed",
          task: payload.data,
          error: payload.data.error,
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
    <main className="flex min-h-[34rem] flex-1 flex-col rounded-3xl border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Generate → Confirm → Publish
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">模拟发布工作台</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            这里不接入真实平台接口，只调用后端 mock publish 任务，演示平台版本确认后的一键发布闭环和状态反馈。
          </p>
        </div>
        <div className="flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-500">
          <span className="rounded-full bg-white px-4 py-2 text-brand-700 shadow-sm">
            已确认 {platformVersions.length}
          </span>
          <span className="px-4 py-2">已成功 {completedCount}</span>
        </div>
      </div>

      <div className="grid flex-1 gap-4 py-5 lg:grid-cols-3">
        {platformVersions.map((version) => {
          const result = publishResults[version.id] ?? { status: "idle" as const };
          const isPublishing = result.status === "publishing";

          return (
            <article
              key={version.id}
              className="flex min-h-64 flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5"
            >
              <div>
                <div className="mb-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                  {version.platformName}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{version.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{version.summary}</p>
                <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
                  {version.metric}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <PublishStatusPanel result={result} />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="flex-1 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    disabled={isPublishing}
                    onClick={() => publishVersion(version)}
                  >
                    {isPublishing ? "发布中..." : "一键模拟发布"}
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>

      <PublishHistory />

      <section className="rounded-3xl border border-dashed border-brand-100 bg-brand-50/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-brand-700">发布闭环说明</h3>
            <p className="mt-1 text-sm text-slate-600">
              发布按钮会创建 mock 任务并返回任务 ID、平台、时间戳和最终状态；“模拟失败”用于演示明确失败提示。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-500">
            <span className="rounded-2xl bg-white px-3 py-2">生成</span>
            <span className="rounded-2xl bg-white px-3 py-2">确认</span>
            <span className="rounded-2xl bg-white px-3 py-2">发布</span>
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
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
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
