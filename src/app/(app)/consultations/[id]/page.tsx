import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { updateConsultationAction } from "@/server/consultations/actions";
import { getConsultation } from "@/server/consultations/service";
import { AppError } from "@/server/shared/http-errors";

type ConsultationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const channelLabels = {
  phone: "전화",
  sms: "문자",
  kakao: "카카오",
  danggeun: "당근",
  visit: "방문",
  other: "기타"
};

const typeLabels = {
  inquiry: "문의",
  quote: "견적",
  booking: "예약",
  complaint: "불만",
  returning: "재문의",
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

export default async function ConsultationDetailPage({
  params
}: ConsultationDetailPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const organizationId = await requireOrganizationId();
  let consultation: Awaited<ReturnType<typeof getConsultation>>;

  try {
    consultation = await getConsultation({
      consultationId: BigInt(id),
      organizationId
    });
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[var(--primary)]"
            href="/consultations"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            상담 목록
          </Link>
          <Badge className="mt-4">상담 업무</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            상담 상세
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            상담 결과와 다음 액션을 정리해 예약과 후속관리로 이어갑니다.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-[var(--surface-subtle)]"
            href={`/customers/${consultation.customerId}`}
          >
            고객 상세
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--primary-hover)]"
            href={`/follow-ups/new?customerId=${consultation.customerId}&consultationId=${consultation.id}`}
          >
            후속관리 생성
          </Link>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]">
            <CardTitle>상담 기록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="text-xs font-semibold text-slate-500">고객</div>
                <div className="mt-1 truncate font-semibold text-slate-950">
                  {consultation.customerName}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {consultation.customerPhone ?? "전화번호 없음"}
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="text-xs font-semibold text-slate-500">유형</div>
                <div className="mt-1 font-semibold text-slate-950">
                  {channelLabels[consultation.channel]} ·{" "}
                  {typeLabels[consultation.type]}
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="text-xs font-semibold text-slate-500">현재 상태</div>
                <div className="mt-2">
                  <Badge variant={statusVariants[consultation.status]}>
                    {statusLabels[consultation.status]}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-950">상담 내용</h2>
              <p className="mt-2 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-white p-4 text-sm leading-6 text-slate-700">
                {consultation.content}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-950">상담 결과</h2>
              <p className="mt-2 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-white p-4 text-sm leading-6 text-slate-700">
                {consultation.result ?? "아직 기록된 상담 결과가 없습니다."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-500">다음 액션</div>
                <div className="mt-1 text-sm text-slate-700">
                  {consultation.nextAction ?? "미정"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">최근 수정</div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDateTime(consultation.updatedAt)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]">
            <CardTitle>상담 업데이트</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              상담 상태와 후속 액션만 빠르게 갱신합니다.
            </p>
          </CardHeader>
          <CardContent>
            <form action={updateConsultationAction} className="space-y-4">
              <input name="consultationId" type="hidden" value={consultation.id} />
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">상태</span>
                <select
                  className="form-select w-full"
                  defaultValue={consultation.status}
                  name="status"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  상담 결과
                </span>
                <textarea
                  className="form-textarea w-full"
                  defaultValue={consultation.result ?? ""}
                  name="result"
                  placeholder="안내한 내용이나 고객 반응"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  다음 액션
                </span>
                <input
                  className="form-input w-full"
                  defaultValue={consultation.nextAction ?? ""}
                  name="nextAction"
                  placeholder="예약 확정 연락"
                />
              </label>
              <div className="border-t border-[var(--border)] pt-5">
                <Button className="w-full" type="submit">
                  <Save aria-hidden="true" className="h-4 w-4" />
                  변경 저장
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
