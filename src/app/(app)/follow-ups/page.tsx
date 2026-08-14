import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";

import { CustomerPicker } from "@/components/forms/customer-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { requireOrganizationId } from "@/server/auth/session";
import { listCustomerPickerOptions } from "@/server/customers/picker-options";
import { updateFollowUpStatusAction } from "@/server/follow-ups/actions";
import { listFollowUps } from "@/server/follow-ups/service";
import { listFollowUpsSchema } from "@/server/follow-ups/validation";

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

type FollowUpsPageProps = {
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

export default async function FollowUpsPage({ searchParams }: FollowUpsPageProps) {
  const organizationId = await requireOrganizationId();
  const params = await searchParams;
  const parsed = listFollowUpsSchema.parse({
    customerId: firstParam(params.customerId),
    status: firstParam(params.status),
    page: firstParam(params.page)
  });
  const [{ followUps, total }, customerOptions] = await Promise.all([
    listFollowUps({
      organizationId,
      ...parsed
    }),
    listCustomerPickerOptions({
      organizationId,
      defaultCustomerId: parsed.customerId
    })
  ]);

  const pendingCount = followUps.filter(
    (followUp) => followUp.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Follow-ups</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            후속관리
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            상담과 예약 이후 놓치면 안 되는 연락, 확인, 처리 일을 관리합니다.
          </p>
        </div>
        <Link
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 sm:w-auto"
          href="/follow-ups/new"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          후속관리 등록
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">전체 할 일</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">{total}</div>
            </div>
            <Badge variant="neutral">전체</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">대기 중</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {pendingCount}
              </div>
            </div>
            <Badge variant="warning">처리 필요</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">상태</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {parsed.status ? statusLabels[parsed.status] : "전체"}
              </div>
            </div>
            <Badge variant={parsed.status ? statusVariants[parsed.status] : "default"}>
              필터
            </Badge>
          </CardContent>
        </Card>
      </section>

      <form className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)] lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <CustomerPicker
            customers={customerOptions}
            defaultCustomerId={parsed.customerId}
            required={false}
          />
        </div>
        <select className="form-select w-full sm:w-44" defaultValue={parsed.status ?? ""} name="status">
          <option value="">전체 상태</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit">검색</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {followUps.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <ClipboardCheck aria-hidden="true" className="h-10 w-10 text-teal-700" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                아직 등록된 후속관리가 없습니다.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                고객과 다시 연락할 시점이 생기면 할 일을 남기세요.
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-teal-700"
                href="/follow-ups/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />첫 후속관리 등록
              </Link>
            </div>
          ) : (
            <>
            <div
              className="space-y-3 p-4 md:hidden"
              data-mobile-list="follow-ups"
            >
              {followUps.map((followUp) => (
                <article
                  className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm"
                  data-mobile-list-item
                  key={followUp.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-950">
                        <Link
                          className="hover:text-teal-700"
                          href={`/follow-ups/${followUp.id}`}
                        >
                          {followUp.title}
                        </Link>
                      </div>
                      <Link
                        className="mt-1 block text-sm font-medium text-slate-600 hover:text-teal-700"
                        href={`/customers/${followUp.customerId}`}
                      >
                        {followUp.customerName}
                      </Link>
                    </div>
                    <Badge variant={statusVariants[followUp.status]}>
                      {statusLabels[followUp.status]}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">마감</span>
                      <span className="text-right">{formatDateTime(followUp.dueAt)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">상담 연결</span>
                      <span className="min-w-0 truncate text-right">
                        {followUp.consultationContent ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">담당자</span>
                      <span>{followUp.userName ?? "-"}</span>
                    </div>
                  </div>
                  {followUp.memo ? (
                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                      {followUp.memo}
                    </div>
                  ) : null}
                  {followUp.status === "pending" ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                        href={`/follow-ups/${followUp.id}`}
                      >
                        상세 보기
                      </Link>
                      <form action={updateFollowUpStatusAction}>
                        <input
                          name="followUpId"
                          type="hidden"
                          value={followUp.id}
                        />
                        <input name="status" type="hidden" value="completed" />
                        <Button size="sm" type="submit" variant="outline">
                          완료 처리
                        </Button>
                      </form>
                      <form action={updateFollowUpStatusAction}>
                        <input
                          name="followUpId"
                          type="hidden"
                          value={followUp.id}
                        />
                        <input name="status" type="hidden" value="cancelled" />
                        <Button size="sm" type="submit" variant="ghost">
                          취소
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Link
                        className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                        href={`/follow-ups/${followUp.id}`}
                      >
                        상세 보기
                      </Link>
                    </div>
                  )}
                </article>
              ))}
            </div>
            <div
              className="hidden overflow-x-auto md:block"
              data-desktop-table="follow-ups"
            >
              <table className="w-full min-w-[860px] text-sm">
                <caption className="sr-only">후속관리 목록 총 {total}건</caption>
                <thead className="border-b border-[var(--border)] bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">할 일</th>
                    <th className="px-4 py-3">고객</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">마감</th>
                    <th className="px-4 py-3">상담 연결</th>
                    <th className="px-4 py-3">담당자</th>
                    <th className="px-4 py-3">처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {followUps.map((followUp) => (
                    <tr className="transition-colors hover:bg-teal-50/40" key={followUp.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-950">
                          <Link
                            className="hover:text-teal-700"
                            href={`/follow-ups/${followUp.id}`}
                          >
                            {followUp.title}
                          </Link>
                        </div>
                        <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {followUp.memo ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          className="font-medium text-slate-950 hover:text-teal-700"
                          href={`/customers/${followUp.customerId}`}
                        >
                          {followUp.customerName}
                        </Link>
                        <div className="mt-1 text-xs text-slate-500">
                          {followUp.customerPhone ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariants[followUp.status]}>
                          {statusLabels[followUp.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(followUp.dueAt)}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                        {followUp.consultationContent ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {followUp.userName ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {followUp.status === "pending" ? (
                          <div className="flex gap-2">
                            <Link
                              className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                              href={`/follow-ups/${followUp.id}`}
                            >
                              상세 보기
                            </Link>
                            <form action={updateFollowUpStatusAction}>
                              <input
                                name="followUpId"
                                type="hidden"
                                value={followUp.id}
                              />
                              <input name="status" type="hidden" value="completed" />
                              <Button size="sm" type="submit" variant="outline">
                                완료 처리
                              </Button>
                            </form>
                            <form action={updateFollowUpStatusAction}>
                              <input
                                name="followUpId"
                                type="hidden"
                                value={followUp.id}
                              />
                              <input name="status" type="hidden" value="cancelled" />
                              <Button size="sm" type="submit" variant="ghost">
                                취소
                              </Button>
                            </form>
                          </div>
                        ) : (
                          <Link
                            className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                            href={`/follow-ups/${followUp.id}`}
                          >
                            상세 보기
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
        <Pagination
          currentPage={parsed.page}
          pageSize={parsed.pageSize}
          params={{
            customerId: parsed.customerId,
            status: parsed.status
          }}
          pathname="/follow-ups"
          total={total}
        />
      </Card>
    </div>
  );
}
