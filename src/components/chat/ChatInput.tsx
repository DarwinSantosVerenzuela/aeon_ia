"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { Send, Square, Mic, MicOff, Plus, FileText, Image, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useFileAttachment, type AttachedFile } from "@/hooks/useFileAttachment";

export interface ChatAttachment {
  name: string;
  type: "pdf" | "word" | "image" | "text";
  textContent?: string;
  imageData?: string;
  size: number;
  previewUrl?: string;
}

interface ChatInputProps {
  onSend: (message: string, attachments?: ChatAttachment[]) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isStreaming = false, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Voice dictation
  const handleTranscript = useCallback((text: string) => {
    setValue((prev) => {
      const needsSpace = prev.length > 0 && !prev.endsWith(" ");
      return prev + (needsSpace ? " " : "") + text;
    });
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 150)}px`; }
    });
  }, []);

  const {
    isSupported: voiceSupported,
    isListening,
    interimTranscript,
    toggleListening,
    error: voiceError,
  } = useSpeechRecognition(handleTranscript);

  // File attachment
  const {
    files,
    isProcessing,
    error: fileError,
    fileInputRef,
    addFiles,
    removeFile,
    clearFiles,
    buildFileContext,
    openFilePicker,
  } = useFileAttachment();

  // Close attach menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAttachMenu]);

  const send = useCallback(() => {
    const v = value.trim();
    if (!v && files.length === 0) return;
    if (disabled) return;

    // Build structured attachments for the API
    const attachments: ChatAttachment[] | undefined = files.length > 0
      ? files.map((f) => ({
          name: f.name,
          type: f.type,
          textContent: f.type !== "image" ? f.textContent : undefined,
          imageData: f.type === "image" ? f.previewUrl : undefined,
          size: f.size,
          previewUrl: f.previewUrl,
        }))
      : undefined;

    onSend(v || "Analiza los archivos adjuntos.", attachments);
    setValue("");
    clearFiles();
    if (ref.current) ref.current.style.height = "auto";
  }, [value, disabled, files, onSend, clearFiles]);

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!isStreaming) send(); }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = ref.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 150)}px`; }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = ""; // Reset so same file can be selected again
    }
    setShowAttachMenu(false);
  };

  const hasText = value.trim().length > 0;
  const hasContent = hasText || files.length > 0;

  const displayPlaceholder = isListening
    ? (interimTranscript || "Escuchando...")
    : "Escribe tu mensaje...";

  // File type icon helper
  const fileIcon = (type: AttachedFile["type"]) => {
    switch (type) {
      case "pdf": return "📄";
      case "word": return "📝";
      case "image": return "📷";
      default: return "📎";
    }
  };

  return (
    <div>

      {/* Attached files preview */}
      {files.length > 0 && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6,
          marginBottom: 8, padding: "0 4px",
        }}>
          {files.map((f) => (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 10,
              background: "#fff", border: "1px solid #d2d2d7",
              fontSize: 12, color: "#48484a",
              maxWidth: 200, overflow: "hidden",
            }}>
              {f.previewUrl ? (
                <img
                  src={f.previewUrl} alt={f.name}
                  style={{ width: 20, height: 20, borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <span style={{ flexShrink: 0 }}>{fileIcon(f.type)}</span>
              )}
              <span style={{
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
              }}>{f.name}</span>
              <button
                onClick={() => removeFile(f.id)}
                style={{
                  width: 16, height: 16, borderRadius: 4, border: "none",
                  background: "rgba(0,0,0,0.06)", display: "grid", placeItems: "center",
                  cursor: "pointer", flexShrink: 0, color: "#86868b", padding: 0,
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 8, padding: "6px 12px", borderRadius: 8,
          background: "rgba(0,122,255,0.06)", fontSize: 12, color: "#007aff",
        }}>
          <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
          Procesando archivo...
        </div>
      )}

      {/* Main input area */}
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px", borderRadius: 16,
        background: "#f5f5f7",
        border: isListening
          ? "1px solid #ff3b30"
          : focused
            ? "1px solid #86868b"
            : "1px solid #d2d2d7",
        transition: "all 0.2s",
        boxShadow: isListening ? "0 0 0 3px rgba(255,59,48,0.12)" : "none",
      }}>

        {/* Attach button "+" — left side */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setShowAttachMenu((v) => !v)}
            disabled={disabled || isStreaming}
            title="Adjuntar archivo"
            style={{
              width: 32, height: 32, display: "grid", placeItems: "center",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: showAttachMenu ? "rgba(0,122,255,0.1)" : "#e8e8ed",
              color: showAttachMenu ? "#007aff" : "#86868b",
              transition: "all 0.15s",
            }}
          >
            <Plus size={16} strokeWidth={2.2} />
          </button>

          {/* Dropdown menu */}
          {showAttachMenu && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: 0,
              width: 200, padding: 6, borderRadius: 14,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
              zIndex: 100,
            }}>
              <AttachOption
                icon={<FileText size={15} />}
                label="Documento PDF"
                sub=".pdf"
                onClick={() => openFilePicker(".pdf")}
              />
              <AttachOption
                icon={<FileSpreadsheet size={15} />}
                label="Documento Word"
                sub=".docx, .doc"
                onClick={() => openFilePicker(".docx,.doc")}
              />
              <AttachOption
                icon={<Image size={15} />}
                label="Imagen"
                sub=".png, .jpg, .webp"
                onClick={() => openFilePicker("image/*")}
              />
              <AttachOption
                icon={<FileText size={15} />}
                label="Archivo de texto"
                sub=".txt, .md, .csv, .json"
                onClick={() => openFilePicker(".txt,.md,.csv,.json,.xml,.html,.js,.ts,.py,.sql,.log")}
              />
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={ref} value={value} onChange={onChange} onKeyDown={onKey}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled} placeholder={displayPlaceholder} rows={1}
          style={{
            flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
            resize: "none", fontSize: 14, lineHeight: 1.5, color: "#48484a", maxHeight: 150,
            fontFamily: "inherit",
          }}
        />

        {/* Interim voice preview */}
        {isListening && interimTranscript && (
          <div style={{
            position: "absolute", bottom: "100%", left: 16, right: 16,
            padding: "8px 12px", marginBottom: 6, borderRadius: 10,
            background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.15)",
            fontSize: 13, color: "#86868b", fontStyle: "italic",
          }}>
            🎙️ {interimTranscript}
          </div>
        )}

        {/* Action buttons — right side */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>

          {/* Mic button */}
          {voiceSupported && (
            <button
              onClick={toggleListening}
              disabled={disabled || isStreaming}
              title={isListening ? "Detener dictado" : "Dictar por voz"}
              style={{
                width: 32, height: 32, display: "grid", placeItems: "center",
                borderRadius: 8, border: "none", cursor: "pointer",
                background: isListening ? "#ff3b30" : "#e8e8ed",
                transition: "all 0.15s",
                animation: isListening ? "mic-pulse 1.5s ease-in-out infinite" : "none",
              }}
            >
              {isListening
                ? <MicOff size={14} color="#fff" />
                : <Mic size={14} color="#86868b" />
              }
            </button>
          )}

          {/* Send / Stop button */}
          {isStreaming ? (
            <button onClick={onStop} style={{
              width: 32, height: 32, display: "grid", placeItems: "center",
              borderRadius: 8, background: "#e8e8ed", border: "none", cursor: "pointer",
            }}>
              <Square size={14} color="#6e6e73" fill="#6e6e73" />
            </button>
          ) : (
            <button onClick={send} disabled={!hasContent || disabled} style={{
              width: 32, height: 32, display: "grid", placeItems: "center",
              borderRadius: 8, background: hasContent ? "#48484a" : "#e8e8ed",
              border: "none", cursor: hasContent ? "pointer" : "default",
              opacity: hasContent ? 1 : 0.5, transition: "all 0.15s",
            }}>
              <Send size={14} color={hasContent ? "#ffffff" : "#aeaeb2"} />
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          multiple
        />
      </div>

      {/* Errors */}
      {(voiceError || fileError) && (
        <p style={{ marginTop: 6, textAlign: "center", fontSize: 11, color: "#ff3b30" }}>
          {voiceError || fileError}
        </p>
      )}

      {/* Help text */}
      <p style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "#aeaeb2" }}>
        {isListening
          ? "🎙️ Dictando — habla y el texto aparecerá aquí · Toca el micrófono para detener"
          : "Enter para enviar · Shift+Enter para nueva línea"
        }
      </p>

      {/* Animations */}
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,48,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(255,59,48,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════
 * Dropdown Option Component
 * ═══════════════════════════════════════════ */

function AttachOption({ icon, label, sub, onClick }: {
  icon: React.ReactNode; label: string; sub: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 9,
        background: "transparent", border: "none", cursor: "pointer",
        transition: "background 0.12s", textAlign: "left",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 7, background: "#f5f5f7",
        display: "grid", placeItems: "center", color: "#6e6e73", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{label}</div>
        <div style={{ fontSize: 10, color: "#aeaeb2", marginTop: 1 }}>{sub}</div>
      </div>
    </button>
  );
}
