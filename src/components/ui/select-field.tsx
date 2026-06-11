import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-secondary/70 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
