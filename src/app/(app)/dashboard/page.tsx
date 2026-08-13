import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  MessageSquareText,
  Plus,
  Users
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "오늘 예약", value: "0", icon: CalendarDays },
  { label: "신규 고객", value: "0", icon: Users },
  { label: "후속 연락", value: "0", icon: ClipboardList },
  { label: "미완료 상담", value: "0", icon: MessageSquareText }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Phase 1</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            오늘 해야 할 일
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            고객, 상담, 예약, 후속관리 흐름을 이 대시보드에서 시작합니다.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            href="/customers/new"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            고객 추가
          </Link>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm opacity-70"
            disabled
            type="button"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            상담 등록
          </button>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{stat.label}</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-950">{stat.value}</div>
                <div className="mt-1 text-xs text-slate-500">오늘 기준</div>
              </CardContent>
            </Card>
          );
        })}
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 일정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
              아직 등록된 예약이 없습니다. 고객 등록 후 예약을 추가하세요.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>후속 연락 필요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              아직 예정된 후속 연락이 없습니다.
            </p>
            <div className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20">
              상담 기능이 연결되면 후속 연락 큐가 이곳에 표시됩니다.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
