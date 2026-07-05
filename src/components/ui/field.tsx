import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {error && <p className="text-[13px] text-coral">{error}</p>}
    </div>
  );
}
