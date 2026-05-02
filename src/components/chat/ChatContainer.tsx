"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowLeft, Pin, Menu, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { usePinnedMessages } from "@/hooks/usePinnedMessages";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useReactions } from "@/hooks/useReactions";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import PinnedPanel from "./PinnedPanel";
import ReactionsPanel from "./ReactionsPanel";
import ConversationSidebar from "./ConversationSidebar";

export default function ChatContainer() {
  const router = useRouter();
  // Active conversation ID — drives everything
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);

  const { messages, isStreaming, error, conversationId, sendMessage, stopStream, editMessage, clearMessages } = useChat(activeConvId);
  const { togglePin, isPinned, getPinnedMessages } = usePinnedMessages(conversationId);
  const { setReaction, getReaction } = useReactions(conversationId);
  const {
    conversations, saveConversation, deleteConversation,
    togglePinConversation, reorderConversation,
  } = useConversationHistory();

  const [showPins, setShowPins] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Derive liked/disliked message lists for ReactionsPanel
  const likedMessages = messages.filter((m) => getReaction(m.id) === "up");
  const dislikedMessages = messages.filter((m) => getReaction(m.id) === "down");
  const reactionsCount = likedMessages.length + dislikedMessages.length;

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-save conversation metadata when messages settle
  useEffect(() => {
    if (messages.length === 0) return;
    const streaming = messages.some((m) => m.isStreaming);
    if (streaming) return;

    const firstUser = messages.find((m) => m.role === "user");
    if (!firstUser) return;
    const title = firstUser.content.slice(0, 45) + (firstUser.content.length > 45 ? "…" : "");
    const last = messages[messages.length - 1];
    saveConversation(conversationId, title, last.content.slice(0, 80));
  }, [messages, conversationId, saveConversation]);

  const pinnedMessages = getPinnedMessages(messages);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id);
    setShowSidebar(false);
  }, []);

  const handleNewConversation = useCallback(() => {
    const newId = clearMessages();
    setActiveConvId(newId);
    setShowSidebar(false);
  }, [clearMessages]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    // If deleting active conversation, start fresh
    if (id === conversationId) {
      handleNewConversation();
    }
  }, [deleteConversation, conversationId, handleNewConversation]);

  const scrollToMessage = useCallback((id: string) => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f5f5f7" }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        height: 56, flexShrink: 0, display: "flex", alignItems: "center",
        padding: "0 16px", gap: 8, background: "#f5f5f7", zIndex: 10,
      }}>
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowSidebar((v) => !v)} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: showSidebar ? "rgba(0,122,255,0.1)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: showSidebar ? "1px solid rgba(0,122,255,0.3)" : "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "grid", placeItems: "center",
            cursor: "pointer", color: showSidebar ? "#007aff" : "#48484a", transition: "all 0.2s",
          }} title="Historial">
            <Menu size={16} />
          </button>
          <button
            onClick={() => { sessionStorage.removeItem("aeon-active-conv"); router.push("/"); }}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              color: "#48484a", fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} /><span>Inicio</span>
          </button>
        </div>

        {/* CENTER */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "6px 20px", borderRadius: 20, background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#48484a" }}>Aeon</span>
          <span style={{ fontSize: 15, fontWeight: 300, color: "#86868b" }}>IA</span>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setShowPins((v) => !v); setShowReactions(false); }} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20,
            background: showPins ? "rgba(0,122,255,0.1)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: showPins ? "1px solid rgba(0,122,255,0.3)" : "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer",
            fontSize: 13, fontWeight: 500, color: showPins ? "#007aff" : "#48484a", transition: "all 0.2s",
          }} title="Mensajes pineados">
            <Pin size={13} /><span>Pins</span>
            {pinnedMessages.length > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: "#fff", background: "#007aff",
                borderRadius: 10, padding: "1px 6px",
              }}>{pinnedMessages.length}</span>
            )}
          </button>

          {/* Reactions pill */}
          <button onClick={() => { setShowReactions((v) => !v); setShowPins(false); }} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20,
            background: showReactions ? "rgba(0,122,255,0.1)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: showReactions ? "1px solid rgba(0,122,255,0.3)" : "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer",
            fontSize: 13, fontWeight: 500, color: showReactions ? "#007aff" : "#48484a", transition: "all 0.2s",
          }} title="Reacciones">
            <ThumbsUp size={13} /><span>Reacciones</span>
            {reactionsCount > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: "#fff", background: "#007aff",
                borderRadius: 10, padding: "1px 6px",
              }}>{reactionsCount}</span>
            )}
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20,
            background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            fontSize: 12, fontWeight: 500, color: "#48484a",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34c759" }} />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} className="custom-scrollbar">
        {messages.length === 0 ? (
          <div style={{ height: "100%", display: "grid", placeItems: "center", padding: "0 24px" }}>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: -40 }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "#fff", border: "1px solid #d2d2d7", display: "grid", placeItems: "center", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <MessageCircle size={26} color="#86868b" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: "#48484a", marginBottom: 6 }}>Aeon IA</h1>
              <p style={{ fontSize: 15, color: "#6e6e73", maxWidth: 340, lineHeight: 1.5, marginBottom: 32 }}>
                Inicia una conversación. Tus mensajes son procesados de forma segura y soberana.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
                {["¿Qué puedes hacer?", "¿Qué significa tu nombre?", "¿Quién te creó?"].map((text) => (
                  <button key={text} onClick={() => sendMessage(text)} style={{
                    padding: "10px 18px", fontSize: 13, borderRadius: 12,
                    background: "#fff", border: "1px solid #d2d2d7", color: "#48484a",
                    cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#e8e8ed"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; }}
                  >{text}</button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", padding: "20px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onEditMessage={editMessage}
                    isPinned={isPinned(msg.id)}
                    onTogglePin={togglePin}
                    reaction={getReaction(msg.id)}
                    onReact={(id, r) => setReaction(id, r)}
                  />
                ))}
              </AnimatePresence>
            </div>
            {error && <p style={{ textAlign: "center", fontSize: 12, color: "#ff3b30", marginTop: 12 }}>{error}</p>}
            <div ref={bottomRef} style={{ height: 20 }} />
          </div>
        )}
      </div>

      {/* ═══ INPUT ═══ */}
      <div style={{ flexShrink: 0, background: "#f5f5f7", padding: "16px 24px" }}>
        <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
          <ChatInput onSend={sendMessage} onStop={stopStream} isStreaming={isStreaming} />
        </div>
      </div>

      {/* ═══ PANELS ═══ */}
      <ConversationSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        onTogglePin={togglePinConversation}
        onReorder={reorderConversation}
      />
      <PinnedPanel
        isOpen={showPins}
        onClose={() => setShowPins(false)}
        pinnedMessages={pinnedMessages}
        onUnpin={togglePin}
        onScrollTo={scrollToMessage}
      />
      <ReactionsPanel
        isOpen={showReactions}
        onClose={() => setShowReactions(false)}
        likedMessages={likedMessages}
        dislikedMessages={dislikedMessages}
        onRemoveReaction={(id, r) => setReaction(id, r)}
        onScrollTo={scrollToMessage}
      />
    </div>
  );
}
