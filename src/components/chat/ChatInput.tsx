"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Square } from "lucide-react";
import GlowInput from "@/components/ui/GlowInput";
import Button from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

/**
 * Floating glass chat input bar with glow effect.
 * Positioned at the bottom of the viewport with backdrop blur.
 */
export default function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) return;
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="sticky bottom-0 z-40 px-4 pb-5 pt-3"
    >
      {/* Background blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--aeon-bg)] via-[var(--aeon-bg)]/90 to-transparent pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Input */}
          <div className="flex-1">
            <GlowInput
              ref={textareaRef}
              value={value}
              onValueChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              isActive={value.length > 0}
              disabled={disabled}
              aria-label="Chat message input"
            />
          </div>

          {/* Send / Stop button */}
          <AnimatePresence mode="wait">
            {isStreaming ? (
              <motion.div
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="glass"
                  size="md"
                  onClick={onStop}
                  className="h-[52px] w-[52px] !p-0 rounded-2xl"
                  aria-label="Stop generation"
                >
                  <Square className="w-4 h-4 fill-current" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant={value.trim() ? "primary" : "glass"}
                  size="md"
                  onClick={handleSend}
                  disabled={!value.trim() || disabled}
                  className="h-[52px] w-[52px] !p-0 rounded-2xl"
                  aria-label="Send message"
                >
                  <motion.span
                    animate={
                      value.trim()
                        ? { rotate: 0, scale: 1 }
                        : { rotate: 0, scale: 0.9 }
                    }
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom hint */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-[var(--aeon-text-muted)] tracking-wider">
            Enter para enviar · Shift+Enter para nueva línea
          </span>
        </div>
      </div>
    </motion.div>
  );
}
