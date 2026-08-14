import Link from "next/link";
import { Bell, LogOut, Search } from "lucide-react";

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
    <header className="flex h-16 items-center gap-3 border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur md:px-6">
      <form
        action="/customers"
        className="relative max-w-3xl flex-1"
        method="get"
        role="search"
      >
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          aria-label="고객 또는 전화번호 검색"
          className="border-[var(--border-strong)] bg-white pl-9 shadow-[0_1px_2px_rgb(15_23_42/0.035)]"
          name="search"
          placeholder="고객명, 전화번호, 이메일 검색..."
          type="search"
        />
      </form>
      <Link
        aria-label="알림"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-white text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)]"
        href="/notifications"
      >
        <Bell aria-hidden="true" className="h-4 w-4" />
        {unreadNotificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        ) : null}
      </Link>
      <div className="hidden items-center gap-3 border-l border-[var(--border)] pl-3 sm:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {initials}
        </div>
        <div className="min-w-20 text-sm leading-tight">
          <div className="font-semibold text-slate-900">{userName ?? "사용자"}</div>
          <div className="text-xs text-slate-500">관리자</div>
        </div>
      </div>
      <form action={logoutAction}>
        <Button aria-label="로그아웃" size="icon" type="submit" variant="ghost">
          <LogOut aria-hidden="true" className="h-4 w-4" />
        </Button>
      </form>
    </header>
  );
}
