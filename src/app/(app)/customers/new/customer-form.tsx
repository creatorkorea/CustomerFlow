"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialCustomerActionState } from "@/server/customers/action-state";
import { createCustomerAction } from "@/server/customers/actions";

const statusOptions = [
  ["new", "신규"],
  ["consulting", "상담중"],
  ["reserved", "예약"],
  ["completed", "완료"],
  ["dormant", "휴면"],
  ["cancelled", "취소"]
] as const;

export function CustomerForm() {
  const [state, formAction, isPending] = useActionState(
    createCustomerAction,
    initialCustomerActionState
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">고객명</span>
          <Input name="name" placeholder="김철수" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">전화번호</span>
          <Input name="phone" placeholder="010-1234-5678" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">이메일</span>
          <Input name="email" placeholder="customer@example.com" type="email" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">상태</span>
          <select
            className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-slate-700"
            defaultValue="new"
            name="status"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">주소</span>
        <Input name="address" placeholder="서울시 강남구" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">메모</span>
        <textarea
          className="min-h-32 w-full resize-y rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          name="memo"
          placeholder="문의 내용이나 특이사항"
        />
      </label>
      <Button disabled={isPending} type="submit">
        <Save aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "저장"}
      </Button>
    </form>
  );
}
