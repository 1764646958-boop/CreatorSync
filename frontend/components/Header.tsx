const navItems = [
  { label: "工作台", href: "#workspace" },
  { label: "平台预览", href: "#platform-preview" },
  { label: "发布历史", href: "#publish-history" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 px-4 py-4 shadow-sm shadow-indigo-100/40 backdrop-blur-xl lg:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <a className="flex items-center gap-3" href="#workspace" aria-label="CreatorSync home">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-indigo-200">
            CS
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
              CreatorSync
            </p>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">
              多平台内容发布助手
            </h1>
          </div>
        </a>

        <nav
          className="flex gap-2 overflow-x-auto rounded-full bg-slate-100/80 p-1 text-sm font-semibold text-slate-500"
          aria-label="Primary navigation"
        >
          {navItems.map((item, index) => (
            <a
              key={item.label}
              className={`whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white hover:text-slate-900 hover:shadow-sm ${index === 0 ? "bg-white text-brand-700 shadow-sm" : ""}`}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            Demo ready
          </div>
          <a
            href="#platform-preview"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            查看演示流程
          </a>
        </div>
      </div>
    </header>
  );
}
