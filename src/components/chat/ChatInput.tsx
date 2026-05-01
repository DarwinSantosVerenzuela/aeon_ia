"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isStreaming = false, disabled = false }: ChatInputProps) {
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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!isStreaming) send(); }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = ref.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 150)}px`; }
  };

  const hasText = value.trim().length > 0;

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 12,
        padding: "12px 16px", borderRadius: 16,
        background: "#ffffff",
        border: focused ? "1px solid #86868b" : "1px solid #d2d2d7",
        boxShadow: focused ? "0 0 0 3px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "all 0.2s",
      }}>
        <textarea
          ref={ref} value={value} onChange={onChange} onKeyDown={onKey}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled} placeholder="Escribe tu mensaje..." rows={1}
          style={{
            flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
            resize: "none", fontSize: 14, lineHeight: 1.5, color: "#48484a", maxHeight: 150,
          }}
        />

        {isStreaming ? (
          <button onClick={onStop} style={{
            flexShrink: 0, width: 32, height: 32, display: "grid", placeItems: "center",
            borderRadius: 8, background: "#e8e8ed", border: "none", cursor: "pointer",
          }}>
            <Square size={14} color="#6e6e73" fill="#6e6e73" />
          </button>
        ) : (
          <button onClick={send} disabled={!hasText || disabled} style={{
            flexShrink: 0, width: 32, height: 32, display: "grid", placeItems: "center",
            borderRadius: 8, background: hasText ? "#48484a" : "#e8e8ed",
            border: "none", cursor: hasText ? "pointer" : "default",
            opacity: hasText ? 1 : 0.5, transition: "all 0.15s",
          }}>
            <Send size={14} color={hasText ? "#ffffff" : "#aeaeb2"} />
          </button>
        )}
      </div>
      <p style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "#aeaeb2" }}>
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  );
}
