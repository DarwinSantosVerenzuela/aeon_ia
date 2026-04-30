"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import Link from "next/link";

export default function ChatContainer() {
  const { messages, isStreaming, error, sendMessage, stopStream } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0a0a]">
      {/* ──────── HEADER ──────── */}
      <header className="shrink-0 h-[56px] border-b border-[#1d1d1f] flex items-center px-5">
        <div className="w-full max-w-[760px] mx-auto flex items-center justify-between relative">
          {/* Left — Back */}
          <Link href="/" className="z-10 flex items-center gap-2 text-[#8e8e93] hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-[13px] tracking-wide hidden sm:block">Inicio</span>
          </Link>

          {/* Center — Brand (absolutely centered) */}
          <div className="absolute left-0 right-0 flex items-center justify-center pointer-events-none">
            <span className="text-[15px] font-medium tracking-[0.02em] text-white">Aeon</span>
            <span className="text-[15px] font-light tracking-[0.02em] text-[#8e8e93] ml-1">IA</span>
          </div>

          {/* Right — Status */}
          <div className="z-10 flex items-center gap-2">
            <span className="w-[6px] h-[6px] rounded-full bg-[#636366]" />
            <span className="text-[12px] text-[#636366] tracking-wide">Demo</span>
          </div>
        </div>
      </header>

      {/* ──────── MAIN ──────── */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          /* ── Empty State: centered on screen ── */
          <div className="h-full flex items-center justify-center px-5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center -mt-16"
            >
              {/* Icon */}
              <div className="w-[56px] h-[56px] rounded-[16px] bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center mb-5">
                <MessageCircle size={24} className="text-[#636366]" />
              </div>

              {/* Title */}
              <h1 className="text-[22px] font-semibold text-white tracking-tight mb-1.5">
                Aeon IA
              </h1>

              {/* Subtitle */}
              <p className="text-[14px] text-[#8e8e93] max-w-[320px] leading-[1.5] mb-8">
                Inicia una conversación. Tus mensajes son procesados de forma segura y soberana.
              </p>

              {/* Suggestions */}
              <div className="flex flex-wrap justify-center gap-2">
                {["¿Qué puedes hacer?", "Explica tu arquitectura", "¿Cómo funciona la soberanía?"].map((text) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="px-4 py-2 text-[13px] rounded-full bg-[#1c1c1e] border border-[#2c2c2e] text-[#a1a1a6] hover:text-white hover:bg-[#2c2c2e] hover:border-[#3a3a3c] transition-all duration-150 cursor-pointer"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── Messages ── */
          <div className="w-full max-w-[760px] mx-auto px-5 py-5">
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
            </div>

            {error && (
              <p className="text-center text-[12px] text-red-400/80 mt-3">{error}</p>
            )}

            <div ref={bottomRef} className="h-6" />
          </div>
        )}
      </main>

      {/* ──────── INPUT ──────── */}
      <footer className="shrink-0 border-t border-[#1d1d1f] bg-[#0a0a0a] px-5 py-4">
        <div className="w-full max-w-[760px] mx-auto">
          <ChatInput
            onSend={sendMessage}
            onStop={stopStream}
            isStreaming={isStreaming}
          />
        </div>
      </footer>
    </div>
  );
}
