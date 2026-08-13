import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/app/(auth)/login/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-[var(--border)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--primary)] text-sm font-black text-white">
              C
            </span>
            <span className="text-lg font-bold text-slate-950">
              CustomerFlow
            </span>
          </div>
          <CardTitle className="text-xl">CustomerFlow 로그인</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            고객, 상담, 예약, 후속관리를 한곳에서 관리하세요.
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
