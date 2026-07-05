import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M3 22C10 20 18 15 29 5c-2 8-7 14-13 17l-4 5-2-6-7 1Z"
          fill="currentColor"
          className="text-gold"
        />
        <path
          d="M3 22c5.5-1.6 11.5-5 17-9"
          stroke="#faf8f5"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-[22px] tracking-tight text-ink">
        Aviawings
      </span>
    </span>
  );
}
