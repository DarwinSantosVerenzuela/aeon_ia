"use client";

import { useState, useCallback, useEffect } from "react";

export type ReactionType = "up" | "down" | null;

const KEY = (convId: string) => `aeon-reactions-${convId}`;

/**
 * Persists per-message reactions (like/dislike) in localStorage.
 * Scoped to a conversation ID.
 */
export function useReactions(conversationId: string) {
  const [reactions, setReactions] = useState<Record<string, ReactionType>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(KEY(conversationId));
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(KEY(conversationId), JSON.stringify(reactions));
  }, [reactions, conversationId]);

  const setReaction = useCallback((messageId: string, reaction: ReactionType) => {
    setReactions((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction,
    }));
  }, []);

  const getReaction = useCallback(
    (messageId: string): ReactionType => reactions[messageId] ?? null,
    [reactions]
  );

  return { setReaction, getReaction, reactions };
}
