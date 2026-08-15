"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Tags,
  Users
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객", icon: Users },
  { href: "/consultations", label: "상담", icon: MessageSquareText },
  { href: "/reservations", label: "예약", icon: CalendarDays },
  { href: "/follow-ups", label: "후속관리", icon: ClipboardList },
  { href: "/tags", label: "태그", icon: Tags },
  { href: "/notifications", label: "알림", icon: Bell },
  { href: "/settings/business", label: "설정", icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-64 shrink-0 border-r border-[var(--border)] bg-white md:block">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-5">
        <Link
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950"
          href="/dashboard"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-black text-white shadow-[inset_0_-8px_18px_rgb(0_111_106/0.45)]">
            C
          </span>
          CustomerFlow
        </Link>
      </div>
      <nav className="space-y-1.5 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-[0_1px_2px_rgb(15_23_42/0.08)]"
                  : "text-slate-600 hover:bg-[var(--muted)] hover:text-slate-950"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-4 mx-3 hidden w-[14.5rem] rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm text-slate-600 xl:block">
        <div className="font-semibold text-slate-950">오늘의 운영 흐름</div>
        <div className="mt-1 leading-5">고객, 상담, 예약, 후속관리를 한 흐름으로 관리합니다.</div>
      </div>
    </aside>
  );
}
