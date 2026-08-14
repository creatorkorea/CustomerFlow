import Link from "next/link";

import { buildPageHref, getPageSummary } from "@/lib/pagination";

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  pathname: string;
  params?: Record<string, string | number | null | undefined>;
  total: number;
};

const disabledClassName =
  "inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-slate-50 px-3 text-sm font-semibold text-slate-400";
const linkClassName =
  "inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50";

export function Pagination({
  currentPage,
  pageSize,
  pathname,
  params,
  total
}: PaginationProps) {
  const { from, to, totalPages } = getPageSummary({
    page: currentPage,
    pageSize,
    total
  });
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-col gap-3 border-t border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-600">
        {from}-{to} / 총 {total}건
      </p>
      <div className="flex items-center gap-2">
        {currentPage <= 1 ? (
          <span aria-disabled="true" className={disabledClassName}>
            이전
          </span>
        ) : (
          <Link
            className={linkClassName}
            href={buildPageHref(pathname, {
              page: previousPage,
              params
            })}
          >
            이전
          </Link>
        )}
        <span className="inline-flex h-9 items-center justify-center rounded-md bg-slate-100 px-3 text-sm font-semibold text-slate-700">
          {currentPage} / {totalPages}
        </span>
        {currentPage >= totalPages ? (
          <span aria-disabled="true" className={disabledClassName}>
            다음
          </span>
        ) : (
          <Link
            className={linkClassName}
            href={buildPageHref(pathname, {
              page: nextPage,
              params
            })}
          >
            다음
          </Link>
        )}
      </div>
    </nav>
  );
}
