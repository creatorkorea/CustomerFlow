import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { listCustomers } from "@/server/customers/service";
import { ReservationForm } from "./reservation-form";

type NewReservationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewReservationPage({
  searchParams
}: NewReservationPageProps) {
  const organizationId = await requireOrganizationId();
  const params = await searchParams;
  const defaultCustomerId = firstParam(params.customerId);
  const { customers } = await listCustomers({
    organizationId,
    pageSize: 100
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/reservations"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          예약 목록
        </Link>
        <Badge className="mt-5">Reservations</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          예약 등록
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          고객 방문 일정과 장소를 등록하고 예약 상태로 전환합니다.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>예약 정보</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            날짜와 시간은 화면에서 Asia/Seoul 기준으로 입력합니다.
          </p>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-slate-600">
              먼저 고객을 등록한 뒤 예약을 만들 수 있습니다.
            </div>
          ) : (
            <ReservationForm
              customers={customers}
              defaultCustomerId={defaultCustomerId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
