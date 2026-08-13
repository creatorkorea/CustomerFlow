import { RegisterForm } from "@/app/(auth)/register/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
