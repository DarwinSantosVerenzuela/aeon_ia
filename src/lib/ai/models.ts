/**
 * Aeon IA — Model Registry
 *
 * Solo modelos con sufijo :free — costo $0 garantizado.
 * ✅ google/gemma-4-31b-it:free  → Visión + Razonamiento + General
 * ✅ openai/gpt-oss-20b:free     → Técnico + Fallback
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
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4",
    specialty: "General & Visión",
    description: "Modelo principal. Razonamiento, imágenes, documentos, código, conversación.",
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
