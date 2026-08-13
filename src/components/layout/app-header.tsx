import { Bell, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AppHeaderProps = {
  userName?: string | null;
};

export function AppHeader({ userName }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-[var(--border)] bg-white px-4 md:px-6">
      <div className="relative max-w-xl flex-1">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          aria-label="고객 또는 전화번호 검색"
          className="pl-9"
          placeholder="고객명 또는 전화번호 검색"
        />
      </div>
      <Button size="sm">
        <Plus aria-hidden="true" className="h-4 w-4" />
        빠른 추가
      </Button>
      <Button aria-label="알림" size="icon" variant="outline">
        <Bell aria-hidden="true" className="h-4 w-4" />
      </Button>
      <div className="hidden min-w-20 text-right text-sm font-medium text-slate-700 sm:block">
        {userName ?? "사용자"}
      </div>
    </header>
  );
}
