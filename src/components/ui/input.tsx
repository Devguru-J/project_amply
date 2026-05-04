"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70",
          "transition-all duration-300 ease-smooth",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:bg-white/[0.07]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
