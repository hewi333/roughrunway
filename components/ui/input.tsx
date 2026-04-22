import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// Auto-applies font-mono for numeric inputs (cockpit convention from
// docs/DESIGN-IMPLEMENTATION.md §3 — all figures render in mono with
// tabular numerals). Text inputs continue using the sans default.
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const isNumeric = type === "number";
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-precise border border-input bg-background px-3 py-2 text-body ring-offset-background file:border-0 file:bg-transparent file:text-body file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 transition-colors",
          isNumeric && "font-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
