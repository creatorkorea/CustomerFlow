import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { requireOrganizationId } from "@/server/auth/session";
import { listCustomers } from "@/server/customers/service";
import { listCustomersSchema } from "@/server/customers/validation";
import { listTags } from "@/server/tags/service";

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

type CustomersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CustomersPage({
  searchParams
}: CustomersPageProps) {
  const organizationId = await requireOrganizationId();
  const params = await searchParams;
  const parsed = listCustomersSchema.parse({
    search: firstParam(params.search),
    status: firstParam(params.status),
    tagId: firstParam(params.tagId),
    page: firstParam(params.page)
  });
  const { customers, total } = await listCustomers({
    organizationId,
    ...parsed
  });
  const { tags } = await listTags({
    organizationId,
    pageSize: 100
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Customers</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            고객
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            신규 문의부터 예약, 후속관리까지 이어질 고객 기반 데이터입니다.
          </p>
        </div>
        <Link
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition-colors hover:bg-teal-700 sm:w-auto"
          href="/customers/new"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          고객 추가
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">전체 고객</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">{total}</div>
            </div>
            <Badge variant="neutral">전체</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">현재 필터</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {parsed.status ? statusLabels[parsed.status] : "전체"}
              </div>
            </div>
            <Badge variant={parsed.status ? statusVariants[parsed.status] : "default"}>
              상태
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">검색어</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {parsed.search || parsed.tagId ? "적용" : "없음"}
              </div>
            </div>
            <Badge variant="info">검색</Badge>
          </CardContent>
        </Card>
      </section>

      <form className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)] sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">이름/전화번호 검색</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            className="pl-9"
            defaultValue={parsed.search}
            name="search"
            placeholder="이름, 전화번호, 이메일 검색"
          />
        </label>
        <select
          className="form-select w-full sm:w-44"
          defaultValue={parsed.status ?? ""}
          name="status"
        >
          <option value="">전체 상태</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="form-select w-full sm:w-44"
          defaultValue={parsed.tagId ?? ""}
          name="tagId"
        >
          <option value="">전체 태그</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <Button type="submit">검색</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <h2 className="text-lg font-semibold text-slate-950">
                아직 등록된 고객이 없습니다.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                첫 고객을 등록하고 상담과 예약을 관리해보세요.
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-teal-800"
                href="/customers/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />첫 고객 등록
              </Link>
            </div>
          ) : (
            <>
            <div className="space-y-3 p-4 md:hidden" data-mobile-list="customers">
              {customers.map((customer) => (
                <Link
                  className="block rounded-md border border-[var(--border)] bg-white p-4 shadow-sm"
                  data-mobile-list-item
                  href={`/customers/${customer.id}`}
                  key={customer.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-950">
                        {customer.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {customer.phone ?? "전화번호 없음"}
                      </div>
                    </div>
                    <Badge variant={statusVariants[customer.status]}>
                      {statusLabels[customer.status]}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">이메일</span>
                      <span className="min-w-0 truncate text-right">
                        {customer.email ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">최근 상담</span>
                      <span>
                        {customer.lastContactedAt
                          ? new Intl.DateTimeFormat("ko-KR", {
                              dateStyle: "short",
                              timeZone: "Asia/Seoul"
                            }).format(new Date(customer.lastContactedAt))
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">태그</span>
                      <span className="min-w-0 truncate text-right">
                        {customer.tags.map((tag) => tag.name).join(", ") || "-"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block" data-desktop-table="customers">
              <table className="w-full min-w-[760px] text-sm">
                <caption className="sr-only">고객 목록 총 {total}명</caption>
                <thead className="border-b border-[var(--border)] bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">고객명</th>
                    <th className="px-4 py-3">전화번호</th>
                    <th className="px-4 py-3">이메일</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">최근 상담</th>
                    <th className="px-4 py-3">태그</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {customers.map((customer) => (
                    <tr className="transition-colors hover:bg-teal-50/40" key={customer.id}>
                      <td className="px-4 py-3 font-medium text-slate-950">
                        <Link className="hover:text-teal-700" href={`/customers/${customer.id}`}>
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {customer.phone ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {customer.email ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariants[customer.status]}>
                          {statusLabels[customer.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {customer.lastContactedAt
                          ? new Intl.DateTimeFormat("ko-KR", {
                              dateStyle: "short",
                              timeZone: "Asia/Seoul"
                            }).format(new Date(customer.lastContactedAt))
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {customer.tags.map((tag) => tag.name).join(", ") || "-"}
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
            search: parsed.search,
            status: parsed.status,
            tagId: parsed.tagId
          }}
          pathname="/customers"
          total={total}
        />
      </Card>
    </div>
  );
}
