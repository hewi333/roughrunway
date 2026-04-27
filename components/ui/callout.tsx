import * as React from "react";
import { Info, Lightbulb, AlertTriangle, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "tip" | "warning" | "success";

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  title?: string;
}

const VARIANT_STYLE: Record<
  CalloutVariant,
  {
    container: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    label: string;
  }
> = {
  info: {
    container:
      "border-sky-blue/40 bg-sky-blue/5 dark:border-sky-blue-dark/40 dark:bg-sky-blue-dark/5",
    icon: Info,
    iconColor: "text-sky-blue dark:text-sky-blue-dark",
    label: "Note",
  },
  tip: {
    container:
      "border-knob-gold/40 bg-knob-gold/5 dark:border-knob-gold-dark/40 dark:bg-knob-gold-dark/5",
    icon: Lightbulb,
    iconColor: "text-knob-gold dark:text-knob-gold-dark",
    label: "Tip",
  },
  warning: {
    container:
      "border-swiss-red/40 bg-swiss-red/5 dark:border-aviation-red-dark/40 dark:bg-aviation-red-dark/5",
    icon: AlertTriangle,
    iconColor: "text-swiss-red dark:text-aviation-red-dark",
    label: "Heads up",
  },
  success: {
    container:
      "border-aviation-green/40 bg-aviation-green/5 dark:border-aviation-green-dark/40 dark:bg-aviation-green-dark/5",
    icon: ShieldCheck,
    iconColor: "text-aviation-green dark:text-aviation-green-dark",
    label: "Good practice",
  },
};

export function Callout({
  variant = "info",
  title,
  className,
  children,
  ...props
}: CalloutProps) {
  const style = VARIANT_STYLE[variant];
  const Icon = style.icon;
  const heading = title ?? style.label;

  return (
    <div
      role="note"
      className={cn(
        "rounded-panel border p-4 flex gap-3",
        style.container,
        className
      )}
      {...props}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", style.iconColor)} aria-hidden="true" />
      <div className="space-y-1">
        <div className={cn("text-placard uppercase tracking-widest", style.iconColor)}>
          {heading}
        </div>
        <div className="text-body text-foreground">{children}</div>
      </div>
    </div>
  );
}
