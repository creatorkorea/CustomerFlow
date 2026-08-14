type BuildPageHrefOptions = {
  page: number;
  params?: Record<string, string | number | null | undefined>;
};

export function getPageSummary({
  page,
  pageSize,
  total
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (total === 0) {
    return {
      from: 0,
      to: 0,
      totalPages
    };
  }

  return {
    from: (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
    totalPages
  };
}

export function buildPageHref(
  pathname: string,
  { params = {}, page }: BuildPageHrefOptions
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined || value === null || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}
