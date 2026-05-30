const statusItems = [
  { label: "输入", value: "示例草稿已填充" },
  { label: "改写", value: "Mock fallback 可复现" },
  { label: "发布", value: "仅模拟不触达真实平台" },
];

export function StatusBar() {
  return (
    <footer className="border-t border-white/70 bg-white/85 px-4 py-4 text-sm text-slate-500 shadow-[0_-12px_40px_rgba(99,102,241,0.08)] backdrop-blur-xl lg:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold text-slate-800">CreatorSync workspace status</p>
          <p className="mt-1 text-xs text-slate-500">
            当前首页展示输入—选择平台—改写—预览—发布—历史的完整 Demo 闭环。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusItems.map((item) => (
            <span
              key={item.label}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium shadow-sm"
            >
              <span className="text-slate-900">{item.label}</span> · {item.value}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
