"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ThumbsUp, ThumbsDown } from "lucide-react";
import type { ChatMessage } from "@/types";

interface ReactionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  likedMessages: ChatMessage[];
  dislikedMessages: ChatMessage[];
  onRemoveReaction: (id: string, r: "up" | "down") => void;
  onScrollTo?: (id: string) => void;
}

export default function ReactionsPanel({
  isOpen, onClose, likedMessages, dislikedMessages, onRemoveReaction, onScrollTo,
}: ReactionsPanelProps) {
  const total = likedMessages.length + dislikedMessages.length;

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
            width: 320, zIndex: 51,
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
              <ThumbsUp size={15} color="#007aff" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>Reacciones</span>
              {total > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 500, color: "#fff",
                  background: "#007aff", borderRadius: 10, padding: "1px 7px",
                }}>{total}</span>
              )}
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center",
              cursor: "pointer", color: "#86868b",
            }}><X size={14} /></button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {total === 0 ? (
              <div style={{
                height: "100%", display: "grid", placeItems: "center",
                color: "#aeaeb2", fontSize: 13, textAlign: "center",
              }}>
                <div>
                  <ThumbsUp size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                  <p>Sin reacciones aún</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Usa 👍 o 👎 en cualquier mensaje</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* LIKED */}
                {likedMessages.length > 0 && (
                  <section>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                    }}>
                      <ThumbsUp size={13} color="#007aff" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#007aff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Me gusta · {likedMessages.length}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {likedMessages.map((msg) => (
                        <ReactionCard
                          key={msg.id}
                          msg={msg}
                          type="up"
                          onRemove={() => onRemoveReaction(msg.id, "up")}
                          onScrollTo={() => { onScrollTo?.(msg.id); onClose(); }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* DISLIKED */}
                {dislikedMessages.length > 0 && (
                  <section>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                    }}>
                      <ThumbsDown size={13} color="#ff3b30" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#ff3b30", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        No me gusta · {dislikedMessages.length}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {dislikedMessages.map((msg) => (
                        <ReactionCard
                          key={msg.id}
                          msg={msg}
                          type="down"
                          onRemove={() => onRemoveReaction(msg.id, "down")}
                          onScrollTo={() => { onScrollTo?.(msg.id); onClose(); }}
                        />
                      ))}
                    </div>
                  </section>
                )}

              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReactionCard({ msg, type, onRemove, onScrollTo }: {
  msg: ChatMessage;
  type: "up" | "down";
  onRemove: () => void;
  onScrollTo?: () => void;
}) {
  const isLike = type === "up";
  const bg = isLike ? "rgba(0,122,255,0.06)" : "rgba(255,59,48,0.06)";
  const border = isLike ? "1px solid rgba(0,122,255,0.15)" : "1px solid rgba(255,59,48,0.15)";
  const labelColor = isLike ? "#007aff" : "#ff3b30";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={onScrollTo}
      style={{
        padding: "10px 12px", borderRadius: 12,
        background: bg, border, fontSize: 13, lineHeight: 1.5, color: "#1d1d1f",
        cursor: "pointer", transition: "filter 0.15s",
      }}
      whileHover={{ filter: "brightness(0.97)" }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: labelColor }}>
          {msg.role === "user" ? "Tú" : "Aeon"}
        </span>
        <button onClick={onRemove} title="Quitar reacción" style={{
          border: "none", background: "none", cursor: "pointer", color: "#c7c7cc", padding: 2,
        }}><X size={11} /></button>
      </div>
      <p style={{
        margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical" as const, overflow: "hidden",
      }}>
        {msg.content}
      </p>
    </motion.div>
  );
}
