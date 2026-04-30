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
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-[1.6]
          ${isUser
            ? "bg-[#2c2c2e] text-white rounded-br-md"
            : "bg-[#1c1c1e] border border-[#2c2c2e] text-[#d1d1d6] rounded-bl-md"
          }
        `}
      >
        {/* Label */}
        <span className={`block text-[10px] uppercase tracking-[0.08em] mb-1 font-medium ${isUser ? "text-[#636366]" : "text-[#8e8e93]"}`}>
          {isUser ? "Tú" : "Aeon"}
        </span>

        {/* Content */}
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <motion.span
              className="inline-block w-[2px] h-[16px] bg-[#8e8e93] ml-0.5 align-text-bottom"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </p>

        {/* Time */}
        <span className="block mt-1.5 text-[10px] text-[#48484a]">
          {new Date(message.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}
