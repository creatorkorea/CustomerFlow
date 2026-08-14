import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  children: React.ReactNode;
  unreadNotificationCount?: number;
  userName?: string | null;
};

export function AppShell({
  children,
  unreadNotificationCount = 0,
  userName
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          unreadNotificationCount={unreadNotificationCount}
          userName={userName}
        />
        <main className="flex-1 px-4 py-5 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
