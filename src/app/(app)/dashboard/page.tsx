import { CalendarDays, ClipboardList, MessageSquareText, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "오늘 예약", value: "0", icon: CalendarDays },
  { label: "신규 고객", value: "0", icon: Users },
  { label: "후속 연락", value: "0", icon: ClipboardList },
  { label: "미완료 상담", value: "0", icon: MessageSquareText }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge>Phase 1</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          오늘 해야 할 일
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          고객, 상담, 예약, 후속관리 흐름을 이 대시보드에서 시작합니다.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{stat.label}</CardTitle>
                <Icon aria-hidden="true" className="h-5 w-5 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 일정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              아직 등록된 예약이 없습니다. 고객 등록 후 예약을 추가하세요.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>후속 연락 필요</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              아직 예정된 후속 연락이 없습니다.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
