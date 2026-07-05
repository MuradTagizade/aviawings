import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium",
        "transition-all duration-300 select-none cursor-pointer",
        "disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.98]",
        {
          primary:
            "bg-ink text-cream hover:bg-ink/90 hover:shadow-lift",
          gold: "bg-gold text-white hover:bg-gold-deep hover:shadow-lift",
          outline:
            "border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-sand/60",
          ghost: "bg-transparent text-ink hover:bg-sand",
        }[variant],
        {
          sm: "h-9 px-4 text-sm",
          md: "h-11 px-6 text-sm",
          lg: "h-13 px-8 text-base",
        }[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
