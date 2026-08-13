import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-600/20",
        className
      )}
      {...props}
    />
  );
}
