"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "@/components/ui/TypingIndicator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Full-screen chat layout.
 * Uses a single centered column for header, messages, and input.
 */
export default function ChatContainer() {
  const { messages, isStreaming, error, sendMessage, stopStream } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--aeon-bg)]">
      {/* ━━━ HEADER ━━━ */}
      <div className="h-14 flex-shrink-0 border-b border-white/[0.06] bg-[var(--aeon-bg)]/90 backdrop-blur-xl z-20">
        <div className="h-full w-full max-w-[720px] mx-auto px-6 flex items-center justify-between relative">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--aeon-text-tertiary)] hover:text-[var(--aeon-text-primary)] transition-colors z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-wide hidden sm:inline">Inicio</span>
          </Link>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm font-medium tracking-wider text-[var(--aeon-text-primary)]">
              Aeon
            </span>
            <span className="text-sm font-light tracking-wider text-[var(--aeon-text-tertiary)] ml-1.5">
              IA
            </span>
          </div>

          <div className="flex items-center gap-2 z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--aeon-accent)]" />
            <span className="text-xs text-[var(--aeon-text-tertiary)] tracking-wide">
              Demo
            </span>
          </div>
        </div>
      </div>

      {/* ━━━ MESSAGES ━━━ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[720px] mx-auto px-6">
          {/* Empty state — truly centered */}
          {!hasMessages && (
            <div
              className="flex items-center justify-center"
              style={{ minHeight: "calc(100dvh - 200px)" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center text-center w-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
                  <MessageCircle className="w-7 h-7 text-[var(--aeon-text-muted)]" />
                </div>

                <h2 className="text-xl font-medium text-[var(--aeon-text-primary)] mb-2 tracking-wide">
                  Aeon IA
                </h2>

                <p className="text-sm text-[var(--aeon-text-tertiary)] max-w-md leading-relaxed tracking-wide mb-10">
                  Inicia una conversación. Tus mensajes son procesados de forma
                  segura y soberana.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {[
                    "¿Qué puedes hacer?",
                    "Explica tu arquitectura",
                    "¿Cómo funciona la soberanía?",
                  ].map((prompt) => (
                    <motion.button
                      key={prompt}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => sendMessage(prompt)}
                      className="px-5 py-2.5 text-[13px] rounded-xl bg-white/[0.04] border border-white/[0.1] text-[var(--aeon-text-secondary)] hover:text-[var(--aeon-text-primary)] hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-200 cursor-pointer tracking-wide"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Messages */}
          {hasMessages && (
            <div className="py-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {isStreaming &&
                  messages[messages.length - 1]?.content === "" && (
                    <TypingIndicator />
                  )}
              </AnimatePresence>

              {error && (
                <div className="text-center py-3">
                  <span className="text-xs text-red-400/80">{error}</span>
                </div>
              )}

              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* ━━━ INPUT ━━━ */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[var(--aeon-bg)]">
        <div className="w-full max-w-[720px] mx-auto px-6 py-4">
          <ChatInput
            onSend={sendMessage}
            onStop={stopStream}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
