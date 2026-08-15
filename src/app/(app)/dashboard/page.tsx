import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  MessageSquareText,
  Bell,
  Plus,
  Users,
  ArrowRight
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageTenantUser } from "@/server/auth/session";
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
  const user = await requirePageTenantUser();

  const overview = await getDashboardOverview({
    organizationId: user.organizationId
  });
  const stats = [
    {
      label: "오늘 예약",
      value: overview.metrics.todayReservations.toString(),
      helper: "시간 확인",
      icon: CalendarDays
    },
    {
      label: "신규 고객",
      value: overview.metrics.newCustomers.toString(),
      helper: "이번 달",
      icon: Users
    },
    {
      label: "후속 연락",
      value: overview.metrics.pendingFollowUps.toString(),
      helper: "처리 필요",
      icon: ClipboardList
    },
    {
      label: "미완료 상담",
      value: overview.metrics.openConsultations.toString(),
      helper: "전환 대기",
      icon: MessageSquareText
    },
    {
      label: "미확인 알림",
      value: overview.metrics.unreadNotifications.toString(),
      helper: "읽음 필요",
      icon: Bell
    }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-white px-5 py-5 shadow-[0_1px_2px_rgb(15_23_42/0.035)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge>오늘의 운영</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            오늘 해야 할 일
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            고객 문의부터 상담, 예약, 후속 연락까지 오늘의 흐름을 한눈에 확인하세요.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 xl:w-auto">
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(15_23_42/0.08)] hover:bg-[var(--primary-hover)]"
            href="/customers/new"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            고객 추가
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            href="/consultations/new"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            상담 등록
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            href="/reservations/new"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            예약 등록
          </Link>
        </div>
        </div>
      </div>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card className="min-w-0 overflow-hidden" key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{stat.label}</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-3xl font-semibold tracking-tight text-slate-950">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  {stat.helper}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="min-w-0">
          <CardHeader className="border-b border-[var(--border)]">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>오늘의 일정</CardTitle>
              <Link
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                href="/reservations"
              >
                전체 보기
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>
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
                    className="flex items-center justify-between gap-4 py-3 hover:text-[var(--primary)]"
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
                    <div className="shrink-0 text-sm font-semibold text-[var(--primary)]">
                      {formatTime(reservation.startAt)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0 xl:row-span-2">
          <CardHeader className="border-b border-[var(--border)]">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>후속 연락 필요</CardTitle>
              <Link
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                href="/follow-ups"
              >
                전체 보기
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>
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
                    className="block rounded-md border border-[var(--border)] bg-white px-3 py-3 hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)]"
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
          <CardHeader className="border-b border-[var(--border)]">
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
                    className="block rounded-md border border-[var(--border)] bg-white px-3 py-3 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)]"
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
          <CardHeader className="border-b border-[var(--border)]">
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
          <CardHeader className="border-b border-[var(--border)]">
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
