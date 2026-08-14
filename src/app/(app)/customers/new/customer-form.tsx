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

type CustomerFormProps = {
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
};

export function CustomerForm({ tags }: CustomerFormProps) {
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
          <span className="text-sm font-semibold text-slate-700">고객명</span>
          <Input name="name" placeholder="김철수" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">전화번호</span>
          <Input name="phone" placeholder="010-1234-5678" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">이메일</span>
          <Input name="email" placeholder="customer@example.com" type="email" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">상태</span>
          <select
            className="form-select w-full"
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
        <span className="text-sm font-semibold text-slate-700">주소</span>
        <Input name="address" placeholder="서울시 강남구" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">메모</span>
        <textarea
          className="form-textarea w-full"
          name="memo"
          placeholder="문의 내용이나 특이사항"
        />
      </label>
      {tags.length > 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-700">태그</legend>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-700 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50"
                key={tag.id}
              >
                <input
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                  name="tagIds"
                  type="checkbox"
                  value={tag.id}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: tag.color ?? "#0f766e" }}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          저장 후 고객 상세에서 상담, 예약, 후속관리를 바로 등록할 수 있습니다.
        </p>
        <Button className="sm:min-w-28" disabled={isPending} type="submit">
          <Save aria-hidden="true" className="h-4 w-4" />
          {isPending ? "저장 중" : "저장"}
        </Button>
      </div>
    </form>
  );
}
