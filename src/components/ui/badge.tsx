import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-teal-50 text-teal-700 ring-teal-600/20",
        neutral: "bg-slate-100 text-slate-700 ring-slate-500/20",
        info: "bg-blue-50 text-blue-700 ring-blue-600/20",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/25",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        danger: "bg-rose-50 text-rose-700 ring-rose-600/20"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}
