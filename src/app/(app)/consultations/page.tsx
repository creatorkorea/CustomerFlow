import Link from "next/link";
import { Plus } from "lucide-react";

import { CustomerPicker } from "@/components/forms/customer-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { requirePageOrganizationId } from "@/server/auth/session";
import { listConsultations } from "@/server/consultations/service";
import { listConsultationsSchema } from "@/server/consultations/validation";
import { listCustomerPickerOptions } from "@/server/customers/picker-options";

const channelLabels = {
  phone: "전화",
  sms: "문자",
  kakao: "카카오",
  danggeun: "당근",
  visit: "방문",
  other: "기타"
};

const statusLabels = {
  new: "신규",
  consulting: "상담중",
  quote: "견적",
  reserved: "예약",
  completed: "완료",
  on_hold: "보류",
  cancelled: "취소"
};

const statusVariants = {
  new: "info",
  consulting: "default",
  quote: "warning",
  reserved: "warning",
  completed: "success",
  on_hold: "neutral",
  cancelled: "danger"
} as const;

type ConsultationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ConsultationsPage({
  searchParams
}: ConsultationsPageProps) {
  const organizationId = await requirePageOrganizationId();
  const params = await searchParams;
  const parsed = listConsultationsSchema.parse({
    customerId: firstParam(params.customerId),
    status: firstParam(params.status),
    channel: firstParam(params.channel),
    page: firstParam(params.page)
  });
  const [{ consultations, total }, customerOptions] = await Promise.all([
    listConsultations({
      organizationId,
      ...parsed
    }),
    listCustomerPickerOptions({
      organizationId,
      defaultCustomerId: parsed.customerId
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-white px-5 py-5 shadow-[0_1px_2px_rgb(15_23_42/0.035)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge>상담 운영</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              상담
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              고객 문의 내용을 기록하고 예약과 후속관리로 이어갈 상담 데이터입니다.
            </p>
          </div>
          <Link
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(15_23_42/0.08)] transition-colors hover:bg-[var(--primary-hover)] sm:w-auto"
            href="/consultations/new"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            상담 등록
          </Link>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">전체 상담</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">{total}</div>
            </div>
            <Badge variant="neutral">전체</Badge>
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
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">채널</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {parsed.channel ? channelLabels[parsed.channel] : "전체"}
              </div>
            </div>
            <Badge variant="info">채널</Badge>
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
        <select className="form-select w-full sm:w-44" defaultValue={parsed.channel ?? ""} name="channel">
          <option value="">전체 채널</option>
          {Object.entries(channelLabels).map(([value, label]) => (
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
            <h2 className="text-base font-semibold text-slate-950">상담 목록</h2>
            <p className="mt-1 text-sm text-slate-500">
              총 {total}건 중 현재 조건에 맞는 상담입니다.
            </p>
          </div>
          <Badge variant={parsed.status ? statusVariants[parsed.status] : "neutral"}>
            {parsed.status ? statusLabels[parsed.status] : "전체"}
          </Badge>
        </div>
        <CardContent className="p-0">
          {consultations.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <h2 className="text-lg font-semibold text-slate-950">
                아직 등록된 상담이 없습니다.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                고객 문의를 상담으로 남기고 예약과 후속관리로 연결하세요.
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
                href="/consultations/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />첫 상담 등록
              </Link>
            </div>
          ) : (
            <>
            <div
              className="space-y-3 p-4 md:hidden"
              data-mobile-list="consultations"
            >
              {consultations.map((consultation) => (
                <article
                  className="rounded-md border border-[var(--border)] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
                  data-mobile-list-item
                  key={consultation.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        className="font-semibold text-slate-950 hover:text-[var(--primary)]"
                        href={`/consultations/${consultation.id}`}
                      >
                        {consultation.customerName}
                      </Link>
                      <div className="mt-1 text-sm text-slate-600">
                        {consultation.customerPhone ?? "전화번호 없음"}
                      </div>
                    </div>
                    <Badge variant={statusVariants[consultation.status]}>
                      {statusLabels[consultation.status]}
                    </Badge>
                  </div>
                  <div className="mt-3 rounded-md bg-[var(--surface-subtle)] p-3 text-sm text-slate-700">
                    {consultation.content}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">채널</span>
                      <span>{channelLabels[consultation.channel]}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">다음 액션</span>
                      <span className="min-w-0 truncate text-right">
                        {consultation.nextAction ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">등록일</span>
                      <span>
                        {new Intl.DateTimeFormat("ko-KR", {
                          dateStyle: "short",
                          timeZone: "Asia/Seoul"
                        }).format(new Date(consultation.createdAt))}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      href={`/consultations/${consultation.id}`}
                    >
                      상세 보기
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      href={`/reservations/new?customerId=${consultation.customerId}`}
                    >
                      예약 생성
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      href={`/follow-ups/new?customerId=${consultation.customerId}&consultationId=${consultation.id}`}
                    >
                      후속관리 생성
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div
              className="hidden overflow-x-auto md:block"
              data-desktop-table="consultations"
            >
              <table className="w-full min-w-[860px] text-sm">
                <caption className="sr-only">상담 목록 총 {total}건</caption>
                <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-left text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">고객</th>
                    <th className="px-4 py-3">채널</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">상담 내용</th>
                    <th className="px-4 py-3">다음 액션</th>
                    <th className="px-4 py-3">등록일</th>
                    <th className="px-4 py-3">연결</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {consultations.map((consultation) => (
                    <tr className="transition-colors hover:bg-[var(--primary-soft)]/45" key={consultation.id}>
                      <td className="px-4 py-3">
                        <Link
                          className="font-medium text-slate-950 hover:text-[var(--primary)]"
                          href={`/consultations/${consultation.id}`}
                        >
                          {consultation.customerName}
                        </Link>
                        <div className="mt-1 text-xs text-slate-500">
                          {consultation.customerPhone ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {channelLabels[consultation.channel]}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariants[consultation.status]}>
                          {statusLabels[consultation.status]}
                        </Badge>
                      </td>
                      <td className="max-w-sm truncate px-4 py-3 text-slate-700">
                        {consultation.content}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {consultation.nextAction ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Intl.DateTimeFormat("ko-KR", {
                          dateStyle: "short",
                          timeZone: "Asia/Seoul"
                        }).format(new Date(consultation.createdAt))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            href={`/consultations/${consultation.id}`}
                          >
                            상세 보기
                          </Link>
                          <Link
                            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            href={`/reservations/new?customerId=${consultation.customerId}`}
                          >
                            예약 생성
                          </Link>
                          <Link
                            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            href={`/follow-ups/new?customerId=${consultation.customerId}&consultationId=${consultation.id}`}
                          >
                            후속관리 생성
                          </Link>
                        </div>
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
            status: parsed.status,
            channel: parsed.channel
          }}
          pathname="/consultations"
          total={total}
        />
      </Card>
    </div>
  );
}
