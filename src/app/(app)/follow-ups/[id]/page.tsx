import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageOrganizationId } from "@/server/auth/session";
import { updateFollowUpAction } from "@/server/follow-ups/actions";
import { getFollowUp } from "@/server/follow-ups/service";
import { AppError } from "@/server/shared/http-errors";

type FollowUpDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusLabels = {
  pending: "대기",
  completed: "완료",
  cancelled: "취소"
};

const statusVariants = {
  pending: "warning",
  completed: "success",
  cancelled: "danger"
} as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul"
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default async function FollowUpDetailPage({
  params
}: FollowUpDetailPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const organizationId = await requirePageOrganizationId();
  let followUp: Awaited<ReturnType<typeof getFollowUp>>;

  try {
    followUp = await getFollowUp({
      followUpId: BigInt(id),
      organizationId
    });
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[var(--primary)]"
            href="/follow-ups"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            후속관리 목록
          </Link>
          <Badge className="mt-4">후속관리 업무</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            후속관리 상세
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            마감 일정, 처리 상태, 후속 메모를 확인하고 변경합니다.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-[var(--surface-subtle)]"
          href={`/customers/${followUp.customerId}`}
        >
          고객 상세
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]">
            <CardTitle>후속관리 기록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="text-xs font-semibold text-slate-500">고객</div>
                <div className="mt-1 truncate font-semibold text-slate-950">
                  {followUp.customerName}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {followUp.customerPhone ?? "전화번호 없음"}
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="text-xs font-semibold text-slate-500">상태</div>
                <div className="mt-2">
                  <Badge variant={statusVariants[followUp.status]}>
                    {statusLabels[followUp.status]}
                  </Badge>
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="text-xs font-semibold text-slate-500">담당자</div>
                <div className="mt-1 font-semibold text-slate-950">
                  {followUp.userName ?? "미배정"}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                {followUp.title}
              </h2>
              <dl className="mt-3 grid gap-3 rounded-md border border-[var(--border)] bg-white p-4 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">마감</dt>
                  <dd className="text-right">{formatDateTime(followUp.dueAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">상담 연결</dt>
                  <dd className="min-w-0 truncate text-right">
                    {followUp.consultationContent ?? "-"}
                  </dd>
                </div>
                {followUp.completedAt ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">완료</dt>
                    <dd className="text-right">
                      {formatDateTime(followUp.completedAt)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-950">메모</h2>
              <p className="mt-2 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-white p-4 text-sm leading-6 text-slate-700">
                {followUp.memo ?? "아직 기록된 메모가 없습니다."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]">
            <CardTitle>후속관리 업데이트</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              마감 시간과 처리 상태를 놓치지 않게 정리합니다.
            </p>
          </CardHeader>
          <CardContent>
            <form action={updateFollowUpAction} className="space-y-4">
              <input name="followUpId" type="hidden" value={followUp.id} />
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">할 일</span>
                <input
                  className="form-input w-full"
                  defaultValue={followUp.title}
                  name="title"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">마감</span>
                <input
                  className="form-input w-full"
                  defaultValue={toDateTimeLocal(followUp.dueAt)}
                  name="dueAt"
                  required
                  type="datetime-local"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">상태</span>
                <select
                  className="form-select w-full"
                  defaultValue={followUp.status}
                  name="status"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">메모</span>
                <textarea
                  className="form-textarea w-full"
                  defaultValue={followUp.memo ?? ""}
                  name="memo"
                  placeholder="다음 확인 사항"
                />
              </label>
              <div className="border-t border-[var(--border)] pt-5">
                <Button className="w-full" type="submit">
                  <Save aria-hidden="true" className="h-4 w-4" />
                  변경 저장
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
