"use client";

import { motion } from "framer-motion";

/**
 * Animated typing indicator with three pulsing dots.
 * Displayed when the AI is generating a response.
 */
export default function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-4 py-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--aeon-text-tertiary)]"
          />
        ))}
      </div>
      <span className="text-xs text-[var(--aeon-text-muted)] ml-2 tracking-wide">
        Aeon está pensando...
      </span>
    </motion.div>
  );
}
