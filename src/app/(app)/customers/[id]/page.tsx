import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { getCustomer } from "@/server/customers/service";
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
};

export default async function CustomerDetailPage({
  params
}: CustomerDetailPageProps) {
  const organizationId = await requireOrganizationId();
  const { id } = await params;
  const customer = await getCustomer({
    customerId: BigInt(id),
    organizationId
  }).catch(() => null);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/customers"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          고객 목록
        </Link>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {customer.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {customer.phone ?? "전화번호 없음"}
            </p>
          </div>
          <Badge variant={statusVariants[customer.status]}>
            {statusLabels[customer.status]}
          </Badge>
        </div>
      </div>
      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
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
        <Card>
          <CardHeader>
            <CardTitle>활동 타임라인</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
              상담, 예약, 후속관리 이력은 다음 단계에서 연결됩니다.
            </p>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>고객 수정</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            고객 기본정보와 상태를 최신으로 유지하세요.
          </p>
        </CardHeader>
        <CardContent>
          <CustomerEditForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-slate-900">{value || "-"}</div>
    </div>
  );
}
