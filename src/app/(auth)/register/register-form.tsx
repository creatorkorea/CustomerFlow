"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialAuthActionState } from "@/server/auth/action-state";
import { registerAction } from "@/server/auth/actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2" noValidate>
      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2"
        >
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2 md:col-span-2">
        <h2 className="text-sm font-semibold text-slate-900">사업장 정보</h2>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="organizationName">
          사업장명
        </label>
        <Input id="organizationName" name="organizationName" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="businessNumber">
          사업자번호
        </label>
        <Input id="businessNumber" name="businessNumber" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <h2 className="text-sm font-semibold text-slate-900">관리자 정보</h2>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="name">
          이름
        </label>
        <Input id="name" name="name" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
          이메일
        </label>
        <Input id="email" name="email" type="email" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          비밀번호
        </label>
        <Input id="password" name="password" type="password" />
      </div>
      <div className="flex items-center justify-between md:col-span-2">
        <Link className="text-sm font-medium text-teal-700" href="/login">
          로그인으로 돌아가기
        </Link>
        <Button disabled={isPending} type="submit">
          {isPending ? "가입 중" : "가입하기"}
        </Button>
      </div>
    </form>
  );
}
