"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import {
  CustomerPicker,
  type CustomerPickerCustomer
} from "@/components/forms/customer-picker";
import { Button } from "@/components/ui/button";
import { initialReservationActionState } from "@/server/reservations/action-state";
import { createReservationAction } from "@/server/reservations/actions";

type ReservationFormProps = {
  customers: CustomerPickerCustomer[];
  defaultCustomerId?: string;
};

const statusOptions = [
  ["scheduled", "예정"],
  ["in_progress", "진행중"],
  ["completed", "완료"],
  ["cancelled", "취소"],
  ["no_show", "노쇼"]
] as const;

export function ReservationForm({
  customers,
  defaultCustomerId
}: ReservationFormProps) {
  const [state, formAction, isPending] = useActionState(
    createReservationAction,
    initialReservationActionState
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
        <span className="text-sm font-semibold text-slate-700">예약명</span>
        <input
          className="form-input w-full"
          name="title"
          placeholder="방문 설치 예약"
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">시작</span>
          <input
            className="form-input w-full"
            name="startAt"
            type="datetime-local"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">종료</span>
          <input
            className="form-input w-full"
            name="endAt"
            type="datetime-local"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">상태</span>
          <select className="form-select w-full" defaultValue="scheduled" name="status">
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">장소</span>
        <input
          className="form-input w-full"
          name="location"
          placeholder="서울 강남구"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">메모</span>
        <textarea
          className="form-textarea w-full"
          name="memo"
          placeholder="방문 전 확인할 내용"
        />
      </label>
      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          저장 후 예약 상세에서 일정, 장소, 처리 상태를 조정할 수 있습니다.
        </p>
        <Button
          className="sm:min-w-28"
          disabled={isPending || customers.length === 0}
          type="submit"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {isPending ? "저장 중" : "저장"}
        </Button>
      </div>
    </form>
  );
}
