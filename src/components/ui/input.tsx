import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-xl border border-ink/10 bg-surface px-4 text-[15px] text-ink",
      "placeholder:text-ink-faint transition-colors",
      "hover:border-ink/20 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
