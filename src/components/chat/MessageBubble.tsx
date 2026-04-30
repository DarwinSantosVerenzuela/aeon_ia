"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Individual chat message bubble.
 * User messages: right-aligned with accent tint.
 * Assistant messages: left-aligned with glass background.
 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3",
          "text-sm leading-relaxed tracking-wide",
          isUser
            ? "bg-white/[0.08] border border-white/[0.08] text-[var(--aeon-text-primary)]"
            : "bg-white/[0.03] border border-white/[0.04] text-[var(--aeon-text-secondary)]",
          isUser ? "rounded-br-lg" : "rounded-bl-lg"
        )}
      >
        {/* Role label */}
        <div
          className={cn(
            "text-[10px] uppercase tracking-[0.12em] mb-1.5 font-medium",
            isUser
              ? "text-[var(--aeon-text-tertiary)]"
              : "text-[var(--aeon-accent)]"
          )}
        >
          {isUser ? "Tú" : "Aeon"}
        </div>

        {/* Message content */}
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <motion.span
              className="inline-block w-0.5 h-4 bg-[var(--aeon-accent-light)] ml-0.5 align-text-bottom"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </p>

        {/* Timestamp */}
        <div className="mt-2 text-[10px] text-[var(--aeon-text-muted)] tracking-wide">
          {new Date(message.timestamp).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
}
