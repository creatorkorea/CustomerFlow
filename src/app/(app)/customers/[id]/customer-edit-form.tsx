"use client";

import { useActionState } from "react";
import { Trash2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialCustomerActionState } from "@/server/customers/action-state";
import {
  deleteCustomerAction,
  updateCustomerAction
} from "@/server/customers/actions";

type CustomerEditFormProps = {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: string;
    memo: string | null;
    tags: Array<{
      id: string;
      name: string;
      color: string | null;
    }>;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
};

const statusOptions = [
  ["new", "신규"],
  ["consulting", "상담중"],
  ["reserved", "예약"],
  ["completed", "완료"],
  ["dormant", "휴면"],
  ["cancelled", "취소"]
] as const;

export function CustomerEditForm({ customer, tags }: CustomerEditFormProps) {
  const updateWithId = updateCustomerAction.bind(null, customer.id);
  const deleteWithId = deleteCustomerAction.bind(null, customer.id);
  const [state, formAction, isPending] = useActionState(
    updateWithId,
    initialCustomerActionState
  );

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" noValidate>
        {state.status === "error" ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">고객명</span>
          <Input defaultValue={customer.name} name="name" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">전화번호</span>
          <Input defaultValue={customer.phone ?? ""} name="phone" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">이메일</span>
          <Input
            defaultValue={customer.email ?? ""}
            name="email"
            type="email"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">주소</span>
          <Input defaultValue={customer.address ?? ""} name="address" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">상태</span>
          <select
            className="form-select w-full"
            defaultValue={customer.status}
            name="status"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">메모</span>
          <textarea
            className="form-textarea w-full"
            defaultValue={customer.memo ?? ""}
            name="memo"
          />
        </label>
        {tags.length > 0 ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-700">태그</legend>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const checked = customer.tags.some(
                  (customerTag) => customerTag.id === tag.id
                );

                return (
                  <label
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-700 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50"
                    key={tag.id}
                  >
                    <input
                      className="h-4 w-4 rounded border-[var(--border)] accent-teal-700"
                      defaultChecked={checked}
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
                );
              })}
            </div>
          </fieldset>
        ) : null}
        <Button disabled={isPending} type="submit">
          <Save aria-hidden="true" className="h-4 w-4" />
          {isPending ? "저장 중" : "변경 저장"}
        </Button>
      </form>
      <form action={deleteWithId}>
        <Button
          className="w-full justify-center sm:w-auto"
          type="submit"
          variant="outline"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          고객 삭제
        </Button>
      </form>
    </div>
  );
}
