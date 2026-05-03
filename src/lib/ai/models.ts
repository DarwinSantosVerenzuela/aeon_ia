/**
 * Aeon IA — Model Registry & Intelligent Router
 * 
 * 5 modelos autorizados, todos gratuitos vía OpenRouter.
 * El router analiza el mensaje del usuario y selecciona
 * automáticamente el modelo óptimo para la tarea.
 */

/* ═══════════════════════════════════════════
 * Model Definitions
 * ═══════════════════════════════════════════ */

export interface AIModel {
  id: string;            // API slug
  name: string;          // Internal reference
  specialty: string;     // Area
  description: string;   // Description
  strengths: string[];   // Keyword matching
  vision?: boolean;      // Supports image input
}

/**
 * Registro de modelos autorizados — todos verificados $0/$0.
 * Cadena de fallback: si uno falla, pasa al siguiente.
 */
export const AUTHORIZED_MODELS: AIModel[] = [
  {
    id: "google/gemma-4-31b-it:free",
    name: "G4-31B",
    specialty: "Razonamiento General",
    description: "Razonamiento profundo, análisis complejo, ciencia, lógica y conversación",
    vision: true,
    strengths: [
      "razonamiento", "analizar", "análisis", "lógica", "ciencia", "física",
      "matemáticas", "cálculo", "explica", "por qué", "filosofía", "debate",
      "comparar", "evaluar", "reflexión", "pensamiento", "argumento",
      "investigación", "hipótesis", "teoría", "deducción", "crítico",
      "hola", "qué tal", "cómo estás", "cuéntame", "historia", "cultura",
      "recomienda", "opinión", "consejo", "creativo", "poema", "cuento",
      "idea", "conversación", "charla", "ayuda", "general",
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      "código", "programar", "bug", "función", "api", "javascript",
      "python", "react", "docker", "backend", "frontend",
      "imagen", "foto", "analiza", "describe", "observa", "visual",
      "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "OSS-20B",
    specialty: "Razonamiento Técnico",
    description: "Razonamiento paso a paso, medicina, finanzas, derecho y problemas complejos",
    vision: false,
    strengths: [
      "paso a paso", "detallado", "medicina", "médico", "diagnóstico",
      "síntoma", "tratamiento", "salud", "finanzas", "inversión", "economía",
      "mercado", "contabilidad", "presupuesto", "impuesto", "legal",
      "derecho", "ley", "contrato", "negocio", "empresa", "estrategia",
    ],
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "G3-27B",
    specialty: "Respaldo Visual",
    description: "Respaldo para análisis visual y conversación general",
    vision: true,
    strengths: [
      "razonamiento", "analizar", "análisis", "lógica", "ciencia", "física",
      "matemáticas", "cálculo", "explica", "por qué", "filosofía", "debate",
      "comparar", "evaluar", "reflexión", "pensamiento", "argumento",
      "investigación", "hipótesis", "teoría", "deducción", "crítico",
      "hola", "qué tal", "cómo estás", "cuéntame", "historia", "cultura",
      "recomienda", "opinión", "consejo", "creativo", "poema", "cuento",
      "idea", "conversación", "charla", "ayuda", "general",
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      "código", "programar", "bug", "función", "api", "javascript",
      "python", "react", "docker", "backend", "frontend",
      "imagen", "foto", "analiza", "describe", "observa", "visual",
      "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
  {
    id: "google/gemma-3-12b-it:free",
    name: "G3-12B",
    specialty: "Respaldo Visual",
    description: "Respaldo secundario para análisis visual",
    vision: true,
    strengths: [
      "razonamiento", "analizar", "análisis", "lógica", "ciencia", "física",
      "matemáticas", "cálculo", "explica", "por qué", "filosofía", "debate",
      "comparar", "evaluar", "reflexión", "pensamiento", "argumento",
      "investigación", "hipótesis", "teoría", "deducción", "crítico",
      "hola", "qué tal", "cómo estás", "cuéntame", "historia", "cultura",
      "recomienda", "opinión", "consejo", "creativo", "poema", "cuento",
      "idea", "conversación", "charla", "ayuda", "general",
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      "código", "programar", "bug", "función", "api", "javascript",
      "python", "react", "docker", "backend", "frontend",
      "imagen", "foto", "analiza", "describe", "observa", "visual",
      "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
  {
    id: "google/gemma-3-4b-it:free",
    name: "G3-4B",
    specialty: "Respaldo Ligero",
    description: "Modelo ligero de último recurso con visión",
    vision: true,
    strengths: [
      "razonamiento", "analizar", "análisis", "lógica", "ciencia", "física",
      "matemáticas", "cálculo", "explica", "por qué", "filosofía", "debate",
      "comparar", "evaluar", "reflexión", "pensamiento", "argumento",
      "investigación", "hipótesis", "teoría", "deducción", "crítico",
      "hola", "qué tal", "cómo estás", "cuéntame", "historia", "cultura",
      "recomienda", "opinión", "consejo", "creativo", "poema", "cuento",
      "idea", "conversación", "charla", "ayuda", "general",
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      "código", "programar", "bug", "función", "api", "javascript",
      "python", "react", "docker", "backend", "frontend",
      "imagen", "foto", "analiza", "describe", "observa", "visual",
      "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
];

/* ═══════════════════════════════════════════
 * Intelligent Router
 * Analiza el mensaje y selecciona el mejor modelo
 * ═══════════════════════════════════════════ */

/**
 * Selecciona el modelo óptimo basado en el contenido del mensaje.
 * Usa scoring por coincidencia de palabras clave.
 * Default: Llama 3.3 (mejor para conversación general).
 */
export function routeToModel(message: string): AIModel {
  const lowerMessage = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let bestModel = AUTHORIZED_MODELS[0]; // Default: Gemma 4 (general purpose)
  let bestScore = 0;

  for (const model of AUTHORIZED_MODELS) {
    let score = 0;
    for (const keyword of model.strengths) {
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lowerMessage.includes(normalizedKeyword)) {
        score += 1;
        // Bonus for exact word match (not just substring)
        const regex = new RegExp(`\\b${normalizedKeyword}\\b`, "i");
        if (regex.test(lowerMessage)) {
          score += 0.5;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestModel = model;
    }
  }

  return bestModel;
}

/**
 * Obtiene un modelo por su ID exacto.
 * Solo retorna modelos autorizados.
 */
export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
