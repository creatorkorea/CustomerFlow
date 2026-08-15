import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  ClipboardPlus,
  MessageSquarePlus
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageOrganizationId } from "@/server/auth/session";
import { getCustomer } from "@/server/customers/service";
import {
  listCustomerTimeline,
  type CustomerTimelineType
} from "@/server/customers/timeline-service";
import { listTags } from "@/server/tags/service";
import { notFound } from "next/navigation";
import { CustomerEditForm } from "./customer-edit-form";

const statusLabels = {
  new: "신규",
  consulting: "상담중",
  reserved: "예약",
  completed: "완료",
  dormant: "휴면",
  cancelled: "취소"
};

const statusVariants = {
  new: "info",
  consulting: "default",
  reserved: "warning",
  completed: "success",
  dormant: "neutral",
  cancelled: "danger"
} as const;

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseTimelineType(value: string | undefined) {
  return value === "consultation" ||
    value === "reservation" ||
    value === "followUp"
    ? value
    : undefined;
}

export default async function CustomerDetailPage({
  params,
  searchParams
}: CustomerDetailPageProps) {
  const organizationId = await requirePageOrganizationId();
  const { id } = await params;
  const timelineType = parseTimelineType(firstParam((await searchParams).timelineType));
  const customer = await getCustomer({
    customerId: BigInt(id),
    organizationId
  }).catch(() => null);

  if (!customer) {
    notFound();
  }

  const tagResult = await listTags({
    organizationId,
    pageSize: 100
  });
  const timeline = await listCustomerTimeline({
    customerId: BigInt(id),
    organizationId,
    type: timelineType
  });
  const customerId = customer.id;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-white px-5 py-5 shadow-[0_1px_2px_rgb(15_23_42/0.035)]">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/customers"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          고객 목록
        </Link>
        <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge variant={statusVariants[customer.status]}>
              {statusLabels[customer.status]}
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {customer.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {customer.phone ?? "전화번호 없음"}
            </p>
            {customer.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <Badge key={tag.id} variant="neutral">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:w-auto">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              href={`/consultations/new?customerId=${customerId}`}
            >
              <MessageSquarePlus aria-hidden="true" className="h-4 w-4" />
              상담 등록
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              href={`/reservations/new?customerId=${customerId}`}
            >
              <CalendarPlus aria-hidden="true" className="h-4 w-4" />
              예약 등록
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_1px_2px_rgb(15_23_42/0.08)] transition-colors hover:bg-[var(--primary-hover)]"
              href={`/follow-ups/new?customerId=${customerId}`}
            >
              <ClipboardPlus aria-hidden="true" className="h-4 w-4" />
              후속관리 등록
            </Link>
          </div>
        </div>
      </div>
      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]">
            <CardTitle>고객 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="이메일" value={customer.email} />
            <Info label="주소" value={customer.address} />
            <Info
              label="태그"
              value={customer.tags.map((tag) => tag.name).join(", ")}
            />
            <Info label="메모" value={customer.memo} />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>활동 타임라인</CardTitle>
              <div className="flex flex-wrap gap-2">
                {timelineFilters.map((filter) => {
                  const isActive = filter.value === timelineType;

                  return (
                    <Link
                      className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-semibold transition-colors ${
                        isActive
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-white text-slate-700 hover:bg-[var(--surface-subtle)]"
                      }`}
                      href={filter.href(customerId)}
                      key={filter.label}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
                아직 연결된 상담, 예약, 후속관리 이력이 없습니다.
              </p>
            ) : (
              <ol className="space-y-3">
                {timeline.map((item) => (
                  <li
                    className="rounded-md border border-[var(--border)] bg-white px-4 py-3"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Badge variant={timelineVariantByType[item.type]}>
                          {timelineTypeLabels[item.type]}
                        </Badge>
                        <div className="mt-2 font-semibold text-slate-950">
                          {item.title}
                        </div>
                        {item.description ? (
                          <div className="mt-1 text-sm text-slate-600">
                            {item.description}
                          </div>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-xs font-medium text-slate-500">
                        {formatTimelineDate(item.occurredAt)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      상태 {item.status}
                      {item.userName ? ` · 담당 ${item.userName}` : ""}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle>고객 수정</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            고객 기본정보와 상태를 최신으로 유지하세요.
          </p>
        </CardHeader>
        <CardContent>
          <CustomerEditForm customer={customer} tags={tagResult.tags} />
        </CardContent>
      </Card>
    </div>
  );
}

const timelineTypeLabels = {
  consultation: "상담",
  reservation: "예약",
  followUp: "후속관리"
};

const timelineFilters: Array<{
  label: string;
  value?: CustomerTimelineType;
  href: (customerId: string) => string;
}> = [
  {
    label: "전체",
    href: (customerId) => `/customers/${customerId}`
  },
  {
    label: "상담",
    value: "consultation",
    href: (customerId) => `/customers/${customerId}?timelineType=consultation`
  },
  {
    label: "예약",
    value: "reservation",
    href: (customerId) => `/customers/${customerId}?timelineType=reservation`
  },
  {
    label: "후속관리",
    value: "followUp",
    href: (customerId) => `/customers/${customerId}?timelineType=followUp`
  }
];

const timelineVariantByType = {
  consultation: "default",
  reservation: "info",
  followUp: "warning"
} as const;

function formatTimelineDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-slate-900">{value || "-"}</div>
    </div>
  );
}
