import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-4 focus-visible:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
);

Input.displayName = "Input";
