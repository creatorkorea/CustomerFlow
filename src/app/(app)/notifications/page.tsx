import Link from "next/link";
import { Bell, CheckCheck, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requirePageUser } from "@/server/auth/session";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/server/notifications/actions";
import { listNotifications } from "@/server/notifications/service";
import { listNotificationsSchema } from "@/server/notifications/validation";

type NotificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

export default async function NotificationsPage({
  searchParams
}: NotificationsPageProps) {
  const user = await requirePageUser();
  if (!user.organizationId) {
    throw new Error("사업장 권한을 확인할 수 없습니다.");
  }

  const params = await searchParams;
  const parsed = listNotificationsSchema.parse({
    unreadOnly: firstParam(params.unreadOnly)
  });
  const { notifications, total, unreadCount } = await listNotifications({
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    ...parsed
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Notifications</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            알림
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            담당자에게 생성된 후속관리와 처리 알림을 확인합니다.
          </p>
        </div>
        <form action={markAllNotificationsReadAction}>
          <Button
            className="w-full sm:w-auto"
            disabled={unreadCount === 0}
            type="submit"
            variant="outline"
          >
            <CheckCheck aria-hidden="true" className="h-4 w-4" />
            모두 읽음
          </Button>
        </form>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">전체 알림</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">{total}</div>
            </div>
            <Badge variant="neutral">전체</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">읽지 않음</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {unreadCount}
              </div>
            </div>
            <Badge variant={unreadCount > 0 ? "warning" : "success"}>
              {unreadCount > 0 ? "확인 필요" : "정리됨"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">현재 보기</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {parsed.unreadOnly ? "미확인" : "전체"}
              </div>
            </div>
            <Badge>필터</Badge>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <Inbox aria-hidden="true" className="h-10 w-10 text-teal-700" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                아직 확인할 알림이 없습니다.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                후속관리가 등록되면 담당자 알림으로 쌓입니다.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {notifications.map((notification) => (
                <li
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-teal-50/40 sm:flex-row sm:items-center sm:justify-between"
                  key={notification.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Bell
                        aria-hidden="true"
                        className="h-4 w-4 text-teal-700"
                      />
                      <h2 className="font-semibold text-slate-950">
                        {notification.title}
                      </h2>
                      <Badge
                        variant={notification.readAt ? "neutral" : "warning"}
                      >
                        {notification.readAt ? "읽음" : "새 알림"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {notification.linkUrl ? (
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                        href={notification.linkUrl}
                      >
                        관련 화면 열기
                      </Link>
                    ) : null}
                    {notification.readAt ? null : (
                      <form action={markNotificationReadAction}>
                        <input
                          name="notificationId"
                          type="hidden"
                          value={notification.id}
                        />
                        <Button
                          className="w-full sm:w-auto"
                          type="submit"
                          variant="outline"
                        >
                          읽음 처리
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
