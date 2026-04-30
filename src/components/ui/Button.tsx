"use client";

import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: "primary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children?: ReactNode;
}

const variantStyles = {
  primary:
    "bg-white/10 text-white hover:bg-white/15 border border-white/10 hover:border-white/20",
  ghost:
    "bg-transparent text-[var(--aeon-text-secondary)] hover:text-[var(--aeon-text-primary)] hover:bg-white/5",
  glass:
    "glass hover:bg-[var(--glass-bg-hover)] text-[var(--aeon-text-primary)]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

/**
 * Animated button with glassmorphism variants.
 * Micro-interaction: scale on tap, subtle hover glow.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      className,
      disabled,
      children,
      onDrag: _onDrag,
      onDragStart: _onDragStart,
      onDragEnd: _onDragEnd,
      onAnimationStart: _onAnimationStart,
      ...rest
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-medium tracking-wide",
          "transition-all duration-200",
          "cursor-pointer select-none",
          "disabled:opacity-40 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? (
          <motion.span
            className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" as const }}
          />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
