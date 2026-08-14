import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { listCustomerPickerOptions } from "@/server/customers/picker-options";
import { ConsultationForm } from "./consultation-form";

type NewConsultationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewConsultationPage({
  searchParams
}: NewConsultationPageProps) {
  const organizationId = await requireOrganizationId();
  const params = await searchParams;
  const defaultCustomerId = firstParam(params.customerId);
  const customers = await listCustomerPickerOptions({
    organizationId,
    defaultCustomerId
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/consultations"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          상담 목록
        </Link>
        <Badge className="mt-5">Consultations</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          상담 등록
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          고객 문의를 기록하고 예약 또는 후속관리로 이어갈 다음 액션을 남깁니다.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>상담 정보</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            같은 사업장에 등록된 고객만 상담과 연결할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
              먼저 고객을 등록한 뒤 상담을 남길 수 있습니다.
            </div>
          ) : (
            <ConsultationForm
              customers={customers}
              defaultCustomerId={defaultCustomerId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
