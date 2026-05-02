"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Pin } from "lucide-react";
import type { ChatMessage } from "@/types";

interface PinnedPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedMessages: ChatMessage[];
  onUnpin: (id: string) => void;
  onScrollTo?: (id: string) => void;
}

export default function PinnedPanel({ isOpen, onClose, pinnedMessages, onUnpin, onScrollTo }: PinnedPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "110%" }}
          animate={{ x: 0 }}
          exit={{ x: "110%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            position: "fixed", top: 64, right: 12, bottom: 12,
            width: 320, zIndex: 50,
            background: "rgba(248,248,250,0.97)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.08)",
            display: "flex", flexDirection: "column",
            boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            height: 56, flexShrink: 0, display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 16px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Pin size={16} color="#007aff" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>
                Mensajes Pineados
              </span>
              <span style={{
                fontSize: 11, fontWeight: 500, color: "#fff",
                background: "#007aff", borderRadius: 10,
                padding: "1px 7px", minWidth: 18, textAlign: "center",
              }}>
                {pinnedMessages.length}
              </span>
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center",
              cursor: "pointer", color: "#86868b",
            }}>
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {pinnedMessages.length === 0 ? (
              <div style={{
                height: "100%", display: "grid", placeItems: "center",
                color: "#aeaeb2", fontSize: 13, textAlign: "center",
              }}>
                <div>
                  <Pin size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p>No hay mensajes pineados</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>
                    Pasa el mouse sobre un mensaje y toca 📌
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pinnedMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => { onScrollTo?.(msg.id); onClose(); }}
                    style={{
                      padding: "10px 12px", borderRadius: 12,
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      fontSize: 13, lineHeight: 1.5, color: "#1d1d1f",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    whileHover={{ background: "rgba(0,122,255,0.05)" }}
                  >
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: 6,
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: msg.role === "user" ? "#86868b" : "#007aff",
                      }}>
                        {msg.role === "user" ? "Tú" : "Aeon"}
                      </span>
                      <button onClick={() => onUnpin(msg.id)} title="Despinear" style={{
                        border: "none", background: "none", cursor: "pointer",
                        color: "#aeaeb2", padding: 2,
                      }}>
                        <X size={12} />
                      </button>
                    </div>
                    <p style={{
                      margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                    }}>
                      {msg.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
