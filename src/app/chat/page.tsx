import type { Metadata } from "next";
import ChatContainer from "@/components/chat/ChatContainer";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Interfaz de chat con IA soberana. Comunicación segura y en tiempo real.",
};

/**
 * Chat page — wraps the ChatContainer client component.
 */
export default function ChatPage() {
  return <ChatContainer />;
}
