const navItems = [
  { label: "Dashboard", href: "#" },
  { label: "History", href: "#publish-history" },
  { label: "Campaigns", href: "#" },
  { label: "Calendar", href: "#" },
  { label: "Analytics", href: "#" },
];

export function Header() {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-indigo-200">
          CS
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
            CreatorSync
          </p>
          <h1 className="text-xl font-bold text-ink">
            Publishing Command Center
          </h1>
        </div>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto text-sm font-medium text-slate-500"
        aria-label="Primary navigation"
      >
        {navItems.map((item, index) => (
          <a
            key={item.label}
            className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 ${index === 0 ? "bg-brand-50 text-brand-700" : ""}`}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 sm:block">
          Draft mode
        </div>
        <button
          type="button"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          New Post
        </button>
      </div>
    </header>
  );
}
