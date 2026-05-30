const statusItems = [
  "No API connected",
  "Autosave placeholder",
  "Responsive shell ready",
];

export function StatusBar() {
  return (
    <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-500 backdrop-blur md:flex-row md:items-center md:justify-between lg:px-6">
      <p className="font-semibold text-slate-700">
        CreatorSync workspace status
      </p>
      <div className="flex flex-wrap gap-2">
        {statusItems.map((item) => (
          <span
            key={item}
            className="rounded-full bg-slate-100 px-3 py-1 font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </footer>
  );
}
