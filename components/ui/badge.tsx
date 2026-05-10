import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "alert" | "pending" | "primary";
};

export function Badge({ className, tone = "primary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "primary" && "border-thesis-primary/10 bg-thesis-primary/5 text-thesis-primary",
        tone === "accent" && "border-thesis-accent/20 bg-thesis-accent/10 text-thesis-primary",
        tone === "alert" && "border-thesis-alert/20 bg-thesis-alert/10 text-thesis-primary",
        tone === "pending" && "border-thesis-pending/20 bg-thesis-pending/10 text-thesis-muted",
        className
      )}
      {...props}
    />
  );
}
