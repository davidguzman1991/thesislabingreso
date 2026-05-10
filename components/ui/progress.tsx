import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[#1E2D5C]", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full w-full origin-left rounded-full bg-[#00E5FF] transition-transform duration-500 ease-in-out"
        style={{ transform: `scaleX(${Math.max(0, Math.min(value, 100)) / 100})` }}
      />
    </div>
  );
}
