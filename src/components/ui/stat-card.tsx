import * as React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";
import { Progress } from "./progress";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface StatCardProps {
  title: string;
  current: number;
  goal: number;
  unit: string;
  icon: LucideIcon;
  variant: "hp" | "stamina" | "strength" | "defense";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const statVariants = {
  hp: {
    gradient: "bg-gradient-hp",
    text: "text-hp-foreground",
    progress: "bg-hp"
  },
  stamina: {
    gradient: "bg-gradient-stamina",
    text: "text-stamina-foreground",
    progress: "bg-stamina"
  },
  strength: {
    gradient: "bg-gradient-strength",
    text: "text-strength-foreground",
    progress: "bg-strength"
  },
  defense: {
    gradient: "bg-gradient-defense",
    text: "text-defense-foreground",
    progress: "bg-defense"
  }
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, current, goal, unit, icon: Icon, variant, size = "md", className }, ref) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const remaining = Math.max(goal - current, 0);
    const isXL = size === "xl";
    const styles = statVariants[variant];

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <GlassCard 
          variant={variant} 
          size={isXL ? "xl" : "lg"} 
          glow={isXL ? "strong" : "subtle"}
          className={cn("relative overflow-hidden", {
            "min-h-48": isXL,
            "min-h-32": !isXL
          })}
        >
          {/* Background gradient overlay */}
          <div className={cn("absolute inset-0 opacity-10", styles.gradient)} />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", styles.gradient)}>
                  <Icon className={cn("h-5 w-5", styles.text)} />
                </div>
                <div>
                  <h3 className={cn("font-semibold", {
                    "text-2xl": isXL,
                    "text-lg": !isXL
                  })}>
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {percentage.toFixed(0)}% complete
                  </p>
                </div>
              </div>
              
              {percentage >= 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  ✨
                </motion.div>
              )}
            </div>

            {/* Stats */}
            <div className={cn("grid grid-cols-2 gap-4 mb-4", {
              "text-2xl": isXL,
              "text-xl": !isXL
            })}>
              <div>
                <div className="font-bold">
                  {current.toLocaleString()}
                  <span className="text-sm font-normal ml-1">{unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <div>
                <div className="font-bold">
                  {remaining.toLocaleString()}
                  <span className="text-sm font-normal ml-1">{unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={percentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{goal.toLocaleString()} {unit}</span>
              </div>
            </div>

            {/* XP indicator for non-XL cards */}
            {!isXL && (
              <div className="mt-3 text-xs text-muted-foreground">
                +{Math.floor(current / 50)}0 XP earned
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };