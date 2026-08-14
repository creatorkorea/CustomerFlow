import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  MessageSquareText,
  Bell,
  Plus,
  Users
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/server/auth/session";
import { getDashboardOverview } from "@/server/dashboard/service";
import { markNotificationReadAction } from "@/server/notifications/actions";
import { DashboardActivityItem } from "./dashboard-activity-item";
import { DashboardNotificationItem } from "./dashboard-notification-item";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const user = await requirePageUser();

  if (!user.organizationId) {
    redirect("/login");
  }

  const overview = await getDashboardOverview({
    organizationId: BigInt(user.organizationId)
  });
  const stats = [
    {
      label: "오늘 예약",
      value: overview.metrics.todayReservations.toString(),
      icon: CalendarDays
    },
    {
      label: "신규 고객",
      value: overview.metrics.newCustomers.toString(),
      icon: Users
    },
    {
      label: "후속 연락",
      value: overview.metrics.pendingFollowUps.toString(),
      icon: ClipboardList
    },
    {
      label: "미완료 상담",
      value: overview.metrics.openConsultations.toString(),
      icon: MessageSquareText
    },
    {
      label: "미확인 알림",
      value: overview.metrics.unreadNotifications.toString(),
      icon: Bell
    }
  ];

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
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            href="/consultations/new"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            상담 등록
          </Link>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card className="min-w-0" key={stat.label}>
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
      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>오늘의 일정</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.todayReservations.length === 0 ? (
              <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
                오늘 예정된 예약이 없습니다. 고객 등록 후 예약을 추가하세요.
              </p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {overview.todayReservations.map((reservation) => (
                  <Link
                    className="flex items-center justify-between gap-4 py-3 hover:text-teal-700"
                    href={`/customers/${reservation.customerId}`}
                    key={reservation.id}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-950">
                        {reservation.title}
                      </div>
                      <div className="mt-1 truncate text-sm text-slate-500">
                        {reservation.customerName}
                        {reservation.customerPhone
                          ? ` / ${reservation.customerPhone}`
                          : ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-teal-700">
                      {formatTime(reservation.startAt)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>최근 상담</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentConsultations.length === 0 ? (
              <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
                최근 상담 기록이 없습니다. 상담 등록으로 고객 흐름을 시작하세요.
              </p>
            ) : (
              <div className="space-y-3">
                {overview.recentConsultations.map((consultation) => (
                  <Link
                    className="block rounded-md border border-[var(--border)] bg-white px-3 py-3 transition-colors hover:border-teal-300 hover:bg-teal-50/50"
                    href={`/customers/${consultation.customerId}`}
                    key={consultation.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-950">
                          {consultation.customerName}
                          {consultation.customerPhone
                            ? ` / ${consultation.customerPhone}`
                            : ""}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {consultation.content}
                        </div>
                      </div>
                      <Badge variant="neutral">{consultation.status}</Badge>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        다음 액션: {consultation.nextAction ?? "미정"}
                      </span>
                      <span>{formatDateTime(consultation.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>후속 연락 필요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.pendingFollowUps.length === 0 ? (
              <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
                오늘까지 처리할 후속 연락이 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {overview.pendingFollowUps.map((followUp) => (
                  <Link
                    className="block rounded-md border border-[var(--border)] bg-white px-3 py-3 hover:border-teal-300 hover:bg-teal-50/50"
                    href={`/customers/${followUp.customerId}`}
                    key={followUp.id}
                  >
                    <div className="truncate text-sm font-semibold text-slate-950">
                      {followUp.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {followUp.customerName} · 마감 {formatTime(followUp.dueAt)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>미확인 알림</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.unreadNotifications.length === 0 ? (
              <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
                확인하지 않은 알림이 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {overview.unreadNotifications.map((notification) => (
                  <DashboardNotificationItem
                    key={notification.id}
                    markReadAction={markNotificationReadAction}
                    notification={{
                      ...notification,
                      createdAtLabel: formatDateTime(notification.createdAt)
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentActivities.length === 0 ? (
              <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
                아직 표시할 활동이 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {overview.recentActivities.map((activity) => (
                  <DashboardActivityItem
                    activity={{
                      ...activity,
                      createdAtLabel: formatDateTime(activity.createdAt)
                    }}
                    key={activity.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
