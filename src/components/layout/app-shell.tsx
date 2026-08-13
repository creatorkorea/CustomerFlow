import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  children: React.ReactNode;
  userName?: string | null;
};

export function AppShell({ children, userName }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader userName={userName} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
