"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CustomerPickerCustomer = {
  id: string;
  name: string;
  phone: string | null;
};

type CustomerPickerProps = {
  customers: CustomerPickerCustomer[];
  defaultCustomerId?: string;
  required?: boolean;
};

function customerLabel(customer: CustomerPickerCustomer) {
  return customer.phone ? `${customer.name} / ${customer.phone}` : customer.name;
}

export function CustomerPicker({
  customers,
  defaultCustomerId,
  required = true
}: CustomerPickerProps) {
  const defaultCustomer = customers.find(
    (customer) => customer.id === defaultCustomerId
  );
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomerPickerCustomer | undefined
  >(defaultCustomer);
  const [query, setQuery] = useState(defaultCustomer ? customerLabel(defaultCustomer) : "");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery || selectedCustomer) {
      return customers.slice(0, 8);
    }

    return customers
      .filter((customer) =>
        [customer.name, customer.phone]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery))
      )
      .slice(0, 8);
  }, [customers, query, selectedCustomer]);
  const shouldShowResults = query.trim().length > 0;

  return (
    <div className="space-y-2">
      <label className="space-y-2" htmlFor="customer-search">
        <span className="text-sm font-semibold text-slate-700">고객</span>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            aria-label="고객 검색"
            autoComplete="off"
            className="pl-9 pr-10"
            id="customer-search"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedCustomer(undefined);
            }}
            placeholder="고객 검색"
            value={query}
          />
          {query ? (
            <button
              aria-label="고객 선택 지우기"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => {
                setQuery("");
                setSelectedCustomer(undefined);
              }}
              type="button"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </label>
      <input name="customerId" type="hidden" value={selectedCustomer?.id ?? ""} />
      {shouldShowResults ? (
        <div
          aria-label="고객 선택 결과"
          className="max-h-64 overflow-y-auto rounded-md border border-[var(--border)] bg-white p-1 shadow-sm"
          role="listbox"
        >
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              const isSelected = customer.id === selectedCustomer?.id;

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                    isSelected && "bg-teal-50 text-teal-900"
                  )}
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setQuery(customerLabel(customer));
                  }}
                  role="option"
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-950">
                      {customer.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {customer.phone ?? "전화번호 없음"}
                    </span>
                  </span>
                  {isSelected ? (
                    <span className="shrink-0 rounded bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700">
                      선택됨
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-6 text-center text-sm text-slate-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      ) : null}
      <p className="text-xs text-slate-500">
        고객명 또는 전화번호 일부로 검색한 뒤 고객을 선택하세요.
      </p>
      {required && !selectedCustomer ? (
        <p className="text-xs font-medium text-amber-700">고객 선택이 필요합니다.</p>
      ) : null}
    </div>
  );
}
