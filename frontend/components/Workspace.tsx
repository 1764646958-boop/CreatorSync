const previewCards = [
  {
    platform: "LinkedIn",
    title: "Thought leadership post",
    metric: "1,200 char target",
  },
  {
    platform: "X / Twitter",
    title: "Thread outline",
    metric: "5 post sequence",
  },
  {
    platform: "Instagram",
    title: "Caption concept",
    metric: "Visual prompt ready",
  },
];

export function Workspace() {
  return (
    <main className="flex min-h-[34rem] flex-1 flex-col rounded-3xl border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Preview
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            Multi-platform Workspace
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review-ready placeholders show where AI rewrites, platform previews,
            and publishing preparation will live in future iterations.
          </p>
        </div>
        <div className="flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-500">
          <span className="rounded-full bg-white px-4 py-2 text-brand-700 shadow-sm">
            Preview
          </span>
          <span className="px-4 py-2">Schedule</span>
        </div>
      </div>

      <div className="grid flex-1 gap-4 py-5 lg:grid-cols-3">
        {previewCards.map((card) => (
          <article
            key={card.platform}
            className="flex min-h-48 flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5"
          >
            <div>
              <div className="mb-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                {card.platform}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Generated content preview placeholder with platform-specific
                formatting, tone guidance, and approval states.
              </p>
            </div>
            <p className="mt-6 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
              {card.metric}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-dashed border-brand-100 bg-brand-50/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-brand-700">Publishing readiness</h3>
            <p className="mt-1 text-sm text-slate-600">
              Placeholder checklist for approvals, assets, and channel-specific
              constraints.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-500">
            <span className="rounded-2xl bg-white px-3 py-2">Draft</span>
            <span className="rounded-2xl bg-white px-3 py-2">Review</span>
            <span className="rounded-2xl bg-white px-3 py-2">Ready</span>
          </div>
        </div>
      </section>
    </main>
  );
}
