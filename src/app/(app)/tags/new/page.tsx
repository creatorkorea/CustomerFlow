import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagForm } from "./tag-form";

export default function NewTagPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/tags"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          태그 목록
        </Link>
        <Badge className="mt-5">Tags</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          태그 등록
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          고객 분류에 사용할 이름과 식별 색상을 지정합니다.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>태그 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <TagForm />
        </CardContent>
      </Card>
    </div>
  );
}
