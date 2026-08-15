import { RegisterForm } from "@/app/(auth)/register/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-black text-white shadow-[inset_0_-8px_18px_rgb(0_111_106/0.45)]">
              C
            </span>
            <span className="text-lg font-bold text-slate-950">
              CustomerFlow
            </span>
          </div>
          <CardTitle className="text-xl">CustomerFlow 회원가입</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            사업장과 owner 계정을 만들고 고객 운영을 시작합니다.
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
