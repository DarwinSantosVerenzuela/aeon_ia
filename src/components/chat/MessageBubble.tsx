"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/types";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div style={{
        maxWidth: "75%", borderRadius: 18,
        ...(isUser ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }),
        padding: "12px 16px", fontSize: 14, lineHeight: 1.6,
        background: isUser ? "#007aff" : "#ffffff",
        border: isUser ? "none" : "1px solid #d2d2d7",
        color: isUser ? "#ffffff" : "#1d1d1f",
        boxShadow: isUser ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
      }}>
        <span style={{
          display: "block", fontSize: 10, textTransform: "uppercase",
          letterSpacing: "0.08em", marginBottom: 4, fontWeight: 500,
          color: isUser ? "rgba(255,255,255,0.7)" : "#86868b",
        }}>
          {isUser ? "Tú" : "Aeon"}
        </span>

        <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
          {message.content}
          {message.isStreaming && (
            <motion.span
              style={{ display: "inline-block", width: 2, height: 16, background: "#86868b", marginLeft: 2, verticalAlign: "text-bottom" }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </p>

        <span style={{ display: "block", marginTop: 6, fontSize: 10, color: isUser ? "rgba(255,255,255,0.6)" : "#aeaeb2" }}>
          {new Date(message.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}
