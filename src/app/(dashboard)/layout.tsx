import { Header } from "@/features/layout/components/Header";
import { HeaderProvider } from "@/features/layout/components/HeaderContext";
import { Sidebar } from "@/features/layout/components/Sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main id="dashboard-scroll" className="flex-1 overflow-y-auto px-8 py-4">
            <div className="mx-auto w-full max-w-[1800px]">{children}</div>
          </main>
        </div>
      </div>
    </HeaderProvider>
  );
}
