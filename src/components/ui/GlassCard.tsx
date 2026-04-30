"use client";

import { cn } from "@/lib/utils/cn";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  /** Glass intensity: subtle, default, strong */
  intensity?: "subtle" | "default" | "strong";
  /** Enable hover glow effect */
  glow?: boolean;
  /** Additional class names */
  className?: string;
}

const intensityMap = {
  subtle: "glass-subtle",
  default: "glass",
  strong: "glass-strong",
};

/**
 * Glassmorphism container with configurable intensity.
 * Uses Framer Motion for entrance animations.
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ intensity = "default", glow = false, className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          intensityMap[intensity],
          "rounded-2xl",
          glow && "glow-on-focus",
          "transition-all duration-300",
          className
        )}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
