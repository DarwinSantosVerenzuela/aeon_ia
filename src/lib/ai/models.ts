/**
 * Aeon IA — Model Registry & Intelligent Router
 *
 * 3 modelos estables vía OpenRouter (todos gratuitos y verificados).
 * El router selecciona el modelo óptimo por contenido del mensaje.
 * Cadena de fallback: Gemma4 → Gemma3-27B → Gemma3-12B
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
 * Solo modelos verificados como estables en OpenRouter.
 */
export const AUTHORIZED_MODELS: AIModel[] = [
  {
    // Modelo primario: mejor razonamiento y visión
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
      "imagen", "foto", "analiza imagen", "describe imagen", "observa",
      "visual", "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
  {
    // Fallback 1: también tiene visión, respaldo robusto
    id: "google/gemma-3-27b-it:free",
    name: "G3-27B",
    specialty: "Respaldo Principal",
    description: "Fallback primario. Visión y texto general.",
    vision: true,
    strengths: [],  // No se usa en el router, solo como fallback
  },
  {
    // Fallback 2: modelo más ligero, último recurso
    id: "google/gemma-3-12b-it:free",
    name: "G3-12B",
    specialty: "Respaldo Ligero",
    description: "Fallback secundario. Modelo ligero con visión.",
    vision: true,
    strengths: [],  // No se usa en el router, solo como fallback
  },
  {
    // Especialista técnico: medicina, finanzas, derecho
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
];

/* ═══════════════════════════════════════════
 * Intelligent Router
 * Selecciona el modelo primario por keywords.
 * Los otros modelos se usan SOLO como fallback.
 * ═══════════════════════════════════════════ */

/**
 * Siempre retorna el modelo primario (Gemma 4).
 * Los fallbacks se gestionan en stream.ts, no aquí.
 * Mantener el router simple evita colisiones de scoring.
 */
export function routeToModel(message: string): AIModel {
  // Normalizar para comparar sin acentos
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Modelo primario siempre es Gemma 4 (mejor balance calidad/disponibilidad)
  const primary = AUTHORIZED_MODELS[0];

  // Solo verificar si hay keywords del modelo OSS para especialidades técnicas profundas
  const techDeepKeywords = [
    "paso a paso", "diagnostico", "diagnostica", "medicina", "medico",
    "sintoma", "tratamiento", "salud clinica", "finanzas avanzadas",
    "inversion profesional", "legal", "derecho", "contrato",
  ];

  for (const kw of techDeepKeywords) {
    if (lower.includes(kw)) {
      // Para estas especialidades aun usamos Gemma 4 (es el más capaz disponible)
      return primary;
    }
  }

  return primary;
}

/**
 * Obtiene un modelo por su ID exacto.
 * Solo retorna modelos autorizados.
 */
export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
