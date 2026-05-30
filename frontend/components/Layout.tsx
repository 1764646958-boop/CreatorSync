import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatusBar } from "@/components/StatusBar";
import { Workspace } from "@/components/Workspace";

export function Layout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col overflow-hidden border-x border-white/70 bg-white/30 shadow-2xl shadow-indigo-100/60">
      <Header />
      <div className="flex flex-1 flex-col gap-5 p-4 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:p-6 xl:grid-cols-[25rem_minmax(0,1fr)]">
        <Sidebar />
        <Workspace />
      </div>
      <StatusBar />
    </div>
  );
}
