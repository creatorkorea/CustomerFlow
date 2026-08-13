import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">CustomerFlow 회원가입</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            사업장과 owner 계정을 생성합니다.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900">사업장 정보</h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="organizationName">
                사업장명
              </label>
              <Input id="organizationName" name="organizationName" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="businessNumber">
                사업자번호
              </label>
              <Input id="businessNumber" name="businessNumber" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900">관리자 정보</h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                이름
              </label>
              <Input id="name" name="name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                이메일
              </label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="password">
                비밀번호
              </label>
              <Input id="password" name="password" type="password" />
            </div>
            <div className="flex items-center justify-between md:col-span-2">
              <Link className="text-sm text-slate-600" href="/login">
                로그인으로 돌아가기
              </Link>
              <Button type="button">가입하기</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
