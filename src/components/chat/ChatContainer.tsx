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
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
      }}
    >
      {/* ═══════ HEADER ═══════ */}
      <div
        style={{
          height: 56,
          flexShrink: 0,
          borderBottom: "1px solid var(--separator)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "var(--bg-secondary)",
        }}
      >
        {/* Left */}
        <Link
          href="/"
          style={{
            position: "absolute",
            left: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--label-tertiary)",
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Inicio</span>
        </Link>

        {/* Center */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--label-primary)" }}>
            Aeon
          </span>
          <span style={{ fontSize: 15, fontWeight: 300, color: "var(--label-tertiary)" }}>
            IA
          </span>
        </div>

        {/* Right */}
        <div
          style={{
            position: "absolute",
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--label-quaternary)",
            }}
          />
          <span style={{ fontSize: 12, color: "var(--label-quaternary)" }}>Demo</span>
        </div>
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div
        style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
        className="custom-scrollbar"
      >
        {messages.length === 0 ? (
          /* ── Empty State: CSS Grid centering ── */
          <div
            style={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              padding: "0 24px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                marginTop: -40,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--separator)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 20,
                }}
              >
                <MessageCircle size={26} color="var(--label-tertiary)" />
              </div>

              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--label-primary)",
                  marginBottom: 6,
                  letterSpacing: "-0.01em",
                }}
              >
                Aeon IA
              </h1>

              <p
                style={{
                  fontSize: 15,
                  color: "var(--label-tertiary)",
                  maxWidth: 340,
                  lineHeight: 1.5,
                  marginBottom: 32,
                }}
              >
                Inicia una conversación. Tus mensajes son procesados de forma
                segura y soberana.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {[
                  "¿Qué puedes hacer?",
                  "Explica tu arquitectura",
                  "¿Cómo funciona la soberanía?",
                ].map((text) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    style={{
                      padding: "10px 18px",
                      fontSize: 13,
                      borderRadius: 12,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--separator)",
                      color: "var(--label-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "var(--bg-tertiary)";
                      e.currentTarget.style.borderColor = "var(--separator-opaque)";
                      e.currentTarget.style.color = "var(--label-primary)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "var(--bg-secondary)";
                      e.currentTarget.style.borderColor = "var(--separator)";
                      e.currentTarget.style.color = "var(--label-secondary)";
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── Messages ── */
          <div
            style={{
              width: "100%",
              maxWidth: 760,
              margin: "0 auto",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
            </div>

            {error && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#ff6b6b", marginTop: 12 }}>
                {error}
              </p>
            )}

            <div ref={bottomRef} style={{ height: 20 }} />
          </div>
        )}
      </div>

      {/* ═══════ INPUT ═══════ */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid var(--separator)",
          background: "var(--bg-secondary)",
          padding: "16px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
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
