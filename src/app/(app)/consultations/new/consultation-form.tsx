"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import {
  CustomerPicker,
  type CustomerPickerCustomer
} from "@/components/forms/customer-picker";
import { Button } from "@/components/ui/button";
import { initialConsultationActionState } from "@/server/consultations/action-state";
import { createConsultationAction } from "@/server/consultations/actions";

type ConsultationFormProps = {
  customers: CustomerPickerCustomer[];
  defaultCustomerId?: string;
};

const channelOptions = [
  ["phone", "전화"],
  ["sms", "문자"],
  ["kakao", "카카오"],
  ["danggeun", "당근"],
  ["visit", "방문"],
  ["other", "기타"]
] as const;

const typeOptions = [
  ["inquiry", "문의"],
  ["quote", "견적"],
  ["booking", "예약"],
  ["complaint", "불만"],
  ["returning", "재문의"],
  ["other", "기타"]
] as const;

const statusOptions = [
  ["new", "신규"],
  ["consulting", "상담중"],
  ["quote", "견적"],
  ["reserved", "예약"],
  ["completed", "완료"],
  ["on_hold", "보류"],
  ["cancelled", "취소"]
] as const;

export function ConsultationForm({
  customers,
  defaultCustomerId
}: ConsultationFormProps) {
  const [state, formAction, isPending] = useActionState(
    createConsultationAction,
    initialConsultationActionState
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <CustomerPicker customers={customers} defaultCustomerId={defaultCustomerId} />
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">채널</span>
          <select className="form-select w-full" defaultValue="phone" name="channel">
            {channelOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">상담 유형</span>
          <select className="form-select w-full" defaultValue="inquiry" name="type">
            {typeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">상태</span>
          <select className="form-select w-full" defaultValue="consulting" name="status">
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">상담 내용</span>
        <textarea
          className="form-textarea w-full"
          name="content"
          placeholder="고객 문의 내용"
          required
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">상담 결과</span>
        <textarea
          className="form-textarea w-full"
          name="result"
          placeholder="안내한 내용이나 고객 반응"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">다음 액션</span>
        <input
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
          name="nextAction"
          placeholder="견적 확인 후 연락"
        />
      </label>
      <Button disabled={isPending || customers.length === 0} type="submit">
        <Save aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "저장"}
      </Button>
    </form>
  );
}
