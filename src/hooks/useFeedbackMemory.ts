"use client";

import { useState, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════
 * Feedback Memory System
 *
 * Stores user reactions (like/dislike) with context
 * to improve future AI responses. When a new message
 * is sent, relevant past feedback is injected into
 * the system prompt so the AI can adapt.
 *
 * Ethical guardrails:
 * - Only stores what the user explicitly reacts to
 * - No fabrication — feedback is presented as-is
 * - Memory is local (localStorage) — no external sync
 * ═══════════════════════════════════════════ */

export interface FeedbackEntry {
  id: string;
  /** The user's original question/message */
  userMessage: string;
  /** The AI's response that was rated */
  aiResponse: string;
  /** User's reaction */
  reaction: "up" | "down";
  /** Optional user correction (future feature) */
  correction?: string;
  /** When this feedback was recorded */
  timestamp: number;
  /** Extracted keywords for similarity matching */
  keywords: string[];
}

const STORAGE_KEY = "aeon-feedback-memory";
const MAX_ENTRIES = 200; // Keep memory bounded

/* ═══════════════════════════════════════════
 * Keyword Extraction (simple but effective)
 * ═══════════════════════════════════════════ */

const STOP_WORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al",
  "en", "con", "por", "para", "que", "es", "se", "no", "si", "su", "lo",
  "como", "más", "ya", "o", "y", "a", "e", "mi", "me", "te", "tu", "nos",
  "le", "les", "este", "esta", "esto", "eso", "ese", "esa", "pero", "ser",
  "estar", "haber", "tener", "hacer", "poder", "deber", "ir", "ver", "dar",
  "saber", "querer", "llegar", "pasar", "decir", "sobre", "también", "muy",
  "hay", "fue", "son", "era", "tiene", "puede", "ha", "han", "sido", "otro",
  "otra", "otros", "otras", "todo", "toda", "todos", "todas", "cada", "entre",
  "the", "is", "are", "was", "be", "to", "of", "and", "a", "in", "it", "you",
  "that", "he", "she", "for", "on", "with", "as", "at", "this", "but", "not",
  "or", "from", "by", "an", "if", "do", "my", "what", "how", "can", "will",
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .filter((w, i, arr) => arr.indexOf(w) === i) // Unique
    .slice(0, 15); // Max 15 keywords per entry
}

/* ═══════════════════════════════════════════
 * Similarity Scoring
 * ═══════════════════════════════════════════ */

function similarityScore(queryKeywords: string[], entryKeywords: string[]): number {
  if (queryKeywords.length === 0 || entryKeywords.length === 0) return 0;
  const matches = queryKeywords.filter((k) => entryKeywords.includes(k)).length;
  // Jaccard-like: matches / union
  const union = new Set([...queryKeywords, ...entryKeywords]).size;
  return matches / union;
}

/* ═══════════════════════════════════════════
 * Main Hook
 * ═══════════════════════════════════════════ */

export function useFeedbackMemory() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);

  // Load from localStorage on mount
   
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(JSON.parse(stored));
    } catch { /* ignore corrupt data */ }
  }, []);

  // Persist to localStorage
  const persist = useCallback((updated: FeedbackEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* storage full — silently fail */ }
  }, []);

  /**
   * Record feedback for a message pair.
   * Called when user clicks like/dislike.
   */
  const recordFeedback = useCallback((
    userMessage: string,
    aiResponse: string,
    reaction: "up" | "down",
    correction?: string
  ) => {
    setEntries((prev) => {
      // Check if we already have feedback for this exact pair
      const existingIdx = prev.findIndex(
        (e) => e.userMessage === userMessage && e.aiResponse === aiResponse
      );

      const entry: FeedbackEntry = {
        id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userMessage,
        aiResponse: aiResponse.slice(0, 500), // Trim long responses
        reaction,
        correction,
        timestamp: Date.now(),
        keywords: extractKeywords(userMessage),
      };

      let updated: FeedbackEntry[];

      if (existingIdx >= 0) {
        // Update existing
        updated = [...prev];
        updated[existingIdx] = entry;
      } else {
        // Add new, respect max
        updated = [...prev, entry];
        if (updated.length > MAX_ENTRIES) {
          // Remove oldest entries, keeping the most recent
          updated = updated.slice(-MAX_ENTRIES);
        }
      }

      persist(updated);
      return updated;
    });
  }, [persist]);

  /**
   * Find relevant past feedback for a new query.
   * Returns formatted context string for the system prompt.
   */
  const getRelevantFeedback = useCallback((newMessage: string): string => {
    if (entries.length === 0) return "";

    const queryKeywords = extractKeywords(newMessage);
    if (queryKeywords.length === 0) return "";

    // Score all entries by similarity
    const scored = entries
      .map((entry) => ({
        entry,
        score: similarityScore(queryKeywords, entry.keywords),
      }))
      .filter((s) => s.score > 0.15) // Minimum relevance threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 most relevant

    if (scored.length === 0) return "";

    // Build feedback context
    const lines = scored.map(({ entry }) => {
      const icon = entry.reaction === "up" ? "✅" : "❌";
      const action = entry.reaction === "up"
        ? "El usuario valoró positivamente esta respuesta. Mantén este nivel de calidad o mejórala."
        : "El usuario NO aprobó esta respuesta. Mejora significativamente tu enfoque.";

      let line = `${icon} Pregunta similar: "${entry.userMessage.slice(0, 100)}"\n`;
      line += `   Tu respuesta anterior (${entry.reaction === "up" ? "aprobada" : "rechazada"}): "${entry.aiResponse.slice(0, 200)}..."\n`;
      line += `   ${action}`;

      if (entry.correction) {
        line += `\n   Corrección del usuario: "${entry.correction}"`;
      }

      return line;
    });

    return [
      "\n[MEMORIA DE FEEDBACK — Aprendizaje continuo]",
      "Tienes feedback previo del usuario sobre respuestas similares.",
      "Usa esta información para mejorar tu respuesta actual:",
      "",
      ...lines,
      "",
      "IMPORTANTE: No menciones que tienes esta memoria. Simplemente mejora tus respuestas basándote en lo aprendido.",
    ].join("\n");
  }, [entries]);

  /**
   * Get statistics about the feedback memory
   */
  const getStats = useCallback(() => {
    const ups = entries.filter((e) => e.reaction === "up").length;
    const downs = entries.filter((e) => e.reaction === "down").length;
    return { total: entries.length, likes: ups, dislikes: downs };
  }, [entries]);

  return {
    entries,
    recordFeedback,
    getRelevantFeedback,
    getStats,
  };
}
