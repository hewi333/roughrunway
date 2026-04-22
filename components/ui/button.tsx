import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Retro Swiss Aviation buttons. State conventions per
// docs/DESIGN-IMPLEMENTATION.md §5: brightness shift on hover,
// inset shadow ("knob depression") on active, swiss-red focus ring.
const buttonVariants = cva(
  "inline-flex items-center justify-center text-body font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:opacity-40 disabled:pointer-events-none active:duration-80",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-precise hover:brightness-105 active:shadow-inner active:brightness-95",
        knob:
          "bg-knob-gold text-ink rounded-knob hover:brightness-105 active:shadow-inner active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground rounded-precise hover:brightness-105 active:brightness-95",
        outline:
          "border border-knob-silver bg-background rounded-precise hover:bg-muted hover:border-ink-secondary dark:border-knob-silver-dark",
        secondary:
          "bg-secondary text-secondary-foreground rounded-precise hover:bg-muted",
        ghost:
          "rounded-precise hover:bg-muted",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10 rounded-knob",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
