import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-thesis-accent/15 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-thesis-primary text-white hover:bg-thesis-primary/90",
        variant === "secondary" &&
          "border border-thesis-border bg-white text-thesis-primary hover:border-thesis-accent/60 hover:bg-thesis-accent/5",
        variant === "ghost" &&
          "text-thesis-muted hover:bg-thesis-primary/5 hover:text-thesis-primary",
        className
      )}
      {...props}
    />
  );
}
