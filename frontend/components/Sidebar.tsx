const channels = [
  { name: "小红书", tone: "轻量种草", active: true, note: "标题更抓眼，保留标签" },
  { name: "知乎", tone: "理性拆解", active: true, note: "突出问题、方法与结论" },
  { name: "公众号", tone: "深度图文", active: true, note: "适合品牌案例和长文结构" },
  { name: "Bilibili", tone: "视频脚本", active: false, note: "作为后续扩展预览" },
];

const demoSteps = ["输入原始草稿", "选择目标平台", "生成平台版本", "预览并确认"];

export function Sidebar() {
  return (
    <aside className="flex min-h-[34rem] flex-col gap-5 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-xl xl:min-h-0">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          Step 1 · Input
        </p>
        <h2 className="mt-2 text-2xl font-bold text-ink">Demo 内容简报</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          使用默认示例即可录制演示：从一份产品更新草稿出发，快速生成适合不同平台的版本。
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-sm font-bold text-slate-800"
            htmlFor="source-content"
          >
            Source content
          </label>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            已准备示例
          </span>
        </div>
        <textarea
          id="source-content"
          className="mt-3 min-h-56 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          defaultValue={`CreatorSync 本周发布 Demo 版：\n\n我们把一篇原始内容整理成统一草稿，并根据小红书、知乎、公众号等渠道自动生成不同语气和结构的版本。\n\n演示重点：\n- 保留核心卖点：减少重复改写\n- 统一预览：发布前快速比较平台版本\n- Mock 发布：不依赖真实平台权限也能展示闭环\n\n目标受众：内容创作者、品牌运营、新媒体团队。`}
        />
      </div>

      <section className="space-y-3" aria-label="Target channels">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
              Step 2 · Platforms
            </p>
            <h3 className="mt-1 font-bold text-slate-900">目标平台</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            3 个已选
          </span>
        </div>
        {channels.map((channel) => (
          <div
            key={channel.name}
            className={`rounded-2xl border p-4 transition ${
              channel.active
                ? "border-brand-100 bg-brand-50/70 shadow-sm"
                : "border-slate-100 bg-white opacity-70"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">{channel.name}</p>
                <p className="mt-1 text-sm text-slate-500">{channel.tone} · {channel.note}</p>
              </div>
              <span
                className={`h-3 w-3 rounded-full ${channel.active ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" : "bg-slate-300"}`}
                aria-label={channel.active ? "selected" : "not selected"}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-dashed border-brand-200 bg-white/70 p-4">
        <h3 className="font-bold text-slate-900">演示顺序</h3>
        <ol className="mt-3 space-y-3">
          {demoSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-3 text-sm text-slate-600">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
