"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initialReservationActionState } from "@/server/reservations/action-state";
import { createReservationAction } from "@/server/reservations/actions";

type ReservationFormProps = {
  customers: Array<{
    id: string;
    name: string;
    phone: string | null;
  }>;
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
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">고객</span>
        <select
          className="form-select w-full"
          defaultValue={defaultCustomerId ?? ""}
          name="customerId"
          required
        >
          <option value="">고객 선택</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
              {customer.phone ? ` / ${customer.phone}` : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">예약명</span>
        <input
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
          name="title"
          placeholder="방문 설치 예약"
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">시작</span>
          <input
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
            name="startAt"
            type="datetime-local"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">종료</span>
          <input
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
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
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10"
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
      <Button disabled={isPending || customers.length === 0} type="submit">
        <Save aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "저장"}
      </Button>
    </form>
  );
}
