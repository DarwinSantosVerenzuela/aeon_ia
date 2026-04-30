"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "@/components/ui/TypingIndicator";

/**
 * Main chat orchestrator component.
 * Manages the message list, auto-scroll, and streaming state.
 */
export default function ChatContainer() {
  const { messages, isStreaming, error, sendMessage, stopStream } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[var(--aeon-bg)] noise-overlay">
      {/* Header */}
      <ChatHeader />

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
      >
        {/* Subtle ambient glow in chat area */}
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(174,174,178,0.03) 0%, transparent 60%)",
          }}
        />

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 relative z-10">
          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7 text-[var(--aeon-text-muted)]" />
              </div>
              <h2 className="text-xl font-medium text-[var(--aeon-text-secondary)] mb-2 tracking-wide">
                Aeon IA
              </h2>
              <p className="text-sm text-[var(--aeon-text-muted)] max-w-sm leading-relaxed tracking-wide">
                Inicia una conversación. Tus mensajes son procesados de forma
                segura y soberana.
              </p>

              {/* Suggested prompts */}
              <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-md">
                {[
                  "¿Qué puedes hacer?",
                  "Explica tu arquitectura",
                  "¿Cómo funciona la soberanía?",
                ].map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(prompt)}
                    className="px-4 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.06] text-[var(--aeon-text-tertiary)] hover:text-[var(--aeon-text-secondary)] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 cursor-pointer tracking-wide"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message list */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-3"
              >
                <span className="text-xs text-red-400/70 tracking-wide">
                  {error}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopStream}
        isStreaming={isStreaming}
      />
    </div>
  );
}
