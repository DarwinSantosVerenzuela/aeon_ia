/** Role of a message participant */
export type MessageRole = "user" | "assistant" | "system";

/** Attachment metadata stored with a message (lightweight, no base64) */
export interface MessageAttachment {
  name: string;
  type: "pdf" | "word" | "image" | "video" | "text";
  size: number;
  previewUrl?: string;
}

/** Single chat message */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  modelName?: string;
  modelSpecialty?: string;
  /** Attached files metadata (for display in the bubble) */
  attachments?: MessageAttachment[];
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
