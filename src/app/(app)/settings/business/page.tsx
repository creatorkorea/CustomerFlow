import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/server/auth/session";
import { getBusinessSettings } from "@/server/settings/business-service";
import { BusinessSettingsForm } from "./business-settings-form";

export default async function BusinessSettingsPage() {
  const user = await requirePageUser();

  if (!user.organizationId) {
    throw new Error("사업장 권한을 확인할 수 없습니다.");
  }

  const settings = await getBusinessSettings({
    organizationId: BigInt(user.organizationId)
  });
  const canManage = user.role === "owner" || user.role === "admin";

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Badge>Settings</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          사업장 설정
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          서비스 전반에 표시되는 사업장 기본 정보를 관리합니다.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">플랜</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {settings.plan}
              </div>
            </div>
            <Badge variant="neutral">MVP</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">상태</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {settings.status}
              </div>
            </div>
            <Badge variant="success">운영</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">권한</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {canManage ? "관리" : "조회"}
              </div>
            </div>
            <Building2 aria-hidden="true" className="h-5 w-5 text-teal-700" />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessSettingsForm canManage={canManage} settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
