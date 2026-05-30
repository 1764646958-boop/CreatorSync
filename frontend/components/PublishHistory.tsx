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
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      id="publish-history"
      aria-labelledby="publish-history-title"
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            History
          </p>
          <h3 id="publish-history-title" className="mt-2 text-xl font-bold text-ink">
            发布历史与导出
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            保存每次平台改写/模拟发布结果，支持 Demo 时一键导出 Markdown 或 JSON。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            href={`${apiBaseUrl}/history/export?format=markdown`}
          >
            导出 Markdown
          </a>
          <a
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            href={`${apiBaseUrl}/history/export?format=json`}
          >
            导出 JSON
          </a>
        </div>
      </div>

      {isLoading ? (
        <p className="py-6 text-sm text-slate-500">正在读取历史记录...</p>
      ) : errorMessage ? (
        <p className="py-6 text-sm text-amber-700">
          暂时无法连接历史接口：{errorMessage}。请确认后端服务已启动。
        </p>
      ) : records.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">
          暂无记录。调用平台改写接口后，这里会显示平台、发布时间、标题、摘要和状态。
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="whitespace-nowrap px-3 py-2">平台</th>
                <th className="whitespace-nowrap px-3 py-2">发布时间</th>
                <th className="whitespace-nowrap px-3 py-2">标题</th>
                <th className="px-3 py-2">摘要</th>
                <th className="whitespace-nowrap px-3 py-2">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">
                    {record.platform}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(record.publishedAt).toLocaleString("zh-CN")}
                  </td>
                  <td className="min-w-48 px-3 py-3 font-medium text-slate-800">
                    {record.title}
                  </td>
                  <td className="min-w-72 px-3 py-3 leading-6">{record.summary}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
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
