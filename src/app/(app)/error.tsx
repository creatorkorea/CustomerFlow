"use client";

import Link from "next/link";
import { AlertTriangle, LogIn, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type AppErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorBoundary({
  error,
  reset
}: AppErrorBoundaryProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-lg border border-[var(--border)] bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-600">
          <AlertTriangle aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
          페이지를 불러오지 못했습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          로그인 세션 또는 서버 연결을 확인하는 중 문제가 발생했습니다. 새로고침 후에도
          반복되면 다시 로그인해주세요.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-slate-400">오류 ID: {error.digest}</p>
        ) : null}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button className="w-full" onClick={reset} type="button">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            다시 시도
          </Button>
          <Link
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-white px-4 text-sm font-semibold leading-none text-slate-800 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            href="/login"
          >
            <LogIn aria-hidden="true" className="h-4 w-4" />
            로그인으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
