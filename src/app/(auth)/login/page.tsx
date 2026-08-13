import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">CustomerFlow 로그인</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            고객, 상담, 예약, 후속관리를 한곳에서 관리하세요.
          </p>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/callback/credentials" className="space-y-4" method="post">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
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
              <label className="text-sm font-medium" htmlFor="password">
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
            <Button className="w-full" type="submit">
              로그인
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <Link href="/register">회원가입</Link>
            <span>비밀번호 찾기</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
