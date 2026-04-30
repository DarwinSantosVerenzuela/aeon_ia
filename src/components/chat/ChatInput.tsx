"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const send = useCallback(() => {
    const v = value.trim();
    if (!v || disabled) return;
    onSend(v);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  }, [value, disabled, onSend]);

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) send();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div>
      {/* Input row */}
      <div
        className={`
          flex items-end gap-3 rounded-2xl border px-4 py-3
          transition-all duration-200
          ${focused
            ? "bg-[#1c1c1e] border-[#3a3a3c]"
            : "bg-[#141414] border-[#2c2c2e]"
          }
        `}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="Escribe tu mensaje..."
          rows={1}
          className="flex-1 min-w-0 bg-transparent resize-none outline-none text-[14px] text-white placeholder:text-[#48484a] leading-[1.5] max-h-[160px]"
        />

        <AnimatePresence mode="wait">
          {isStreaming ? (
            <motion.button
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={onStop}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#2c2c2e] hover:bg-[#3a3a3c] transition-colors cursor-pointer"
            >
              <Square size={14} className="text-[#a1a1a6] fill-current" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={send}
              disabled={!hasText || disabled}
              className={`
                shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer
                ${hasText
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-[#2c2c2e] text-[#48484a] pointer-events-none"
                }
              `}
            >
              <Send size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Hint */}
      <p className="mt-2 text-center text-[11px] text-[#3a3a3c]">
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  );
}
