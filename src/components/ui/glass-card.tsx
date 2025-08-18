import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const glassCardVariants = cva(
  "backdrop-blur-glass border rounded-2xl shadow-glass transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white/10 border-white/20 hover:bg-white/15 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-900/50",
        primary: "bg-primary/10 border-primary/20 hover:bg-primary/15 shadow-glow",
        hp: "bg-hp/10 border-hp/20 hover:bg-hp/15 shadow-hp-glow",
        stamina: "bg-stamina/10 border-stamina/20 hover:bg-stamina/15 shadow-stamina-glow",
        strength: "bg-strength/10 border-strength/20 hover:bg-strength/15 shadow-strength-glow",
        defense: "bg-defense/10 border-defense/20 hover:bg-defense/15 shadow-defense-glow",
        solid: "bg-white dark:bg-slate-900 border-border"
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8"
      },
      glow: {
        none: "",
        subtle: "hover:shadow-glow",
        strong: "shadow-glow hover:animate-glow-pulse"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      glow: "none"
    }
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, glow, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, size, glow, className }))}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };