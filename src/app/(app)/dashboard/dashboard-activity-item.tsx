import Link from "next/link";

import { Badge } from "@/components/ui/badge";

type DashboardActivity = {
  id: string;
  actionLabel: string;
  entityLabel: string;
  userName: string | null;
  createdAtLabel: string;
  href: string | null;
};

type DashboardActivityItemProps = {
  activity: DashboardActivity;
};

const activityClassName =
  "block rounded-md border border-[var(--border)] bg-white px-3 py-3 transition-colors hover:border-teal-300 hover:bg-teal-50/50";

function ActivityContent({ activity }: DashboardActivityItemProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 truncate text-sm font-semibold text-slate-950">
          {activity.actionLabel}
        </div>
        <Badge variant="neutral">{activity.entityLabel}</Badge>
      </div>
      <div className="mt-1 truncate text-xs text-slate-500">
        {activity.userName ?? "시스템"} · {activity.createdAtLabel}
      </div>
    </>
  );
}

export function DashboardActivityItem({ activity }: DashboardActivityItemProps) {
  if (activity.href) {
    return (
      <Link className={activityClassName} href={activity.href}>
        <ActivityContent activity={activity} />
      </Link>
    );
  }

  return (
    <div className={activityClassName}>
      <ActivityContent activity={activity} />
    </div>
  );
}
