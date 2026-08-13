import { Bell, HelpCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutAction } from "@/server/auth/actions";

type AppHeaderProps = {
  unreadNotificationCount?: number;
  userName?: string | null;
};

export function AppHeader({
  unreadNotificationCount = 0,
  userName
}: AppHeaderProps) {
  const initials = (userName?.slice(0, 1) || "U").toUpperCase();

  return (
    <header className="flex h-16 items-center gap-3 border-b border-[var(--border)] bg-white px-4 md:px-6">
      <div className="relative max-w-2xl flex-1">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          aria-label="고객 또는 전화번호 검색"
          className="pl-9"
          placeholder="고객명, 전화번호, 이메일 검색"
        />
      </div>
      <Button aria-label="도움말" className="hidden sm:inline-flex" size="icon" variant="ghost">
        <HelpCircle aria-hidden="true" className="h-4 w-4" />
      </Button>
      <Button aria-label="알림" className="relative" size="icon" variant="outline">
        <Bell aria-hidden="true" className="h-4 w-4" />
        {unreadNotificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        ) : null}
      </Button>
      <div className="hidden items-center gap-3 rounded-md border border-[var(--border)] bg-white px-2 py-1 sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
          {initials}
        </div>
        <div className="min-w-20 text-sm">
          <div className="font-semibold text-slate-900">{userName ?? "사용자"}</div>
          <div className="text-xs text-slate-500">관리자</div>
        </div>
      </div>
      <form action={logoutAction}>
        <Button size="sm" type="submit" variant="ghost">
          로그아웃
        </Button>
      </form>
    </header>
  );
}
