"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import {
  CustomerPicker,
  type CustomerPickerCustomer
} from "@/components/forms/customer-picker";
import { Button } from "@/components/ui/button";
import { initialFollowUpActionState } from "@/server/follow-ups/action-state";
import { createFollowUpAction } from "@/server/follow-ups/actions";

type FollowUpFormProps = {
  customers: CustomerPickerCustomer[];
  defaultConsultationId?: string;
  defaultCustomerId?: string;
};

const statusOptions = [
  ["pending", "대기"],
  ["completed", "완료"],
  ["cancelled", "취소"]
] as const;

export function FollowUpForm({
  customers,
  defaultConsultationId,
  defaultCustomerId
}: FollowUpFormProps) {
  const [state, formAction, isPending] = useActionState(
    createFollowUpAction,
    initialFollowUpActionState
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <CustomerPicker customers={customers} defaultCustomerId={defaultCustomerId} />
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">할 일</span>
        <input
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
          name="title"
          placeholder="예약 전 확인 연락"
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">마감</span>
          <input
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
            name="dueAt"
            type="datetime-local"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">상태</span>
          <select className="form-select w-full" defaultValue="pending" name="status">
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">상담 ID</span>
        <input
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
          inputMode="numeric"
          defaultValue={defaultConsultationId ?? ""}
          name="consultationId"
          placeholder="선택 입력"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">메모</span>
        <textarea
          className="form-textarea w-full"
          name="memo"
          placeholder="연락 전 확인할 내용"
        />
      </label>
      <Button disabled={isPending || customers.length === 0} type="submit">
        <Save aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "저장"}
      </Button>
    </form>
  );
}
