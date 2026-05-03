"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pin, Trash2, ChevronUp, ChevronDown, Plus, MessageCircle, MoreHorizontal } from "lucide-react";
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close dropdown on click outside
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if clicking inside dropdown
      if (dropdownRef.current?.contains(target)) return;
      // Don't close if clicking the trigger button
      const btn = btnRefs.current[openMenuId];
      if (btn?.contains(target)) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const openMenu = useCallback((convId: string, isPinned: boolean, btnEl: HTMLButtonElement) => {
    if (openMenuId === convId) { setOpenMenuId(null); return; }
    const rect = btnEl.getBoundingClientRect();
    const menuHeight = isPinned ? 180 : 90;
    const spaceBelow = window.innerHeight - rect.bottom;

    const style: React.CSSProperties = {
      position: "fixed",
      right: window.innerWidth - rect.right,
      width: 160,
      padding: 4,
      borderRadius: 12,
      background: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06)",
      zIndex: 9999,
    };

    if (spaceBelow > menuHeight + 12) {
      style.top = rect.bottom + 4;
    } else {
      style.bottom = window.innerHeight - rect.top + 4;
    }

    setMenuStyle(style);
    setOpenMenuId(convId);
  }, [openMenuId]);

  // Find the active conversation for the dropdown
  const activeConv = openMenuId ? conversations.find(c => c.id === openMenuId) : null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setOpenMenuId(null); onClose(); }}
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
                <button onClick={() => { setOpenMenuId(null); onClose(); }} style={{
                  width: 28, height: 28, borderRadius: 8, border: "none",
                  background: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center",
                  cursor: "pointer", color: "#48484a",
                }}>
                  <X size={14} />
                </button>
              </div>

              {/* New conversation button */}
              <div style={{ padding: "10px 12px 4px", flexShrink: 0 }}>
                <button onClick={onNew} style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  padding: "10px 16px", borderRadius: 10,
                  background: "transparent",
                  border: "1.5px solid rgba(0,0,0,0.2)",
                  color: "#6e6e73", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)"; }}
                >
                  <Plus size={15} />
                  Nueva conversación
                </button>
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
                        <div
                          key={conv.id}
                          style={{
                            padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                            background: isActive ? "rgba(0,122,255,0.08)" : "transparent",
                            border: isActive ? "1px solid rgba(0,122,255,0.2)" : "1px solid transparent",
                            transition: "all 0.15s",
                            position: "relative",
                          }}
                          onClick={() => { setOpenMenuId(null); onSelect(conv.id); onClose(); }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.background = isActive ? "rgba(0,122,255,0.08)" : "transparent";
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", marginBottom: 1, paddingRight: conv.isPinned ? 58 : 30, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {conv.title}
                          </div>
                          <div style={{
                            fontSize: 11, color: "#aeaeb2", lineHeight: 1.3,
                            overflow: "hidden", textOverflow: "ellipsis",
                            whiteSpace: "nowrap", paddingRight: conv.isPinned ? 58 : 30,
                          }}>
                            {conv.preview}
                          </div>

                          {/* Right icons group — pin + three dots */}
                          <div style={{
                            position: "absolute", top: "50%", right: 8,
                            transform: "translateY(-50%)",
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                            {conv.isPinned && (
                              <div style={{
                                width: 24, height: 24, borderRadius: 6,
                                background: "rgba(0,122,255,0.08)",
                                display: "grid", placeItems: "center",
                              }}>
                                <Pin size={11} color="#007aff" />
                              </div>
                            )}
                            <button
                              ref={(el) => { btnRefs.current[conv.id] = el; }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openMenu(conv.id, !!conv.isPinned, e.currentTarget);
                              }}
                              style={{
                                width: 24, height: 24, borderRadius: 6, border: "none",
                                background: openMenuId === conv.id ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
                                display: "grid", placeItems: "center",
                                cursor: "pointer", color: "#86868b", transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.08)"; }}
                              onMouseLeave={(e) => { if (openMenuId !== conv.id) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
                            >
                              <MoreHorizontal size={13} />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ DROPDOWN RENDERED OUTSIDE SIDEBAR (portal-like) ═══ */}
      {openMenuId && activeConv && (
        <div
          ref={dropdownRef}
          style={menuStyle}
        >
          <MenuOption
            icon={<Pin size={13} color={activeConv.isPinned ? "#007aff" : "#6e6e73"} />}
            label={activeConv.isPinned ? "Despinear" : "Pinear"}
            onClick={() => { onTogglePin(activeConv.id); setOpenMenuId(null); }}
          />
          {activeConv.isPinned && (
            <>
              <MenuOption
                icon={<ChevronUp size={13} />}
                label="Subir"
                onClick={() => { onReorder(activeConv.id, "up"); setOpenMenuId(null); }}
              />
              <MenuOption
                icon={<ChevronDown size={13} />}
                label="Bajar"
                onClick={() => { onReorder(activeConv.id, "down"); setOpenMenuId(null); }}
              />
            </>
          )}
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "3px 8px" }} />
          <MenuOption
            icon={<Trash2 size={13} color="#ff3b30" />}
            label="Eliminar"
            danger
            onClick={() => { onDelete(activeConv.id); setOpenMenuId(null); }}
          />
        </div>
      )}
    </>
  );
}

/* ═══ Dropdown Menu Option ═══ */

function MenuOption({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 8,
      padding: "7px 10px", borderRadius: 8, border: "none",
      background: "transparent", cursor: "pointer",
      fontSize: 12, fontWeight: 500,
      color: danger ? "#ff3b30" : "#1d1d1f",
      transition: "background 0.12s", textAlign: "left",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "rgba(255,59,48,0.06)" : "rgba(0,0,0,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
      {label}
    </button>
  );
}
