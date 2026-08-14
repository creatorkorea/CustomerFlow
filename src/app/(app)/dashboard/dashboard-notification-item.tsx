import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DashboardNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  createdAtLabel: string;
};

type DashboardNotificationItemProps = {
  markReadAction: (formData: FormData) => void | Promise<void>;
  notification: DashboardNotification;
};

export function DashboardNotificationItem({
  markReadAction,
  notification
}: DashboardNotificationItemProps) {
  const actionHref = notification.linkUrl ?? "/notifications";
  const actionLabel = notification.linkUrl ? "관련 화면" : "전체 알림";

  return (
    <div className="rounded-md border border-[var(--border)] bg-white px-3 py-3 transition-colors hover:border-teal-300 hover:bg-teal-50/50">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-950">
            {notification.title}
          </div>
          <div className="mt-1 line-clamp-2 text-sm text-slate-600">
            {notification.message}
          </div>
        </div>
        <Badge variant="neutral">{notification.type}</Badge>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">{notification.createdAtLabel}</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
            href={actionHref}
          >
            {actionLabel}
          </Link>
          <form action={markReadAction}>
            <input name="notificationId" type="hidden" value={notification.id} />
            <Button
              className="w-full sm:w-auto"
              size="sm"
              type="submit"
              variant="outline"
            >
              <Check aria-hidden="true" className="h-4 w-4" />
              읽음 처리
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
