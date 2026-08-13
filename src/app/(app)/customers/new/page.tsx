import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { listTags } from "@/server/tags/service";
import { CustomerForm } from "./customer-form";

export default async function NewCustomerPage() {
  const organizationId = await requireOrganizationId();
  const { tags } = await listTags({
    organizationId,
    pageSize: 100
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/customers"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          고객 목록
        </Link>
        <Badge className="mt-5">Customers</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          고객 등록
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          이름만으로도 먼저 등록하고, 상담이 진행되며 정보를 보강할 수 있습니다.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>기본정보</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            필수 정보는 고객명뿐입니다. 상담이 시작되면 전화번호와 메모를 보강하세요.
          </p>
        </CardHeader>
        <CardContent>
          <CustomerForm tags={tags} />
        </CardContent>
      </Card>
    </div>
  );
}
