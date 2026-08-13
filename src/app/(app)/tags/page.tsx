import Link from "next/link";
import { Plus, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireOrganizationId } from "@/server/auth/session";
import { listTags } from "@/server/tags/service";

export default async function TagsPage() {
  const organizationId = await requireOrganizationId();
  const { tags, total } = await listTags({
    organizationId,
    pageSize: 100
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Tags</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            태그
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            고객을 빠르게 분류하기 위한 사업장 전용 태그입니다.
          </p>
        </div>
        <Link
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 sm:w-auto"
          href="/tags/new"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          태그 등록
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {tags.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <Tags aria-hidden="true" className="h-10 w-10 text-teal-700" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                아직 등록된 태그가 없습니다.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                VIP, 긴급, 재문의 같은 분류부터 시작하세요.
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-teal-700"
                href="/tags/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />첫 태그 등록
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="sr-only">태그 목록 총 {total}건</caption>
                <thead className="border-b border-[var(--border)] bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">태그</th>
                    <th className="px-4 py-3">색상</th>
                    <th className="px-4 py-3">등록일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {tags.map((tag) => (
                    <tr className="transition-colors hover:bg-teal-50/40" key={tag.id}>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-sm font-semibold text-slate-800">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: tag.color ?? "#0f766e" }}
                          />
                          {tag.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {tag.color ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Intl.DateTimeFormat("ko-KR", {
                          dateStyle: "short",
                          timeZone: "Asia/Seoul"
                        }).format(new Date(tag.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
