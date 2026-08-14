import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { listCustomerPickerOptions } from "@/server/customers/picker-options";
import { FollowUpForm } from "./follow-up-form";

type NewFollowUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewFollowUpPage({
  searchParams
}: NewFollowUpPageProps) {
  const organizationId = await requireOrganizationId();
  const params = await searchParams;
  const defaultConsultationId = firstParam(params.consultationId);
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
          href="/follow-ups"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          후속관리 목록
        </Link>
        <Badge className="mt-5">Follow-ups</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          후속관리 등록
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          고객에게 다시 연락하거나 확인해야 할 일을 마감 시간과 함께 남깁니다.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>후속관리 정보</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            같은 사업장 고객에게만 후속관리 항목을 연결할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
              먼저 고객을 등록한 뒤 후속관리를 만들 수 있습니다.
            </div>
          ) : (
            <FollowUpForm
              customers={customers}
              defaultConsultationId={defaultConsultationId}
              defaultCustomerId={defaultCustomerId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
