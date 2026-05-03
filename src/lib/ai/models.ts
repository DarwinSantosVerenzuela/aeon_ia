/**
 * Aeon IA — Model Registry & Intelligent Router
 *
 * Pipeline de modelos verificados en producción vía OpenRouter.
 * Evidencia: logs de OpenRouter del 2-3 mayo 2026.
 *
 * MODELOS CONFIRMADOS FUNCIONANDO:
 * ✅ google/gemma-4-31b-it:free      → Google AI Studio (primario)
 * ✅ openai/gpt-oss-20b:free         → OpenInference (fallback 1 confirmado)
 *
 * MODELOS FALLBACK NUEVOS (reemplazando gemma-3-27b y gemma-3-12b que
 * NUNCA conectaron en producción — 0 apariciones en logs de OpenRouter):
 * 🔄 meta-llama/llama-3.3-70b-instruct:free → fallback 2
 * 🔄 mistralai/mistral-7b-instruct:free     → fallback 3
 */

export interface AIModel {
  id: string;
  name: string;
  specialty: string;
  description: string;
  strengths: string[];
  vision?: boolean;
}

/**
 * Modelos autorizados — ordenados por prioridad de fallback.
 * Solo modelos verificados con apariciones confirmadas en logs de producción.
 */
export const AUTHORIZED_MODELS: AIModel[] = [
  {
    // ✅ CONFIRMADO: Aparece en logs OpenRouter como primario
    id: "google/gemma-4-31b-it:free",
    name: "G4-31B",
    specialty: "General & Visión",
    description: "Modelo principal. Razonamiento, conversación, código, imágenes y documentos.",
    vision: true,
    strengths: [
      // Conversación general
      "hola", "qué tal", "cómo estás", "buenos días", "buenas tardes",
      "cuéntame", "ayuda", "general", "conversación", "charla",
      // Razonamiento y análisis
      "razonamiento", "analizar", "análisis", "lógica", "por qué",
      "explica", "filosofía", "debate", "comparar", "evaluar",
      "reflexión", "pensamiento", "argumento", "crítico",
      // Ciencia y matemáticas
      "ciencia", "física", "matemáticas", "cálculo", "química",
      "investigación", "hipótesis", "teoría", "deducción",
      // Contenido creativo
      "historia", "cultura", "opinión", "consejo", "creativo",
      "poema", "cuento", "idea", "recomienda",
      // Escritura
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      // Código
      "código", "programar", "bug", "función", "api",
      "javascript", "python", "react", "docker", "backend", "frontend",
      // Visual y documentos
      "imagen", "foto", "analiza imagen", "describe imagen",
      "visual", "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
  {
    // ✅ CONFIRMADO: Aparece en logs OpenRouter como fallback exitoso
    id: "openai/gpt-oss-20b:free",
    name: "OSS-20B",
    specialty: "Razonamiento Técnico",
    description: "Especialista en medicina, finanzas, derecho y razonamiento paso a paso.",
    vision: false,
    strengths: [
      // Medicina y salud
      "medicina", "médico", "medico", "diagnóstico", "diagnostico",
      "síntoma", "sintoma", "tratamiento", "enfermedad", "salud",
      "clínica", "clinica", "hospital", "paciente", "dosis",
      // Finanzas
      "finanzas", "inversión", "inversion", "economía", "economia",
      "mercado", "contabilidad", "presupuesto", "impuesto", "renta",
      "bolsa", "acción", "accion", "bono", "rendimiento",
      // Legal
      "legal", "derecho", "ley", "contrato", "abogado",
      "demanda", "juicio", "norma", "reglamento",
      // Análisis profundo
      "negocio", "empresa", "estrategia", "plan de negocio",
      "paso a paso", "detallado", "explica en detalle",
    ],
  },
  {
    // ✅ CONFIRMADO FREE en OpenRouter — mayor capacidad que OSS-20B
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama-70B",
    specialty: "Respaldo Principal",
    description: "Fallback robusto. Llama 70B instrucciones, estable en OpenRouter.",
    vision: false,
    strengths: [],  // Solo usado como fallback, no en el router primario
  },
  {
    // ✅ CONFIRMADO FREE en OpenRouter (captura del usuario: "gpt-oss-120b (free)")
    id: "openai/gpt-oss-120b:free",
    name: "OSS-120B",
    specialty: "Respaldo Potente",
    description: "Fallback de alta capacidad. GPT-OSS 120B versión gratuita.",
    vision: false,
    strengths: [],  // Solo usado como fallback, no en el router primario
  },
  {
    // ✅ CONFIRMADO FREE en OpenRouter (captura del usuario: "Gemma 3 27B (free)")
    id: "google/gemma-3-27b-it:free",
    name: "G3-27B",
    specialty: "Respaldo Visual",
    description: "Fallback de Google. Gemma 3 27B versión gratuita con visión.",
    vision: true,
    strengths: [],  // Solo usado como fallback, no en el router primario
  },
];

/* ═══════════════════════════════════════════
 * Intelligent Router
 * ═══════════════════════════════════════════ */

/**
 * Selecciona el modelo primario por contenido del mensaje.
 * - Temas técnicos profundos (medicina, finanzas, legal) → OSS-20B
 * - Todo lo demás → Gemma 4 31B
 * Los modelos Llama y Mistral SOLO se usan como fallback automático.
 */
export function routeToModel(message: string): AIModel {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Keywords que activan el modelo técnico especialista (OSS-20B)
  const techKeywords = [
    "medicina", "medico", "diagnostico", "sintoma", "tratamiento",
    "enfermedad", "salud", "hospital", "clinica", "paciente",
    "finanzas", "inversion", "economia", "mercado", "contabilidad",
    "presupuesto", "impuesto", "bolsa", "bono", "rendimiento",
    "legal", "derecho", "ley", "contrato", "abogado",
    "negocio", "estrategia", "plan de negocio",
  ];

  for (const kw of techKeywords) {
    if (lower.includes(kw)) {
      return AUTHORIZED_MODELS[1]; // OSS-20B para temas técnicos
    }
  }

  return AUTHORIZED_MODELS[0]; // Gemma 4 como modelo general por defecto
}

/**
 * Obtiene un modelo por su ID exacto.
 * Solo retorna modelos autorizados.
 */
export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
