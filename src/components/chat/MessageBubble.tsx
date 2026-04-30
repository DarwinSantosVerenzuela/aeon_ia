"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          borderRadius: 18,
          ...(isUser ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }),
          padding: "12px 16px",
          fontSize: 14,
          lineHeight: 1.6,
          background: isUser ? "var(--bg-tertiary)" : "var(--bg-secondary)",
          border: `1px solid ${isUser ? "var(--separator-opaque)" : "var(--separator)"}`,
          color: isUser ? "var(--label-primary)" : "var(--label-secondary)",
        }}
      >
        {/* Label */}
        <span
          style={{
            display: "block",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 4,
            fontWeight: 500,
            color: isUser ? "var(--label-quaternary)" : "var(--label-tertiary)",
          }}
        >
          {isUser ? "Tú" : "Aeon"}
        </span>

        {/* Content */}
        <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
          {message.content}
          {message.isStreaming && (
            <motion.span
              style={{
                display: "inline-block",
                width: 2,
                height: 16,
                background: "var(--label-tertiary)",
                marginLeft: 2,
                verticalAlign: "text-bottom",
              }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </p>

        {/* Time */}
        <span
          style={{
            display: "block",
            marginTop: 6,
            fontSize: 10,
            color: "var(--label-quaternary)",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
