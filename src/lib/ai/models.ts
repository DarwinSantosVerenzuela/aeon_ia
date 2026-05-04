/**
 * Aeon IA — Model Registry & Intelligent Router
 *
 * Solo 2 modelos confirmados funcionando en producción:
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

/**
 * Selecciona el modelo según el contenido.
 * - Con archivos/imágenes → Gemma 4 (el único con visión)
 * - Texto general → Gemma 4 (primario), OSS-20B (fallback)
 */
export function routeToModel(message: string, hasAttachments: boolean = false): AIModel {
  if (hasAttachments) return AUTHORIZED_MODELS[0]; // Gemma 4

  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const techKeywords = [
    "medicina", "medico", "diagnostico", "sintoma", "tratamiento",
    "enfermedad", "salud", "hospital", "clinica", "paciente",
    "finanzas", "inversion", "economia", "mercado", "contabilidad",
    "presupuesto", "impuesto", "bolsa", "rendimiento",
    "legal", "derecho", "ley", "contrato", "abogado",
    "negocio", "empresa", "estrategia", "plan de negocio",
    "paso a paso", "detallado", "explica en detalle",
  ];

  for (const kw of techKeywords) {
    if (lower.includes(kw)) return AUTHORIZED_MODELS[1]; // OSS-20B
  }

  return AUTHORIZED_MODELS[0]; // Gemma 4 por defecto
}

export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
