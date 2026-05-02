"use client";

import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useState, type TextareaHTMLAttributes } from "react";

interface GlowInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  /** Callback fired on value change */
  onValueChange?: (value: string) => void;
  /** Whether the input is actively being used (controls glow intensity) */
  isActive?: boolean;
}

/**
 * Floating glass input with dynamic glow effect.
 * Glow intensifies when focused and while typing.
 */
const GlowInput = forwardRef<HTMLTextAreaElement, GlowInputProps>(
  ({ className, isActive = false, onValueChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasContent, setHasContent] = useState(false);

    const showGlow = isFocused || isActive;

    return (
      <div className="relative">
        {/* Glow Layer */}
        <AnimatePresence>
          {showGlow && (
            <motion.div
              className="absolute -inset-[1px] rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                boxShadow: hasContent
                  ? "0 0 30px rgba(200,200,210,0.15), 0 0 60px rgba(200,200,210,0.05)"
                  : "0 0 20px rgba(200,200,210,0.1), 0 0 40px rgba(200,200,210,0.03)",
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Border glow gradient */}
        <AnimatePresence>
          {showGlow && (
            <motion.div
              className="absolute -inset-[1px] rounded-2xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.08) 100%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        <textarea
          ref={ref}
          className={cn(
            "relative z-10 w-full",
            "bg-white/[0.06] backdrop-blur-xl",
            "border border-white/[0.1]",
            "rounded-2xl px-5 py-4",
            "text-[var(--aeon-text-primary)] text-sm leading-relaxed",
            "placeholder:text-[var(--aeon-text-muted)]",
            "resize-none outline-none",
            "transition-all duration-300",
            "focus:border-white/[0.18] focus:bg-white/[0.08]",
            "selection:bg-white/10",
            className
          )}
          rows={1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setHasContent(e.target.value.length > 0);
            onValueChange?.(e.target.value);
          }}
          {...props}
        />
      </div>
    );
  }
);

GlowInput.displayName = "GlowInput";

export default GlowInput;
