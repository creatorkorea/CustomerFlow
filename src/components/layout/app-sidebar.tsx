import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Users
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객", icon: Users },
  { href: "/consultations", label: "상담", icon: MessageSquareText },
  { href: "/reservations/calendar", label: "예약", icon: CalendarDays },
  { href: "/follow-ups", label: "후속관리", icon: ClipboardList },
  { href: "/notifications", label: "알림", icon: Bell },
  { href: "/settings/business", label: "설정", icon: Settings }
];

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-white md:block">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-5">
        <Link className="text-lg font-bold tracking-tight text-slate-950" href="/dashboard">
          CustomerFlow
        </Link>
      </div>
      <nav className="space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
