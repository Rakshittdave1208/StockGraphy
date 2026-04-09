import { Outlet } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  useSocket();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="app-scrollbar app-scroll-surface flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
