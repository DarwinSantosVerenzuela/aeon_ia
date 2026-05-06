"use client";

import { useState, useCallback } from "react";
import { X, Star, Send, Loader2, CheckCircle2 } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export default function FeedbackModal({ isOpen, onClose, onConfirmExit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = useCallback(async () => {
    if (rating === 0) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim().slice(0, 1000),
          _t: Date.now(), // timestamp for anti-replay
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setTimeout(() => {
          onConfirmExit();
        }, 1500);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [rating, comment, onConfirmExit]);

  const handleSkip = useCallback(() => {
    onConfirmExit();
  }, [onConfirmExit]);

  if (!isOpen) return null;

  const displayRating = hoverRating || rating;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "grid", placeItems: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "min(420px, 90vw)", borderRadius: 20,
          background: "#fff",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)",
          animation: "slideUp 0.25s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1d1d1f" }}>
              ¿Cómo fue tu experiencia?
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#86868b", lineHeight: 1.4 }}>
              Tu opinión nos ayuda a mejorar Aeon IA
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 14, border: "none",
              background: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center",
              cursor: "pointer", color: "#86868b", flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Stars */}
        <div style={{
          padding: "20px 24px", display: "flex", justifyContent: "center", gap: 8,
        }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={status === "sending" || status === "sent"}
              style={{
                width: 44, height: 44, borderRadius: 12, border: "none",
                background: star <= displayRating ? "rgba(255,204,0,0.12)" : "rgba(0,0,0,0.03)",
                display: "grid", placeItems: "center", cursor: "pointer",
                transition: "all 0.15s", transform: star <= displayRating ? "scale(1.1)" : "scale(1)",
              }}
            >
              <Star
                size={24}
                fill={star <= displayRating ? "#ffcc00" : "transparent"}
                color={star <= displayRating ? "#ffcc00" : "#d2d2d7"}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {/* Rating label */}
        {rating > 0 && (
          <p style={{
            textAlign: "center", fontSize: 13, fontWeight: 600, color: "#48484a",
            margin: "-8px 0 8px",
          }}>
            {rating === 1 && "Necesita mejorar"}
            {rating === 2 && "Regular"}
            {rating === 3 && "Buena"}
            {rating === 4 && "Muy buena"}
            {rating === 5 && "¡Excelente!"}
          </p>
        )}

        {/* Comment */}
        <div style={{ padding: "0 24px 16px" }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia... (opcional)"
            maxLength={1000}
            disabled={status === "sending" || status === "sent"}
            style={{
              width: "100%", minHeight: 80, padding: "12px 14px", borderRadius: 12,
              border: "1px solid #d2d2d7", background: "#f5f5f7",
              fontSize: 13, color: "#48484a", fontFamily: "inherit",
              resize: "vertical", outline: "none", lineHeight: 1.5,
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#007aff"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#d2d2d7"; }}
          />
          {comment.length > 0 && (
            <p style={{ textAlign: "right", fontSize: 10, color: "#aeaeb2", marginTop: 4 }}>
              {comment.length}/1000
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{
          padding: "0 24px 24px",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {status === "sent" ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px", borderRadius: 12,
              background: "rgba(52,199,89,0.08)", color: "#34c759",
              fontSize: 14, fontWeight: 600,
            }}>
              <CheckCircle2 size={18} />
              ¡Gracias por tu feedback!
            </div>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || status === "sending"}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12,
                  border: "none", cursor: rating > 0 ? "pointer" : "default",
                  background: rating > 0 ? "#1d1d1f" : "#e8e8ed",
                  color: rating > 0 ? "#fff" : "#aeaeb2",
                  fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                  opacity: status === "sending" ? 0.7 : 1,
                }}
              >
                {status === "sending" ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</>
                ) : (
                  <><Send size={14} /> Enviar y salir</>
                )}
              </button>
              <button
                onClick={handleSkip}
                disabled={status === "sending"}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12,
                  border: "none", background: "transparent",
                  color: "#86868b", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#48484a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#86868b"; }}
              >
                Salir sin comentar
              </button>
            </>
          )}
        </div>

        {status === "error" && (
          <p style={{
            textAlign: "center", fontSize: 11, color: "#ff3b30",
            padding: "0 24px 16px", margin: 0,
          }}>
            Error al enviar. Intenta de nuevo.
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
