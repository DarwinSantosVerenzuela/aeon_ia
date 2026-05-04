"use client";

import dynamic from "next/dynamic";

/**
 * ChatContainer se carga SOLO en el cliente (ssr: false).
 * Esto elimina el error React #418 (hydration mismatch) causado por
 * extensiones del navegador que modifican el DOM antes de que React hidrate.
 */
const ChatContainer = dynamic(
  () => import("@/components/chat/ChatContainer"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: "fixed", inset: 0,
        display: "grid", placeItems: "center",
        background: "#f5f5f7",
      }}>
        <div style={{ textAlign: "center", color: "#86868b" }}>
          <div style={{
            width: 32, height: 32, margin: "0 auto 12px",
            border: "3px solid #e8e8ed",
            borderTopColor: "#007aff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Cargando Aeon IA...</span>
        </div>
      </div>
    ),
  }
);

export default function ChatPageClient() {
  return <ChatContainer />;
}
