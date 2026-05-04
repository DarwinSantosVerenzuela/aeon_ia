/**
 * Aeon IA — Model Registry
 *
 * Primario: openrouter/free (Auto Router — elige el mejor modelo free disponible)
 * Fallbacks: Gemma 4 :free (visión) + OSS-20B :free (técnico)
 */

export interface AIModel {
  id: string;
  name: string;
  specialty: string;
  description: string;
  vision?: boolean;
}

export const AUTHORIZED_MODELS: AIModel[] = [
  {
    id: "openrouter/free",
    name: "Auto FREE",
    specialty: "Auto-selección",
    description: "Elige automáticamente el mejor modelo gratuito disponible. Inmediato.",
    vision: true,
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4",
    specialty: "General & Visión",
    description: "Razonamiento, imágenes, documentos, código, conversación.",
    vision: true,
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "OSS-20B",
    specialty: "Técnico",
    description: "Especialista técnico. Medicina, finanzas, derecho, análisis.",
    vision: false,
  },
];

export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
