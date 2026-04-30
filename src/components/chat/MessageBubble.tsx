"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Chat message — user right-aligned, assistant left-aligned.
 * Max-width prevents full-width stretch.
 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" as const }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[72%] rounded-2xl px-4 py-3",
          "text-sm leading-relaxed",
          isUser
            ? "bg-white/[0.09] border border-white/[0.1] text-[var(--aeon-text-primary)] rounded-br-lg"
            : "bg-white/[0.04] border border-white/[0.07] text-[var(--aeon-text-secondary)] rounded-bl-lg"
        )}
      >
        {/* Role */}
        <span
          className={cn(
            "block text-[10px] uppercase tracking-[0.1em] mb-1 font-medium",
            isUser ? "text-[var(--aeon-text-tertiary)]" : "text-[var(--aeon-accent)]"
          )}
        >
          {isUser ? "Tú" : "Aeon"}
        </span>

        {/* Content */}
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <motion.span
              className="inline-block w-0.5 h-4 bg-[var(--aeon-accent-light)] ml-0.5 align-text-bottom"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </p>

        {/* Timestamp */}
        <span className="block mt-1.5 text-[10px] text-[var(--aeon-text-muted)] tracking-wide">
          {new Date(message.timestamp).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
