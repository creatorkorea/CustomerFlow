import Link from "next/link";
import { CalendarPlus, Plus } from "lucide-react";

import { CustomerPicker } from "@/components/forms/customer-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { requirePageOrganizationId } from "@/server/auth/session";
import { listCustomerPickerOptions } from "@/server/customers/picker-options";
import { updateReservationStatusAction } from "@/server/reservations/actions";
import { listReservations } from "@/server/reservations/service";
import { listReservationsSchema } from "@/server/reservations/validation";

const statusLabels = {
  scheduled: "예정",
  in_progress: "진행중",
  completed: "완료",
  cancelled: "취소",
  no_show: "노쇼"
};

const statusVariants = {
  scheduled: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
  no_show: "neutral"
} as const;

type ReservationsPageProps = {
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

export default async function ReservationsPage({
  searchParams
}: ReservationsPageProps) {
  const organizationId = await requirePageOrganizationId();
  const params = await searchParams;
  const parsed = listReservationsSchema.parse({
    customerId: firstParam(params.customerId),
    status: firstParam(params.status),
    page: firstParam(params.page)
  });
  const [{ reservations, total }, customerOptions] = await Promise.all([
    listReservations({
      organizationId,
      ...parsed
    }),
    listCustomerPickerOptions({
      organizationId,
      defaultCustomerId: parsed.customerId
    })
  ]);

  const upcomingCount = reservations.filter((reservation) =>
    ["scheduled", "in_progress"].includes(reservation.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-white px-5 py-5 shadow-[0_1px_2px_rgb(15_23_42/0.035)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge>예약 운영</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              예약
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              상담에서 확정된 방문 일정과 작업 약속을 한 곳에서 관리합니다.
            </p>
          </div>
          <Link
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(15_23_42/0.08)] transition-colors hover:bg-[var(--primary-hover)] sm:w-auto"
            href="/reservations/new"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            예약 등록
          </Link>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">전체 예약</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">{total}</div>
            </div>
            <Badge variant="neutral">전체</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">진행 예정</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {upcomingCount}
              </div>
            </div>
            <Badge variant="info">다가오는 예약</Badge>
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

      <form className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.035)] lg:flex-row lg:items-start">
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
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">예약 목록</h2>
            <p className="mt-1 text-sm text-slate-500">
              총 {total}건 중 현재 조건에 맞는 예약입니다.
            </p>
          </div>
          <Badge variant={parsed.status ? statusVariants[parsed.status] : "neutral"}>
            {parsed.status ? statusLabels[parsed.status] : "전체"}
          </Badge>
        </div>
        <CardContent className="p-0">
          {reservations.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <CalendarPlus aria-hidden="true" className="h-10 w-10 text-[var(--primary)]" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                아직 등록된 예약이 없습니다.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                상담이 확정되면 방문 일정을 예약으로 남기세요.
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
                href="/reservations/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />첫 예약 등록
              </Link>
            </div>
          ) : (
            <>
            <div
              className="space-y-3 p-4 md:hidden"
              data-mobile-list="reservations"
            >
              {reservations.map((reservation) => (
                <article
                  className="rounded-md border border-[var(--border)] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
                  data-mobile-list-item
                  key={reservation.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-950">
                        <Link
                          className="hover:text-[var(--primary)]"
                          href={`/reservations/${reservation.id}`}
                        >
                          {reservation.title}
                        </Link>
                      </div>
                      <Link
                        className="mt-1 block text-sm font-medium text-slate-600 hover:text-[var(--primary)]"
                        href={`/customers/${reservation.customerId}`}
                      >
                        {reservation.customerName}
                      </Link>
                    </div>
                    <Badge variant={statusVariants[reservation.status]}>
                      {statusLabels[reservation.status]}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">시작</span>
                      <span className="text-right">
                        {formatDateTime(reservation.startAt)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">장소</span>
                      <span className="min-w-0 truncate text-right">
                        {reservation.location ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">담당자</span>
                      <span>{reservation.userName ?? "-"}</span>
                    </div>
                  </div>
                  {["scheduled", "in_progress"].includes(reservation.status) ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        href={`/reservations/${reservation.id}`}
                      >
                        상세 보기
                      </Link>
                      {reservation.status === "scheduled" ? (
                        <form action={updateReservationStatusAction}>
                          <input
                            name="reservationId"
                            type="hidden"
                            value={reservation.id}
                          />
                          <input name="status" type="hidden" value="in_progress" />
                          <Button size="sm" type="submit" variant="outline">
                            진행 시작
                          </Button>
                        </form>
                      ) : null}
                      <form action={updateReservationStatusAction}>
                        <input
                          name="reservationId"
                          type="hidden"
                          value={reservation.id}
                        />
                        <input name="status" type="hidden" value="completed" />
                        <Button size="sm" type="submit" variant="outline">
                          완료 처리
                        </Button>
                      </form>
                      <form action={updateReservationStatusAction}>
                        <input
                          name="reservationId"
                          type="hidden"
                          value={reservation.id}
                        />
                        <input name="status" type="hidden" value="cancelled" />
                        <Button size="sm" type="submit" variant="ghost">
                          취소
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
            <div
              className="hidden overflow-x-auto md:block"
              data-desktop-table="reservations"
            >
              <table className="w-full min-w-[1040px] text-sm">
                <caption className="sr-only">예약 목록 총 {total}건</caption>
                <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-left text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">예약</th>
                    <th className="px-4 py-3">고객</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">시간</th>
                    <th className="px-4 py-3">장소</th>
                    <th className="px-4 py-3">담당자</th>
                    <th className="px-4 py-3">처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {reservations.map((reservation) => (
                    <tr className="transition-colors hover:bg-[var(--primary-soft)]/45" key={reservation.id}>
                      <td className="px-4 py-3">
                        <Link
                          className="font-medium text-slate-950 hover:text-[var(--primary)]"
                          href={`/reservations/${reservation.id}`}
                        >
                          {reservation.title}
                        </Link>
                        <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {reservation.memo ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          className="font-medium text-slate-950 hover:text-[var(--primary)]"
                          href={`/customers/${reservation.customerId}`}
                        >
                          {reservation.customerName}
                        </Link>
                        <div className="mt-1 text-xs text-slate-500">
                          {reservation.customerPhone ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariants[reservation.status]}>
                          {statusLabels[reservation.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{formatDateTime(reservation.startAt)}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          종료 {formatDateTime(reservation.endAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {reservation.location ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {reservation.userName ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {["scheduled", "in_progress"].includes(
                          reservation.status
                        ) ? (
                          <div className="flex min-w-64 flex-wrap gap-2">
                            <Link
                              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                              href={`/reservations/${reservation.id}`}
                            >
                              상세 보기
                            </Link>
                            {reservation.status === "scheduled" ? (
                              <form action={updateReservationStatusAction}>
                                <input
                                  name="reservationId"
                                  type="hidden"
                                  value={reservation.id}
                                />
                                <input
                                  name="status"
                                  type="hidden"
                                  value="in_progress"
                                />
                                <Button size="sm" type="submit" variant="outline">
                                  진행 시작
                                </Button>
                              </form>
                            ) : null}
                            <form action={updateReservationStatusAction}>
                              <input
                                name="reservationId"
                                type="hidden"
                                value={reservation.id}
                              />
                              <input name="status" type="hidden" value="completed" />
                              <Button size="sm" type="submit" variant="outline">
                                완료 처리
                              </Button>
                            </form>
                            <form action={updateReservationStatusAction}>
                              <input
                                name="reservationId"
                                type="hidden"
                                value={reservation.id}
                              />
                              <input name="status" type="hidden" value="cancelled" />
                              <Button size="sm" type="submit" variant="ghost">
                                취소
                              </Button>
                            </form>
                          </div>
                        ) : (
                          <Link
                            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            href={`/reservations/${reservation.id}`}
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
          pathname="/reservations"
          total={total}
        />
      </Card>
    </div>
  );
}
