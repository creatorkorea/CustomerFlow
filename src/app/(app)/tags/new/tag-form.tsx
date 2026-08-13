"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialTagActionState } from "@/server/tags/action-state";
import { createTagAction } from "@/server/tags/actions";

const colorOptions = [
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#dc2626",
  "#d97706",
  "#475569"
];

export function TagForm() {
  const [state, formAction, isPending] = useActionState(
    createTagAction,
    initialTagActionState
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">태그명</span>
        <Input name="name" placeholder="VIP" required />
      </label>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">색상</legend>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <label
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-700 has-[:checked]:border-teal-500 has-[:checked]:ring-2 has-[:checked]:ring-teal-500/20"
              key={color}
            >
              <input
                className="sr-only"
                defaultChecked={color === "#0f766e"}
                name="color"
                type="radio"
                value={color}
              />
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              {color}
            </label>
          ))}
        </div>
      </fieldset>
      <Button disabled={isPending} type="submit">
        <Save aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "저장"}
      </Button>
    </form>
  );
}
