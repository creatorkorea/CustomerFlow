import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { listCustomers } from "@/server/customers/service";
import { FollowUpForm } from "./follow-up-form";

export default async function NewFollowUpPage() {
  const organizationId = await requireOrganizationId();
  const { customers } = await listCustomers({
    organizationId,
    pageSize: 100
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
            <FollowUpForm customers={customers} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
