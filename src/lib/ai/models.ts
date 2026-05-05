/**
 * Aeon IA — Model Registry
 *
 * ACTIVO: Gemini 2.5 Flash Lite (Google AI — $0, máxima velocidad)
 *
 * INACTIVOS (conservados como respaldo):
 * - openrouter/free (Auto Router)
 * - google/gemma-4-31b-it:free (Gemma 4)
 * - openai/gpt-oss-20b:free (OSS-20B)
 */

export interface AIModel {
  id: string;
  name: string;
  specialty: string;
  description: string;
  vision?: boolean;
  active?: boolean;
}

/* ═══════════════════════════════════════════
 * MODELO ACTIVO — Gemini (Google AI Studio)
 * ═══════════════════════════════════════════ */

export const GEMINI_MODEL: AIModel = {
  id: "gemini-2.5-flash-lite",
  name: "Gemini Flash Lite",
  specialty: "General & Visión",
  description: "Modelo ultrarrápido de Google. Gratis, alta concurrencia, multimodal.",
  vision: true,
  active: true,
};

/* ═══════════════════════════════════════════
 * MODELOS INACTIVOS — OpenRouter (respaldo)
 * ═══════════════════════════════════════════ */

export const INACTIVE_MODELS: AIModel[] = [
  {
    id: "openrouter/free",
    name: "Auto FREE",
    specialty: "Auto-selección",
    description: "Elige automáticamente el mejor modelo gratuito disponible. Inmediato.",
    vision: true,
    active: false,
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4",
    specialty: "General & Visión",
    description: "Razonamiento, imágenes, documentos, código, conversación.",
    vision: true,
    active: false,
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "OSS-20B",
    specialty: "Técnico",
    description: "Especialista técnico. Medicina, finanzas, derecho, análisis.",
    vision: false,
    active: false,
  },
];

/* ═══════════════════════════════════════════
 * Exportaciones de compatibilidad
 * ═══════════════════════════════════════════ */

/** Lista de modelos autorizados (solo activos) */
export const AUTHORIZED_MODELS: AIModel[] = [GEMINI_MODEL];

export function getModelById(id: string): AIModel | undefined {
  return [...AUTHORIZED_MODELS, ...INACTIVE_MODELS].find((m) => m.id === id);
}

export function getActiveModel(): AIModel {
  return GEMINI_MODEL;
}
