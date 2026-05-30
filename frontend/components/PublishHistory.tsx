"use client";

import { useEffect, useMemo, useState } from "react";

type PublishHistoryStatus = "rewritten" | "ready" | "needs_review" | "unsupported" | "failed";

interface PublishHistoryRecord {
  id: string;
  platform: string;
  publishedAt: string;
  title: string;
  summary: string;
  status: PublishHistoryStatus;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

const statusLabels: Record<PublishHistoryStatus, string> = {
  rewritten: "已改写",
  ready: "模拟发布成功",
  needs_review: "需复核",
  unsupported: "暂不支持",
  failed: "失败",
};

const statusClasses: Record<PublishHistoryStatus, string> = {
  rewritten: "bg-brand-50 text-brand-700",
  ready: "bg-emerald-50 text-emerald-700",
  needs_review: "bg-amber-50 text-amber-700",
  unsupported: "bg-slate-100 text-slate-600",
  failed: "bg-rose-50 text-rose-700",
};

export function PublishHistory() {
  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );
  const [records, setRecords] = useState<PublishHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`${apiBaseUrl}/history`, { cache: "no-store" });
        const payload = (await response.json()) as ApiResponse<PublishHistoryRecord[]>;

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message ?? "无法读取发布历史");
        }

        if (isMounted) {
          setRecords(payload.data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "无法读取发布历史");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  return (
    <section
      className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      id="publish-history"
      aria-labelledby="publish-history-title"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Step 6 · History
          </p>
          <h3 id="publish-history-title" className="mt-2 text-xl font-black text-ink">
            发布历史与导出
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            展示后端保存的平台改写/模拟发布结果；评审可直接导出 Markdown 或 JSON 复盘 Demo。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700"
            href={`${apiBaseUrl}/history/export?format=markdown`}
          >
            导出 Markdown
          </a>
          <a
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700"
            href={`${apiBaseUrl}/history/export?format=json`}
          >
            导出 JSON
          </a>
        </div>
      </div>

      {isLoading ? (
        <HistoryLoadingState />
      ) : errorMessage ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <p className="font-bold">历史接口暂不可用</p>
          <p className="mt-1">
            {errorMessage}。请确认后端服务已启动；页面其他 Demo 区域仍可用于说明产品流程。
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
          <p className="font-bold text-slate-800">暂无历史记录</p>
          <p className="mt-1">
            调用平台改写接口后，这里会显示平台、发布时间、标题、摘要和状态；空状态保留明确指引，便于本地首次打开 Demo。
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">平台</th>
                <th className="whitespace-nowrap px-4 py-3">发布时间</th>
                <th className="whitespace-nowrap px-4 py-3">标题</th>
                <th className="px-4 py-3">摘要</th>
                <th className="whitespace-nowrap px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {records.map((record) => (
                <tr key={record.id} className="transition hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-900">
                    {record.platform}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {new Date(record.publishedAt).toLocaleString("zh-CN")}
                  </td>
                  <td className="min-w-48 px-4 py-4 font-semibold text-slate-800">
                    {record.title}
                  </td>
                  <td className="min-w-72 px-4 py-4 leading-6">{record.summary}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[record.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {statusLabels[record.status] ?? record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function HistoryLoadingState() {
  return (
    <div className="mt-4 space-y-3" aria-label="正在读取历史记录">
      {[0, 1, 2].map((item) => (
        <div key={item} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[8rem_10rem_minmax(0,1fr)]">
          <span className="h-4 animate-pulse rounded-full bg-slate-200" />
          <span className="h-4 animate-pulse rounded-full bg-slate-200" />
          <span className="h-4 animate-pulse rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
