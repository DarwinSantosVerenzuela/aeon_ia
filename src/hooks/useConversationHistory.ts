"use client";

import { useState, useCallback, useEffect } from "react";

export interface ConversationEntry {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  order: number;
}

const STORAGE_KEY = "aeon-conversations";

/**
 * Hook para gestionar historial de conversaciones.
 * Persiste en localStorage.
 */
export function useConversationHistory() {
  const [conversations, setConversations] = useState<ConversationEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const saveConversation = useCallback((id: string, title: string, preview: string) => {
    setConversations((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) {
        return prev.map((c) =>
          c.id === id ? { ...c, title, preview, updatedAt: Date.now() } : c
        );
      }
      return [...prev, {
        id, title, preview,
        createdAt: Date.now(), updatedAt: Date.now(),
        isPinned: false, order: prev.length,
      }];
    });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    // Remove conversation entry
    setConversations((prev) => prev.filter((c) => c.id !== id));
    // Clean up ALL data for this conversation — only way data ever gets deleted
    try {
      localStorage.removeItem(`aeon-messages-${id}`);
      localStorage.removeItem(`aeon-pins-${id}`);
      localStorage.removeItem(`aeon-reactions-${id}`);
    } catch { /* ignore */ }
  }, []);

  const togglePinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, isPinned: !c.isPinned } : c)
    );
  }, []);

  const reorderConversation = useCallback((id: string, direction: "up" | "down") => {
    setConversations((prev) => {
      const pinned = prev.filter((c) => c.isPinned);
      const idx = pinned.findIndex((c) => c.id === id);
      if (idx === -1) return prev;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= pinned.length) return prev;

      const newPinned = [...pinned];
      [newPinned[idx], newPinned[swapIdx]] = [newPinned[swapIdx], newPinned[idx]];

      const unpinned = prev.filter((c) => !c.isPinned);
      return [...newPinned, ...unpinned];
    });
  }, []);

  // Sorted: pinned first, then by updatedAt desc
  const sortedConversations = [
    ...conversations.filter((c) => c.isPinned),
    ...conversations.filter((c) => !c.isPinned).sort((a, b) => b.updatedAt - a.updatedAt),
  ];

  return {
    conversations: sortedConversations,
    saveConversation,
    deleteConversation,
    togglePinConversation,
    reorderConversation,
  };
}
