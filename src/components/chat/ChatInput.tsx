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

/**
 * Chat input — raw form, no wrapper containers.
 * Parent provides the centered container and padding.
 */
export default function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const showGlow = isFocused || value.length > 0;

  return (
    <div>
      <div className="relative flex items-end gap-3">
        {/* Glow ring */}
        {showGlow && (
          <motion.div
            className="absolute -inset-px rounded-2xl pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              boxShadow: value.length > 0
                ? "0 0 25px rgba(200,200,210,0.12), 0 0 50px rgba(200,200,210,0.04)"
                : "0 0 15px rgba(200,200,210,0.08)",
            }}
          />
        )}

        {/* Input */}
        <div className="relative flex-1 min-w-0 z-10">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder="Escribe tu mensaje..."
            rows={1}
            className="w-full resize-none outline-none bg-white/[0.05] border border-white/[0.1] focus:border-white/[0.18] focus:bg-white/[0.07] rounded-2xl px-5 py-3.5 text-sm text-[var(--aeon-text-primary)] placeholder:text-[var(--aeon-text-muted)] leading-relaxed transition-all duration-200 backdrop-blur-sm"
            aria-label="Chat message input"
          />
        </div>

        {/* Button */}
        <AnimatePresence mode="wait">
          {isStreaming ? (
            <motion.button
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStop}
              className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] transition-all duration-200 cursor-pointer"
              aria-label="Detener"
            >
              <Square className="w-4 h-4 fill-current text-[var(--aeon-text-secondary)]" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] disabled:opacity-25 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4 text-[var(--aeon-text-secondary)]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-2.5 text-center text-[10px] text-[var(--aeon-text-muted)] tracking-wider">
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  );
}
