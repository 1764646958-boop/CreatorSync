const channels = [
  { name: "LinkedIn", tone: "Professional", active: true },
  { name: "X / Twitter", tone: "Concise", active: true },
  { name: "Instagram", tone: "Visual-first", active: false },
];

export function Sidebar() {
  return (
    <aside className="flex min-h-[34rem] flex-col gap-5 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur xl:min-h-0">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          Input
        </p>
        <h2 className="mt-2 text-2xl font-bold text-ink">Content Brief</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Placeholder panel for source ideas, campaign notes, and platform
          preferences. Business logic will be connected in a later PR.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
        <label
          className="text-sm font-semibold text-slate-700"
          htmlFor="source-content"
        >
          Source content
        </label>
        <textarea
          id="source-content"
          className="mt-3 min-h-40 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          placeholder="Paste a draft, outline, or campaign idea here..."
        />
      </div>

      <section className="space-y-3" aria-label="Target channels">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Target channels</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            Placeholder
          </span>
        </div>
        {channels.map((channel) => (
          <div
            key={channel.name}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3"
          >
            <div>
              <p className="font-semibold text-slate-800">{channel.name}</p>
              <p className="text-sm text-slate-500">{channel.tone} tone</p>
            </div>
            <span
              className={`h-3 w-3 rounded-full ${channel.active ? "bg-emerald-400" : "bg-slate-300"}`}
            />
          </div>
        ))}
      </section>
    </aside>
  );
}
