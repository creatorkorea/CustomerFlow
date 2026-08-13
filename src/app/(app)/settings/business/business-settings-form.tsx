"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  initialBusinessSettingsActionState
} from "@/server/settings/business-action-state";
import { updateBusinessSettingsAction } from "@/server/settings/business-actions";

type BusinessSettingsFormProps = {
  settings: {
    name: string;
    businessNumber: string | null;
    phone: string | null;
    email: string | null;
    timezone: string;
  };
  canManage: boolean;
};

export function BusinessSettingsForm({
  settings,
  canManage
}: BusinessSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBusinessSettingsAction,
    initialBusinessSettingsActionState
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status !== "idle" ? (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">사업장명</span>
        <Input
          defaultValue={settings.name}
          disabled={!canManage}
          name="name"
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            사업자등록번호
          </span>
          <Input
            defaultValue={settings.businessNumber ?? ""}
            disabled={!canManage}
            name="businessNumber"
            placeholder="123-45-67890"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">시간대</span>
          <select
            className="form-select w-full"
            defaultValue={settings.timezone}
            disabled={!canManage}
            name="timezone"
          >
            <option value="Asia/Seoul">Asia/Seoul</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">대표 전화</span>
          <Input
            defaultValue={settings.phone ?? ""}
            disabled={!canManage}
            name="phone"
            placeholder="02-1234-5678"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            대표 이메일
          </span>
          <Input
            defaultValue={settings.email ?? ""}
            disabled={!canManage}
            name="email"
            placeholder="team@example.com"
            type="email"
          />
        </label>
      </div>
      <Button disabled={!canManage || isPending} type="submit">
        <Save aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "저장"}
      </Button>
    </form>
  );
}
