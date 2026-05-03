"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Pencil, Share2, Pin, ThumbsUp, ThumbsDown } from "lucide-react";
import type { ChatMessage } from "@/types";

/**
 * Lightweight markdown → HTML converter for AI responses.
 * Handles: **bold**, *italic*, `inline code`, ```code blocks```,
 * ### headings, - lists, and line breaks.
 */
function renderMarkdown(text: string): string {
  // Escape HTML entities first
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (```) — extract before table processing
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.04);padding:10px 14px;border-radius:10px;font-size:13px;overflow-x:auto;margin:8px 0;font-family:monospace"><code>$1</code></pre>');

  // === TABLES — must run BEFORE line break conversion ===
  html = html.replace(
    /((?:^\|.+\|$\n?){2,})/gm,
    (tableBlock) => {
      const lines = tableBlock.trim().split("\n").filter((l) => l.trim());
      if (lines.length < 2) return tableBlock;

      // Check if second line is separator (|---|---|)
      const isSeparator = (line: string) => /^\|[\s\-:|]+\|$/.test(line.trim());
      const hasSeparator = isSeparator(lines[1]);

      const parseRow = (line: string) =>
        line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

      let tableHtml = '<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:13px;border-radius:8px;overflow:hidden;border:1px solid rgba(0,0,0,0.1)">';

      if (hasSeparator) {
        // Header row
        const headers = parseRow(lines[0]);
        tableHtml += "<thead><tr>";
        for (const h of headers) {
          tableHtml += `<th style="padding:8px 12px;text-align:left;font-weight:600;background:rgba(0,0,0,0.04);border-bottom:2px solid rgba(0,0,0,0.1)">${h}</th>`;
        }
        tableHtml += "</tr></thead>";

        // Body rows (skip separator line)
        tableHtml += "<tbody>";
        for (let i = 2; i < lines.length; i++) {
          const cells = parseRow(lines[i]);
          const bgColor = i % 2 === 0 ? "rgba(0,0,0,0.015)" : "transparent";
          tableHtml += `<tr style="background:${bgColor}">`;
          for (const c of cells) {
            tableHtml += `<td style="padding:7px 12px;border-bottom:1px solid rgba(0,0,0,0.06)">${c}</td>`;
          }
          tableHtml += "</tr>";
        }
        tableHtml += "</tbody>";
      } else {
        // No header — all body rows
        tableHtml += "<tbody>";
        for (let i = 0; i < lines.length; i++) {
          const cells = parseRow(lines[i]);
          const bgColor = i % 2 === 1 ? "rgba(0,0,0,0.015)" : "transparent";
          tableHtml += `<tr style="background:${bgColor}">`;
          for (const c of cells) {
            tableHtml += `<td style="padding:7px 12px;border-bottom:1px solid rgba(0,0,0,0.06)">${c}</td>`;
          }
          tableHtml += "</tr>";
        }
        tableHtml += "</tbody>";
      }

      tableHtml += "</table>";
      return tableHtml;
    }
  );

  // Inline code (`)
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:2px 6px;border-radius:5px;font-size:13px;font-family:monospace">$1</code>');
  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong style="font-weight:600">$1</strong>');
  // Italic (*text* or _text_)
  html = html.replace(/(?<![\w*])\*([^*]+)\*(?![\w*])/g, '<em>$1</em>');
  html = html.replace(/(?<![\w_])_([^_]+)_(?![\w_])/g, '<em>$1</em>');
  // Headings
  html = html.replace(/^### (.+)$/gm, '<strong style="font-size:15px;display:block;margin:12px 0 4px">$1</strong>');
  html = html.replace(/^## (.+)$/gm, '<strong style="font-size:16px;display:block;margin:14px 0 6px">$1</strong>');
  html = html.replace(/^# (.+)$/gm, '<strong style="font-size:17px;display:block;margin:16px 0 8px">$1</strong>');
  // Horizontal rules (--- or ***)
  html = html.replace(/^[-*]{3,}$/gm, '<hr style="border:none;border-top:1px solid rgba(0,0,0,0.1);margin:12px 0"/>');
  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<span style="display:block;padding-left:16px">• $1</span>');
  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<span style="display:block;padding-left:16px">$1. $2</span>');
  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}


interface MessageBubbleProps {
  message: ChatMessage;
  onEditMessage?: (id: string, newContent: string) => void;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  reaction?: "up" | "down" | null;
  onReact?: (id: string, r: "up" | "down") => void;
}

export default function MessageBubble({ message, onEditMessage, isPinned, onTogglePin, reaction, onReact }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const liked = reaction ?? null;
  const editRef = useRef<HTMLTextAreaElement>(null);
  // Delay hiding actions so fast mouse movement doesn't close them
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowActions(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setShowActions(false), 150);
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Aeon IA", text: message.content });
    } else {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEditMessage?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  /* ── Shared action bar ── */
  const ActionBar = ({ actions }: { actions: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 3 }}
      transition={{ duration: 0.12 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "flex", gap: 1, padding: "3px 4px", borderRadius: 10,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "fit-content",
      }}
    >
      {actions}
    </motion.div>
  );

  /* ── User Message ── */
  if (isUser) {
    return (
      <div id={message.id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <div style={{ maxWidth: "75%", position: "relative" }}>
            {isPinned && (
              <div style={{
                position: "absolute", top: -6, right: -6, width: 16, height: 16,
                borderRadius: "50%", background: "#007aff",
                display: "grid", placeItems: "center", zIndex: 2,
              }}>
                <Pin size={9} color="#fff" />
              </div>
            )}
            <div style={{
              padding: "14px 18px", borderRadius: 18,
              background: "rgba(0,0,0,0.04)",
              border: isPinned ? "1px solid rgba(0,122,255,0.3)" : "1px solid rgba(0,0,0,0.06)",
              fontSize: 15, lineHeight: 1.7, color: "#1d1d1f",
            }}>
              {isEditing ? (
                <div>
                  <textarea
                    ref={editRef}
                    value={editContent}
                    onChange={(e) => { setEditContent(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(); } if (e.key === "Escape") handleEditCancel(); }}
                    style={{ width: "100%", resize: "none", border: "none", background: "transparent", outline: "none", fontSize: 15, lineHeight: 1.7, color: "#1d1d1f", fontFamily: "inherit", padding: 0 }}
                  />
                  <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                    <button onClick={handleEditCancel} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #d2d2d7", background: "transparent", fontSize: 12, color: "#86868b", cursor: "pointer" }}>Cancelar</button>
                    <button onClick={handleEditSave} style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "#1d1d1f", fontSize: 12, color: "#fff", cursor: "pointer" }}>Guardar</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Attachment chips */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {message.attachments.map((att, i) => (
                        <div key={i} style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "4px 10px", borderRadius: 8,
                          background: "rgba(0,0,0,0.05)", fontSize: 12, color: "#48484a",
                        }}>
                          {att.previewUrl ? (
                            <img src={att.previewUrl} alt={att.name} style={{
                              width: 18, height: 18, borderRadius: 3, objectFit: "cover",
                            }} />
                          ) : (
                            <span>{att.type === "pdf" ? "📄" : att.type === "word" ? "📝" : att.type === "image" ? "📷" : "📎"}</span>
                          )}
                          <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {att.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{message.content}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions — always rendered, opacity toggles to avoid layout shift */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            height: 36, display: "flex", justifyContent: "flex-end",
            alignItems: "center", paddingRight: 4,
            opacity: showActions && !isEditing ? 1 : 0,
            pointerEvents: showActions && !isEditing ? "auto" : "none",
            transition: "opacity 0.15s",
          }}
        >
          <ActionBar actions={<>
            <ActionBtn icon={copied ? <Check size={13} /> : <Copy size={13} />} onClick={handleCopy} tip="Copiar" />
            <ActionBtn icon={<Pencil size={13} />} onClick={() => setIsEditing(true)} tip="Editar" />
            <ActionBtn icon={<Pin size={13} />} onClick={() => onTogglePin?.(message.id)} tip={isPinned ? "Despinear" : "Pinear"} active={isPinned} />
            <Divider />
            <ActionBtn icon={<ThumbsUp size={13} />} onClick={() => onReact?.(message.id, "up")} tip="Me gusta" active={liked === "up"} color="#34c759" />
            <ActionBtn icon={<ThumbsDown size={13} />} onClick={() => onReact?.(message.id, "down")} tip="No me gusta" active={liked === "down"} color="#ff3b30" />
          </>} />
        </div>
      </div>
    );
  }

  /* ── AI Response ── */
  return (
    <div id={message.id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
      >
        {/* Avatar — símbolo oficial Aeon */}
        <motion.div
          style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            display: "grid", placeItems: "center", marginTop: 0,
            overflow: "hidden",
          }}
        >
          <motion.img
            src="/brand/symbol-dark.png"
            alt="Aeon"
            style={{ width: 26, height: 26, display: "block" }}
            draggable={false}
            animate={message.isStreaming ? {
              rotate: [0, 360, 720, 900, 900, 900, 1260],
            } : { rotate: 0 }}
            transition={message.isStreaming ? {
              duration: 3.5,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.25, 0.5, 0.6, 0.7, 0.75, 1],
            } : { duration: 0.4, ease: "easeOut" }}
          />
        </motion.div>

        <div style={{ position: "relative", maxWidth: "85%" }}>
          {isPinned && (
            <div style={{ position: "absolute", top: -6, left: -6, width: 16, height: 16, borderRadius: "50%", background: "#007aff", display: "grid", placeItems: "center", zIndex: 2 }}>
              <Pin size={9} color="#fff" />
            </div>
          )}
          <div style={{ fontSize: 15, lineHeight: 1.7, color: "#1d1d1f", wordBreak: "break-word", ...(isPinned ? { padding: "8px 12px", borderRadius: 14, border: "1px solid rgba(0,122,255,0.2)", background: "rgba(0,122,255,0.03)" } : {}) }}>
            <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
            {message.isStreaming && (
              <motion.span style={{ display: "inline-block", width: 2, height: 16, background: "#86868b", marginLeft: 2, verticalAlign: "text-bottom" }} animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} />
            )}
          </div>
        </div>
      </motion.div>

      {/* Actions — always rendered, opacity toggles to avoid layout shift */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          height: 36, display: "flex", alignItems: "center", paddingLeft: 40,
          opacity: showActions && !message.isStreaming && !!message.content ? 1 : 0,
          pointerEvents: showActions && !message.isStreaming && !!message.content ? "auto" : "none",
          transition: "opacity 0.15s",
        }}
      >
        <ActionBar actions={<>
          <ActionBtn icon={copied ? <Check size={13} /> : <Copy size={13} />} onClick={handleCopy} tip="Copiar" />
          <ActionBtn icon={<Share2 size={13} />} onClick={handleShare} tip="Compartir" />
          <ActionBtn icon={<Pin size={13} />} onClick={() => onTogglePin?.(message.id)} tip={isPinned ? "Despinear" : "Pinear"} active={isPinned} />
          <Divider />
          <ActionBtn icon={<ThumbsUp size={13} />} onClick={() => onReact?.(message.id, "up")} tip="Me gusta" active={liked === "up"} color="#34c759" />
          <ActionBtn icon={<ThumbsDown size={13} />} onClick={() => onReact?.(message.id, "down")} tip="No me gusta" active={liked === "down"} color="#ff3b30" />
        </>} />
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.08)", margin: "5px 2px", alignSelf: "center" }} />;
}

function ActionBtn({ icon, onClick, tip, active, color }: {
  icon: React.ReactNode; onClick: () => void; tip: string; active?: boolean; color?: string;
}) {
  const activeColor = color || "#007aff";
  return (
    <button onClick={onClick} title={tip} style={{
      display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 7,
      border: "none", background: active ? `${activeColor}18` : "transparent",
      color: active ? activeColor : "#86868b", cursor: "pointer", transition: "all 0.12s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = active ? `${activeColor}25` : "rgba(0,0,0,0.05)"; e.currentTarget.style.color = active ? activeColor : "#1d1d1f"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = active ? `${activeColor}18` : "transparent"; e.currentTarget.style.color = active ? activeColor : "#86868b"; }}
    >{icon}</button>
  );
}
