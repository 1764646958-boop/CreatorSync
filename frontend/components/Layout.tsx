import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatusBar } from "@/components/StatusBar";
import { Workspace } from "@/components/Workspace";

export function Layout() {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <div
        className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[23rem_minmax(0,1fr)] lg:px-6 xl:grid-cols-[26rem_minmax(0,1fr)]"
        id="workspace"
      >
        <Sidebar />
        <Workspace />
      </div>
      <StatusBar />
    </div>
  );
}
