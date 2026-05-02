/** Role of a message participant */
export type MessageRole = "user" | "assistant" | "system";

/** Single chat message */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  modelName?: string;
  modelSpecialty?: string;
}

/** Conversation state */
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** Connection status for the sovereignty layer */
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

/** Streaming event from the AI backend */
export interface StreamEvent {
  type: "token" | "done" | "error";
  content?: string;
  error?: string;
  model?: string;
  specialty?: string;
}

/** API request payload */
export interface ChatRequest {
  message: string;
  conversationId?: string;
}

/** API response shape */
export interface ChatResponse {
  id: string;
  content: string;
  conversationId: string;
}
