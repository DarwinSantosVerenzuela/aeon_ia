"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Pin, Trash2, ChevronUp, ChevronDown, Plus, MessageCircle } from "lucide-react";
import type { ConversationEntry } from "@/hooks/useConversationHistory";

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationEntry[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
}

export default function ConversationSidebar({
  isOpen, onClose, conversations, activeId,
  onSelect, onNew, onDelete, onTogglePin, onReorder,
}: ConversationSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 49,
              background: "rgba(0,0,0,0.15)",
            }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-110%" }}
            animate={{ x: 0 }}
            exit={{ x: "-110%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed", top: 64, left: 12, bottom: 12,
              width: 300, zIndex: 50,
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
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>
                Conversaciones
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={onNew} title="Nueva conversación" style={{
                  width: 28, height: 28, borderRadius: 8, border: "none",
                  background: "#007aff", display: "grid", placeItems: "center",
                  cursor: "pointer", color: "#fff",
                }}>
                  <Plus size={14} />
                </button>
                <button onClick={onClose} style={{
                  width: 28, height: 28, borderRadius: 8, border: "none",
                  background: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center",
                  cursor: "pointer", color: "#86868b",
                }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {conversations.length === 0 ? (
                <div style={{
                  height: "100%", display: "grid", placeItems: "center",
                  color: "#aeaeb2", fontSize: 13, textAlign: "center",
                }}>
                  <div>
                    <MessageCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p>No hay conversaciones</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Inicia una nueva</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {conversations.map((conv) => {
                    const isActive = conv.id === activeId;
                    return (
                      <motion.div
                        key={conv.id}
                        layout
                        style={{
                          padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                          background: isActive ? "rgba(0,122,255,0.08)" : "transparent",
                          border: isActive ? "1px solid rgba(0,122,255,0.2)" : "1px solid transparent",
                          transition: "all 0.15s",
                          position: "relative",
                        }}
                        onClick={() => { onSelect(conv.id); onClose(); }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Pin badge */}
                        {conv.isPinned && (
                          <Pin size={10} color="#007aff" style={{
                            position: "absolute", top: 6, right: 6,
                          }} />
                        )}

                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f", marginBottom: 2 }}>
                          {conv.title}
                        </div>
                        <div style={{
                          fontSize: 11, color: "#aeaeb2", lineHeight: 1.3,
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {conv.preview}
                        </div>
                        <div style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          marginTop: 6,
                        }}>
                          <span style={{ fontSize: 10, color: "#c7c7cc" }}>
                            {new Date(conv.updatedAt).toLocaleDateString("es-ES", {
                              day: "numeric", month: "short",
                            })}
                          </span>
                          <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
                            <MiniBtn onClick={() => onTogglePin(conv.id)} title={conv.isPinned ? "Despinear" : "Pinear"}>
                              <Pin size={11} color={conv.isPinned ? "#007aff" : "#c7c7cc"} />
                            </MiniBtn>
                            {conv.isPinned && (
                              <>
                                <MiniBtn onClick={() => onReorder(conv.id, "up")} title="Subir">
                                  <ChevronUp size={11} />
                                </MiniBtn>
                                <MiniBtn onClick={() => onReorder(conv.id, "down")} title="Bajar">
                                  <ChevronDown size={11} />
                                </MiniBtn>
                              </>
                            )}
                            <MiniBtn onClick={() => onDelete(conv.id)} title="Eliminar">
                              <Trash2 size={11} color="#ff3b30" />
                            </MiniBtn>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MiniBtn({ children, onClick, title }: {
  children: React.ReactNode; onClick: () => void; title: string;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 22, height: 22, borderRadius: 6, border: "none",
      background: "rgba(0,0,0,0.04)", display: "grid", placeItems: "center",
      cursor: "pointer", color: "#aeaeb2", transition: "all 0.15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
    >{children}</button>
  );
}
