import type { Metadata } from "next";
import ChatPageClient from "./ChatPageClient";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Interfaz de chat con IA soberana. Comunicación segura y en tiempo real.",
};

/**
 * Chat page — Server Component for metadata, delegates to client component.
 */
export default function ChatPage() {
  return <ChatPageClient />;
}
