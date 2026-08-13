"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  initialAuthActionState
} from "@/server/auth/action-state";
import { loginAction } from "@/server/auth/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
          이메일
        </label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="owner@example.com"
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          비밀번호
        </label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          placeholder="비밀번호"
          type="password"
        />
      </div>
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "로그인 중" : "로그인"}
      </Button>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <Link className="font-medium text-teal-700" href="/register">
          회원가입
        </Link>
        <span>비밀번호 찾기</span>
      </div>
    </form>
  );
}
